#!/usr/bin/env python3
"""
Generate VAPID keys for push notifications
Run this script to generate your VAPID public and private keys
"""

import base64
import json
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def generate_vapid_keys():
    """Generate VAPID public and private keys"""
    
    # Generate private key
    private_key = ec.generate_private_key(
        ec.SECP256R1()
    )
    
    # Get public key
    public_key = private_key.public_key()
    
    # Serialize private key
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    # Serialize public key
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    # Convert to base64 for web push
    private_key_b64 = base64.urlsafe_b64encode(
        private_key.private_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
    ).decode('utf-8').rstrip('=')
    
    public_key_b64 = base64.urlsafe_b64encode(
        public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
    ).decode('utf-8').rstrip('=')
    
    return {
        'private_key': private_key_b64,
        'public_key': public_key_b64,
        'private_key_pem': private_key_pem.decode('utf-8'),
        'public_key_pem': public_key_pem.decode('utf-8')
    }

if __name__ == "__main__":
    print("🔑 Generating VAPID keys for push notifications...")
    print()
    
    keys = generate_vapid_keys()
    
    print("✅ VAPID Keys Generated Successfully!")
    print()
    print("📋 Copy these to your environment variables:")
    print()
    print(f"VAPID_PRIVATE_KEY={keys['private_key']}")
    print(f"VAPID_PUBLIC_KEY={keys['public_key']}")
    print("VAPID_EMAIL=your-email@example.com")
    print()
    print("🔧 Or add to your .env file:")
    print()
    print(f"VAPID_PRIVATE_KEY={keys['private_key']}")
    print(f"VAPID_PUBLIC_KEY={keys['public_key']}")
    print("VAPID_EMAIL=your-email@example.com")
    print()
    print("📝 Update your PWA utilities with the public key:")
    print()
    print(f"getVapidPublicKey() {{ return '{keys['public_key']}'; }}")
    print()
    print("🚀 Your push notifications are ready to use!")
