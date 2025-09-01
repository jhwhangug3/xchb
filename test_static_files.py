#!/usr/bin/env python3
"""
Test script to verify static file serving
"""
import requests
import os

def test_static_files():
    base_url = "http://127.0.0.1:5050"
    
    # Test files to check
    test_files = [
        "/static/css/main.css",
        "/static/js/pwa-utils.js", 
        "/static/manifest.json",
        "/static/sw.js",
        "/manifest.json",
        "/sw.js"
    ]
    
    print("Testing static file serving...")
    print("=" * 50)
    
    for file_path in test_files:
        try:
            url = base_url + file_path
            response = requests.get(url)
            
            print(f"Testing: {file_path}")
            print(f"  Status: {response.status_code}")
            print(f"  Content-Length: {len(response.content)} bytes")
            print(f"  Content-Type: {response.headers.get('content-type', 'N/A')}")
            
            if response.status_code == 200:
                if len(response.content) > 0:
                    print(f"  ✅ SUCCESS: File served with {len(response.content)} bytes")
                else:
                    print(f"  ❌ ERROR: File served with 0 bytes")
            else:
                print(f"  ❌ ERROR: HTTP {response.status_code}")
            
            print()
            
        except Exception as e:
            print(f"❌ ERROR testing {file_path}: {e}")
            print()

if __name__ == "__main__":
    test_static_files()
