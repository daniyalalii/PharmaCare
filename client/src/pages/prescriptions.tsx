import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, FileText, Pill, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { localStorageManager, type Prescription } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { formatDate } from "@/lib/utils";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => localStorageManager.getPrescriptions());
  const [customers] = useState(() => localStorageManager.getCustomers());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const { toast } = useToast();

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    pending: prescriptions.filter(p => p.status === 'pending').length,
    inProgress: prescriptions.filter(p => p.status === 'in-progress').length,
    ready: prescriptions.filter(p => p.status === 'ready').length,
    completed: prescriptions.filter(p => p.status === 'completed').length,
  };

  const handleAddPrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPrescription = localStorageManager.addPrescription(prescriptionData);
      setPrescriptions(localStorageManager.getPrescriptions());
      setShowPrescriptionForm(false);
      toast({
        title: "Prescription Added",
        description: `Prescription ${newPrescription.prescriptionNumber} has been added.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add prescription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPrescription) return;
    
    try {
      localStorageManager.updatePrescription(editingPrescription.id, prescriptionData);
      setPrescriptions(localStorageManager.getPrescriptions());
      setEditingPrescription(null);
      setShowPrescriptionForm(false);
      toast({
        title: "Prescription Updated",
        description: `Prescription ${prescriptionData.prescriptionNumber} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prescription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (prescriptionId: string, newStatus: Prescription['status']) => {
    try {
      localStorageManager.updatePrescription(prescriptionId, { status: newStatus });
      setPrescriptions(localStorageManager.getPrescriptions());
      toast({
        title: "Status Updated",
        description: `Prescription status updated to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setShowPrescriptionForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout title="Prescription Management" description="Manage prescriptions and patient medications">
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ready</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.ready}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">{statusCounts.completed}</p>
                </div>
                <Pill className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescriptions Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Prescriptions</CardTitle>
              <Button 
                onClick={() => {
                  setEditingPrescription(null);
                  setShowPrescriptionForm(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Prescription
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by medication, customer, or prescription number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prescriptions Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No prescriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPrescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-mono">
                          {prescription.prescriptionNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prescription.customerName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prescription.medication}</p>
                            <p className="text-sm text-gray-500">{prescription.dosage}</p>
                            <p className="text-xs text-gray-400">
                              Qty: {prescription.quantity} | Refills: {prescription.refills}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{prescription.doctorName}</p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={prescription.status}
                            onValueChange={(value) => handleStatusChange(prescription.id, value as Prescription['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(prescription.status)}
                                <span className="capitalize">{prescription.status.replace('-', ' ')}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(prescription.createdAt)}</p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(prescription)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Prescription Form Dialog */}
        <Dialog open={showPrescriptionForm} onOpenChange={setShowPrescriptionForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPrescription ? 'Edit Prescription' : 'New Prescription'}
              </DialogTitle>
            </DialogHeader>
            <PrescriptionForm
              prescription={editingPrescription}
              customers={customers}
              onSubmit={editingPrescription ? handleEditPrescription : handleAddPrescription}
              onCancel={() => {
                setShowPrescriptionForm(false);
                setEditingPrescription(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}