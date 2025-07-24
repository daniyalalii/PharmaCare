import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { localStorageManager } from "@/lib/localStorage";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: 'edit' | 'delete';
  itemName: string;
}

export function SecurityModal({ isOpen, onClose, onSuccess, action, itemName }: SecurityModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const settings = localStorageManager.getSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (pin === settings.pin) {
      onSuccess();
      setPin("");
      setError("");
    } else {
      setError("Incorrect PIN. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Security Verification Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              You are about to <strong>{action}</strong> the item: <strong>{itemName}</strong>
              <br />
              Please enter your PIN to confirm this action.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                className={error ? 'border-red-500' : ''}
                maxLength={10}
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                disabled={!pin || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : `Confirm ${action}`}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Default PIN is 0000. You can change it in Settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}