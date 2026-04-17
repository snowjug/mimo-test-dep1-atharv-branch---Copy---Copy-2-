# Brother HL-L5210DN Network Menu Guide

## 📋 Network Menu Overview

You're seeing these options in the printer's **Network** menu:
- TCP/IP
- Ethernet
- Wired Status
- MAC Address
- Network Reset

Let me explain each one and what you need to do!

---

## 🔧 What Each Menu Item Means

### **1. TCP/IP**
**What it is:** Network configuration settings

**What you'll see inside:**
- Boot Method: DHCP, Static, RARP, BOOTP
- IP Address: e.g., 192.168.1.100
- Subnet Mask: e.g., 255.255.255.0
- Gateway: e.g., 192.168.1.1
- Node Name: printer hostname
- WINS Config: Windows networking

**What to check:**
```
Boot Method: Should be "Auto" or "DHCP"
IP Address: Should show actual IP (not 0.0.0.0)
```

### **2. Ethernet**
**What it is:** Wired network connection settings

**What you'll see inside:**
- Link Status: Connected / Disconnected
- Speed: 100Mbps / 1000Mbps / Auto
- Connection: Full-duplex / Half-duplex

**What to check:**
```
Link Status: Should be "Connected" (if cable plugged in)
```

### **3. Wired Status**
**What it is:** Current wired connection information

**Shows:**
- Active/Inactive status
- Connection speed
- Current link state

### **4. MAC Address**
**What it is:** Printer's unique hardware address

**Format:** XX:XX:XX:XX:XX:XX (e.g., 00:80:77:12:34:56)

**Why it matters:** 
- Needed for MAC filtering
- Needed for DHCP reservation
- Printer's permanent ID

### **5. Network Reset**
**What it is:** Reset all network settings to factory defaults

**⚠️ WARNING:** This erases all network configuration!

---

## 🎯 What You Need to Do

Based on what you're seeing, I assume you want to connect via **WiFi**, not Ethernet cable.

### You're in the WIRED network menu!

To connect via WiFi, you need the **WLAN** (Wireless) menu instead!

---

## 📡 How to Connect to WiFi

### **Step 1: Exit Current Menu**

```
Press "Stop/Exit" or "Back" button
→ Return to main Network menu
```

### **Step 2: Find WLAN Menu**

```
From Network menu:
→ Look for "WLAN" or "Wireless"
→ NOT "Ethernet" or "Wired"
```

### **Step 3: Enter WLAN Menu**

```
Network → WLAN → You should see:
  - WLAN Enable/Disable
  - Setup Wizard
  - WPS
  - Status
  - MAC Address (wireless)
```

### **Step 4: Enable WLAN**

```
WLAN → WLAN Enable/Disable
→ Select "Enable"
→ Press OK
```

### **Step 5: Run Setup Wizard**

```
WLAN → Setup Wizard
→ Printer searches for WiFi networks
→ Wait 10-20 seconds
→ List of networks appears
```

### **Step 6: Select Your WiFi**

```
Use arrow buttons to find your WiFi network
→ Press OK
→ Password entry screen appears
```

### **Step 7: Enter WiFi Password**

```
Use number pad and * button to type password
- Press number multiple times for letters
  (Like old phone texting)
- Example: Press 2 three times = 'C'
- Or use arrow keys if keyboard appears
→ Press OK when done
```

### **Step 8: Wait for Connection**

```
Status shows: "Connecting..."
→ Wait 10-30 seconds
→ Should show: "Connected"
→ IP address assigned
```

### **Step 9: Print Network Config**

```
Exit menus
→ Press "Go" button 6 times quickly
→ Network configuration page prints
→ Should show:
  - Wireless Status: Active
  - IP Address: 192.168.x.x (not 0.0.0.0)
  - Connection: WiFi
```

---

## 🔍 Understanding Network Settings

### **TCP/IP Settings Explained**

#### **Boot Method:**

**Auto/DHCP (Recommended)** ✓
- Router assigns IP automatically
- Easiest setup
- IP may change (rare)

**Static** 
- You set IP manually
- IP never changes
- Good for production
- Requires manual configuration

#### **IP Address:**

**Format:** 192.168.x.x or 10.x.x.x

**Examples:**
- 192.168.1.100 ✓ Good
- 0.0.0.0 ✗ Not connected
- 169.254.x.x ✗ No DHCP server

#### **Subnet Mask:**

**Common:** 255.255.255.0

**What it means:** Defines your local network range

#### **Gateway:**

**Usually:** 192.168.1.1 or 192.168.0.1

**What it is:** Your router's IP address

---

## 📝 Recording Your Printer's Info

### **Write Down These Settings:**

After connection, record this information:

```
PRINTER NETWORK INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Connection Type: [ ] Wired  [✓] WiFi

IP Address: ___.___.___.___ 
(Example: 192.168.1.100)

Subnet Mask: 255.255.255.0

Gateway: ___.___.___.___ 
(Usually: 192.168.1.1)

MAC Address (WiFi): __:__:__:__:__:__

Network Name (SSID): _________________

Connection Status: [ ] Connected  [ ] Disconnected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keep this information handy!
```

---

## 🔌 Wired vs Wireless Connection

### **When to Use Wired (Ethernet):**

✓ Permanent installation
✓ Near router
✓ Maximum speed/reliability
✓ No WiFi interference

**Setup:**
1. Plug Ethernet cable into printer (back)
2. Plug other end into router/switch
3. Done! Should auto-configure

### **When to Use Wireless (WiFi):**

✓ Printer away from router ⭐
✓ No cable access
✓ Flexible placement
✓ Cleaner setup

**Setup:**
1. Use WLAN menu (not Wired menu!)
2. Setup Wizard
3. Select network
4. Enter password
5. Connect!

---

## 🎯 Your Current Situation

Since you're seeing:
- TCP/IP
- Ethernet
- Wired Status

**You're in the WIRED network menu!**

### **What you probably want:**

**For tablet connection → Use WiFi!**

### **What to do:**

```
1. Exit current menu (press Back/Stop)
2. From Network menu → Select "WLAN"
3. Enable WLAN
4. Run Setup Wizard
5. Connect to your WiFi
6. Print network config
7. Note IP address
```

---

## 📱 After Printer is on WiFi

### **Connect Tablet:**

```
1. Tablet → Settings → WiFi
2. Connect to SAME WiFi network
3. Both devices now on same network!
```

### **Add Printer to Tablet:**

```
1. Settings → Connected devices → Printing
2. Brother Print Service Plugin → Enable
3. Should auto-discover printer
4. Or add manually by IP
```

### **Test Print:**

```
1. Chrome → Any page → Print
2. Select Brother HL-L5210DN
3. Tap Print
4. Should work! ✓
```

---

## 🔧 Advanced: Setting Static IP (Optional)

### **Why Static IP?**

✓ IP never changes
✓ More reliable
✓ Easier troubleshooting
✓ Professional setup

### **How to Set:**

**Method 1: Via Printer Menu**

```
Network → TCP/IP → Boot Method
→ Select "Static"
→ Enter IP Address: 192.168.1.100 (example)
→ Enter Subnet: 255.255.255.0
→ Enter Gateway: 192.168.1.1 (your router)
→ Press OK
→ Printer reboots
```

**Method 2: Via Web Interface (Easier)**

```
1. Connect printer to network (DHCP first)
2. Note current IP address
3. Open browser on computer
4. Go to: http://PRINTER_IP
5. Login: admin / (no password)
6. Network → TCP/IP
7. Change to Static
8. Set desired IP
9. Click Submit
10. Printer reboots
```

**Recommended Static IP:**
```
IP: 192.168.1.100 (or any free IP)
Subnet: 255.255.255.0
Gateway: 192.168.1.1 (your router)
DNS: 8.8.8.8 (Google DNS)
```

---

## ⚠️ Network Reset - When to Use

### **When to Reset:**

✓ Can't connect to network
✓ Forgotten WiFi password
✓ Moving to new location
✓ Network settings corrupted

### **How to Reset:**

```
Network → Network Reset
→ Confirm "Yes"
→ Printer resets network settings
→ All WiFi/wired settings erased
→ Must configure again from scratch
```

### **After Reset:**

1. WiFi will be disabled
2. All TCP/IP settings reset
3. Must run Setup Wizard again
4. Must enter WiFi password again

**⚠️ Don't reset unless you need to!**

---

## 📊 Network Troubleshooting

### **Issue: No IP Address (0.0.0.0)**

**Cause:** Not connected to network

**Fix:**
```
WiFi: Run WLAN Setup Wizard
Wired: Check cable is plugged in
Both: Check router is working
```

### **Issue: Can't Connect to WiFi**

**Check:**
```
[ ] WiFi enabled? (WLAN → Enable)
[ ] Correct network selected?
[ ] Password correct? (case-sensitive!)
[ ] Router working?
[ ] Within range?
[ ] 2.4GHz network? (Printer may not support 5GHz)
```

### **Issue: IP Address Shows 169.254.x.x**

**Cause:** Router not giving IP (DHCP failure)

**Fix:**
```
1. Check router DHCP is enabled
2. Restart printer
3. Restart router
4. Try different network
5. Or use Static IP
```

### **Issue: Connected But Tablet Can't Find Printer**

**Check:**
```
[ ] Both on same network? (same SSID)
[ ] Same subnet? (192.168.1.x)
[ ] Printer IP valid?
[ ] Brother service enabled on tablet?
[ ] Firewall blocking?
```

---

## 🎓 Quick Reference

### **Menu Navigation:**

```
Network Menu
  ├─ WLAN (WiFi) ⭐ Use this for tablet!
  │  ├─ Enable/Disable
  │  ├─ Setup Wizard
  │  ├─ WPS
  │  └─ Status
  │
  ├─ Wired/Ethernet (Cable connection)
  │  ├─ TCP/IP
  │  ├─ Link Status
  │  └─ MAC Address
  │
  └─ Network Reset (Erase all settings)
```

### **Key Information to Know:**

```
✓ Connection Type: WiFi or Wired
✓ IP Address: Your printer's address
✓ MAC Address: Printer's hardware ID
✓ Network Name: Which WiFi/network
✓ Status: Connected or not
```

### **Print Network Info:**

```
Press "Go" button 6 times → Prints full network config
Keep this page for reference!
```

---

## ✅ Setup Checklist

**For WiFi Connection (Recommended):**

```
[ ] Exit Wired/Ethernet menu
[ ] Navigate to WLAN menu
[ ] Enable WLAN
[ ] Run Setup Wizard
[ ] Select WiFi network
[ ] Enter password correctly
[ ] Wait for connection
[ ] Verify "Connected" status
[ ] Print network config page
[ ] Write down IP address
[ ] Connect tablet to same WiFi
[ ] Enable Brother Print Service
[ ] Test print from tablet
[ ] Success! ✓
```

---

## 🎯 Next Steps

**Now that you understand the network menu:**

1. **Exit Wired menu** (you're in the wrong section)
2. **Navigate to WLAN menu** (wireless)
3. **Follow WiFi setup** (see steps above)
4. **Connect tablet to same network**
5. **Test printing**

**See these guides for detailed steps:**
- `BROTHER_PRINTER_SETUP.md` - Complete printer setup
- `SETUP_CAPACITOR_APP_WITH_PRINTER.md` - App + printer integration

---

## 💡 Pro Tips

**1. Use 2.4GHz WiFi:**
- Brother printers often don't support 5GHz
- Check your router has 2.4GHz enabled
- Use 2.4GHz network name

**2. Keep Network Config Page:**
- Press Go 6x to print
- Tape to wall near printer
- Reference for IP address

**3. Consider Static IP:**
- Prevents IP changes
- More reliable
- Set after initial connection

**4. Document Settings:**
- Write down WiFi password
- Note printer IP
- Keep MAC address
- Save network config page

---

## 🔍 What to Look For

**Good Status:**
```
✓ WLAN: Active
✓ IP: 192.168.1.100 (or similar)
✓ Connection: Wireless
✓ Status: Connected
```

**Bad Status:**
```
✗ IP: 0.0.0.0 (not connected)
✗ Status: Disconnected
✗ WLAN: Disabled
```

---

## 📞 Still Stuck?

**If you can't find WLAN menu:**
```
Try: Menu → Network → scroll down/up
Look for: WLAN, Wireless, WiFi, or 802.11
```

**If only seeing Wired options:**
```
Your printer may not have WiFi! (uncommon)
Check printer model supports wireless
Or use Ethernet cable instead
```

**Brother HL-L5210DN does support WiFi!** ✓
So you should definitely see WLAN menu.

---

**Let me know what you see in the WLAN menu and I'll guide you through the WiFi setup! 📡**





