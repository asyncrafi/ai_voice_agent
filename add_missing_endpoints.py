import json
import os

with open('PeakAgent_Postman_Collection.json', 'r') as f:
    data = json.load(f)

def find_folder(name):
    for item in data['item']:
        if item.get('name') == name:
            return item
    return None

auth_folder = find_folder('1. Authentication & Profile')
training_folder = find_folder('4. Training & Scripts')
policy_folder = find_folder('3. Policy Library (Admin)')

# AUTH ENDPOINTS
auth_endpoints = [
    {
        "name": "Logout",
        "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"refresh\": \"your_refresh_token_here\"\n}",
                "options": {"raw": {"language": "json"}}
            },
            "url": {
                "raw": "{{base_url}}/api/auth/logout/",
                "host": ["{{base_url}}"],
                "path": ["api", "auth", "logout", ""]
            }
        }
    },
    {
        "name": "Token Refresh",
        "request": {
            "method": "POST",
            "header": [],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"refresh\": \"your_refresh_token_here\"\n}",
                "options": {"raw": {"language": "json"}}
            },
            "url": {
                "raw": "{{base_url}}/api/auth/token/refresh/",
                "host": ["{{base_url}}"],
                "path": ["api", "auth", "token", "refresh", ""]
            }
        }
    },
    {
        "name": "Change Password",
        "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"old_password\": \"OldPassword123!\",\n    \"new_password\": \"NewPassword123!\",\n    \"retype_password\": \"NewPassword123!\"\n}",
                "options": {"raw": {"language": "json"}}
            },
            "url": {
                "raw": "{{base_url}}/api/auth/change-password/",
                "host": ["{{base_url}}"],
                "path": ["api", "auth", "change-password", ""]
            }
        }
    },
    {
        "name": "Update Language",
        "request": {
            "method": "PATCH",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"language\": \"es\"\n}",
                "options": {"raw": {"language": "json"}}
            },
            "url": {
                "raw": "{{base_url}}/api/auth/me/language/",
                "host": ["{{base_url}}"],
                "path": ["api", "auth", "me", "language", ""]
            }
        }
    }
]

# TRAINING ENDPOINTS
training_endpoints = [
    {
        "name": "Admin: Get Script Details",
        "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/training/scripts/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "scripts", "1", ""]
            }
        }
    },
    {
        "name": "Admin: Update Script",
        "request": {
            "method": "PUT",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"title\": \"Updated Script\",\n    \"category\": \"Sales\",\n    \"difficulty\": \"hard\",\n    \"content\": \"Updated content\",\n    \"system_prompt\": \"Updated prompt\",\n    \"is_default\": true\n}",
                "options": {"raw": {"language": "json"}}
            },
            "url": {
                "raw": "{{base_url}}/api/training/scripts/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "scripts", "1", ""]
            }
        }
    },
    {
        "name": "Admin: Delete Script",
        "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/training/scripts/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "scripts", "1", ""]
            }
        }
    },
    {
        "name": "Agent: List Custom Scripts",
        "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/training/agent-scripts/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "agent-scripts", ""]
            }
        }
    },
    {
        "name": "Agent: Create Custom Script",
        "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"title\": \"My Custom Script\",\n    \"content\": \"Custom content for practice\",\n    \"difficulty\": \"medium\"\n}",
                "options": {"raw": {"language": "json"}}
            },
            "url": {
                "raw": "{{base_url}}/api/training/agent-scripts/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "agent-scripts", ""]
            }
        }
    },
    {
        "name": "Agent: Get Custom Script Details",
        "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/training/agent-scripts/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "agent-scripts", "1", ""]
            }
        }
    },
    {
        "name": "Agent: Update Custom Script",
        "request": {
            "method": "PUT",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "body": {
                "mode": "raw",
                "raw": "{\n    \"title\": \"Updated Custom Script\",\n    \"content\": \"Updated custom content for practice\",\n    \"difficulty\": \"hard\"\n}",
                "options": {"raw": {"language": "json"}}
            },
            "url": {
                "raw": "{{base_url}}/api/training/agent-scripts/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "agent-scripts", "1", ""]
            }
        }
    },
    {
        "name": "Agent: Delete Custom Script",
        "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/training/agent-scripts/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "agent-scripts", "1", ""]
            }
        }
    },
    {
        "name": "Agent: List Training Sessions",
        "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/training/sessions/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "sessions", ""]
            }
        }
    },
    {
        "name": "Agent: Get Session Details",
        "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/training/sessions/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "training", "sessions", "1", ""]
            }
        }
    }
]

# POLICY ENDPOINTS
policy_endpoints = [
    {
        "name": "Policy Document Details",
        "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/policy/documents/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "policy", "documents", "1", ""]
            }
        }
    },
    {
        "name": "Update Policy Document",
        "request": {
            "method": "PUT",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "body": {
                "mode": "formdata",
                "formdata": [
                    {
                        "key": "name",
                        "value": "Updated Mortgage Protection",
                        "type": "text"
                    }
                ]
            },
            "url": {
                "raw": "{{base_url}}/api/policy/documents/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "policy", "documents", "1", ""]
            }
        }
    },
    {
        "name": "Delete Policy Document",
        "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
            "url": {
                "raw": "{{base_url}}/api/policy/documents/1/",
                "host": ["{{base_url}}"],
                "path": ["api", "policy", "documents", "1", ""]
            }
        }
    }
]

def extend_if_missing(folder, new_endpoints):
    existing_names = set(item['name'] for item in folder['item'])
    for endpoint in new_endpoints:
        if endpoint['name'] not in existing_names:
            folder['item'].append(endpoint)

if auth_folder:
    extend_if_missing(auth_folder, auth_endpoints)
if training_folder:
    extend_if_missing(training_folder, training_endpoints)
if policy_folder:
    extend_if_missing(policy_folder, policy_endpoints)

with open('PeakAgent_Postman_Collection.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Updated with missing endpoints.")
