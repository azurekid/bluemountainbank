// Sensitive Data Generator for Educational Purposes
// ⚠️ WARNING: This is for learning/testing only. Never use in production.

class SensitiveDataGenerator {
    constructor() {
        // Valid SSN area numbers (excluding invalid ranges)
        this.validSSNAreas = [
            // Traditional state-based area numbers (001-728)
            ...Array.from({length: 728}, (_, i) => i + 1).filter(n => 
                n !== 666 && // Invalid area
                !(n >= 900 && n <= 999) // Reserved for future use
            )
        ];

        // Credit card prefixes for major issuers (updated for accuracy)
        this.creditCardPrefixes = {
            visa: ['4'],
            mastercard: ['51', '52', '53', '54', '55'], // Traditional Mastercard ranges
            amex: ['34', '37'],
            discover: ['6011', '65'] // Simplified to most common Discover prefixes
        };
    }

    /**
     * Generate a valid SSN using the randomized format (post-2011)
     * Format: XXX-XX-XXXX where:
     * - Area number (first 3 digits): 001-899 (excluding 666)
     * - Group number (middle 2 digits): 01-99
     * - Serial number (last 4 digits): 0001-9999
     */
    generateValidSSN() {
        // Generate area number (001-899, excluding 666)
        let areaNumber;
        do {
            areaNumber = Math.floor(Math.random() * 899) + 1;
        } while (areaNumber === 666);

        // Generate group number (01-99)
        const groupNumber = Math.floor(Math.random() * 99) + 1;

        // Generate serial number (0001-9999)
        const serialNumber = Math.floor(Math.random() * 9999) + 1;

        // Format with leading zeros
        const formattedArea = areaNumber.toString().padStart(3, '0');
        const formattedGroup = groupNumber.toString().padStart(2, '0');
        const formattedSerial = serialNumber.toString().padStart(4, '0');

        return `${formattedArea}-${formattedGroup}-${formattedSerial}`;
    }

    /**
     * Validate SSN format and rules
     */
    validateSSN(ssn) {
        // Remove any formatting
        const cleanSSN = ssn.replace(/\D/g, '');
        
        // Must be exactly 9 digits
        if (cleanSSN.length !== 9) return false;

        const area = parseInt(cleanSSN.substring(0, 3));
        const group = parseInt(cleanSSN.substring(3, 5));
        const serial = parseInt(cleanSSN.substring(5, 9));

        // Validate area number
        if (area === 0 || area === 666 || (area >= 900 && area <= 999)) return false;

        // Validate group number
        if (group === 0) return false;

        // Validate serial number
        if (serial === 0) return false;

        return true;
    }

    /**
     * Generate a valid credit card number using Luhn algorithm
     */
    generateValidCreditCard(type = 'visa') {
        const prefixes = this.creditCardPrefixes[type.toLowerCase()];
        if (!prefixes) {
            throw new Error(`Unsupported credit card type: ${type}`);
        }

        // Choose random prefix
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        // Determine target length
        let targetLength;
        switch (type.toLowerCase()) {
            case 'amex':
                targetLength = 15;
                break;
            case 'visa':
            case 'mastercard':
            case 'discover':
            default:
                targetLength = 16;
                break;
        }

        // Generate remaining digits (excluding check digit)
        let cardNumber = prefix;
        while (cardNumber.length < targetLength - 1) {
            cardNumber += Math.floor(Math.random() * 10);
        }

        // Calculate and append Luhn check digit
        const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
        cardNumber += checkDigit;

        return cardNumber;
    }

    /**
     * Calculate Luhn check digit
     */
    calculateLuhnCheckDigit(partialNumber) {
        const digits = partialNumber.split('').map(Number);
        let sum = 0;
        let alternate = false; // Start with false since we're adding a check digit

        // Process digits from right to left
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];
            
            // Double every second digit from the right (alternate pattern)
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit = digit - 9; // Equivalent to Math.floor(digit / 10) + (digit % 10)
                }
            }
            
            sum += digit;
            alternate = !alternate; // Toggle for next iteration
        }

        // Check digit makes the total sum divisible by 10
        return (10 - (sum % 10)) % 10;
    }

    /**
     * Validate credit card number using Luhn algorithm
     */
    validateCreditCard(cardNumber) {
        // Remove any formatting
        const cleanNumber = cardNumber.replace(/\D/g, '');
        
        // Must be 13-19 digits
        if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

        const digits = cleanNumber.split('').map(Number);
        let sum = 0;
        let alternate = false;

        // Process digits from right to left
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];
            
            // Double every second digit from the right (starting with second-to-last)
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit = digit - 9; // Equivalent to Math.floor(digit / 10) + (digit % 10)
                }
            }
            
            sum += digit;
            alternate = !alternate; // Toggle for next iteration
        }

        return sum % 10 === 0;
    }

    /**
     * Format credit card number with spaces
     */
    formatCreditCard(cardNumber) {
        const clean = cardNumber.replace(/\D/g, '');
        
        // American Express format: XXXX XXXXXX XXXXX
        if (clean.length === 15) {
            return clean.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
        }
        
        // Standard format: XXXX XXXX XXXX XXXX
        return clean.replace(/(\d{4})/g, '$1 ').trim();
    }

    /**
     * Mask sensitive data for display
     */
    maskSSN(ssn) {
        if (!ssn) return '';
        const clean = ssn.replace(/\D/g, '');
        if (clean.length === 9) {
            return `***-**-${clean.substring(5)}`;
        }
        return '***-**-****';
    }

    maskCreditCard(cardNumber) {
        if (!cardNumber) return '';
        const clean = cardNumber.replace(/\D/g, '');
        if (clean.length >= 13) {
            const lastFour = clean.substring(clean.length - 4);
            return `**** **** **** ${lastFour}`;
        }
        return '**** **** **** ****';
    }

    /**
     * Generate sample data for testing
     */
    generateSamplePersonalInfo() {
        // Generate credit cards and validate them
        const primaryCard = this.generateValidCreditCard('visa');
        const rewardsCard = this.generateValidCreditCard('mastercard');
        
        // Validate generated cards (for debugging)
        const primaryValid = this.validateCreditCard(primaryCard);
        const rewardsValid = this.validateCreditCard(rewardsCard);
        
        console.log(`Generated credit cards validation:
            Primary (Visa): ${primaryCard} - ${primaryValid ? 'VALID' : 'INVALID'}
            Rewards (Mastercard): ${rewardsCard} - ${rewardsValid ? 'VALID' : 'INVALID'}`);
        
        return {
            ssn: this.generateValidSSN(),
            creditCards: {
                primary: {
                    type: 'visa',
                    number: primaryCard,
                    expiryMonth: Math.floor(Math.random() * 12) + 1,
                    expiryYear: new Date().getFullYear() + Math.floor(Math.random() * 5) + 1,
                    cvv: Math.floor(Math.random() * 900) + 100,
                    name: 'Primary Card',
                    isActive: true
                },
                rewards: {
                    type: 'mastercard',
                    number: rewardsCard,
                    expiryMonth: Math.floor(Math.random() * 12) + 1,
                    expiryYear: new Date().getFullYear() + Math.floor(Math.random() * 5) + 1,
                    cvv: Math.floor(Math.random() * 900) + 100,
                    name: 'Rewards Card',
                    isActive: true
                }
            }
        };
    }

    /**
     * Generate a random date of birth for testing (18-80 years old)
     */
    generateRandomDateOfBirth() {
        const today = new Date();
        const currentYear = today.getFullYear();
        
        // Generate age between 18 and 80
        const age = Math.floor(Math.random() * (80 - 18 + 1)) + 18;
        const birthYear = currentYear - age;
        
        // Random month (0-11)
        const birthMonth = Math.floor(Math.random() * 12);
        
        // Random day (1-28 to avoid month/leap year issues)
        const birthDay = Math.floor(Math.random() * 28) + 1;
        
        const birthDate = new Date(birthYear, birthMonth, birthDay);
        return birthDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }

    /**
     * Generate a random mother's maiden name for testing
     */
    generateRandomMaidenName() {
        const maidenNames = [
            'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Fisher', 'Garcia', 'Harris',
            'Jackson', 'Johnson', 'Jones', 'King', 'Lewis', 'Martinez', 'Miller', 'Moore',
            'Nelson', 'Parker', 'Roberts', 'Robinson', 'Rodriguez', 'Smith', 'Taylor', 'Thompson',
            'Walker', 'White', 'Williams', 'Wilson', 'Young', 'Allen', 'Baker', 'Campbell',
            'Carter', 'Collins', 'Cooper', 'Edwards', 'Green', 'Hall', 'Hill', 'Lee',
            'Lopez', 'Mitchell', 'Morgan', 'Murphy', 'Phillips', 'Reed', 'Rogers', 'Scott',
            'Stewart', 'Turner', 'Ward', 'Watson', 'Wood', 'Wright'
        ];
        
        return maidenNames[Math.floor(Math.random() * maidenNames.length)];
    }
}

// Export for use
window.SensitiveDataGenerator = SensitiveDataGenerator;

// Educational note display
console.log(`
⚠️  EDUCATIONAL USE ONLY ⚠️

This SSN and Credit Card generator is for learning and testing purposes only.

Generated data characteristics:
- SSNs follow post-2011 randomized format
- Credit cards pass Luhn algorithm validation
- All numbers are synthetic and not linked to real accounts

NEVER use this in production applications or with real financial data.
`);
