#!/usr/bin/env python3

import json
import os

def fix_credit_card_amounts(user_data):
    """Fix credit card transaction amounts to follow proper conventions"""
    
    # Fix primary credit card transactions
    if 'personalInfo' in user_data and 'creditCards' in user_data['personalInfo']:
        credit_cards = user_data['personalInfo']['creditCards']
        
        for card_type in ['primary', 'secondary']:
            if card_type in credit_cards and 'transactions' in credit_cards[card_type]:
                transactions = credit_cards[card_type]['transactions']
                
                for transaction in transactions:
                    # Only payments should be positive, all other transactions should be negative
                    if transaction.get('type') != 'payment' and transaction.get('amount', 0) > 0:
                        transaction['amount'] = -abs(transaction['amount'])
                    elif transaction.get('type') == 'payment' and transaction.get('amount', 0) < 0:
                        transaction['amount'] = abs(transaction['amount'])
                
                # Recalculate balance (negative means debt owed)
                total_spent = sum(abs(t['amount']) for t in transactions if t.get('type') != 'payment')
                total_paid = sum(t['amount'] for t in transactions if t.get('type') == 'payment')
                credit_cards[card_type]['balance'] = -(total_spent - total_paid)
    
    return user_data

# Process all sample data files
sample_data_dir = '/Users/rogier/bluemountainbank/sample-data'
files = [
    'alice_martinez.json',
    'bob_johnson.json', 
    'carol_smith.json',
    'david_wilson.json',
    'emma_brown.json',
    'frank_miller.json'
]

total_fixed = 0

for filename in files:
    file_path = os.path.join(sample_data_dir, filename)
    
    try:
        # Read the current data
        with open(file_path, 'r') as f:
            user_data = json.load(f)
        
        print(f"\nProcessing {filename}...")
        
        # Count transactions before fixing
        transactions_before = 0
        positive_transactions_before = 0
        
        if ('personalInfo' in user_data and 
            'creditCards' in user_data['personalInfo']):
            
            credit_cards = user_data['personalInfo']['creditCards']
            
            for card_type in ['primary', 'secondary']:
                if card_type in credit_cards and 'transactions' in credit_cards[card_type]:
                    transactions = credit_cards[card_type]['transactions']
                    transactions_before += len(transactions)
                    positive_transactions_before += len([
                        t for t in transactions 
                        if t.get('type') != 'payment' and t.get('amount', 0) > 0
                    ])
        
        # Fix the amounts
        fixed_data = fix_credit_card_amounts(user_data)
        
        # Count after fixing
        positive_transactions_after = 0
        
        if ('personalInfo' in fixed_data and 
            'creditCards' in fixed_data['personalInfo']):
            
            credit_cards = fixed_data['personalInfo']['creditCards']
            
            for card_type in ['primary', 'secondary']:
                if card_type in credit_cards and 'transactions' in credit_cards[card_type]:
                    transactions = credit_cards[card_type]['transactions']
                    positive_transactions_after += len([
                        t for t in transactions 
                        if t.get('type') != 'payment' and t.get('amount', 0) > 0
                    ])
        
        print(f"  Total transactions: {transactions_before}")
        print(f"  Positive non-payment transactions before: {positive_transactions_before}")
        print(f"  Positive non-payment transactions after: {positive_transactions_after}")
        print(f"  Fixed: {positive_transactions_before - positive_transactions_after} transactions")
        
        # Write the fixed data back
        with open(file_path, 'w') as f:
            json.dump(fixed_data, f, indent=2)
        
        total_fixed += (positive_transactions_before - positive_transactions_after)
        
        print(f"✅ {filename} updated successfully")
        
    except Exception as error:
        print(f"❌ Error processing {filename}: {error}")

print(f"\n🎉 Fix complete! Total transactions fixed: {total_fixed}")
print('\nCredit card transaction amounts now follow proper conventions:')
print('  • Purchases/charges: negative amounts (money owed)')
print('  • Payments: positive amounts (money paid)')
