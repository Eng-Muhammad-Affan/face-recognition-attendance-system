import uuid

def generate_registration_number():
    string = str(uuid.uuid4()).replace('-', '')[:6]
    
    # Separate letters and numbers
    letters = [char for char in string if char.isalpha()]
    numbers = [char for char in string if char.isdigit()]
    
    # Combine: first 3 from letters, last 3 from numbers, or vice versa
    result = ''.join(letters[:3]) + ''.join(numbers[:3])
    
    return result