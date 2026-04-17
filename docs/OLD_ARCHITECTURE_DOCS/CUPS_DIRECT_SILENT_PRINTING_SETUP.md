# CUPS Direct & Silent Printing Setup Guide

Complete guide to configure CUPS on Raspberry Pi for direct, silent printing (no dialogs).

## Prerequisites

- Raspberry Pi connected via SSH
- CUPS installed (`sudo apt install cups cups-client`)
- Printer connected (USB or Network)
- Access to CUPS web interface: `http://printpi.local:631/`

## Step 1: Enable Remote Access to CUPS Web Interface

By default, CUPS only allows access from localhost. Enable remote access:

```bash
# Edit CUPS configuration
sudo nano /etc/cups/cupsd.conf
```

Find and modify these sections:

```conf
# Allow access from local network
Listen *:631

# Allow remote access
<Location />
  Order allow,deny
  Allow @LOCAL
  Allow 192.168.0.0/16
  Allow 10.0.0.0/8
</Location>

# Allow admin access from network
<Location /admin>
  Order allow,deny
  Allow @LOCAL
  Allow 192.168.0.0/16
  Allow 10.0.0.0/8
</Location>
```

Restart CUPS:
```bash
sudo systemctl restart cups
```

## Step 2: Access CUPS Web Interface

1. Open browser: `http://printpi.local:631/` or `http://<raspberry-pi-ip>:631/`
2. Go to **Administration** tab
3. You may need to authenticate (use your Raspberry Pi user credentials)

## Step 3: Add Printer via Web Interface

### Method A: Network Printer (IPP/IPP Everywhere)

1. Click **Add Printer**
2. Select **Internet Printing Protocol (ipp)** or **Network Printer**
3. Enter printer URI:
   - IPP: `ipp://printer-ip:631/ipp/print`
   - IPP Everywhere: `ipp://printer-ip:631/ipp/print`
   - Example: `ipp://192.168.1.50:631/ipp/print`
4. Click **Continue**
5. Enter printer name (e.g., `Brother_HL-L5210DN`)
6. Select **Generic** → **IPP Everywhere Printer** (or specific driver)
7. Click **Add Printer**
8. Set default options (see Step 4)

### Method B: USB Printer

1. Click **Add Printer**
2. Select **USB Printer** (should auto-detect)
3. Choose your printer from the list
4. Enter printer name
5. Select driver
6. Click **Add Printer**

## Step 4: Configure Printer for Silent/Direct Printing

### Via Web Interface:

1. Go to **Printers** tab
2. Click on your printer name
3. Click **Set Default Options**
4. Configure these settings:

**Critical Settings for Silent Printing:**

- **Job Sheets**: Set to **None** (no banner pages)
- **Default Options**:
  - `job-sheets=none` (no banner pages)
  - `print-quality=normal` (or high)
  - `ColorModel=Gray` (for grayscale) or `ColorModel=RGB` (for color)
  - `media=A4` (or your paper size)
  - `orientation-requested=portrait` (or landscape)

5. Click **Set Default Options**

### Via Command Line:

```bash
# Set printer to accept jobs immediately (direct printing)
sudo lpadmin -p Brother_HL-L5210DN -o printer-op-policy=default
sudo lpadmin -p Brother_HL-L5210DN -o printer-error-policy=retry-job

# Disable banner pages (silent printing)
sudo lpadmin -p Brother_HL-L5210DN -o job-sheets=none

# Set default options
sudo lpadmin -p Brother_HL-L5210DN -o ColorModel=Gray
sudo lpadmin -p Brother_HL-L5210DN -o media=A4
sudo lpadmin -p Brother_HL-L5210DN -o orientation-requested=portrait

# Enable printer and set as default
sudo lpadmin -p Brother_HL-L5210DN -E
sudo lpadmin -d Brother_HL-L5210DN
```

## Step 5: Configure CUPS for Direct Printing (No Queuing Delays)

Edit CUPS configuration for immediate printing:

```bash
sudo nano /etc/cups/cupsd.conf
```

Add/modify these settings:

```conf
# Immediate printing (no delays)
MaxJobs 0
MaxJobsPerPrinter 0
MaxJobsPerUser 0

# Auto-start printers
AutoStartPrinters Yes

# Keep jobs for debugging (optional)
PreserveJobHistory Yes
PreserveJobFiles No
```

Restart CUPS:
```bash
sudo systemctl restart cups
```

## Step 6: Test Direct Silent Printing

### Test 1: Simple Text Print

```bash
# Print directly (no dialog, silent)
echo "Test print - Direct and Silent" | lp -d Brother_HL-L5210DN

# Check job status
lpq -P Brother_HL-L5210DN
```

### Test 2: PDF Print with Options

```bash
# Print PDF with silent options
lp -d Brother_HL-L5210DN \
   -o job-sheets=none \
   -o ColorModel=Gray \
   -o media=A4 \
   -o orientation-requested=portrait \
   test.pdf
```

### Test 3: Multiple Copies (Silent)

```bash
# Print 3 copies silently
lp -d Brother_HL-L5210DN -n 3 -o job-sheets=none test.pdf
```

### Test 4: Check Printer Status

```bash
# List all printers
lpstat -p

# Check printer status
lpstat -p Brother_HL-L5210DN

# List printer options
lpoptions -p Brother_HL-L5210DN -l
```

## Step 7: Verify Silent Printing Configuration

Check that banner pages are disabled:

```bash
# Check current printer options
lpoptions -p Brother_HL-L5210DN

# Should show: job-sheets=none
```

Verify printer accepts jobs immediately:

```bash
# Check printer state
lpstat -p Brother_HL-L5210DN

# Should show: "printer Brother_HL-L5210DN is idle. enabled since..."
```

## Step 8: Advanced CUPS Configuration for Kiosk Mode

For a kiosk environment, configure CUPS to be more aggressive about printing:

```bash
sudo nano /etc/cups/cupsd.conf
```

Add these settings:

```conf
# Kiosk mode settings
BrowseAllow @LOCAL
BrowseAllow 192.168.0.0/16

# Auto-start printers on boot
AutoStartPrinters Yes

# Don't require authentication for local printing
<Policy default>
  JobPrivateValues default
  SubscriptionPrivateValues default
  <Limit Create-Job Print-Job Print-URI Validate-Job>
    Require user @OWNER @SYSTEM
    Order deny,allow
  </Limit>
  <Limit Send-Document Send-URI Hold-Job Release-Job Restart-Job Purge-Jobs Set-Job-Attributes Create-Job-Subscription Renew-Subscription Cancel-Subscription Get-Notifications Reprocess-Job Cancel-Current-Job Suspend-Current-Job Resume-Job>
    Require user @OWNER @SYSTEM
    Order deny,allow
  </Limit>
  <Limit All>
    Order deny,allow
  </Limit>
</Policy>
```

Restart CUPS:
```bash
sudo systemctl restart cups
```

## Step 9: Create Print Test Script

Create a test script to verify silent printing:

```bash
nano ~/test_silent_print.sh
```

Add this content:

```bash
#!/bin/bash
PRINTER_NAME="Brother_HL-L5210DN"

echo "Testing silent direct printing..."
echo "================================"

# Test 1: Simple text
echo "Test 1: Text print"
echo "Silent Print Test $(date)" | lp -d $PRINTER_NAME -o job-sheets=none
sleep 2

# Test 2: Check job completed
echo "Test 2: Checking job status"
lpq -P $PRINTER_NAME

# Test 3: Print with options
echo "Test 3: PDF with options"
if [ -f "test.pdf" ]; then
    lp -d $PRINTER_NAME \
       -o job-sheets=none \
       -o ColorModel=Gray \
       -o media=A4 \
       test.pdf
    echo "PDF printed"
else
    echo "test.pdf not found, skipping"
fi

echo "================================"
echo "Test complete. Check printer output."
```

Make executable:
```bash
chmod +x ~/test_silent_print.sh
```

Run test:
```bash
~/test_silent_print.sh
```

## Step 10: Troubleshooting

### Printer Not Found

```bash
# List all printers
lpstat -p

# Check printer discovery
lpinfo -v

# Check network printer
lpinfo -v | grep ipp
```

### Print Jobs Stuck in Queue

```bash
# Check queue
lpq -P Brother_HL-L5210DN

# Cancel all jobs
cancel -a Brother_HL-L5210DN

# Check CUPS error log
sudo tail -f /var/log/cups/error_log
```

### Banner Pages Still Appearing

```bash
# Force remove banner pages
sudo lpadmin -p Brother_HL-L5210DN -o job-sheets=none

# Verify
lpoptions -p Brother_HL-L5210DN | grep job-sheets
```

### Printer Offline

```bash
# Enable printer
sudo cupsenable Brother_HL-L5210DN

# Accept jobs
sudo cupsaccept Brother_HL-L5210DN

# Check status
lpstat -p Brother_HL-L5210DN
```

### CUPS Web Interface Not Accessible

```bash
# Check CUPS is running
sudo systemctl status cups

# Check firewall
sudo ufw status
sudo ufw allow 631/tcp

# Check CUPS is listening
sudo netstat -tlnp | grep 631
```

## Step 11: Integration with Print Server

If using the Raspberry Pi print server (`print_server.py`), verify it uses the correct printer name:

```bash
# Check configured printer name
lpstat -p

# Update print_server.py config if needed
nano raspberry-pi-print-server/config.env
```

Set:
```
PRINTER_NAME=Brother_HL-L5210DN
```

## Verification Checklist

- [ ] CUPS web interface accessible at `http://printpi.local:631/`
- [ ] Printer added and shows as "idle" in `lpstat -p`
- [ ] Banner pages disabled (`job-sheets=none`)
- [ ] Test print works: `echo "Test" | lp -d <printer-name>`
- [ ] No print dialog appears (printing is silent)
- [ ] Jobs print immediately (no queuing delays)
- [ ] Printer accepts jobs: `lpstat -p` shows "enabled"
- [ ] CUPS logs show successful prints: `sudo tail /var/log/cups/error_log`

## Quick Reference Commands

```bash
# List printers
lpstat -p

# Print file silently
lp -d <printer> -o job-sheets=none file.pdf

# Print with options
lp -d <printer> -o job-sheets=none -o ColorModel=Gray -n 2 file.pdf

# Check queue
lpq -P <printer>

# Cancel all jobs
cancel -a <printer>

# Enable printer
sudo cupsenable <printer>

# Set default options
sudo lpadmin -p <printer> -o job-sheets=none

# View printer options
lpoptions -p <printer> -l

# Check CUPS status
sudo systemctl status cups

# View CUPS logs
sudo tail -f /var/log/cups/error_log
```

## Next Steps

1. **Test printing** from your application
2. **Configure print server** if using `print_server.py`
3. **Set up monitoring** for print jobs
4. **Create backup** of CUPS configuration: `sudo cp /etc/cups/cupsd.conf /etc/cups/cupsd.conf.backup`

## Support

- CUPS logs: `sudo tail -f /var/log/cups/error_log`
- CUPS access log: `sudo tail -f /var/log/cups/access_log`
- Printer status: `lpstat -p -d`
- Test print: `echo "Test" | lp`

For issues, check:
1. Printer is online: `lpstat -p`
2. CUPS is running: `sudo systemctl status cups`
3. Network connectivity (for network printers)
4. USB connection (for USB printers)
5. Printer driver compatibility




















