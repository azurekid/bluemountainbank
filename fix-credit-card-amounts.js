#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix credit card transaction amounts
function fixCreditCardAmounts(userData) {
    // Fix primary credit card transactions
    if (userData.personalInfo?.creditCards?.primary?.transactions) {
        userData.personalInfo.creditCards.primary.transactions.forEach(transaction => {
            // Only payments should be positive, all other transactions should be negative
            if (transaction.type !== 'payment' && transaction.amount > 0) {
                transaction.amount = -Math.abs(transaction.amount);
            } else if (transaction.type === 'payment' && transaction.amount < 0) {
                transaction.amount = Math.abs(transaction.amount);
            }
        });
        
        // Recalculate balance (negative means debt owed)
        const totalSpent = userData.personalInfo.creditCards.primary.transactions
            .filter(t => t.type !== 'payment')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const totalPaid = userData.personalInfo.creditCards.primary.transactions
            .filter(t => t.type === 'payment')
            .reduce((sum, t) => sum + t.amount, 0);
        
        userData.personalInfo.creditCards.primary.balance = -(totalSpent - totalPaid);
    }
    
    // Fix secondary credit card transactions if exists
    if (userData.personalInfo?.creditCards?.secondary?.transactions) {
        userData.personalInfo.creditCards.secondary.transactions.forEach(transaction => {
            if (transaction.type !== 'payment' && transaction.amount > 0) {
                transaction.amount = -Math.abs(transaction.amount);
            } else if (transaction.type === 'payment' && transaction.amount < 0) {
                transaction.amount = Math.abs(transaction.amount);
            }
        });
        
        // Recalculate balance
        const totalSpent = userData.personalInfo.creditCards.secondary.transactions
            .filter(t => t.type !== 'payment')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const totalPaid = userData.personalInfo.creditCards.secondary.transactions
            .filter(t => t.type === 'payment')
            .reduce((sum, t) => sum + t.amount, 0);
        
        userData.personalInfo.creditCards.secondary.balance = -(totalSpent - totalPaid);
    }
    
    return userData;
}

// Get all sample data files
const sampleDataDir = '/Users/rogier/bluemountainbank/sample-data';
const files = [
    'alice_martinez.json',
    'bob_johnson.json',
    'carol_smith.json',
    'david_wilson.json',
    'emma_brown.json',
    'frank_miller.json'
];

let totalFixed = 0;

files.forEach(filename => {
    const filePath = path.join(sampleDataDir, filename);
    
    try {
        // Read the current data
        const rawData = fs.readFileSync(filePath, 'utf8');
        const userData = JSON.parse(rawData);
        
        console.log(`\nProcessing ${filename}...`);
        
        // Count transactions before fixing
        let transactionsBefore = 0;
        let positiveTransactionsBefore = 0;
        
        if (userData.personalInfo?.creditCards?.primary?.transactions) {
            transactionsBefore += userData.personalInfo.creditCards.primary.transactions.length;
            positiveTransactionsBefore += userData.personalInfo.creditCards.primary.transactions
                .filter(t => t.type !== 'payment' && t.amount > 0).length;
        }
        
        if (userData.personalInfo?.creditCards?.secondary?.transactions) {
            transactionsBefore += userData.personalInfo.creditCards.secondary.transactions.length;
            positiveTransactionsBefore += userData.personalInfo.creditCards.secondary.transactions
                .filter(t => t.type !== 'payment' && t.amount > 0).length;
        }
        
        // Fix the amounts
        const fixedData = fixCreditCardAmounts(userData);
        
        // Count after fixing
        let positiveTransactionsAfter = 0;
        
        if (fixedData.personalInfo?.creditCards?.primary?.transactions) {
            positiveTransactionsAfter += fixedData.personalInfo.creditCards.primary.transactions
                .filter(t => t.type !== 'payment' && t.amount > 0).length;
        }
        
        if (fixedData.personalInfo?.creditCards?.secondary?.transactions) {
            positiveTransactionsAfter += fixedData.personalInfo.creditCards.secondary.transactions
                .filter(t => t.type !== 'payment' && t.amount > 0).length;
        }
        
        console.log(`  Total transactions: ${transactionsBefore}`);
        console.log(`  Positive non-payment transactions before: ${positiveTransactionsBefore}`);
        console.log(`  Positive non-payment transactions after: ${positiveTransactionsAfter}`);
        console.log(`  Fixed: ${positiveTransactionsBefore - positiveTransactionsAfter} transactions`);
        
        // Write the fixed data back
        fs.writeFileSync(filePath, JSON.stringify(fixedData, null, 2));
        
        totalFixed += (positiveTransactionsBefore - positiveTransactionsAfter);
        
        console.log(`✅ ${filename} updated successfully`);
        
    } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message);
    }
});

console.log(`\n🎉 Fix complete! Total transactions fixed: ${totalFixed}`);
console.log('\nCredit card transaction amounts now follow proper conventions:');
console.log('  • Purchases/charges: negative amounts (money owed)');
console.log('  • Payments: positive amounts (money paid)');
