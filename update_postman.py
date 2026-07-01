import json

with open('PeakAgent_Postman_Collection.json', 'r') as f:
    data = json.load(f)

# Find "1. Authentication & Profile"
auth_folder = next(item for item in data['item'] if item['name'] == '1. Authentication & Profile')

auth_folder['item'].extend([
    {
        "name": "Forgot Password",
        "request": {
            "method": "POST",
            "header": [],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"email\": \"sarah@example.com\"\n}",
                "options": {
                    "raw": {
                        "language": "json"
                    }
                }
            },
            "url": {
                "raw": "{{base_url}}/api/auth/forgot-password/",
                "host": ["{{base_url}}"],
                "path": ["api", "auth", "forgot-password", ""]
            }
        }
    },
    {
        "name": "Verify OTP",
        "request": {
            "method": "POST",
            "header": [],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"email\": \"sarah@example.com\",\n    \"otp\": \"123456\"\n}",
                "options": {
                    "raw": {
                        "language": "json"
                    }
                }
            },
            "url": {
                "raw": "{{base_url}}/api/auth/verify-otp/",
                "host": ["{{base_url}}"],
                "path": ["api", "auth", "verify-otp", ""]
            }
        }
    },
    {
        "name": "Reset Password",
        "request": {
            "method": "POST",
            "header": [],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"email\": \"sarah@example.com\",\n    \"otp\": \"123456\",\n    \"new_password\": \"StrongPassword123!\",\n    \"retype_password\": \"StrongPassword123!\"\n}",
                "options": {
                    "raw": {
                        "language": "json"
                    }
                }
            },
            "url": {
                "raw": "{{base_url}}/api/auth/reset-password/",
                "host": ["{{base_url}}"],
                "path": ["api", "auth", "reset-password", ""]
            }
        }
    }
])

# Find "4. Training & Scripts"
training_folder = next(item for item in data['item'] if item['name'] == '4. Training & Scripts')

training_folder['item'].append({
    "name": "Agent: Connect WebSocket Session",
    "protocolProfileBehavior": {
        "disableBodyPruning": True
    },
    "request": {
        "method": "GET",
        "header": [
            {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
            }
        ],
        "url": {
            "raw": "ws://localhost:8000/ws/training/chat/1/",
            "protocol": "ws",
            "host": ["localhost"],
            "port": "8000",
            "path": ["ws", "training", "chat", "1", ""]
        }
    }
})

with open('PeakAgent_Postman_Collection.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Updated PeakAgent_Postman_Collection.json")
