import json
import os

def verify_sample_data():
    users = ['alice_martinez.json', 'bob_johnson.json', 'carol_smith.json', 'david_wilson.json', 'emma_brown.json', 'frank_miller.json']
    
    for user_file in users:
        file_path = f'sample-data/{user_file}'
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            print(f'=== {user_file} ===')
            personal_info = data.get('personalInfo', {})
            print(f'SSN: {personal_info.get("ssn", "Not found")}')
            print(f'DOB: {personal_info.get("dateOfBirth", "Not found")}')
            print(f'Maiden Name: {personal_info.get("mothersMaidenName", "Not found")}')
            
            credit_cards = personal_info.get('creditCards', {})
            print(f'Credit Cards: {len(credit_cards)} cards')
            
            for card_name, card_data in credit_cards.items():
                transactions = card_data.get('transactions', [])
                card_number = card_data.get('number', '')
                card_type = card_data.get('type', 'Unknown')
                balance = card_data.get('balance', 0)
                print(f'  {card_name}: {card_type} ending in {card_number[-4:]} - {len(transactions)} transactions, Balance: ${balance:.2f}')
            
            bank_transactions = len(data.get('recentTransactions', []))
            all_transactions = len(data.get('allTransactions', []))
            print(f'Bank Transactions: {bank_transactions} recent, {all_transactions} total')
            
            # Check for credit card payments in bank transactions
            cc_payments = [t for t in data.get('allTransactions', []) if 'Credit Card Payment' in t.get('description', '')]
            print(f'Credit Card Payments in Bank: {len(cc_payments)}')
            print()

if __name__ == '__main__':
    verify_sample_data()
