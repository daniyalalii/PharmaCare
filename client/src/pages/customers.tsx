import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Users, Phone, Mail } from "lucide-react";
import { localStorageManager, type Customer } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { CustomerForm } from "@/components/customers/customer-form";
import { formatDate } from "@/lib/utils";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(() => localStorageManager.getCustomers());
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const { toast } = useToast();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'registrationDate'>) => {
    try {
      const newCustomer = localStorageManager.addCustomer(customerData);
      setCustomers(localStorageManager.getCustomers());
      setShowCustomerForm(false);
      toast({
        title: "Customer Added",
        description: `${newCustomer.name} has been added to the customer database.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCustomer = (customerData: Omit<Customer, 'id' | 'registrationDate'>) => {
    if (!editingCustomer) return;
    
    try {
      localStorageManager.updateCustomer(editingCustomer.id, customerData);
      setCustomers(localStorageManager.getCustomers());
      setEditingCustomer(null);
      setShowCustomerForm(false);
      toast({
        title: "Customer Updated",
        description: `${customerData.name} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      try {
        localStorageManager.deleteCustomer(customer.id);
        setCustomers(localStorageManager.getCustomers());
        toast({
          title: "Customer Deleted",
          description: `${customer.name} has been removed from the database.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete customer. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  return (
    <MainLayout title="Customer Management" description="Manage customer information and profiles">
      <div className="p-6 space-y-6">
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New This Month</p>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => 
                      new Date(c.registrationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Insurance</p>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => c.insuranceInfo).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Today</p>
                  <p className="text-2xl font-bold">
                    {Math.floor(customers.length * 0.15)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Customers</CardTitle>
              <Button 
                onClick={() => {
                  setEditingCustomer(null);
                  setShowCustomerForm(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Customers Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            {customer.dateOfBirth && (
                              <p className="text-sm text-gray-500">
                                DOB: {formatDate(customer.dateOfBirth)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-xs truncate">{customer.address}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{customer.insuranceInfo || 'None'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(customer.registrationDate)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(customer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

        {/* Customer Form Dialog */}
        <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer}
              onCancel={() => {
                setShowCustomerForm(false);
                setEditingCustomer(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}