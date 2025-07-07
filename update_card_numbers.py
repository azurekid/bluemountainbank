#!/usr/bin/env python3
"""
Update all sample data files to use valid test credit card numbers
"""

import json
import os
import random

# Valid test credit card numbers
TEST_CARDS = {
    'visa': [
        '4000000000000002',  # Visa
        '4111111111111111',  # Visa
        '4242424242424242',  # Visa
        '4000000000000044',  # Visa
        '4000000000000101',  # Visa
    ],
    'mastercard': [
        '5200828282828210',  # Mastercard
        '5105105105105100',  # Mastercard
        '5555555555554444',  # Mastercard
        '5424000000000015',  # Mastercard
        '2223003122003222',  # Mastercard
    ],
    'amex': [
        '378282246310005',   # Amex
        '371449635398431',   # Amex
        '378734493671000',   # Amex
        '343434343434343',   # Amex
        '341111111111111',   # Amex
    ]
}

def update_credit_card_numbers():
    """Update all sample data files with valid test credit card numbers"""
    sample_dir = '/Users/rogier/bluemountainbank/sample-data'
    
    for filename in os.listdir(sample_dir):
        if filename.endswith('.json') and not filename.startswith('.'):
            filepath = os.path.join(sample_dir, filename)
            
            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                print(f"\nUpdating {filename}...")
                
                # Update credit card numbers
                credit_cards = data.get('personalInfo', {}).get('creditCards', {})
                
                for card_type, card_data in credit_cards.items():
                    if isinstance(card_data, dict):
                        current_type = card_data.get('type', '').lower()
                        
                        # Map card types to test card numbers
                        if current_type in ['visa']:
                            new_number = random.choice(TEST_CARDS['visa'])
                        elif current_type in ['mastercard']:
                            new_number = random.choice(TEST_CARDS['mastercard'])
                        elif current_type in ['amex', 'american express']:
                            new_number = random.choice(TEST_CARDS['amex'])
                        else:
                            # Default to visa for unknown types
                            new_number = random.choice(TEST_CARDS['visa'])
                        
                        old_number = card_data.get('number')
                        card_data['number'] = new_number
                        
                        print(f"  {card_type}: {old_number} -> {new_number}")
                
                # Save updated data
                with open(filepath, 'w') as f:
                    json.dump(data, f, indent=2)
                
                print(f"  ✓ Updated {filename}")
                
            except Exception as e:
                print(f"  ✗ Error updating {filename}: {str(e)}")

if __name__ == "__main__":
    update_credit_card_numbers()
    print("\n✓ All credit card numbers updated!")
