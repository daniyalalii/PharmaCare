import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { localStorageManager } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Download, Trash2 } from "lucide-react";
import { exportToJSON } from "@/lib/utils";

export default function Settings() {
  const [settings, setSettings] = useState(() => localStorageManager.getSettings());
  const { toast } = useToast();

  const handleSaveSettings = () => {
    try {
      localStorageManager.updateSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    try {
      const data = localStorageManager.exportData();
      exportToJSON(data, `pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`);
      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        localStorageManager.importData(data);
        setSettings(localStorageManager.getSettings());
        toast({
          title: "Data Imported",
          description: "Your data has been imported successfully.",
        });
        // Refresh the page to reflect imported data
        window.location.reload();
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      try {
        localStorageManager.clearAllData();
        setSettings(localStorageManager.getSettings());
        toast({
          title: "Data Cleared",
          description: "All data has been cleared.",
        });
        // Refresh the page to reflect cleared data
        window.location.reload();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <MainLayout title="Settings" description="Manage pharmacy settings and preferences">
      <div className="p-6 space-y-6">
        {/* Pharmacy Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                <Input
                  id="pharmacyName"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter pharmacy name"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={settings.licenseNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="Enter license number"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="pharmacistName">Pharmacist Name</Label>
                <Input
                  id="pharmacistName"
                  value={settings.pharmacistName}
                  onChange={(e) => setSettings(prev => ({ ...prev, pharmacistName: e.target.value }))}
                  placeholder="Enter pharmacist name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter pharmacy address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.taxRate * 100}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) / 100 || 0 }))}
                  placeholder="8.00"
                />
              </div>
              <div>
                <Label htmlFor="defaultDiscount">Default Discount (%)</Label>
                <Input
                  id="defaultDiscount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.defaultDiscount}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultDiscount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pin">Security PIN (for inventory operations)</Label>
              <Input
                id="pin"
                type="password"
                value={settings.pin}
                onChange={(e) => setSettings(prev => ({ ...prev, pin: e.target.value }))}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                This PIN is required for sensitive operations like editing or deleting inventory items.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                  id="import-file"
                />
                <Button 
                  onClick={() => document.getElementById('import-file')?.click()}
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
              </div>
              <Button 
                onClick={handleClearData} 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Export your data for backup purposes or import previously exported data. 
              Use "Clear All Data" to reset the system to its initial state.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}