# CUPS Quick Reference - Direct Silent Printing

Quick commands and steps for CUPS configuration on Raspberry Pi.

## Quick Setup (5 Minutes)

### 1. Run Configuration Script

```bash
# On Raspberry Pi via SSH
cd raspberry-pi-print-server
chmod +x configure_cups_silent.sh
./configure_cups_silent.sh
```

### 2. Or Manual Setup

```bash
# Enable remote access
sudo nano /etc/cups/cupsd.conf
# Change: Listen localhost:631 → Listen *:631
# Add network access rules (see full guide)

# Restart CUPS
sudo systemctl restart cups

# Configure printer for silent printing
sudo lpadmin -p Brother_HL-L5210DN -o job-sheets=none
sudo lpadmin -p Brother_HL-L5210DN -E
```

## Essential Commands

### Printer Management

```bash
# List all printers
lpstat -p

# Check specific printer status
lpstat -p Brother_HL-L5210DN

# List printer options
lpoptions -p Brother_HL-L5210DN -l

# Set printer as default
sudo lpadmin -d Brother_HL-L5210DN

# Enable printer
sudo cupsenable Brother_HL-L5210DN

# Accept jobs
sudo cupsaccept Brother_HL-L5210DN
```

### Silent Printing

```bash
# Print file silently (no banner pages)
lp -d Brother_HL-L5210DN -o job-sheets=none file.pdf

# Print with options
lp -d Brother_HL-L5210DN \
   -o job-sheets=none \
   -o ColorModel=Gray \
   -o media=A4 \
   -o orientation-requested=portrait \
   file.pdf

# Print multiple copies silently
lp -d Brother_HL-L5210DN -n 3 -o job-sheets=none file.pdf

# Print text directly
echo "Test print" | lp -d Brother_HL-L5210DN -o job-sheets=none
```

### Queue Management

```bash
# Check print queue
lpq -P Brother_HL-L5210DN

# Cancel specific job
cancel <job-id>

# Cancel all jobs
cancel -a Brother_HL-L5210DN

# Check job history
lpstat -o
```

### Configuration

```bash
# Disable banner pages (silent printing)
sudo lpadmin -p Brother_HL-L5210DN -o job-sheets=none

# Set default options
sudo lpadmin -p Brother_HL-L5210DN -o ColorModel=Gray
sudo lpadmin -p Brother_HL-L5210DN -o media=A4

# View current options
lpoptions -p Brother_HL-L5210DN
```

### Troubleshooting

```bash
# Check CUPS service
sudo systemctl status cups

# Restart CUPS
sudo systemctl restart cups

# View CUPS error log
sudo tail -f /var/log/cups/error_log

# View CUPS access log
sudo tail -f /var/log/cups/access_log

# Check printer discovery
lpinfo -v

# Test printer connection
lpinfo -v | grep ipp
```

## CUPS Web Interface

- **URL**: `http://printpi.local:631/` or `http://<raspberry-pi-ip>:631/`
- **Admin Tab**: Configure printers, set default options
- **Printers Tab**: View printer status, test print
- **Jobs Tab**: View print queue

## Common Issues

### Printer Not Found

```bash
# Check if printer exists
lpstat -p

# Add printer via command line
lpadmin -p Brother_HL-L5210DN -E -v ipp://192.168.1.50:631/ipp/print -m everywhere
```

### Banner Pages Still Appearing

```bash
# Force disable
sudo lpadmin -p Brother_HL-L5210DN -o job-sheets=none

# Verify
lpoptions -p Brother_HL-L5210DN | grep job-sheets
```

### Print Jobs Stuck

```bash
# Check queue
lpq -P Brother_HL-L5210DN

# Cancel all
cancel -a Brother_HL-L5210DN

# Enable printer
sudo cupsenable Brother_HL-L5210DN
```

### Web Interface Not Accessible

```bash
# Check CUPS is running
sudo systemctl status cups

# Check firewall
sudo ufw allow 631/tcp

# Check listening port
sudo netstat -tlnp | grep 631
```

## Integration with Print Server

If using `print_server.py`, ensure printer name matches:

```bash
# Check configured printer
lpstat -p

# Update config.env
nano raspberry-pi-print-server/config.env
# Set: PRINTER_NAME=Brother_HL-L5210DN
```

## Verification Checklist

- [ ] `lpstat -p` shows printer as "idle" and "enabled"
- [ ] `lpoptions -p <printer>` shows `job-sheets=none`
- [ ] Test print works: `echo "Test" | lp -d <printer>`
- [ ] CUPS web interface accessible
- [ ] No banner pages on test prints
- [ ] Jobs print immediately (no delays)

## Full Documentation

See `CUPS_DIRECT_SILENT_PRINTING_SETUP.md` for complete setup guide.




















