// Local Storage Manager for User Data
class LocalStorageManager {
    constructor() {
        this.storageKey = 'blueMountainBank_userData';
        this.initializeData();
    }

    // Initialize with sample data if not exists
    initializeData() {
        if (!localStorage.getItem(this.storageKey)) {
            // Import the existing user data structure
            const initialData = {
                users: {
                    alice_martinez: {
                        credentials: {
                            username: "alice.martinez",
                            password: this.hashPassword("AliceM2024!"),
                            email: "alice.martinez@email.com"
                        },
                        profile: {
                            firstName: "Alice",
                            lastName: "Martinez",
                            fullName: "Alice Martinez",
                            age: 28,
                            profession: "Software Engineer",
                            phone: "(555) 123-4567",
                            address: "1234 Tech Avenue, San Francisco, CA 94105",
                            joinDate: "2022-03-15",
                            avatar: "AM",
                            accountNumber: "****-1234"
                        },
                        accounts: {
                            checking: {
                                balance: 8750.43,
                                accountNumber: "CHK-001-1234",
                                type: "Premium Checking"
                            },
                            savings: {
                                balance: 25300.89,
                                accountNumber: "SAV-001-1234",
                                type: "High Yield Savings"
                            },
                            credit: {
                                balance: -1234.56,
                                limit: 15000,
                                accountNumber: "CC-001-1234",
                                type: "Rewards Credit Card"
                            }
                        },
                        transactions: [
                            { date: "2022-07-01", description: "Salary Deposit - TechCorp Inc", amount: 4250.00, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-30", description: "Rent Payment - Bay Area Apartments", amount: -2200.00, type: "withdrawal", category: "housing", icon: "fas fa-home" },
                            { date: "2022-06-29", description: "Grocery Store - Whole Foods", amount: -127.83, type: "withdrawal", category: "groceries", icon: "fas fa-shopping-cart" },
                            { date: "2022-06-28", description: "Coffee Shop - Blue Bottle", amount: -12.45, type: "withdrawal", category: "dining", icon: "fas fa-coffee" },
                            { date: "2022-06-27", description: "Gas Station - Shell", amount: -65.20, type: "withdrawal", category: "transportation", icon: "fas fa-gas-pump" },
                            { date: "2022-06-26", description: "Online Transfer to Savings", amount: -1000.00, type: "transfer", category: "savings", icon: "fas fa-piggy-bank" },
                            { date: "2022-06-25", description: "Gym Membership - FitLife", amount: -89.99, type: "withdrawal", category: "health", icon: "fas fa-dumbbell" },
                            { date: "2022-06-24", description: "Uber Ride", amount: -18.75, type: "withdrawal", category: "transportation", icon: "fas fa-car" },
                            { date: "2022-06-23", description: "Amazon Purchase - Tech Gadgets", amount: -156.32, type: "withdrawal", category: "shopping", icon: "fas fa-shopping-bag" },
                            { date: "2022-06-22", description: "Netflix Subscription", amount: -15.99, type: "withdrawal", category: "entertainment", icon: "fas fa-tv" },
                            { date: "2022-06-21", description: "Freelance Project Payment", amount: 750.00, type: "deposit", category: "income", icon: "fas fa-laptop-code" },
                            { date: "2022-06-20", description: "Restaurant - Chez Laurent", amount: -89.50, type: "withdrawal", category: "dining", icon: "fas fa-utensils" },
                            { date: "2022-06-19", description: "Electric Bill - PG&E", amount: -145.67, type: "withdrawal", category: "utilities", icon: "fas fa-bolt" },
                            { date: "2022-06-18", description: "Mobile Deposit - Check", amount: 320.00, type: "deposit", category: "income", icon: "fas fa-mobile-alt" },
                            { date: "2022-06-17", description: "Pharmacy - CVS", amount: -34.89, type: "withdrawal", category: "healthcare", icon: "fas fa-pills" },
                            { date: "2022-06-16", description: "Spotify Premium", amount: -12.99, type: "withdrawal", category: "entertainment", icon: "fas fa-music" },
                            { date: "2022-06-15", description: "Salary Deposit - TechCorp Inc", amount: 4250.00, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-14", description: "Target - Household Items", amount: -67.23, type: "withdrawal", category: "shopping", icon: "fas fa-shopping-cart" },
                            { date: "2022-06-13", description: "Lunch - Chipotle", amount: -14.75, type: "withdrawal", category: "dining", icon: "fas fa-pepper-hot" },
                            { date: "2022-06-12", description: "Investment Transfer - Vanguard", amount: -500.00, type: "transfer", category: "investment", icon: "fas fa-chart-line" }
                        ]
                    },
                    bob_johnson: {
                        credentials: {
                            username: "bob.johnson",
                            password: this.hashPassword("BobJ2024!"),
                            email: "bob.johnson@email.com"
                        },
                        profile: {
                            firstName: "Bob",
                            lastName: "Johnson",
                            fullName: "Bob Johnson",
                            age: 45,
                            profession: "Small Business Owner",
                            phone: "(555) 234-5678",
                            address: "5678 Main Street, Denver, CO 80202",
                            joinDate: "2019-08-22",
                            avatar: "BJ",
                            accountNumber: "****-5678"
                        },
                        accounts: {
                            checking: {
                                balance: 15420.75,
                                accountNumber: "CHK-002-5678",
                                type: "Business Checking"
                            },
                            savings: {
                                balance: 58900.23,
                                accountNumber: "SAV-002-5678",
                                type: "Business Savings"
                            },
                            credit: {
                                balance: -4567.89,
                                limit: 25000,
                                accountNumber: "CC-002-5678",
                                type: "Business Credit Card"
                            }
                        },
                        transactions: [
                            { date: "2022-07-01", description: "Customer Payment - Invoice #1234", amount: 2850.00, type: "deposit", category: "income", icon: "fas fa-file-invoice-dollar" },
                            { date: "2022-06-30", description: "Office Supplies - Staples", amount: -234.67, type: "withdrawal", category: "business", icon: "fas fa-briefcase" },
                            { date: "2022-06-29", description: "Equipment Rental", amount: -450.00, type: "withdrawal", category: "business", icon: "fas fa-tools" },
                            { date: "2022-06-28", description: "Insurance Payment - Business Policy", amount: -320.45, type: "withdrawal", category: "insurance", icon: "fas fa-shield-alt" },
                            { date: "2022-06-27", description: "Utilities - Electric Company", amount: -178.92, type: "withdrawal", category: "utilities", icon: "fas fa-bolt" },
                            { date: "2022-06-26", description: "Client Payment - Project Alpha", amount: 1750.00, type: "deposit", category: "income", icon: "fas fa-handshake" },
                            { date: "2022-06-25", description: "Truck Payment - Ford Credit", amount: -567.89, type: "withdrawal", category: "transportation", icon: "fas fa-truck" },
                            { date: "2022-06-24", description: "Lunch Meeting - Romano's", amount: -67.43, type: "withdrawal", category: "dining", icon: "fas fa-utensils" },
                            { date: "2022-06-23", description: "Marketing - Google Ads", amount: -125.00, type: "withdrawal", category: "business", icon: "fas fa-bullhorn" },
                            { date: "2022-06-22", description: "Hardware Store - Home Depot", amount: -198.76, type: "withdrawal", category: "business", icon: "fas fa-hammer" },
                            { date: "2022-06-21", description: "Deposit - Cash Sales", amount: 890.50, type: "deposit", category: "income", icon: "fas fa-cash-register" },
                            { date: "2022-06-20", description: "Phone Bill - Verizon Business", amount: -89.99, type: "withdrawal", category: "utilities", icon: "fas fa-phone" },
                            { date: "2022-06-19", description: "Fuel - Business Truck", amount: -156.78, type: "withdrawal", category: "transportation", icon: "fas fa-gas-pump" },
                            { date: "2022-06-18", description: "Client Meeting - Starbucks", amount: -23.45, type: "withdrawal", category: "dining", icon: "fas fa-coffee" },
                            { date: "2022-06-17", description: "Software License - QuickBooks", amount: -89.99, type: "withdrawal", category: "business", icon: "fas fa-laptop" },
                            { date: "2022-06-16", description: "Customer Payment - Invoice #1189", amount: 1890.00, type: "deposit", category: "income", icon: "fas fa-file-invoice-dollar" },
                            { date: "2022-06-15", description: "Business Lunch - Olive Garden", amount: -78.90, type: "withdrawal", category: "dining", icon: "fas fa-utensils" },
                            { date: "2022-06-14", description: "Internet Bill - Comcast Business", amount: -129.99, type: "withdrawal", category: "utilities", icon: "fas fa-wifi" },
                            { date: "2022-06-13", description: "Office Rent Payment", amount: -1200.00, type: "withdrawal", category: "business", icon: "fas fa-building" },
                            { date: "2022-06-12", description: "Equipment Purchase - Tools", amount: -345.67, type: "withdrawal", category: "business", icon: "fas fa-toolbox" }
                        ]
                    },
                    carol_smith: {
                        credentials: {
                            username: "carol.smith",
                            password: this.hashPassword("CarolS2024!"),
                            email: "carol.smith@email.com"
                        },
                        profile: {
                            firstName: "Carol",
                            lastName: "Smith",
                            fullName: "Carol Smith",
                            age: 67,
                            profession: "Retired Teacher",
                            phone: "(555) 345-6789",
                            address: "9101 Elm Street, Austin, TX 78701",
                            joinDate: "2015-05-10",
                            avatar: "CS",
                            accountNumber: "****-9101"
                        },
                        accounts: {
                            checking: {
                                balance: 4325.12,
                                accountNumber: "CHK-003-9101",
                                type: "Senior Checking"
                            },
                            savings: {
                                balance: 87650.45,
                                accountNumber: "SAV-003-9101",
                                type: "High Interest Savings"
                            },
                            credit: {
                                balance: -234.78,
                                limit: 5000,
                                accountNumber: "CC-003-9101",
                                type: "Classic Credit Card"
                            }
                        },
                        transactions: [
                            { date: "2022-07-01", description: "Pension Deposit - Teachers Retirement", amount: 2780.50, type: "deposit", category: "income", icon: "fas fa-university" },
                            { date: "2022-06-30", description: "Pharmacy - CVS", amount: -45.67, type: "withdrawal", category: "healthcare", icon: "fas fa-pills" },
                            { date: "2022-06-29", description: "Grocery Store - Kroger", amount: -89.23, type: "withdrawal", category: "groceries", icon: "fas fa-shopping-cart" },
                            { date: "2022-06-28", description: "Doctor Visit Copay", amount: -25.00, type: "withdrawal", category: "healthcare", icon: "fas fa-stethoscope" },
                            { date: "2022-06-27", description: "Donation - Local Library", amount: -100.00, type: "withdrawal", category: "charity", icon: "fas fa-heart" },
                            { date: "2022-06-26", description: "Social Security Deposit", amount: 1456.00, type: "deposit", category: "income", icon: "fas fa-coins" },
                            { date: "2022-06-25", description: "Electric Bill - Austin Energy", amount: -78.45, type: "withdrawal", category: "utilities", icon: "fas fa-bolt" },
                            { date: "2022-06-24", description: "Book Store - Barnes & Noble", amount: -34.99, type: "withdrawal", category: "entertainment", icon: "fas fa-book" },
                            { date: "2022-06-23", description: "Gas Station - Texaco", amount: -42.18, type: "withdrawal", category: "transportation", icon: "fas fa-gas-pump" },
                            { date: "2022-06-22", description: "Garden Center - Plants & More", amount: -56.78, type: "withdrawal", category: "home", icon: "fas fa-seedling" },
                            { date: "2022-06-21", description: "Lunch - Corner Cafe", amount: -18.95, type: "withdrawal", category: "dining", icon: "fas fa-coffee" },
                            { date: "2022-06-20", description: "Medicare Supplement", amount: -145.50, type: "withdrawal", category: "insurance", icon: "fas fa-shield-alt" },
                            { date: "2022-06-19", description: "Water Bill - City of Austin", amount: -34.78, type: "withdrawal", category: "utilities", icon: "fas fa-tint" },
                            { date: "2022-06-18", description: "Charity - Red Cross", amount: -50.00, type: "withdrawal", category: "charity", icon: "fas fa-heart" },
                            { date: "2022-06-17", description: "Dental Checkup Copay", amount: -30.00, type: "withdrawal", category: "healthcare", icon: "fas fa-tooth" },
                            { date: "2022-06-16", description: "Grocery Store - H-E-B", amount: -76.45, type: "withdrawal", category: "groceries", icon: "fas fa-shopping-cart" },
                            { date: "2022-06-15", description: "Pension Deposit - Teachers Retirement", amount: 2780.50, type: "deposit", category: "income", icon: "fas fa-university" },
                            { date: "2022-06-14", description: "Senior Center - Yoga Class", amount: -15.00, type: "withdrawal", category: "health", icon: "fas fa-spa" },
                            { date: "2022-06-13", description: "Netflix Subscription", amount: -8.99, type: "withdrawal", category: "entertainment", icon: "fas fa-tv" },
                            { date: "2022-06-12", description: "Dinner - Hometown Buffet", amount: -24.85, type: "withdrawal", category: "dining", icon: "fas fa-utensils" }
                        ]
                    },
                    david_wilson: {
                        credentials: {
                            username: "david.wilson",
                            password: this.hashPassword("DavidW2024!"),
                            email: "david.wilson@email.com"
                        },
                        profile: {
                            firstName: "David",
                            lastName: "Wilson",
                            fullName: "David Wilson",
                            age: 21,
                            profession: "College Student",
                            phone: "(555) 456-7890",
                            address: "2468 College Ave, Boston, MA 02115",
                            joinDate: "2023-09-01",
                            avatar: "DW",
                            accountNumber: "****-2468"
                        },
                        accounts: {
                            checking: {
                                balance: 1245.67,
                                accountNumber: "CHK-004-2468",
                                type: "Student Checking"
                            },
                            savings: {
                                balance: 3890.23,
                                accountNumber: "SAV-004-2468",
                                type: "Student Savings"
                            },
                            credit: {
                                balance: -567.34,
                                limit: 2500,
                                accountNumber: "CC-004-2468",
                                type: "Student Credit Card"
                            }
                        },
                        transactions: [
                            { date: "2022-07-01", description: "Part-time Job - Campus Bookstore", amount: 320.00, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-30", description: "Textbooks - Amazon", amount: -245.89, type: "withdrawal", category: "education", icon: "fas fa-book-open" },
                            { date: "2022-06-29", description: "Pizza Delivery - Domino's", amount: -18.75, type: "withdrawal", category: "dining", icon: "fas fa-pizza-slice" },
                            { date: "2022-06-28", description: "Laundromat", amount: -8.50, type: "withdrawal", category: "personal", icon: "fas fa-tshirt" },
                            { date: "2022-06-27", description: "Coffee - Starbucks", amount: -6.95, type: "withdrawal", category: "dining", icon: "fas fa-coffee" },
                            { date: "2022-06-26", description: "Financial Aid Refund", amount: 850.00, type: "deposit", category: "income", icon: "fas fa-graduation-cap" },
                            { date: "2022-06-25", description: "Movie Tickets", amount: -24.00, type: "withdrawal", category: "entertainment", icon: "fas fa-film" },
                            { date: "2022-06-24", description: "Grocery Store - Target", amount: -67.43, type: "withdrawal", category: "groceries", icon: "fas fa-shopping-cart" },
                            { date: "2022-06-23", description: "Bus Pass - MBTA", amount: -30.00, type: "withdrawal", category: "transportation", icon: "fas fa-bus" },
                            { date: "2022-06-22", description: "Spotify Premium", amount: -9.99, type: "withdrawal", category: "entertainment", icon: "fas fa-music" },
                            { date: "2022-06-21", description: "Study Group Snacks", amount: -15.67, type: "withdrawal", category: "dining", icon: "fas fa-cookie-bite" },
                            { date: "2022-06-20", description: "Parent Transfer", amount: 200.00, type: "deposit", category: "income", icon: "fas fa-hand-holding-heart" },
                            { date: "2022-06-19", description: "Campus Gym Membership", amount: -45.00, type: "withdrawal", category: "health", icon: "fas fa-dumbbell" },
                            { date: "2022-06-18", description: "Uber Eats - Late Night", amount: -22.50, type: "withdrawal", category: "dining", icon: "fas fa-hamburger" },
                            { date: "2022-06-17", description: "School Supplies - Staples", amount: -67.89, type: "withdrawal", category: "education", icon: "fas fa-pencil-alt" },
                            { date: "2022-06-16", description: "Gaming - Steam Purchase", amount: -29.99, type: "withdrawal", category: "entertainment", icon: "fas fa-gamepad" },
                            { date: "2022-06-15", description: "Part-time Job - Campus Bookstore", amount: 320.00, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-14", description: "Pharmacy - CVS", amount: -12.45, type: "withdrawal", category: "healthcare", icon: "fas fa-pills" },
                            { date: "2022-06-13", description: "Fast Food - Taco Bell", amount: -9.87, type: "withdrawal", category: "dining", icon: "fas fa-pepper-hot" },
                            { date: "2022-06-12", description: "Used Books - Online", amount: -34.56, type: "withdrawal", category: "education", icon: "fas fa-book" }
                        ]
                    },
                    emma_brown: {
                        credentials: {
                            username: "emma.brown",
                            password: this.hashPassword("EmmaB2024!"),
                            email: "emma.brown@email.com"
                        },
                        profile: {
                            firstName: "Emma",
                            lastName: "Brown",
                            fullName: "Emma Brown",
                            age: 34,
                            profession: "Marketing Manager",
                            phone: "(555) 567-8901",
                            address: "1357 Park Avenue, New York, NY 10028",
                            joinDate: "2020-11-12",
                            avatar: "EB",
                            accountNumber: "****-1357"
                        },
                        accounts: {
                            checking: {
                                balance: 12890.45,
                                accountNumber: "CHK-005-1357",
                                type: "Premium Checking"
                            },
                            savings: {
                                balance: 45670.89,
                                accountNumber: "SAV-005-1357",
                                type: "Investment Savings"
                            },
                            credit: {
                                balance: -2345.67,
                                limit: 18000,
                                accountNumber: "CC-005-1357",
                                type: "Platinum Rewards Card"
                            }
                        },
                        transactions: [
                            { date: "2022-07-01", description: "Salary - Global Marketing Inc", amount: 5250.00, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-30", description: "Rent - Manhattan Apartments", amount: -3200.00, type: "withdrawal", category: "housing", icon: "fas fa-building" },
                            { date: "2022-06-29", description: "Designer Clothing - Nordstrom", amount: -456.78, type: "withdrawal", category: "shopping", icon: "fas fa-shopping-bag" },
                            { date: "2022-06-28", description: "Yoga Class - CorePower", amount: -35.00, type: "withdrawal", category: "health", icon: "fas fa-spa" },
                            { date: "2022-06-27", description: "Fine Dining - Le Bernardin", amount: -180.50, type: "withdrawal", category: "dining", icon: "fas fa-wine-glass-alt" },
                            { date: "2022-06-26", description: "Investment Transfer", amount: -2000.00, type: "transfer", category: "investment", icon: "fas fa-chart-line" },
                            { date: "2022-06-25", description: "Taxi - NYC Yellow Cab", amount: -25.40, type: "withdrawal", category: "transportation", icon: "fas fa-taxi" },
                            { date: "2022-06-24", description: "Skincare - Sephora", amount: -89.99, type: "withdrawal", category: "personal", icon: "fas fa-magic" },
                            { date: "2022-06-23", description: "Wine Shop - Vintage Cellars", amount: -125.67, type: "withdrawal", category: "dining", icon: "fas fa-wine-bottle" },
                            { date: "2022-06-22", description: "Broadway Show Tickets", amount: -240.00, type: "withdrawal", category: "entertainment", icon: "fas fa-theater-masks" },
                            { date: "2022-06-21", description: "Bonus - Q2 Performance", amount: 1500.00, type: "deposit", category: "income", icon: "fas fa-trophy" },
                            { date: "2022-06-20", description: "Personal Trainer", amount: -120.00, type: "withdrawal", category: "health", icon: "fas fa-dumbbell" },
                            { date: "2022-06-19", description: "Luxury Spa Day", amount: -350.00, type: "withdrawal", category: "health", icon: "fas fa-spa" },
                            { date: "2022-06-18", description: "Art Gallery Opening", amount: -75.00, type: "withdrawal", category: "entertainment", icon: "fas fa-palette" },
                            { date: "2022-06-17", description: "Professional Networking Event", amount: -95.00, type: "withdrawal", category: "business", icon: "fas fa-handshake" },
                            { date: "2022-06-16", description: "Luxury Shopping - Tiffany & Co", amount: -890.00, type: "withdrawal", category: "shopping", icon: "fas fa-gem" },
                            { date: "2022-06-15", description: "Salary - Global Marketing Inc", amount: 5250.00, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-14", description: "High-end Grocery - Dean & DeLuca", amount: -156.78, type: "withdrawal", category: "groceries", icon: "fas fa-shopping-cart" },
                            { date: "2022-06-13", description: "Private Pilates Session", amount: -85.00, type: "withdrawal", category: "health", icon: "fas fa-spa" },
                            { date: "2022-06-12", description: "Executive Travel - Uber", amount: -45.60, type: "withdrawal", category: "transportation", icon: "fas fa-car" }
                        ]
                    },
                    frank_miller: {
                        credentials: {
                            username: "frank.miller",
                            password: this.hashPassword("FrankM2024!"),
                            email: "frank.miller@email.com"
                        },
                        profile: {
                            firstName: "Frank",
                            lastName: "Miller",
                            fullName: "Frank Miller",
                            age: 38,
                            profession: "Construction Foreman",
                            phone: "(555) 678-9012",
                            address: "8642 Industrial Blvd, Phoenix, AZ 85034",
                            joinDate: "2018-02-28",
                            avatar: "FM",
                            accountNumber: "****-8642"
                        },
                        accounts: {
                            checking: {
                                balance: 6785.32,
                                accountNumber: "CHK-006-8642",
                                type: "Working Man's Checking"
                            },
                            savings: {
                                balance: 18450.78,
                                accountNumber: "SAV-006-8642",
                                type: "Goal Saver Account"
                            },
                            credit: {
                                balance: -1876.54,
                                limit: 8000,
                                accountNumber: "CC-006-8642",
                                type: "Tools & Equipment Card"
                            }
                        },
                        transactions: [
                            { date: "2022-07-01", description: "Paycheck - Arizona Construction Co", amount: 1890.75, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-30", description: "Mortgage Payment", amount: -1245.00, type: "withdrawal", category: "housing", icon: "fas fa-home" },
                            { date: "2022-06-29", description: "Work Boots - Red Wing", amount: -189.99, type: "withdrawal", category: "work", icon: "fas fa-hard-hat" },
                            { date: "2022-06-28", description: "Truck Fuel - Circle K", amount: -85.43, type: "withdrawal", category: "transportation", icon: "fas fa-gas-pump" },
                            { date: "2022-06-27", description: "Grocery Store - Fry's", amount: -156.78, type: "withdrawal", category: "groceries", icon: "fas fa-shopping-cart" },
                            { date: "2022-06-26", description: "Tools - Harbor Freight", amount: -234.56, type: "withdrawal", category: "work", icon: "fas fa-toolbox" },
                            { date: "2022-06-25", description: "Family Dinner - Applebee's", amount: -67.89, type: "withdrawal", category: "dining", icon: "fas fa-utensils" },
                            { date: "2022-06-24", description: "Overtime Pay", amount: 345.25, type: "deposit", category: "income", icon: "fas fa-clock" },
                            { date: "2022-06-23", description: "Auto Insurance - State Farm", amount: -98.50, type: "withdrawal", category: "insurance", icon: "fas fa-car" },
                            { date: "2022-06-22", description: "Home Improvement - Lowe's", amount: -298.67, type: "withdrawal", category: "home", icon: "fas fa-hammer" },
                            { date: "2022-06-21", description: "Beer & Snacks - Convenience Store", amount: -34.21, type: "withdrawal", category: "personal", icon: "fas fa-beer" },
                            { date: "2022-06-20", description: "Phoenix Suns Tickets", amount: -120.00, type: "withdrawal", category: "entertainment", icon: "fas fa-basketball-ball" },
                            { date: "2022-06-19", description: "Work Shirt - Carhartt", amount: -45.99, type: "withdrawal", category: "work", icon: "fas fa-tshirt" },
                            { date: "2022-06-18", description: "Phone Bill - Verizon", amount: -78.99, type: "withdrawal", category: "utilities", icon: "fas fa-phone" },
                            { date: "2022-06-17", description: "Barbershop", amount: -25.00, type: "withdrawal", category: "personal", icon: "fas fa-cut" },
                            { date: "2022-06-16", description: "Hardware Store - Ace Hardware", amount: -67.89, type: "withdrawal", category: "work", icon: "fas fa-wrench" },
                            { date: "2022-06-15", description: "Paycheck - Arizona Construction Co", amount: 1890.75, type: "deposit", category: "income", icon: "fas fa-money-bill-wave" },
                            { date: "2022-06-14", description: "Fast Food - McDonald's", amount: -12.45, type: "withdrawal", category: "dining", icon: "fas fa-hamburger" },
                            { date: "2022-06-13", description: "Safety Equipment", amount: -89.99, type: "withdrawal", category: "work", icon: "fas fa-shield-alt" },
                            { date: "2022-06-12", description: "Truck Maintenance", amount: -156.78, type: "withdrawal", category: "transportation", icon: "fas fa-tools" }
                        ]
                    }
                }
            };
            this.saveData(initialData);
        }
    }

    // Simple hash function (use bcrypt in production)
    hashPassword(password) {
        return btoa(password); // Base64 encoding - use proper hashing in production
    }

    // Save data to localStorage
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    // Load data from localStorage
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    // Get user data
    getUserData(userId) {
        const data = this.loadData();
        return data?.users[userId] || null;
    }

    // Get all users data
    getAllUsers() {
        const data = this.loadData();
        return data?.users || {};
    }

    // Get specific user data (alias for getUserData for consistency)
    getUser(userId) {
        return this.getUserData(userId);
    }

    // Add new transaction
    addTransaction(userId, transaction) {
        const data = this.loadData();
        if (data?.users[userId]) {
            data.users[userId].transactions.unshift(transaction);
            return this.saveData(data);
        }
        return false;
    }

    // Update account balance
    updateAccountBalance(userId, accountType, newBalance) {
        const data = this.loadData();
        if (data?.users[userId]?.accounts[accountType]) {
            data.users[userId].accounts[accountType].balance = newBalance;
            return this.saveData(data);
        }
        return false;
    }

    // Authenticate user
    authenticateUser(username, password) {
        const data = this.loadData();
        const hashedPassword = this.hashPassword(password);
        
        for (const userId in data.users) {
            const user = data.users[userId];
            if (user.credentials.username === username && 
                user.credentials.password === hashedPassword) {
                return { success: true, userId: userId, user: user };
            }
        }
        return { success: false, message: "Invalid username or password" };
    }

    // Reset to defaults
    resetToDefaults() {
        this.clearData();
        this.initializeData();
        return true;
    }

    // Clear all data (for demo purposes)
    clearData() {
        localStorage.removeItem(this.storageKey);
    }
}

// Export for use
window.LocalStorageManager = LocalStorageManager;
