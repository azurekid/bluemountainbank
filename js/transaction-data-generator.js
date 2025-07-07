// Transaction Data Generator for Sample Users
// Generates realistic banking and credit card transactions

class TransactionDataGenerator {
    constructor() {
        this.merchants = {
            groceries: [
                'Whole Foods Market', 'Safeway', 'Trader Joe\'s', 'Kroger', 'Target Groceries',
                'Costco Wholesale', 'Walmart Supercenter', 'Fresh Market', 'Harris Teeter'
            ],
            restaurants: [
                'Starbucks', 'McDonald\'s', 'Chipotle Mexican Grill', 'Subway', 'Olive Garden',
                'Domino\'s Pizza', 'Taco Bell', 'Panera Bread', 'Cheesecake Factory', 'Red Lobster'
            ],
            gas: [
                'Shell', 'Chevron', 'BP', 'Exxon Mobil', 'Texaco', 'Arco', 'Valero', '76'
            ],
            shopping: [
                'Amazon.com', 'Target', 'Walmart', 'Best Buy', 'Macy\'s', 'Nordstrom',
                'Home Depot', 'Lowe\'s', 'CVS Pharmacy', 'Walgreens'
            ],
            hotels: [
                'Marriott Hotels', 'Hilton Hotels', 'Holiday Inn', 'Hampton Inn', 'Hyatt Regency',
                'Sheraton Hotels', 'Courtyard by Marriott', 'Embassy Suites', 'Doubletree'
            ],
            airlines: [
                'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
                'JetBlue Airways', 'Alaska Airlines', 'Spirit Airlines'
            ],
            entertainment: [
                'Netflix', 'Spotify', 'Apple Music', 'Disney+', 'HBO Max', 'Amazon Prime',
                'YouTube Premium', 'Hulu', 'AMC Theatres', 'Regal Cinemas'
            ],
            utilities: [
                'PG&E', 'Southern California Edison', 'ConEd', 'Verizon', 'AT&T', 'Comcast',
                'T-Mobile', 'Charter Communications'
            ],
            automotive: [
                'Shell', 'Jiffy Lube', 'Valvoline Instant Oil', 'Firestone', 'Midas',
                'AutoZone', 'O\'Reilly Auto Parts'
            ]
        };

        this.categories = {
            groceries: { min: 25, max: 200, frequency: 8 },
            restaurants: { min: 12, max: 85, frequency: 12 },
            gas: { min: 35, max: 75, frequency: 6 },
            shopping: { min: 20, max: 350, frequency: 10 },
            hotels: { min: 120, max: 450, frequency: 2 },
            airlines: { min: 180, max: 650, frequency: 1 },
            entertainment: { min: 8, max: 45, frequency: 5 },
            utilities: { min: 65, max: 280, frequency: 3 },
            automotive: { min: 25, max: 150, frequency: 3 }
        };
    }

    generateTransactionAmount(category) {
        const range = this.categories[category];
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    generateRandomDate(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    generateCreditCardTransactions(cardType, monthsBack = 3) {
        const transactions = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);

        // Generate transactions for each category
        Object.keys(this.categories).forEach(category => {
            const frequency = this.categories[category].frequency;
            const numTransactions = Math.floor(frequency * monthsBack / 3); // Adjust for time period

            for (let i = 0; i < numTransactions; i++) {
                const merchants = this.merchants[category];
                const merchant = merchants[Math.floor(Math.random() * merchants.length)];
                const amount = this.generateTransactionAmount(category);
                const date = this.generateRandomDate(startDate, endDate);

                transactions.push({
                    id: `cc_${cardType}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                    date: date.toISOString().split('T')[0],
                    description: merchant,
                    amount: -amount, // Credit card charges are negative
                    type: 'purchase',
                    category: category,
                    cardType: cardType,
                    pending: Math.random() < 0.1 // 10% chance of being pending
                });
            }
        });

        // Add monthly payment (positive amount)
        for (let month = 0; month < monthsBack; month++) {
            const paymentDate = new Date();
            paymentDate.setMonth(paymentDate.getMonth() - month);
            paymentDate.setDate(15); // Payment on 15th of each month

            const totalPurchases = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === paymentDate.getMonth() && 
                           tDate.getFullYear() === paymentDate.getFullYear();
                })
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            if (totalPurchases > 0) {
                const paymentAmount = Math.floor(totalPurchases * 0.7); // Pay 70% of purchases
                transactions.push({
                    id: `cc_payment_${cardType}_${paymentDate.getTime()}`,
                    date: paymentDate.toISOString().split('T')[0],
                    description: `Credit Card Payment - ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`,
                    amount: paymentAmount,
                    type: 'payment',
                    category: 'payment',
                    cardType: cardType,
                    pending: false
                });
            }
        }

        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    generateBankTransactions(profile, monthsBack = 3) {
        const transactions = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);

        // Generate salary deposits (monthly)
        for (let month = 0; month < monthsBack; month++) {
            const salaryDate = new Date();
            salaryDate.setMonth(salaryDate.getMonth() - month);
            salaryDate.setDate(1); // First of each month

            const salaryAmount = this.getSalaryAmount(profile.profession);
            transactions.push({
                id: `salary_${salaryDate.getTime()}`,
                date: salaryDate.toISOString().split('T')[0],
                description: `Salary Deposit - ${profile.profession}`,
                amount: salaryAmount,
                type: 'deposit',
                account: 'checking',
                category: 'income',
                icon: 'fas fa-money-bill-wave'
            });
        }

        // Generate recurring bills
        this.generateRecurringBills(transactions, startDate, endDate, profile);

        // Generate credit card payments (matching credit card transactions)
        this.generateCreditCardPayments(transactions, startDate, endDate);

        // Generate misc transactions
        this.generateMiscTransactions(transactions, startDate, endDate);

        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getSalaryAmount(profession) {
        const salaries = {
            'Software Engineer': 8500,
            'Marketing Manager': 6500,
            'Teacher': 4200,
            'Sales Manager': 5800,
            'Nurse': 4800,
            'Accountant': 5200,
            'Doctor': 12000,
            'Lawyer': 9500,
            'Consultant': 7500,
            'Designer': 5500
        };
        return salaries[profession] || 5000;
    }

    generateRecurringBills(transactions, startDate, endDate, profile) {
        const bills = [
            { name: 'Rent Payment', amount: this.getRentAmount(profile.address), category: 'housing' },
            { name: 'Electric Bill - PG&E', amount: 120, category: 'utilities' },
            { name: 'Internet - Comcast', amount: 89, category: 'utilities' },
            { name: 'Phone - Verizon', amount: 75, category: 'utilities' },
            { name: 'Car Insurance', amount: 165, category: 'insurance' },
            { name: 'Health Insurance', amount: 285, category: 'insurance' }
        ];

        bills.forEach(bill => {
            for (let month = 0; month < 3; month++) {
                const billDate = new Date();
                billDate.setMonth(billDate.getMonth() - month);
                billDate.setDate(5 + Math.floor(Math.random() * 10)); // Random day between 5-15

                transactions.push({
                    id: `bill_${bill.name.replace(/\s+/g, '_')}_${billDate.getTime()}`,
                    date: billDate.toISOString().split('T')[0],
                    description: bill.name,
                    amount: -bill.amount,
                    type: 'withdrawal',
                    account: 'checking',
                    category: bill.category,
                    icon: 'fas fa-file-invoice-dollar'
                });
            }
        });
    }

    getRentAmount(address) {
        if (address.includes('San Francisco')) return 2800;
        if (address.includes('New York')) return 3200;
        if (address.includes('Los Angeles')) return 2400;
        if (address.includes('Chicago')) return 1800;
        if (address.includes('Austin')) return 1600;
        return 1400;
    }

    generateCreditCardPayments(transactions, startDate, endDate) {
        for (let month = 0; month < 3; month++) {
            const paymentDate = new Date();
            paymentDate.setMonth(paymentDate.getMonth() - month);
            paymentDate.setDate(15);

            const paymentAmount = 800 + Math.floor(Math.random() * 600); // $800-$1400
            transactions.push({
                id: `cc_payment_${paymentDate.getTime()}`,
                date: paymentDate.toISOString().split('T')[0],
                description: 'Credit Card Payment',
                amount: -paymentAmount,
                type: 'withdrawal',
                account: 'checking',
                category: 'payment',
                icon: 'fas fa-credit-card'
            });
        }
    }

    generateMiscTransactions(transactions, startDate, endDate) {
        const miscTransactions = [
            { name: 'ATM Withdrawal', amount: -100, category: 'cash' },
            { name: 'Mobile Deposit', amount: 150, category: 'deposit' },
            { name: 'Transfer to Savings', amount: -500, category: 'transfer' },
            { name: 'Gym Membership', amount: -45, category: 'fitness' },
            { name: 'Netflix', amount: -15.99, category: 'entertainment' }
        ];

        miscTransactions.forEach(txn => {
            for (let i = 0; i < 2; i++) {
                const date = this.generateRandomDate(startDate, endDate);
                transactions.push({
                    id: `misc_${txn.name.replace(/\s+/g, '_')}_${date.getTime()}`,
                    date: date.toISOString().split('T')[0],
                    description: txn.name,
                    amount: txn.amount,
                    type: txn.amount > 0 ? 'deposit' : 'withdrawal',
                    account: 'checking',
                    category: txn.category,
                    icon: 'fas fa-exchange-alt'
                });
            }
        });
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransactionDataGenerator;
} else {
    window.TransactionDataGenerator = TransactionDataGenerator;
}
