#!/usr/bin/env python3
"""
Simple health monitoring script for web applications.
This script periodically checks if a web application is responding correctly.
"""

import requests
import time
import logging
import sys
from datetime import datetime
import os

# Configuration
APP_URL = "https://your-app-name.onrender.com"  # Replace with your actual Render app URL
CHECK_INTERVAL = 300  # 5 minutes in seconds
TIMEOUT = 30  # Request timeout in seconds
LOG_FILE = "health_monitor.log"

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

def check_app_health():
    """Check if the application is responding correctly."""
    try:
        # Try to access a simple endpoint
        response = requests.get(f"{APP_URL}/", timeout=TIMEOUT)
        
        if response.status_code == 200:
            logging.info(f"✓ App is healthy - Status: {response.status_code}")
            return True
        else:
            logging.warning(f"⚠ App returned status {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        logging.error("✗ Request timed out")
        return False
    except requests.exceptions.ConnectionError:
        logging.error("✗ Connection error - App might be down")
        return False
    except requests.exceptions.RequestException as e:
        logging.error(f"✗ Request failed: {e}")
        return False
    except Exception as e:
        logging.error(f"✗ Unexpected error: {e}")
        return False

def ping_app():
    """Send a simple ping to keep the app alive."""
    try:
        # Use a simple GET request to the root endpoint
        response = requests.get(f"{APP_URL}/", timeout=TIMEOUT)
        logging.info(f"Ping sent - Status: {response.status_code}")
        return True
    except Exception as e:
        logging.error(f"Ping failed: {e}")
        return False

def main():
    """Main function to run the health monitor."""
    logging.info("Starting health monitor...")
    logging.info(f"Monitoring URL: {APP_URL}")
    logging.info(f"Check interval: {CHECK_INTERVAL} seconds")
    
    consecutive_failures = 0
    max_failures = 3
    
    while True:
        try:
            # Check app health
            is_healthy = check_app_health()
            
            if is_healthy:
                consecutive_failures = 0
                # Send additional ping to keep app warm
                ping_app()
            else:
                consecutive_failures += 1
                logging.warning(f"Consecutive failures: {consecutive_failures}")
                
                if consecutive_failures >= max_failures:
                    logging.error("App appears to be down after multiple failures")
                    # You could add notification logic here (email, Slack, etc.)
            
            # Wait before next check
            time.sleep(CHECK_INTERVAL)
            
        except KeyboardInterrupt:
            logging.info("Health monitor stopped by user")
            break
        except Exception as e:
            logging.error(f"Unexpected error in main loop: {e}")
            time.sleep(60)  # Wait 1 minute before retrying

if __name__ == "__main__":
    main()
