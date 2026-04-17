# Fix for PowerShell Logcat Parser Errors

## Problem
When running `adb logcat` in PowerShell, you may see errors like:
```
Unexpected token '20:16:40.133' in expression or statement.
ParserError: UnexpectedToken
```

This happens because PowerShell tries to parse log lines as commands.

## Solution

### Option 1: Use the Provided Scripts (Recommended)

**Simple viewer (all logs):**
```powershell
.\scripts\view-logs-simple.ps1
```

**Filtered viewer:**
```powershell
# View VPrint logs
.\scripts\view-logs-filtered.ps1 vprint

# View GPUAUX logs
.\scripts\view-logs-filtered.ps1 gpuaux

# View print-related logs
.\scripts\view-logs-filtered.ps1 print

# View all logs
.\scripts\view-logs-filtered.ps1 all
```

**Custom filter:**
```powershell
.\scripts\view-logs.ps1 "com.vprint.kiosk"
```

### Option 2: Use PowerShell Command Directly

**For all logs:**
```powershell
adb logcat | ForEach-Object { $_ }
```

**For filtered logs:**
```powershell
adb logcat | ForEach-Object { if ($_ -match "com.vprint.kiosk") { $_ } }
```

**For GPUAUX logs:**
```powershell
adb logcat | ForEach-Object { if ($_ -match "GPUAUX") { $_ } }
```

### Option 3: Use CMD Instead

If you prefer, you can use Command Prompt instead:
```cmd
adb logcat | findstr "com.vprint.kiosk"
```

Or use Git Bash:
```bash
adb logcat | grep "com.vprint.kiosk"
```

## Why This Happens

PowerShell tries to parse command output as PowerShell code. When logcat outputs lines like:
```
2025-11-16 20:16:40.133  4402-4458  GPUAUX  ...
```

PowerShell sees `20:16:40.133` and tries to interpret it as a command or expression, causing the parser error.

## The Fix

Using `ForEach-Object { $_ }` tells PowerShell to treat each line as a string and output it without parsing, preventing the error.

## Quick Commands

```powershell
# Clear logcat buffer first
adb logcat -c

# Then view logs using one of these methods:
.\scripts\view-logs-simple.ps1
# OR
adb logcat | ForEach-Object { $_ }
```



