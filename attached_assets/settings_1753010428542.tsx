import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Store, Shield, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocalStorageManager } from '@/lib/localStorage';
import { animatePageEnter, animateButtonClick, animateFieldSuccess, animateFieldError } from '@/lib/gsapUtils';

export default function Settings() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    storeAddress: '',
    storePhone: '',
    taxRate: '',
    currency: '',
  });
  const [securitySettings, setSecuritySettings] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    if (pageRef.current) {
      animatePageEnter(pageRef.current);
    }
  }, []);

  const loadSettings = () => {
    const settings = LocalStorageManager.getSettings();
    setStoreSettings({
      storeName: settings.storeName,
      storeAddress: settings.storeAddress,
      storePhone: settings.storePhone,
      taxRate: (settings.taxRate * 100).toString(),
      currency: settings.currency,
    });
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const settings = LocalStorageManager.getSettings();
      const updatedSettings = {
        ...settings,
        storeName: storeSettings.storeName,
        storeAddress: storeSettings.storeAddress,
        storePhone: storeSettings.storePhone,
        taxRate: parseFloat(storeSettings.taxRate) / 100,
        currency: storeSettings.currency,
      };

      LocalStorageManager.setSettings(updatedSettings);
      
      // Success animation
      const submitButton = document.querySelector('#store-submit') as HTMLElement;
      if (submitButton) {
        animateFieldSuccess(submitButton);
      }
      
      toast({ title: "Store settings updated successfully" });
    } catch (error) {
      toast({ 
        title: "Failed to update settings", 
        description: "Please check your inputs and try again",
        variant: "destructive" 
      });
      
      // Error animation
      const form = document.getElementById('store-form');
      if (form) {
        animateFieldError(form);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const settings = LocalStorageManager.getSettings();
      
      // Verify current PIN
      if (securitySettings.currentPin !== settings.securityPin) {
        throw new Error('Current PIN is incorrect');
      }

      // Validate new PIN
      if (securitySettings.newPin !== securitySettings.confirmPin) {
        throw new Error('New PINs do not match');
      }

      if (securitySettings.newPin.length !== 4 || !/^\d{4}$/.test(securitySettings.newPin)) {
        throw new Error('PIN must be exactly 4 digits');
      }

      // Update PIN
      LocalStorageManager.updateSetting('securityPin', securitySettings.newPin);
      
      // Success animation
      const submitButton = document.querySelector('#security-submit') as HTMLElement;
      if (submitButton) {
        animateFieldSuccess(submitButton);
      }
      
      toast({ title: "Security PIN updated successfully" });
      
      // Clear form
      setSecuritySettings({
        currentPin: '',
        newPin: '',
        confirmPin: '',
      });
    } catch (error) {
      toast({ 
        title: "Failed to update PIN", 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive" 
      });
      
      // Error animation
      const form = document.getElementById('security-form');
      if (form) {
        animateFieldError(form);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      LocalStorageManager.clearAllData();
      LocalStorageManager.initializeSampleData();
      loadSettings();
      toast({ 
        title: "All data cleared", 
        description: "Sample data has been restored",
      });
    }
  };

  return (
    <div ref={pageRef} className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your pharmacy settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="w-5 h-5 mr-2" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form id="store-form" onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({ 
                    ...storeSettings, 
                    storeName: e.target.value 
                  })}
                  placeholder="PharmaCare Pharmacy"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="store-address">Store Address</Label>
                <Input
                  id="store-address"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({ 
                    ...storeSettings, 
                    storeAddress: e.target.value 
                  })}
                  placeholder="123 Healthcare Ave, Medical District, City 12345"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="store-phone">Phone Number</Label>
                <Input
                  id="store-phone"
                  value={storeSettings.storePhone}
                  onChange={(e) => setStoreSettings({ 
                    ...storeSettings, 
                    storePhone: e.target.value 
                  })}
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({ 
                      ...storeSettings, 
                      taxRate: e.target.value 
                    })}
                    placeholder="8.25"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({ 
                      ...storeSettings, 
                      currency: e.target.value 
                    })}
                    placeholder="USD"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                id="store-submit"
                type="submit" 
                className="w-full"
                disabled={isLoading}
                onMouseDown={(e) => animateButtonClick(e.currentTarget)}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Store Information'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form id="security-form" onSubmit={handleSecuritySubmit} className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Security PIN</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This PIN is required for sensitive operations like deleting products or customers.
                      Keep it secure and only share with authorized staff.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="current-pin">Current Security PIN</Label>
                <Input
                  id="current-pin"
                  type="password"
                  value={securitySettings.currentPin}
                  onChange={(e) => setSecuritySettings({ 
                    ...securitySettings, 
                    currentPin: e.target.value 
                  })}
                  placeholder="••••"
                  maxLength={4}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="new-pin">New Security PIN</Label>
                <Input
                  id="new-pin"
                  type="password"
                  value={securitySettings.newPin}
                  onChange={(e) => setSecuritySettings({ 
                    ...securitySettings, 
                    newPin: e.target.value 
                  })}
                  placeholder="••••"
                  maxLength={4}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Enter a 4-digit PIN</p>
              </div>

              <div>
                <Label htmlFor="confirm-pin">Confirm New PIN</Label>
                <Input
                  id="confirm-pin"
                  type="password"
                  value={securitySettings.confirmPin}
                  onChange={(e) => setSecuritySettings({ 
                    ...securitySettings, 
                    confirmPin: e.target.value 
                  })}
                  placeholder="••••"
                  maxLength={4}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={isLoading}
                />
              </div>

              <Button 
                id="security-submit"
                type="submit" 
                className="w-full"
                disabled={
                  isLoading || 
                  !securitySettings.currentPin || 
                  !securitySettings.newPin || 
                  !securitySettings.confirmPin
                }
                onMouseDown={(e) => animateButtonClick(e.currentTarget)}
              >
                <Shield className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Security PIN'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
              <p className="text-sm text-blue-700 font-medium">System Version</p>
              <p className="text-xs text-gray-600 mt-1">PharmaCare Management System</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {new Date().getFullYear()}
              </div>
              <p className="text-sm text-green-700 font-medium">Licensed Year</p>
              <p className="text-xs text-gray-600 mt-1">Valid license</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Local</div>
              <p className="text-sm text-purple-700 font-medium">Data Storage</p>
              <p className="text-xs text-gray-600 mt-1">Browser localStorage</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Inventory Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Point of Sale System</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Customer Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Prescription Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Sales Reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Excel Export</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Management</h3>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-800">Clear All Data</p>
                <p className="text-xs text-red-700">This will remove all data and restore sample data</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={clearAllData}
                onMouseDown={(e) => animateButtonClick(e.currentTarget)}
              >
                Clear Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
