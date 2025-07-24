import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocalStorageManager } from '@/lib/localStorage';
import { animateButtonClick, animateFieldSuccess, animateFieldError } from '@/lib/gsapUtils';
import { InsertProduct } from '@shared/schema';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [formData, setFormData] = useState<InsertProduct>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    expiry: '',
    manufacturer: '',
    batch: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name || !formData.category || formData.price <= 0 || formData.stock < 0) {
        throw new Error('Please fill all required fields with valid values');
      }

      // Add product
      const newProduct = LocalStorageManager.addProduct({
        ...formData,
        manufacturer: formData.manufacturer || 'Generic Manufacturer',
        batch: formData.batch || `BATCH${Date.now()}`,
      });

      // Success animation
      const submitButton = document.querySelector('[type="submit"]') as HTMLElement;
      if (submitButton) {
        animateFieldSuccess(submitButton);
      }

      toast({ title: "Product added successfully!" });
      onSuccess();
      handleClose();
    } catch (error) {
      toast({ 
        title: "Failed to add product", 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive" 
      });
      
      // Error animation
      const form = document.getElementById('add-product-form');
      if (form) {
        animateFieldError(form);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      stock: 0,
      expiry: '',
      manufacturer: '',
      batch: '',
    });
    onClose();
  };

  const updateFormData = (field: keyof InsertProduct, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form id="add-product-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Enter product name"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-price">Price *</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="product-stock">Stock Quantity *</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => updateFormData('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="product-category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => updateFormData('category', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medications">Medications</SelectItem>
                <SelectItem value="Vitamins">Vitamins</SelectItem>
                <SelectItem value="First Aid">First Aid</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Medical Devices">Medical Devices</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="product-expiry">Expiry Date *</Label>
            <Input
              id="product-expiry"
              type="date"
              value={formData.expiry}
              onChange={(e) => updateFormData('expiry', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="product-manufacturer">Manufacturer</Label>
            <Input
              id="product-manufacturer"
              value={formData.manufacturer}
              onChange={(e) => updateFormData('manufacturer', e.target.value)}
              placeholder="Manufacturer name"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="product-batch">Batch Number</Label>
            <Input
              id="product-batch"
              value={formData.batch}
              onChange={(e) => updateFormData('batch', e.target.value)}
              placeholder="Batch number"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
