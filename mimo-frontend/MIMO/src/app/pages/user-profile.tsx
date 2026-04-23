import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { MimoHeader } from "../components/mimo-header";
import { User, Mail, Phone, Save, Bell, FileText, Gift } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "../lib/api";


export function UserProfile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [printHistory, setPrintHistory] = useState<any[]>([]);
  const [name, setName] = useState(() => localStorage.getItem("mimo_user_name") || "Admin User");
  const [email, setEmail] = useState("admin@mimo.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [printCompleteNotif, setPrintCompleteNotif] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [mimoCoinsInfo] = useState<{ balance: number; totalEarned: number; totalUsed: number; history: any[] }>({ balance: 0, totalEarned: 0, totalUsed: 0, history: [] });

  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const res = await apiFetch("/print-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Error:", text);
        return;
      }

      const data = JSON.parse(text);
      setPrintHistory(data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchHistory();
}, []);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await apiFetch("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setName(data.username);
      setEmail(data.email);
      setPhone(data.mobileNumber);

    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, []);

  const handleSaveProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await apiFetch("/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: name,
        mobileNumber: phone,
      }),
    });

    if (!res.ok) {
      throw new Error("Update failed");
    }

    toast.success("Profile updated successfully!");

  } catch (err) {
    console.error(err);
    toast.error("Failed to update profile");
  }
};
  const getHistoryTimestamp = (job: any) => {
  const rawValue = job.createdAtMs ?? job.dateMs ?? job.createdAt ?? job.date;

  if (rawValue === null || rawValue === undefined) {
    return 0;
  }

  if (typeof rawValue === "number") {
    return rawValue;
  }

  const parsed = Date.parse(rawValue);
  return Number.isNaN(parsed) ? 0 : parsed;
};

  const formatHistoryDate = (job: any) => {
  const timestamp = getHistoryTimestamp(job);
  return timestamp > 0 ? new Date(timestamp).toLocaleString() : "N/A";
};

  const getPrinterStatusClass = (printerStatus: string) => {
  if (printerStatus === "Ready to Print") {
    return "bg-blue-100 text-blue-700";
  }

  if (printerStatus === "Printing") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (printerStatus === "Completed") {
    return "bg-green-100 text-green-700";
  }

  if (printerStatus === "Expired") {
    return "bg-gray-200 text-gray-600";
  }

  return "bg-red-100 text-red-700";
};

  const sortedHistory = [...printHistory].sort((a, b) => {
  return getHistoryTimestamp(b) - getHistoryTimestamp(a);
     // latest first
});
  return (
    <div className="min-h-[100dvh] w-full bg-slate-50/50 p-3 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-8">

        {/* Header */}
        <MimoHeader />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#093765] to-blue-600 bg-clip-text text-transparent">Account & Settings</h1>
          <p className="text-base sm:text-lg text-slate-500">Manage your profile, printing preferences, and account settings</p>
        </div>

        {/* Profile Header */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-[#093765] to-blue-600 text-white">
                  {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-gray-500">{email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0">Administrator</Badge>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <User className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs
          value={searchParams.get("tab") || "personal"}
          onValueChange={(val) => setSearchParams({ tab: val })}
          className="space-y-4 sm:space-y-6"
        >
          <div className="w-full overflow-x-auto custom-scrollbar pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-full min-w-max bg-white/50 p-1 rounded-xl h-auto">
              <TabsTrigger className="px-6" value="personal">Personal Info</TabsTrigger>
              <TabsTrigger className="px-6" value="mimo-coins">
                <Gift className="w-4 h-4 mr-2 inline-block" />
                Mimo Coins
              </TabsTrigger>
              <TabsTrigger className="px-6" value="activity">Activity</TabsTrigger>
              <TabsTrigger className="px-6" value="notifications">Notifications</TabsTrigger>
              <TabsTrigger className="px-6" value="privacy">Privacy</TabsTrigger>
            </TabsList>
          </div>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card className="border-0 shadow-md bg-white/80">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-indigo-400" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-indigo-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-indigo-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>

                </div>

                <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-[#093765] to-blue-700 hover:from-[#052345] hover:to-blue-800 text-white shadow-lg shadow-blue-900/20 transition-all duration-200">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="activity">
            <Card className="border-0 shadow-md bg-white/80">
              <CardHeader>
                <CardTitle>Print History</CardTitle>
                <CardDescription>View details and costs of your past print jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Print Code</TableHead>
                      <TableHead>Printer Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>

                    {sortedHistory.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{job.file}</p>
                              <p className="text-xs text-gray-500">{job.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-gray-700">{job.details}</p>
                            <p className="text-xs text-gray-500">{job.details}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {job.cost}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={job.status === "Completed" ? "default" : "destructive"}
                            className={job.status === "Completed" ? "bg-green-100 text-green-700 hover:bg-green-200 shadow-none border-green-200" : "bg-red-100 text-red-700 hover:bg-red-200 shadow-none border-red-200"}
                          >
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {job.printCode || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPrinterStatusClass(job.printerStatus)}
                          >
                            {job.printerStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-500">
                          {formatHistoryDate(job)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mimo Coins */}
          <TabsContent value="mimo-coins">
            <Card className="border-0 shadow-md bg-white/80">
              <CardHeader className="text-center pb-2 mt-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-purple-900">{mimoCoinsInfo.balance} Mimo Coins</CardTitle>
                <CardDescription className="text-purple-600 font-medium">Worth ₹{(mimoCoinsInfo.balance * 0.5).toFixed(2)} in discounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50/50 border border-green-100 rounded-xl p-6 text-center shadow-sm">
                    <div className="text-4xl font-bold text-green-600 mb-2">{mimoCoinsInfo.totalEarned}</div>
                    <div className="text-sm font-medium text-gray-600">Total Coins Earned</div>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-center shadow-sm">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{mimoCoinsInfo.totalUsed}</div>
                    <div className="text-sm font-medium text-gray-600">Total Coins Used</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 mt-4 shadow-sm">
                  <h3 className="font-semibold text-purple-900 mb-4 text-lg">How to Earn Mimo Coins:</h3>
                  <ul className="space-y-3 text-purple-800 text-base">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                      <span>Earn <strong>1 coin per ₹10 spent</strong> on print jobs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                      <span>Use coins for up to <strong>50% discount</strong> on prints</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                      <span><strong>1 coin = ₹0.5</strong> discount (2 coins = ₹1)</span>
                    </li>
                  </ul>
                </div>

              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white/80 mt-6">
              <CardHeader>
                <CardTitle>Mimo Coins History</CardTitle>
              </CardHeader>
              <CardContent>
                {mimoCoinsInfo.history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No coin history yet. Start printing to earn coins!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mimoCoinsInfo.history.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="font-medium text-sm text-gray-900">{record.description}</div>
                            <div className="text-xs text-gray-500">{record.id}</div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{record.date}</TableCell>
                          <TableCell className={`text-right font-medium ${record.type === 'earned' ? 'text-green-600' : 'text-blue-600'}`}>
                            {record.type === 'earned' ? '+' : '-'}{record.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-md bg-white/80">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Email Notifications
                  </h4>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label>Enable Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    {emailNotifications && (
                      <>
                        <Separator />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="space-y-0.5">
                            <Label>Print Job Completed</Label>
                            <p className="text-sm text-gray-500">
                              Get notified when your print is ready
                            </p>
                          </div>
                          <Switch
                            checked={printCompleteNotif}
                            onCheckedChange={setPrintCompleteNotif}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="space-y-0.5">
                            <Label>Payment Receipts</Label>
                            <p className="text-sm text-gray-500">
                              Receive payment confirmations
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">
                      Receive news and promotional offers
                    </p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>

                <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-[#093765] to-blue-700 hover:from-[#052345] hover:to-blue-800 text-white shadow-lg shadow-blue-900/20 transition-all duration-200">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy">
            <Card className="border-0 shadow-md bg-white/80">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your data and privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="retention">Data Retention</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Print history and uploaded files will be deleted after this period
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-gray-500">
                      Show your profile to other users
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5">
                    <Label>Usage Analytics</Label>
                    <p className="text-sm text-gray-500">
                      Help improve MIMO by sharing usage data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Account Actions</Label>
                  <Button variant="outline" className="w-full justify-start">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
