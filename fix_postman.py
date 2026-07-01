import json

with open('PeakAgent_Postman_Collection.json', 'r') as f:
    data = json.load(f)

for category in data.get('item', []):
    for endpoint in category.get('item', []):
        if endpoint.get('name') == 'Verify OTP':
            endpoint['request']['body']['raw'] = '{\n    "email": "sarah@example.com",\n    "code": "123456"\n}'

with open('PeakAgent_Postman_Collection.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Updated Verify OTP body to use 'code' instead of 'otp'.")
