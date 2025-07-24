import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocalStorageManager } from '@/lib/localStorage';
import { animateFieldError, animateButtonClick } from '@/lib/gsapUtils';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function SecurityModal({ isOpen, onClose, onSuccess, title, description }: SecurityModalProps) {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    const settings = LocalStorageManager.getSettings();
    const correctPin = settings.securityPin;

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (pin === correctPin) {
      onSuccess();
      onClose();
      setPin('');
      toast({ title: "Security verification successful" });
    } else {
      toast({ 
        title: "Invalid security PIN", 
        description: "Please check your PIN and try again",
        variant: "destructive" 
      });
      
      // Animate error
      const pinInput = document.getElementById('security-pin');
      if (pinInput) {
        animateFieldError(pinInput);
      }
      
      setPin('');
    }
    
    setIsVerifying(false);
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 transform transition-all duration-300">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-600 text-2xl" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title || "Security Verification Required"}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {description || "Please enter your security PIN to continue with this action."}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="security-pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                placeholder="••••"
                className="text-center text-lg font-mono tracking-widest"
                disabled={isVerifying}
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1"
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isVerifying || pin.length !== 4}
                onMouseDown={(e) => animateButtonClick(e.currentTarget)}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Security PIN can be changed in Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
