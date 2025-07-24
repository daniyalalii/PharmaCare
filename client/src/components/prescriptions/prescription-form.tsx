import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Customer } from "@/lib/localStorage";
import { localStorageManager, type Prescription } from "@/lib/localStorage";

interface PrescriptionFormProps {
  prescription?: Prescription | null;
  customers: Customer[];
  onSubmit: (data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function PrescriptionForm({ prescription, customers, onSubmit, onCancel }: PrescriptionFormProps) {
  // const customers = localStorageManager.getCustomers(); no needed any more
  
  const [formData, setFormData] = useState({
    prescriptionNumber: prescription?.prescriptionNumber || '',
    customerId: prescription?.customerId || '',
    customerName: prescription?.customerName || '',
    doctorName: prescription?.doctorName || '',
    medication: prescription?.medication || '',
    dosage: prescription?.dosage || '',
    quantity: prescription?.quantity || 1,
    refills: prescription?.refills || 0,
    status: prescription?.status || 'pending' as Prescription['status'],
    notes: prescription?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prescriptionNumber.trim()) newErrors.prescriptionNumber = 'Prescription number is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.doctorName.trim()) newErrors.doctorName = 'Doctor name is required';
    if (!formData.medication.trim()) newErrors.medication = 'Medication is required';
    if (!formData.dosage.trim()) newErrors.dosage = 'Dosage is required';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (formData.refills < 0) newErrors.refills = 'Refills cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: customer?.name || ''
    }));
    if (errors.customerId) {
      setErrors(prev => ({ ...prev, customerId: '' }));
    }
  };

  const generatePrescriptionNumber = () => {
    const prefix = 'RX';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    handleChange('prescriptionNumber', `${prefix}${timestamp}${random}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prescriptionNumber">Prescription Number *</Label>
          <div className="flex gap-2">
            <Input
              id="prescriptionNumber"
              value={formData.prescriptionNumber}
              onChange={(e) => handleChange('prescriptionNumber', e.target.value)}
              placeholder="Enter prescription number"
              className={errors.prescriptionNumber ? 'border-red-500' : ''}
            />
            <Button type="button" variant="outline" onClick={generatePrescriptionNumber}>
              Generate
            </Button>
          </div>
          {errors.prescriptionNumber && <p className="text-sm text-red-500 mt-1">{errors.prescriptionNumber}</p>}
        </div>

        <div>
          <Label htmlFor="customer">Customer *</Label>
          <Select value={formData.customerId} onValueChange={handleCustomerChange}>
            <SelectTrigger className={errors.customerId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>}
        </div>

        <div>
          <Label htmlFor="doctorName">Doctor Name *</Label>
          <Input
            id="doctorName"
            value={formData.doctorName}
            onChange={(e) => handleChange('doctorName', e.target.value)}
            placeholder="Enter doctor's name"
            className={errors.doctorName ? 'border-red-500' : ''}
          />
          {errors.doctorName && <p className="text-sm text-red-500 mt-1">{errors.doctorName}</p>}
        </div>

        <div>
          <Label htmlFor="medication">Medication *</Label>
          <Input
            id="medication"
            value={formData.medication}
            onChange={(e) => handleChange('medication', e.target.value)}
            placeholder="Enter medication name"
            className={errors.medication ? 'border-red-500' : ''}
          />
          {errors.medication && <p className="text-sm text-red-500 mt-1">{errors.medication}</p>}
        </div>

        <div>
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            value={formData.dosage}
            onChange={(e) => handleChange('dosage', e.target.value)}
            placeholder="e.g., 500mg twice daily"
            className={errors.dosage ? 'border-red-500' : ''}
          />
          {errors.dosage && <p className="text-sm text-red-500 mt-1">{errors.dosage}</p>}
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
        </div>

        <div>
          <Label htmlFor="refills">Refills</Label>
          <Input
            id="refills"
            type="number"
            min="0"
            value={formData.refills}
            onChange={(e) => handleChange('refills', parseInt(e.target.value) || 0)}
            className={errors.refills ? 'border-red-500' : ''}
          />
          {errors.refills && <p className="text-sm text-red-500 mt-1">{errors.refills}</p>}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: Prescription['status']) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="ready">Ready for Pickup</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">
          {prescription ? 'Update Prescription' : 'Add Prescription'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}