import json
import random
import os
from datetime import datetime, timedelta

class TransactionGenerator:
    def __init__(self):
        self.merchants = {
            'groceries': ['Whole Foods Market', 'Safeway', 'Trader Joes', 'Kroger', 'Target Groceries',
                         'Costco Wholesale', 'Walmart Supercenter', 'Fresh Market', 'Harris Teeter'],
            'restaurants': ['Starbucks', 'McDonalds', 'Chipotle Mexican Grill', 'Subway', 'Olive Garden',
                           'Dominos Pizza', 'Taco Bell', 'Panera Bread', 'Cheesecake Factory', 'Red Lobster'],
            'gas': ['Shell', 'Chevron', 'BP', 'Exxon Mobil', 'Texaco', 'Arco', 'Valero', '76'],
            'shopping': ['Amazon.com', 'Target', 'Walmart', 'Best Buy', 'Macys', 'Nordstrom',
                        'Home Depot', 'Lowes', 'CVS Pharmacy', 'Walgreens'],
            'hotels': ['Marriott Hotels', 'Hilton Hotels', 'Holiday Inn', 'Hampton Inn', 'Hyatt Regency',
                      'Sheraton Hotels', 'Courtyard by Marriott', 'Embassy Suites', 'Doubletree'],
            'airlines': ['American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines',
                        'JetBlue Airways', 'Alaska Airlines', 'Spirit Airlines'],
            'entertainment': ['Netflix', 'Spotify', 'Apple Music', 'Disney+', 'HBO Max', 'Amazon Prime',
                             'YouTube Premium', 'Hulu', 'AMC Theatres', 'Regal Cinemas'],
            'utilities': ['PG&E Electric', 'Southern California Edison', 'ConEd', 'Verizon', 'AT&T', 'Comcast',
                         'T-Mobile', 'Charter Communications']
        }
        
        self.categories = {
            'groceries': {'min': 25, 'max': 200, 'frequency': 8},
            'restaurants': {'min': 12, 'max': 85, 'frequency': 12},
            'gas': {'min': 35, 'max': 75, 'frequency': 6},
            'shopping': {'min': 20, 'max': 350, 'frequency': 10},
            'hotels': {'min': 120, 'max': 450, 'frequency': 2},
            'airlines': {'min': 180, 'max': 650, 'frequency': 1},
            'entertainment': {'min': 8, 'max': 45, 'frequency': 5},
            'utilities': {'min': 65, 'max': 280, 'frequency': 3}
        }

    def generate_random_date(self, start_date, end_date):
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        return start_date + timedelta(days=random_days)

    def generate_credit_card_transactions(self, card_type, months_back=3):
        transactions = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months_back * 30)
        
        # Generate purchases for each category
        for category, config in self.categories.items():
            frequency = config['frequency']
            num_transactions = max(1, int(frequency * months_back / 3))
            
            for i in range(num_transactions):
                merchant = random.choice(self.merchants[category])
                amount = random.randint(config['min'], config['max'])
                date = self.generate_random_date(start_date, end_date)
                
                transaction = {
                    'id': f'cc_{card_type}_{int(date.timestamp())}_{random.randint(1000, 9999)}',
                    'date': date.strftime('%Y-%m-%d'),
                    'description': merchant,
                    'amount': round(amount + random.random(), 2),
                    'type': 'purchase',
                    'category': category,
                    'cardType': card_type,
                    'pending': False
                }
                transactions.append(transaction)
        
        # Add monthly payments
        for month in range(months_back):
            payment_date = datetime.now().replace(day=15) - timedelta(days=month * 30)
            # Calculate payment amount based on purchases
            monthly_purchases = [t for t in transactions if 
                               datetime.strptime(t['date'], '%Y-%m-%d').month == payment_date.month and
                               datetime.strptime(t['date'], '%Y-%m-%d').year == payment_date.year]
            total_purchases = sum(t['amount'] for t in monthly_purchases)
            payment_amount = max(50, int(total_purchases * 0.7))  # Pay 70% of purchases
            
            if payment_date <= datetime.now():
                transactions.append({
                    'id': f'cc_payment_{card_type}_{int(payment_date.timestamp())}',
                    'date': payment_date.strftime('%Y-%m-%d'),
                    'description': f'Payment - Thank You',
                    'amount': -payment_amount,
                    'type': 'payment',
                    'category': 'payment',
                    'cardType': card_type,
                    'pending': False
                })
        
        return sorted(transactions, key=lambda x: x['date'], reverse=True)

    def generate_bank_transactions(self, profile, months_back=3):
        transactions = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months_back * 30)
        
        # Generate salary deposits
        for month in range(months_back):
            salary_date = datetime.now().replace(day=1) - timedelta(days=month * 30)
            salary_amount = self.get_salary_amount(profile.get('profession', 'Professional'))
            
            transactions.append({
                'id': f'salary_{int(salary_date.timestamp())}',
                'date': salary_date.strftime('%Y-%m-%d'),
                'description': f'Salary Deposit - {profile.get("profession", "Company")}',
                'amount': salary_amount,
                'type': 'deposit',
                'account': 'checking',
                'category': 'income',
                'icon': 'fas fa-money-bill-wave'
            })
        
        # Generate bills
        bills = [
            {'name': 'Rent Payment - Bay Area Apartments', 'amount': self.get_rent_amount(profile.get('address', '')), 'category': 'housing'},
            {'name': 'Electric Bill - PG&E', 'amount': random.randint(80, 160), 'category': 'utilities'},
            {'name': 'Internet - Comcast', 'amount': 89, 'category': 'utilities'},
            {'name': 'Phone - Verizon', 'amount': 75, 'category': 'utilities'},
            {'name': 'Car Insurance', 'amount': random.randint(140, 200), 'category': 'insurance'},
            {'name': 'Health Insurance', 'amount': random.randint(250, 350), 'category': 'insurance'}
        ]
        
        for bill in bills:
            for month in range(months_back):
                bill_date = datetime.now() - timedelta(days=month * 30 + random.randint(1, 28))
                transactions.append({
                    'id': f'bill_{bill["name"].replace(" ", "_")}_{int(bill_date.timestamp())}',
                    'date': bill_date.strftime('%Y-%m-%d'),
                    'description': bill['name'],
                    'amount': -bill['amount'],
                    'type': 'withdrawal',
                    'account': 'checking',
                    'category': bill['category'],
                    'icon': 'fas fa-file-invoice-dollar'
                })
        
        # Generate credit card payments (matching the CC payments)
        for month in range(months_back):
            payment_date = datetime.now().replace(day=15) - timedelta(days=month * 30)
            payment_amount = random.randint(800, 1500)
            transactions.append({
                'id': f'cc_payment_bank_{int(payment_date.timestamp())}',
                'date': payment_date.strftime('%Y-%m-%d'),
                'description': 'Credit Card Payment',
                'amount': -payment_amount,
                'type': 'withdrawal',
                'account': 'checking',
                'category': 'payment',
                'icon': 'fas fa-credit-card'
            })
        
        # Generate misc transactions
        misc_transactions = [
            {'name': 'ATM Withdrawal', 'amount': -100, 'category': 'cash'},
            {'name': 'Mobile Deposit', 'amount': random.randint(50, 300), 'category': 'deposit'},
            {'name': 'Transfer to Savings', 'amount': -500, 'category': 'transfer'},
            {'name': 'Gym Membership - 24 Hour Fitness', 'amount': -45, 'category': 'fitness'},
            {'name': 'Netflix', 'amount': -15.99, 'category': 'entertainment'},
            {'name': 'Spotify Premium', 'amount': -9.99, 'category': 'entertainment'}
        ]
        
        for misc in misc_transactions:
            for i in range(random.randint(1, 3)):
                date = self.generate_random_date(start_date, end_date)
                transactions.append({
                    'id': f'misc_{misc["name"].replace(" ", "_")}_{int(date.timestamp())}',
                    'date': date.strftime('%Y-%m-%d'),
                    'description': misc['name'],
                    'amount': misc['amount'],
                    'type': 'deposit' if misc['amount'] > 0 else 'withdrawal',
                    'account': 'checking',
                    'category': misc['category'],
                    'icon': 'fas fa-exchange-alt'
                })
        
        return sorted(transactions, key=lambda x: x['date'], reverse=True)

    def get_salary_amount(self, profession):
        salaries = {
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
        }
        return salaries.get(profession, 5000)

    def get_rent_amount(self, address):
        if 'San Francisco' in address:
            return random.randint(2600, 3200)
        elif 'New York' in address:
            return random.randint(2900, 3500)
        elif 'Los Angeles' in address:
            return random.randint(2200, 2800)
        elif 'Chicago' in address:
            return random.randint(1600, 2200)
        elif 'Austin' in address:
            return random.randint(1400, 1800)
        else:
            return random.randint(1200, 1600)

def main():
    generator = TransactionGenerator()
    
    users = [
        'alice_martinez.json',
        'bob_johnson.json', 
        'carol_smith.json',
        'david_wilson.json',
        'emma_brown.json',
        'frank_miller.json'
    ]
    
    print('Adding transaction data to sample users...')
    
    for user_file in users:
        try:
            file_path = f'sample-data/{user_file}'
            if not os.path.exists(file_path):
                continue
    
            with open(file_path, 'r') as f:
                user_data = json.load(f)
            
            profile = user_data.get('profile', {})
            
            # Generate bank transactions
            bank_transactions = generator.generate_bank_transactions(profile, 3)
            user_data['recentTransactions'] = bank_transactions[:15]  # Keep last 15
            user_data['allTransactions'] = bank_transactions
            
            # Generate credit card transactions for each card
            if 'personalInfo' in user_data and 'creditCards' in user_data['personalInfo']:
                for card_name, card_data in user_data['personalInfo']['creditCards'].items():
                    if card_data.get('isActive', True):
                        cc_transactions = generator.generate_credit_card_transactions(card_name, 3)
                        card_data['transactions'] = cc_transactions
                        
                        # Calculate current balance based on transactions
                        total_purchases = sum(t['amount'] for t in cc_transactions if t['type'] == 'purchase')
                        total_payments = sum(abs(t['amount']) for t in cc_transactions if t['type'] == 'payment')
                        card_data['balance'] = -(total_purchases - total_payments)
            
            with open(file_path, 'w') as f:
                json.dump(user_data, f, indent=2)
            
            print(f'✅ Added transaction data to {user_file}')
            
        except Exception as e:
            print(f'❌ Error updating {user_file}: {e}')
    
    print('Transaction data generation completed!')

if __name__ == '__main__':
    main()
