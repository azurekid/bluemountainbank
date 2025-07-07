#!/usr/bin/env python3
"""
Fix Alice's backup card to have transactions
"""

import json
import random
from datetime import datetime, timedelta

def generate_transactions_for_alice_backup():
    """Generate transactions for Alice's backup Amex card"""
    
    # Read Alice's data
    with open('/Users/rogier/bluemountainbank/sample-data/alice_martinez.json', 'r') as f:
        data = json.load(f)
    
    # Transaction categories and merchants suitable for travel card
    transactions_data = [
        {"category": "airlines", "merchants": ["American Airlines", "Delta Air Lines", "United Airlines", "Southwest Airlines"]},
        {"category": "hotels", "merchants": ["Marriott Hotels", "Hilton Hotels", "Holiday Inn", "Hampton Inn"]},
        {"category": "restaurants", "merchants": ["Olive Garden", "Starbucks", "Chipotle Mexican Grill", "Subway"]},
        {"category": "gas", "merchants": ["Shell", "Chevron", "Exxon Mobil", "BP"]},
        {"category": "shopping", "merchants": ["Amazon", "Target", "Walmart", "Best Buy"]},
        {"category": "entertainment", "merchants": ["Netflix", "Spotify", "Disney+", "AMC Theatres"]},
    ]
    
    # Generate 25 transactions over the last 60 days
    transactions = []
    base_date = datetime.now()
    
    for i in range(25):
        # Random date within last 60 days
        days_ago = random.randint(1, 60)
        trans_date = base_date - timedelta(days=days_ago)
        
        # Random category and merchant
        category_data = random.choice(transactions_data)
        merchant = random.choice(category_data["merchants"])
        
        # Random amount based on category
        if category_data["category"] == "airlines":
            amount = round(random.uniform(250, 800), 2)
        elif category_data["category"] == "hotels":
            amount = round(random.uniform(150, 400), 2)
        elif category_data["category"] == "restaurants":
            amount = round(random.uniform(25, 120), 2)
        elif category_data["category"] == "gas":
            amount = round(random.uniform(40, 80), 2)
        elif category_data["category"] == "shopping":
            amount = round(random.uniform(50, 300), 2)
        else:  # entertainment
            amount = round(random.uniform(10, 50), 2)
        
        transaction = {
            "id": f"cc_backup_{int(trans_date.timestamp())}_{random.randint(1000, 9999)}",
            "date": trans_date.strftime("%Y-%m-%d"),
            "description": merchant,
            "amount": amount,
            "type": "purchase",
            "category": category_data["category"],
            "cardType": "backup",
            "pending": False
        }
        
        transactions.append(transaction)
    
    # Add two payment transactions
    payment_dates = [
        base_date - timedelta(days=15),
        base_date - timedelta(days=45)
    ]
    
    for i, payment_date in enumerate(payment_dates):
        payment_amount = round(random.uniform(400, 800), 2)
        
        payment = {
            "id": f"cc_payment_backup_{int(payment_date.timestamp())}",
            "date": payment_date.strftime("%Y-%m-%d"),
            "description": "Payment - Thank You",
            "amount": -payment_amount,
            "type": "payment",
            "category": "payment",
            "cardType": "backup",
            "pending": False
        }
        
        transactions.append(payment)
    
    # Sort transactions by date (newest first)
    transactions.sort(key=lambda x: x["date"], reverse=True)
    
    # Add transactions to Alice's backup card
    data["personalInfo"]["creditCards"]["backup"]["transactions"] = transactions
    data["personalInfo"]["creditCards"]["backup"]["isActive"] = True
    
    # Calculate balance
    total_charges = sum(t["amount"] for t in transactions if t["amount"] > 0)
    total_payments = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)
    balance = total_charges - total_payments
    data["personalInfo"]["creditCards"]["backup"]["balance"] = -balance
    
    # Save updated data
    with open('/Users/rogier/bluemountainbank/sample-data/alice_martinez.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Added {len(transactions)} transactions to Alice's backup card")
    print(f"  - Purchase transactions: {len([t for t in transactions if t['amount'] > 0])}")
    print(f"  - Payment transactions: {len([t for t in transactions if t['amount'] < 0])}")
    print(f"  - Updated balance: -${balance:.2f}")

if __name__ == "__main__":
    generate_transactions_for_alice_backup()
