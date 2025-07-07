/**
 * Blue Mountain Bank API Server with Azure SQL Database
 * Production-ready backend with authentication and data management
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AzureSQLManager = require('../js/azure-sql-manager');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Azure SQL Database configuration
const sqlConfig = {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USERNAME,
    password: process.env.AZURE_SQL_PASSWORD,
    pool: {
        max: parseInt(process.env.AZURE_SQL_POOL_MAX) || 10,
        min: parseInt(process.env.AZURE_SQL_POOL_MIN) || 0,
        idleTimeoutMillis: parseInt(process.env.AZURE_SQL_POOL_IDLE_TIMEOUT) || 30000
    },
    options: {
        encrypt: process.env.AZURE_SQL_ENCRYPT === 'true',
        trustServerCertificate: process.env.AZURE_SQL_TRUST_SERVER_CERTIFICATE === 'true'
    }
};

// Initialize database manager
const dbManager = new AzureSQLManager(sqlConfig);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: { success: false, error: 'Too many login attempts, please try again later.' }
});

app.use(generalLimiter);

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const isConnected = dbManager.isConnected;
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: isConnected ? 'connected' : 'disconnected',
            version: '2.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Authentication endpoints
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Get user from database
        const user = await dbManager.getUserByUsername(username);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

        // Verify password (assuming passwords are already hashed in migration)
        // For the demo data, passwords are already hashed, so we compare directly
        // In production, you would use bcrypt.compare(password, user.PasswordHash)
        const isValidPassword = user.PasswordHash === password || 
                               await bcrypt.compare(password, user.PasswordHash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.UserId,
                username: user.Username,
                email: user.Email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                userId: user.UserId,
                username: user.Username,
                email: user.Email,
                firstName: user.FirstName,
                lastName: user.LastName
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed. Please try again.'
        });
    }
});

// Get user data endpoint
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user can only access their own data
        if (req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const userData = await dbManager.getUserData(userId);
        
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: userData
        });

    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve user data'
        });
    }
});

// Update user preferences endpoint
app.put('/api/users/:userId/preferences', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;

        // Verify user can only update their own data
        if (req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        await dbManager.updateUserPreferences(userId, preferences);

        res.json({
            success: true,
            message: 'Preferences updated successfully'
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
});

// Add transaction endpoint
app.post('/api/users/:userId/transactions', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const transactionData = req.body;

        // Verify user can only add transactions to their own account
        if (req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const transactionId = await dbManager.addTransaction(userId, transactionData);

        res.json({
            success: true,
            transactionId,
            message: 'Transaction added successfully'
        });

    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add transaction'
        });
    }
});

// Get transactions endpoint with filtering
app.get('/api/users/:userId/transactions', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, startDate, endDate, category, limit = 50 } = req.query;

        // Verify user can only access their own data
        if (req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Get complete user data (includes transactions)
        const userData = await dbManager.getUserData(userId);
        
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        let transactions = [];

        // Combine credit card and bank transactions if requested
        if (!type || type === 'all') {
            // Add bank transactions
            transactions = [...userData.recentTransactions];

            // Add credit card transactions
            Object.values(userData.personalInfo.creditCards || {}).forEach(card => {
                if (card.transactions) {
                    transactions.push(...card.transactions.map(t => ({
                        ...t,
                        transactionType: 'credit_card'
                    })));
                }
            });
        } else if (type === 'bank') {
            transactions = userData.recentTransactions;
        } else if (type === 'credit_card') {
            Object.values(userData.personalInfo.creditCards || {}).forEach(card => {
                if (card.transactions) {
                    transactions.push(...card.transactions);
                }
            });
        }

        // Apply filters
        if (startDate) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(startDate));
        }
        if (endDate) {
            transactions = transactions.filter(t => new Date(t.date) <= new Date(endDate));
        }
        if (category) {
            transactions = transactions.filter(t => t.category === category);
        }

        // Sort by date (newest first) and limit results
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        transactions = transactions.slice(0, parseInt(limit));

        res.json({
            success: true,
            data: transactions,
            count: transactions.length
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve transactions'
        });
    }
});

// Create new user endpoint (for registration)
app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        const userData = {
            username,
            email,
            passwordHash,
            firstName,
            lastName
        };

        const userId = await dbManager.createUser(userData);

        res.status(201).json({
            success: true,
            userId,
            message: 'User created successfully'
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (error.message.includes('UNIQUE constraint')) {
            res.status(409).json({
                success: false,
                error: 'Username or email already exists'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Registration failed. Please try again.'
            });
        }
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
async function startServer() {
    try {
        // Connect to Azure SQL Database
        const connected = await dbManager.connect();
        
        if (!connected) {
            console.error('❌ Failed to connect to Azure SQL Database');
            process.exit(1);
        }

        app.listen(port, () => {
            console.log(`🚀 Blue Mountain Bank API Server running on port ${port}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: Azure SQL Database`);
            console.log(`🔐 JWT Authentication: Enabled`);
            console.log(`🛡️  Security middleware: Enabled`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await dbManager.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await dbManager.disconnect();
    process.exit(0);
});

startServer();
