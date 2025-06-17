"use client";

import { useState } from "react";
import { RouteGuard } from "@/components/route-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User,
  Lock,
  Globe,
  Bell,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Shield,
  Download,
  Trash2,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  Languages,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

interface UserSettings {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Security
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;

  // Preferences
  timezone: string;
  language: string;
  theme: "light" | "dark" | "system";

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  digestReminders: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;

  // Privacy
  profileVisibility: "public" | "private";
  dataSharing: boolean;
  analyticsOptIn: boolean;

  // App Settings
  autoSave: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
}

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    timezone: "America/New_York",
    language: "en",
    theme: "system",
    emailNotifications: true,
    pushNotifications: true,
    digestReminders: true,
    weeklyReports: false,
    securityAlerts: true,
    profileVisibility: "private",
    dataSharing: false,
    analyticsOptIn: true,
    autoSave: true,
    soundEnabled: true,
    compactMode: false,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "app", label: "App Settings", icon: Smartphone },
  ];

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return (
      password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    );
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-$$$$]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const handleInputChange = (field: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Personal Information Validation
    if (!settings.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!settings.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!validateEmail(settings.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (settings.phone && !validatePhone(settings.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password Validation (only if changing password)
    if (settings.newPassword || settings.confirmPassword) {
      if (!settings.currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }
      if (!validatePassword(settings.newPassword)) {
        newErrors.newPassword =
          "Password must be at least 8 characters with uppercase, lowercase, and number";
      }
      if (settings.newPassword !== settings.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveStatus("error");
      return;
    }

    setIsLoading(true);
    setSaveStatus("saving");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSaveStatus("success");

      // Clear password fields after successful save
      setSettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setShowExportDialog(false);
    // Simulate data export
    const data = {
      personal: {
        firstName: settings.firstName,
        lastName: settings.lastName,
        email: settings.email,
      },
      preferences: {
        timezone: settings.timezone,
        language: settings.language,
        theme: settings.theme,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "digestly-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={settings.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className={`h-12 ${errors.firstName ? "border-red-500" : ""}`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={settings.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className={`h-12 ${errors.lastName ? "border-red-500" : ""}`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={settings.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className={`h-12 ${errors.email ? "border-red-500" : ""}`}
          placeholder="Enter your email address"
        />
        {errors.email && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={settings.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className={`h-12 ${errors.phone ? "border-red-500" : ""}`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.phone}
          </p>
        )}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Change Password</h4>

        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={settings.currentPassword}
              onChange={(e) =>
                handleInputChange("currentPassword", e.target.value)
              }
              className={`h-12 pr-12 ${
                errors.currentPassword ? "border-red-500" : ""
              }`}
              placeholder="Enter current password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={settings.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              className={`h-12 pr-12 ${
                errors.newPassword ? "border-red-500" : ""
              }`}
              placeholder="Enter new password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.newPassword}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={settings.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className={`h-12 pr-12 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              placeholder="Confirm new password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Two-Factor Authentication
        </h4>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Enable Two-Factor Authentication</p>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={settings.twoFactorEnabled}
            onCheckedChange={(checked) =>
              handleInputChange("twoFactorEnabled", checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => handleInputChange("timezone", value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {tz.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => handleInputChange("language", value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {lang.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={settings.theme}
            onValueChange={(value) => handleInputChange("theme", value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  System
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Email Notifications
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                handleInputChange("emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Digest Reminders</p>
              <p className="text-sm text-gray-600">
                Get reminded when new digests are available
              </p>
            </div>
            <Switch
              checked={settings.digestReminders}
              onCheckedChange={(checked) =>
                handleInputChange("digestReminders", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-gray-600">
                Receive weekly summary reports
              </p>
            </div>
            <Switch
              checked={settings.weeklyReports}
              onCheckedChange={(checked) =>
                handleInputChange("weeklyReports", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-gray-600">
                Important security notifications
              </p>
            </div>
            <Switch
              checked={settings.securityAlerts}
              onCheckedChange={(checked) =>
                handleInputChange("securityAlerts", checked)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Push Notifications
        </h4>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-gray-600">
              Receive push notifications on your device
            </p>
          </div>
          <Switch
            checked={settings.pushNotifications}
            onCheckedChange={(checked) =>
              handleInputChange("pushNotifications", checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profileVisibility">Profile Visibility</Label>
          <Select
            value={settings.profileVisibility}
            onValueChange={(value) =>
              handleInputChange("profileVisibility", value)
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select profile visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Data Sharing</p>
            <p className="text-sm text-gray-600">
              Allow sharing anonymized usage data
            </p>
          </div>
          <Switch
            checked={settings.dataSharing}
            onCheckedChange={(checked) =>
              handleInputChange("dataSharing", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Analytics</p>
            <p className="text-sm text-gray-600">
              Help improve the app with usage analytics
            </p>
          </div>
          <Switch
            checked={settings.analyticsOptIn}
            onCheckedChange={(checked) =>
              handleInputChange("analyticsOptIn", checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderAppSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Auto-save</p>
            <p className="text-sm text-gray-600">Automatically save changes</p>
          </div>
          <Switch
            checked={settings.autoSave}
            onCheckedChange={(checked) =>
              handleInputChange("autoSave", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Sound Effects</p>
            <p className="text-sm text-gray-600">
              Play sound effects for interactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                handleInputChange("soundEnabled", checked)
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Compact Mode</p>
            <p className="text-sm text-gray-600">
              Use compact layout for more content
            </p>
          </div>
          <Switch
            checked={settings.compactMode}
            onCheckedChange={(checked) =>
              handleInputChange("compactMode", checked)
            }
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Data Management</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="h-12 justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="h-12 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "personal":
        return renderPersonalInfo();
      case "security":
        return renderSecurity();
      case "preferences":
        return renderPreferences();
      case "notifications":
        return renderNotifications();
      case "privacy":
        return renderPrivacy();
      case "app":
        return renderAppSettings();
      default:
        return renderPersonalInfo();
    }
  };
  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                            isActive
                              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{section.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const section = sections.find(
                        (s) => s.id === activeSection
                      );
                      const Icon = section?.icon || User;
                      return (
                        <>
                          <Icon className="w-5 h-5" />
                          {section?.label}
                        </>
                      );
                    })()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderContent()}

                  {/* Save Button */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center gap-2">
                      {saveStatus === "success" && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Settings saved successfully
                          </span>
                        </div>
                      )}
                      {saveStatus === "error" && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Failed to save settings
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-teal-600 hover:bg-teal-700 text-white h-12 px-6"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Export Data Dialog */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Your Data</DialogTitle>
                <DialogDescription>
                  Download a copy of your personal data and settings. This will
                  include your profile information, preferences, and digest
                  configurations.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExportData}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Account Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>{" "}
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </RouteGuard>
  );
}
