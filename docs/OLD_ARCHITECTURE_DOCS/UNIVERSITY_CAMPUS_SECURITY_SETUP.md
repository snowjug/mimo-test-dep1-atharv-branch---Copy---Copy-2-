# University Campus Security Setup - Network Isolation

## 🔐 Security Problem

**Scenario:**
- VPrint Kiosk deployed on university campus
- Printer and tablet connected to campus WiFi
- **Problem:** Anyone on campus network can discover and use printer
- **Risk:** Unauthorized printing, paper waste, security breach

**You need network isolation!**

---

## ✅ Solution Options (Best to Worst)

### Option 1: Private WiFi Network (Recommended) ⭐⭐⭐⭐⭐

Create a separate, isolated network just for your kiosk.

**Equipment Needed:**
- Small WiFi router (~$30-50)
- One with "Guest Network" or "Isolated Network" feature

**Setup:**
```
Campus Network (University)
    ↓
Ethernet cable
    ↓
Private WiFi Router (Your kiosk network)
    ↓
    ├─→ Lenovo Tab M9
    └─→ Brother Printer
```

**How It Works:**
- Router connects to campus via ethernet (WAN port)
- Creates isolated WiFi network (different SSID/password)
- Only your devices on this private network
- Campus users can't see or access printer
- Kiosk still has internet for Firebase

**Implementation:**
1. Purchase small router (TP-Link, Netgear, etc.)
2. Connect router WAN port to campus ethernet
3. Configure router with unique SSID/password
4. Enable "AP Isolation" or "Client Isolation"
5. Connect tablet and printer to this network only
6. Campus users can't access

**Pros:**
- ✅ Complete isolation
- ✅ Full control over network
- ✅ Easy to setup
- ✅ Low cost (~$30-50)
- ✅ No IT department needed
- ✅ Portable (move to different locations)

**Cons:**
- ⚠️ Needs power for router
- ⚠️ Needs ethernet connection
- ⚠️ Small hardware footprint

**Recommended Routers:**
- TP-Link AC1200 (~$30)
- Netgear Nighthawk R6700 (~$50)
- ASUS RT-AC66U (~$60)

---

### Option 2: VLAN (Virtual LAN) ⭐⭐⭐⭐

Request university IT to create isolated network segment.

**How It Works:**
- IT creates separate VLAN for kiosk
- Kiosk devices get dedicated subnet
- VLAN is isolated from campus network
- Only authorized devices can connect

**Setup:**
1. Contact university IT department
2. Request VLAN for printing kiosk
3. Explain security requirements
4. IT configures network switches
5. Connect devices to VLAN SSID/port
6. Test isolation

**Pros:**
- ✅ Professional solution
- ✅ No extra hardware
- ✅ Uses existing infrastructure
- ✅ IT department manages security
- ✅ Can have multiple kiosks on same VLAN

**Cons:**
- ⚠️ Requires IT approval and support
- ⚠️ May take time to implement
- ⚠️ Depends on IT department responsiveness
- ⚠️ Less flexible for moving kiosk

**Request Template:**
```
Subject: VLAN Request for Self-Service Printing Kiosk

Dear IT Department,

We are deploying a self-service printing kiosk and require 
network isolation for security. We need:

1. Dedicated VLAN for kiosk devices
2. Subnet: Isolated from campus network
3. Devices: 
   - Android tablet (MAC: XX:XX:XX:XX:XX:XX)
   - Brother printer (MAC: XX:XX:XX:XX:XX:XX)
4. Internet access: Required for cloud service
5. Isolation: Prevent discovery from campus network

Purpose: Prevent unauthorized access to printer

Thank you!
```

---

### Option 3: Brother Secure Function Lock ⭐⭐⭐⭐

Use printer's built-in access control.

**How It Works:**
- Brother printers have security features
- Require PIN code to print
- Can restrict by user group
- Tablet knows PIN, users don't

**Setup via Printer Web Interface:**

1. **Access Printer:**
   ```
   Browser → http://PRINTER_IP
   Login: admin / (no password)
   ```

2. **Enable Secure Function Lock:**
   ```
   Administrator → Secure Function Lock 2.0 → On
   ```

3. **Create User Groups:**
   ```
   Group 1: "Kiosk Tablet"
   - PIN: 1234 (your secret)
   - Allow: Print
   
   Group 2: "Public"
   - PIN: None required to see printer
   - Deny: Print (or require PIN)
   ```

4. **Configure Your App:**
   ```typescript
   // In your print plugin, send PIN with print job
   printJob.authentication = "1234";
   ```

**Pros:**
- ✅ No extra hardware
- ✅ Works on existing network
- ✅ Prevents unauthorized printing
- ✅ Audit trail available
- ✅ Can track print usage

**Cons:**
- ⚠️ Printer still visible on network
- ⚠️ Users can see printer (just can't print)
- ⚠️ PIN must be embedded in app
- ⚠️ Not true network isolation

---

### Option 4: MAC Address Filtering ⭐⭐⭐

Configure printer to only accept jobs from tablet.

**How It Works:**
- Printer whitelist: Only tablet's MAC address
- Other devices can see printer but can't print
- Brother HL-L5210DN supports this

**Setup:**

1. **Get Tablet MAC Address:**
   ```
   Tablet → Settings → About → Status → WiFi MAC address
   Example: 00:11:22:33:44:55
   ```

2. **Configure Printer:**
   ```
   Web Interface → Network → Wireless → MAC Address Filter
   Mode: Accept List
   Add: Tablet MAC address
   Save
   ```

3. **Test:**
   - Tablet can print ✓
   - Other devices cannot print ✗

**Pros:**
- ✅ Free
- ✅ Easy to configure
- ✅ No extra hardware

**Cons:**
- ⚠️ Can be bypassed (MAC spoofing)
- ⚠️ Only prevents printing, not discovery
- ⚠️ Not enterprise-grade security

---

### Option 5: Captive Portal WiFi ⭐⭐⭐

Router with login portal.

**How It Works:**
- Dedicated router with captive portal
- Users must login to access network
- Only you have credentials
- Portal blocks unauthorized access

**Equipment:**
- UniFi Access Point (~$100)
- MikroTik router (~$60)
- Or consumer router with captive portal

**Setup:**
1. Configure router with captive portal
2. Set password you control
3. Connect tablet and printer
4. Campus users blocked by login screen

**Pros:**
- ✅ Professional solution
- ✅ Good for multiple kiosks
- ✅ Can track access

**Cons:**
- ⚠️ More expensive hardware
- ⚠️ Complex configuration
- ⚠️ Overkill for single kiosk

---

### Option 6: Print Server with Authentication ⭐⭐

Add authentication middleware.

**How It Works:**
```
User → QR Code (with token) → VPrint App 
→ Firebase (validates token) 
→ Print Server (checks auth)
→ Printer
```

**Implementation:**
- Modify print plugin to require authentication
- Each print job includes encrypted token
- Print server validates before printing
- Only valid tokens from your app work

**Code Example:**
```typescript
// In PrintPlugin.java
public void print(PluginCall call) {
    String documentUrl = call.getString("documentUrl");
    String authToken = call.getString("authToken");
    
    // Validate token against Firebase
    if (!validateToken(authToken)) {
        call.reject("Unauthorized");
        return;
    }
    
    // Proceed with printing
    printDocument(documentUrl);
}
```

**Pros:**
- ✅ Software-only solution
- ✅ No extra hardware
- ✅ Token-based security
- ✅ Audit trail

**Cons:**
- ⚠️ Requires development
- ⚠️ More complex
- ⚠️ Printer still visible

---

## 🎯 Recommended Solution for University

### **Best: Option 1 (Private WiFi) + Option 3 (Secure Function Lock)**

**Why This Combination:**
1. **Private WiFi** - Physical network isolation
2. **Secure Function Lock** - Software protection layer
3. **Defense in depth** - Multiple security layers

**Setup:**

```
Campus Ethernet
    ↓
Private WiFi Router ($30-50)
  SSID: "VPrintKiosk" (hidden)
  Password: Strong password
  AP Isolation: Enabled
    ↓
    ├─→ Lenovo Tab M9 (MAC whitelisted)
    └─→ Brother Printer (PIN protected)
```

**Security Layers:**
1. ✅ Hidden SSID (not broadcast)
2. ✅ Strong WPA3 password
3. ✅ AP Isolation enabled
4. ✅ MAC filtering on router
5. ✅ Printer PIN/password required
6. ✅ Secure Function Lock enabled
7. ✅ Token validation in app

**Cost:** ~$40 (router only)
**Setup Time:** 1-2 hours
**Security Level:** High
**Maintenance:** Low

---

## 📋 Step-by-Step Implementation

### Phase 1: Network Setup (30 min)

**1. Purchase Router:**
```
TP-Link Archer A7 AC1750 (~$40)
- Dual band
- Guest network support
- Parental controls (for isolation)
```

**2. Configure Router:**
```
Connect to router admin page
→ Wireless Settings
  → Main Network
     SSID: VPrintKiosk_Private
     Password: [strong password]
     Hide SSID: Yes
     Security: WPA3 or WPA2
  
→ Advanced Settings
  → AP Isolation: Enable
  → Guest Network: Disable
  
→ Firewall
  → Block WAN requests: Yes
  → SPI Firewall: Enable
```

**3. Connect to Campus:**
```
Router WAN port → Campus ethernet jack
Router gets internet from campus
Creates isolated WiFi for kiosk
```

### Phase 2: Printer Security (20 min)

**1. Connect Printer to Private Network:**
```
Printer → Menu → Network → WLAN → Setup Wizard
→ Select: VPrintKiosk_Private
→ Enter password
→ Connect
```

**2. Configure Secure Function Lock:**
```
Browser → http://PRINTER_IP
→ Administrator → Secure Function Lock 2.0
→ Enable

Create Groups:
  Group: KioskTablet
  PIN: 8739 (random, store in app config)
  Permissions: Allow all printing
  
  Group: Public
  PIN: [none]
  Permissions: Deny all
```

**3. Enable MAC Filtering:**
```
Network → Wireless → MAC Filter
Mode: Accept List
Add: [Tablet MAC address]
Save
```

### Phase 3: Tablet Setup (15 min)

**1. Connect Tablet:**
```
Settings → WiFi → Add Network
SSID: VPrintKiosk_Private (type manually if hidden)
Password: [router password]
Connect
```

**2. Configure Print Plugin:**
```typescript
// Update PrintPlugin.java
private static final String PRINTER_PIN = "8739";

public void print(PluginCall call) {
    // Add PIN to print job
    printJob.setAuthentication(PRINTER_PIN);
    // Continue printing
}
```

**3. Test:**
```
Open VPrint app
Scan QR code
Print → Should work with PIN
```

### Phase 4: Verification (10 min)

**Test Security:**

1. ✅ **Tablet can print**
   - Scan QR → Print → Works

2. ✅ **Other devices blocked**
   - Try connecting to VPrintKiosk_Private → Requires password
   - Try accessing printer → PIN required

3. ✅ **Campus network isolated**
   - From campus laptop → Can't see printer
   - Can't access private network

4. ✅ **Internet works**
   - VPrint app → Firebase → Works
   - QR scanning → Works

---

## 🔒 Security Checklist

**Network Security:**
- [ ] Private WiFi router installed
- [ ] Strong WPA3/WPA2 password set
- [ ] SSID hidden (not broadcast)
- [ ] AP Isolation enabled
- [ ] Different subnet from campus
- [ ] Firewall rules configured

**Printer Security:**
- [ ] Connected to private network only
- [ ] Static IP assigned
- [ ] Secure Function Lock enabled
- [ ] PIN required for printing
- [ ] MAC filtering enabled
- [ ] Admin password changed from default

**Tablet Security:**
- [ ] Connected to private network only
- [ ] Kiosk mode enabled (screen pinning)
- [ ] Only VPrint app accessible
- [ ] Auto-updates disabled (or controlled)
- [ ] Unknown sources disabled
- [ ] Find My Device enabled (theft protection)

**Application Security:**
- [ ] PIN stored securely in app
- [ ] Firebase authentication enabled
- [ ] Token validation implemented
- [ ] QR codes expire after use
- [ ] Print logs recorded
- [ ] Error handling doesn't expose info

---

## 🏢 Multiple Kiosks (Scalability)

**If deploying multiple kiosks:**

### Architecture:
```
Campus Network
    ↓
    ├─→ Router 1 → Kiosk 1 (Library)
    ├─→ Router 2 → Kiosk 2 (Student Center)  
    └─→ Router 3 → Kiosk 3 (Dorms)

Each isolated from others and campus
All connect to same Firebase backend
```

### Best Practice:
1. One router per kiosk location
2. Each on different subnet
3. All use same security config
4. Central Firebase for all
5. Unique kiosk IDs

---

## 💰 Cost Breakdown

**Single Kiosk:**
```
Private WiFi Router:     $40
Ethernet cable:          $5 (if needed)
Labor (setup):           2 hours

Total Hardware Cost:     ~$45
One-time setup
```

**Alternative (VLAN):**
```
Hardware:                $0
IT Department:           Free (internal)
Setup time:              Depends on IT

Total Cost:              $0 (if IT cooperates)
```

---

## 🚨 Security Risk Levels

### Without Security (Bad):
```
Risk Level: 🔴 HIGH
- Anyone can use printer
- Paper waste
- Toner waste
- Unauthorized documents
- Potential data breach
```

### With Private Network (Good):
```
Risk Level: 🟡 MEDIUM
- Network isolated
- Still need printer PIN
- Physical access concern
```

### With Private Network + Printer Security (Best):
```
Risk Level: 🟢 LOW
- Network isolated ✓
- Printer PIN protected ✓
- MAC filtered ✓
- App token validated ✓
- Multiple security layers ✓
```

---

## 📞 Working with University IT

**If you need IT Department help:**

### Email Template:
```
Subject: Network Isolation Request for Self-Service Printing Kiosk

Dear [IT Department],

We are deploying a self-service printing kiosk for students and 
require network security consultation.

Project: VPrint Self-Service Printing Kiosk
Location: [Building/Floor]
Devices: 
  - 1x Android tablet (Lenovo Tab M9)
  - 1x Network printer (Brother HL-L5210DN)

Security Requirements:
1. Prevent unauthorized access to printer from campus network
2. Maintain internet connectivity for cloud services
3. Isolate kiosk network from campus network

Proposed Solutions (for discussion):
- Option A: Dedicated VLAN for kiosk devices
- Option B: Private WiFi router with campus uplink
- Option C: Your recommended approach

Can we schedule a meeting to discuss the best approach?

Thank you,
[Your Name]
```

### Meeting Topics:
1. Security requirements
2. Network topology
3. VLAN availability
4. Firewall rules needed
5. Support/maintenance
6. Expansion plans

---

## 🎯 Final Recommendation

**For University Campus:**

**DO THIS:**
```
1. Buy small WiFi router ($40)
2. Connect to campus ethernet
3. Create isolated network
4. Connect tablet + printer to private network
5. Enable Brother Secure Function Lock with PIN
6. Hide SSID
7. Enable MAC filtering
8. Change all default passwords
9. Test security
10. Deploy!
```

**This gives you:**
- ✅ Complete network isolation
- ✅ No IT department needed
- ✅ Quick deployment (2 hours)
- ✅ Low cost ($40)
- ✅ Full control
- ✅ Portable to other locations
- ✅ Enterprise-level security
- ✅ Peace of mind

**Security Level:** 🔒🔒🔒🔒🔒 Excellent

---

## 📚 Additional Resources

**Router Recommendations:**
- TP-Link Archer A7 (~$40) ⭐
- Netgear R6700 (~$50)
- ASUS RT-AC66U (~$60)

**Brother Security Guide:**
- support.brother.com → HL-L5210DN → Security Guide

**Network Testing Tools:**
- Fing (Android app) - Scan network devices
- WiFi Analyzer - Check network isolation

---

## ✅ Summary

**Problem:** Campus network allows anyone to access printer

**Solution:** Private WiFi + Printer PIN protection

**Cost:** $40 (router)

**Time:** 2 hours setup

**Security:** Excellent (multiple layers)

**Maintenance:** Minimal

**Approved for university deployment:** ✅ YES

---

**Questions about security setup? Let me know!**





