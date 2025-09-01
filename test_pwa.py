#!/usr/bin/env python3
"""
PWA Debug Test Script
This script helps test and debug PWA functionality
"""

import requests
import json
import sys
import time

def test_pwa_endpoints(base_url):
    """Test PWA-related endpoints"""
    print("🔍 Testing PWA endpoints...")
    
    endpoints = [
        '/manifest.json',
        '/static/manifest.json',
        '/api/pwa/version',
        '/api/pwa/debug',
        '/offline',
        '/static/sw.js'
    ]
    
    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=10)
            print(f"✅ {endpoint}: {response.status_code}")
            if response.status_code == 200:
                if 'json' in response.headers.get('content-type', ''):
                    try:
                        data = response.json()
                        print(f"   Data: {json.dumps(data, indent=2)[:200]}...")
                    except:
                        print(f"   Content: {response.text[:100]}...")
        except Exception as e:
            print(f"❌ {endpoint}: Error - {e}")

def test_pwa_installation(base_url):
    """Test PWA installation flow"""
    print("\n📱 Testing PWA installation flow...")
    
    try:
        # Test manifest
        manifest_url = f"{base_url}/manifest.json"
        response = requests.get(manifest_url)
        if response.status_code == 200:
            manifest = response.json()
            print(f"✅ Manifest loaded successfully")
            print(f"   Name: {manifest.get('name', 'N/A')}")
            print(f"   Start URL: {manifest.get('start_url', 'N/A')}")
            print(f"   Display: {manifest.get('display', 'N/A')}")
            print(f"   Icons: {len(manifest.get('icons', []))} icons")
        else:
            print(f"❌ Manifest failed to load: {response.status_code}")
    except Exception as e:
        print(f"❌ Manifest test failed: {e}")

def test_service_worker(base_url):
    """Test service worker functionality"""
    print("\n⚙️ Testing Service Worker...")
    
    try:
        sw_url = f"{base_url}/static/sw.js"
        response = requests.get(sw_url)
        if response.status_code == 200:
            content = response.text
            print(f"✅ Service Worker loaded successfully")
            print(f"   Size: {len(content)} bytes")
            print(f"   Cache version: {'meowchat-v1.0.1' in content}")
            print(f"   PWA fixes: {'Critical PWA fix' in content}")
        else:
            print(f"❌ Service Worker failed to load: {response.status_code}")
    except Exception as e:
        print(f"❌ Service Worker test failed: {e}")

def test_offline_page(base_url):
    """Test offline page"""
    print("\n📴 Testing Offline Page...")
    
    try:
        offline_url = f"{base_url}/offline"
        response = requests.get(offline_url)
        if response.status_code == 200:
            content = response.text
            print(f"✅ Offline page loaded successfully")
            print(f"   Size: {len(content)} bytes")
            print(f"   Contains PWA meta: {'manifest' in content}")
            print(f"   Contains offline content: {'You\'re Offline' in content}")
        else:
            print(f"❌ Offline page failed to load: {response.status_code}")
    except Exception as e:
        print(f"❌ Offline page test failed: {e}")

def main():
    """Main test function"""
    if len(sys.argv) != 2:
        print("Usage: python test_pwa.py <base_url>")
        print("Example: python test_pwa.py http://localhost:5000")
        sys.exit(1)
    
    base_url = sys.argv[1].rstrip('/')
    
    print("🚀 PWA Debug Test Suite")
    print("=" * 50)
    print(f"Testing PWA at: {base_url}")
    print()
    
    # Test all endpoints
    test_pwa_endpoints(base_url)
    test_pwa_installation(base_url)
    test_service_worker(base_url)
    test_offline_page(base_url)
    
    print("\n" + "=" * 50)
    print("🎯 PWA Debug Test Complete!")
    print("\nNext steps:")
    print("1. Install the PWA on your device")
    print("2. Open the PWA in standalone mode")
    print("3. Check browser console for errors")
    print("4. Visit /pwa-debug for detailed diagnostics")

if __name__ == "__main__":
    main()
