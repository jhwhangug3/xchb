#!/usr/bin/env python3
"""
Simple one-time ping script for testing.
"""

import requests
import sys

def ping_app(url):
    """Send a single ping to the app."""
    try:
        response = requests.get(url, timeout=30)
        print(f"✓ Ping successful - Status: {response.status_code}")
        return True
    except requests.exceptions.Timeout:
        print("✗ Request timed out")
        return False
    except requests.exceptions.ConnectionError:
        print("✗ Connection error")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 ping_test.py <app_url>")
        print("Example: python3 ping_test.py https://your-app.onrender.com")
        sys.exit(1)
    
    app_url = sys.argv[1]
    print(f"Pinging: {app_url}")
    ping_app(app_url)
