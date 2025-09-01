#!/usr/bin/env python3
"""
PWA Version Update Script
Run this script when you make changes to update the PWA version automatically
"""

import re
import datetime
import os

def update_version():
    """Update PWA version in all relevant files"""
    
    # Generate new version based on timestamp
    timestamp = datetime.datetime.now()
    new_version = f"v{timestamp.year}.{timestamp.month}.{timestamp.day}.{timestamp.hour}{timestamp.minute}"
    
    print(f"Updating PWA version to: {new_version}")
    
    # Files to update
    files_to_update = [
        ('app.py', r"PWA_VERSION = '([^']+)'", f"PWA_VERSION = '{new_version}'"),
        ('static/sw.js', r"const CACHE_NAME = 'meowchat-([^']+)'", f"const CACHE_NAME = 'meowchat-{new_version}'"),
        ('static/sw.js', r"const STATIC_CACHE = 'meowchat-static-([^']+)'", f"const STATIC_CACHE = 'meowchat-static-{new_version}'"),
        ('static/sw.js', r"const DYNAMIC_CACHE = 'meowchat-dynamic-([^']+)'", f"const DYNAMIC_CACHE = 'meowchat-dynamic-{new_version}'"),
        ('static/js/pwa-utils.js', r"this\.currentVersion = '([^']+)'", f"this.currentVersion = '{new_version}'")
    ]
    
    updated_files = []
    
    for file_path, pattern, replacement in files_to_update:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if pattern exists
                if re.search(pattern, content):
                    new_content = re.sub(pattern, replacement, content)
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    updated_files.append(file_path)
                    print(f"✓ Updated {file_path}")
                else:
                    print(f"⚠ Pattern not found in {file_path}")
            except Exception as e:
                print(f"✗ Error updating {file_path}: {e}")
        else:
            print(f"✗ File not found: {file_path}")
    
    print(f"\n🎉 PWA version updated to {new_version}")
    print(f"Updated {len(updated_files)} files:")
    for file in updated_files:
        print(f"  - {file}")
    
    print(f"\nNext steps:")
    print(f"1. Restart your Flask server")
    print(f"2. Users will automatically get the update notification")
    print(f"3. The app will reload with the new version")

if __name__ == "__main__":
    update_version()
