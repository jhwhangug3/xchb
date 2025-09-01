# PWA Test Script
# This script helps test the PWA functionality

import webbrowser
import time
import os

def test_pwa():
    print("🚀 Testing PWA App...")
    print("=" * 50)
    
    # Check if app is running
    print("1. Starting Flask app...")
    print("   - App should be running on http://127.0.0.1:5050")
    print("   - If not running, start with: python app.py")
    
    # Test URLs
    test_urls = [
        "http://127.0.0.1:5050/",
        "http://127.0.0.1:5050/pwa-debug",
        "http://127.0.0.1:5050/offline"
    ]
    
    print("\n2. Testing URLs...")
    for url in test_urls:
        print(f"   - {url}")
    
    print("\n3. PWA Testing Steps:")
    print("   a) Open http://127.0.0.1:5050 in Chrome/Edge")
    print("   b) Open Developer Tools (F12)")
    print("   c) Go to Application tab")
    print("   d) Check Service Worker status")
    print("   e) Check Manifest")
    print("   f) Test offline functionality")
    
    print("\n4. Common Issues & Solutions:")
    print("   - Dark screen: Clear browser cache and reload")
    print("   - Service Worker not working: Check console for errors")
    print("   - App not loading: Check if Flask app is running")
    
    print("\n5. Debug Page:")
    print("   - Visit http://127.0.0.1:5050/pwa-debug for detailed diagnostics")
    
    # Open debug page
    try:
        webbrowser.open("http://127.0.0.1:5050/pwa-debug")
        print("\n✅ Debug page opened in browser")
    except:
        print("\n❌ Could not open debug page automatically")
        print("   Please manually visit: http://127.0.0.1:5050/pwa-debug")

if __name__ == "__main__":
    test_pwa()
