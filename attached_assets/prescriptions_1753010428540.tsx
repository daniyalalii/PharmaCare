import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LocalStorageManager } from '@/lib/localStorage';
import { animatePageEnter, animateTableRows, animateButtonClick } from '@/lib/gsapUtils';
import { useToast } from '@/hooks/use-toast';
import { Prescription } from '@shared/schema';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'ready' | 'dispensed'>('all');

  const pageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
    if (pageRef.current) {
      animatePageEnter(pageRef.current);
    }
  }, []);

  const loadPrescriptions = () => {
    const loadedPrescriptions = LocalStorageManager.getPrescriptions();
    setPrescriptions(loadedPrescriptions);
  };

  const getFilteredPrescriptions = () => {
    if (selectedStatus === 'all') {
      return prescriptions;
    }
    return prescriptions.filter(p => p.status === selectedStatus);
  };

  const updatePrescriptionStatus = (prescriptionId: number, newStatus: 'pending' | 'ready' | 'dispensed') => {
    LocalStorageManager.updatePrescription(prescriptionId, { status: newStatus });
    loadPrescriptions();
    toast({ title: `Prescription marked as ${newStatus}` });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'dispensed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Dispensed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
            Unknown
          </Badge>
        );
    }
  };

  const getCustomerName = (customerId: number) => {
    const customers = LocalStorageManager.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getProductName = (productId: number) => {
    const products = LocalStorageManager.getProducts();
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const statusCounts = {
    all: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'pending').length,
    ready: prescriptions.filter(p => p.status === 'ready').length,
    dispensed: prescriptions.filter(p => p.status === 'dispensed').length,
  };

  const filteredPrescriptions = getFilteredPrescriptions();

  return (
    <div ref={pageRef} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600">Track and manage customer prescriptions</p>
        </div>
        <Button 
          onClick={() => toast({ title: "Add Prescription modal coming soon" })}
          onMouseDown={(e) => animateButtonClick(e.currentTarget)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${selectedStatus === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">All Prescriptions</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${selectedStatus === 'pending' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setSelectedStatus('pending')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${selectedStatus === 'ready' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setSelectedStatus('ready')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.ready}</div>
            <div className="text-sm text-gray-600">Ready</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${selectedStatus === 'dispensed' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setSelectedStatus('dispensed')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.dispensed}</div>
            <div className="text-sm text-gray-600">Dispensed</div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedStatus === 'all' ? 'All Prescriptions' : `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Prescriptions`}
            ({filteredPrescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody id="prescriptions-table">
                {filteredPrescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 mb-2 opacity-50" />
                        <p>No prescriptions found</p>
                        {selectedStatus !== 'all' && (
                          <p className="text-sm">No prescriptions with status: {selectedStatus}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              RX-{String(prescription.id).padStart(6, '0')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prescription.medications.length} medication{prescription.medications.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {getCustomerName(prescription.customerId)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {prescription.doctorName}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <div key={index} className="text-sm text-gray-900">
                              {getProductName(med.productId)}
                              <span className="text-xs text-gray-500 ml-2">
                                {med.dosage} - {med.frequency}
                              </span>
                            </div>
                          ))}
                          {prescription.medications.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{prescription.medications.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(prescription.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {formatDate(prescription.prescriptionDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {prescription.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePrescriptionStatus(prescription.id, 'ready')}
                              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
                            >
                              Mark Ready
                            </Button>
                          )}
                          {prescription.status === 'ready' && (
                            <Button
                              size="sm"
                              onClick={() => updatePrescriptionStatus(prescription.id, 'dispensed')}
                              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
                            >
                              Dispense
                            </Button>
                          )}
                          {prescription.status === 'dispensed' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Complete
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
