#!/bin/bash
# Setup script for health monitoring

echo "Setting up health monitor..."

# Make the Python script executable
chmod +x health_monitor.py

# Install required dependencies
pip install requests

# Create a simple cron job entry
echo "To set up the cron job, run:"
echo "crontab -e"
echo ""
echo "Then add this line to run every 5 minutes:"
echo "*/5 * * * * cd $(pwd) && python3 health_monitor.py >> health_monitor.log 2>&1"
echo ""
echo "Or to run every 10 minutes:"
echo "*/10 * * * * cd $(pwd) && python3 health_monitor.py >> health_monitor.log 2>&1"
echo ""
echo "Don't forget to update the APP_URL in health_monitor.py with your actual Render app URL!"
