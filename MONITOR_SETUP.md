# Health Monitor Setup Guide

## Overview

This setup creates a simple health monitoring system that pings your Render app to keep it alive and prevent it from going to sleep.

## Files Created

- `health_monitor.py` - Main monitoring script
- `setup_monitor.sh` - Setup script for dependencies

## Setup Instructions

### 1. Update Configuration

Edit `health_monitor.py` and replace the `APP_URL` with your actual Render app URL:

```python
APP_URL = "https://your-actual-app-name.onrender.com"
```

### 2. Install Dependencies

Run the setup script:

```bash
chmod +x setup_monitor.sh
./setup_monitor.sh
```

Or manually install:

```bash
pip install requests
```

### 3. Test the Script

Test the script manually first:

```bash
python3 health_monitor.py
```

Press Ctrl+C to stop the test.

### 4. Set Up Cron Job

#### Option A: Using crontab (Recommended)

```bash
crontab -e
```

Add one of these lines:

- Every 5 minutes: `*/5 * * * * cd /path/to/your/script && python3 health_monitor.py >> health_monitor.log 2>&1`
- Every 10 minutes: `*/10 * * * * cd /path/to/your/script && python3 health_monitor.py >> health_monitor.log 2>&1`

#### Option B: Using systemd (Linux)

Create a service file:

```bash
sudo nano /etc/systemd/system/health-monitor.service
```

Add:

```ini
[Unit]
Description=Health Monitor
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/your/script
ExecStart=/usr/bin/python3 health_monitor.py
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable health-monitor.service
sudo systemctl start health-monitor.service
```

### 5. Monitor Logs

Check the log file:

```bash
tail -f health_monitor.log
```

## Features

- ✅ Checks app health every 5-10 minutes
- ✅ Logs all activities
- ✅ Handles connection errors gracefully
- ✅ Sends additional pings to keep app warm
- ✅ Looks like legitimate monitoring (not suspicious)
- ✅ Lightweight and efficient

## Customization

You can modify:

- `CHECK_INTERVAL` - How often to check (in seconds)
- `TIMEOUT` - Request timeout
- `LOG_FILE` - Log file location
- Add notification logic for failures

## Troubleshooting

- Make sure Python 3 and requests library are installed
- Check that the cron job path is correct
- Verify the app URL is accessible
- Check logs for any errors

## Security Notes

- The script only makes GET requests to your app
- No sensitive data is transmitted
- Logs are stored locally
- Looks like normal health monitoring
