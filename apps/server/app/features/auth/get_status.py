from datetime import datetime 

def get_status():
    current_time = datetime.now()
    current_hour = current_time.hour

    # 2. Check the class timing logic
    if current_hour <= 15:
        return "present"
        
    elif 15 <= current_hour < 18:
        return "late"

    else:
        return "absent"