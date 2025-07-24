import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Users, Mail, Phone } from 'lucide-react';
import SecurityModal from '@/components/modals/security-modal';
import { LocalStorageManager } from '@/lib/localStorage';
import { animatePageEnter, animateTableRows, animateButtonClick } from '@/lib/gsapUtils';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@shared/schema';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
    if (pageRef.current) {
      animatePageEnter(pageRef.current);
    }
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadCustomers = () => {
    const loadedCustomers = LocalStorageManager.getCustomers();
    setCustomers(loadedCustomers);
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);

      // Animate filtered results
      setTimeout(() => {
        const rows = document.querySelectorAll('#customers-table tr');
        animateTableRows(rows);
      }, 100);
    }
  };

  const handleDeleteCustomer = (customerId: number) => {
    setPendingAction(() => () => {
      LocalStorageManager.deleteCustomer(customerId);
      loadCustomers();
      toast({ title: "Customer deleted successfully" });
    });
    setIsSecurityModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCustomerStats = (customer: Customer) => {
    const transactions = LocalStorageManager.getTransactions();
    const customerTransactions = transactions.filter(t => t.customerId === customer.id);
    return {
      transactionCount: customerTransactions.length,
      lastVisit: customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'
    };
  };

  return (
    <div ref={pageRef} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer information and history</p>
        </div>
        <Button 
          onClick={() => toast({ title: "Add Customer modal coming soon" })}
          onMouseDown={(e) => animateButtonClick(e.currentTarget)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody id="customers-table">
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        {searchTerm ? (
                          <>
                            <Search className="w-12 h-12 mb-2 opacity-50" />
                            <p>No customers found matching your search</p>
                          </>
                        ) : (
                          <>
                            <Users className="w-12 h-12 mb-2 opacity-50" />
                            <p>No customers registered yet</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const stats = getCustomerStats(customer);
                    
                    return (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">
                                Born {formatDate(customer.dateOfBirth)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-3 h-3 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="w-3 h-3 mr-2 text-gray-400" />
                              {customer.phone}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {customer.address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {formatDate(customer.registrationDate)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {stats.lastVisit}
                          {stats.transactionCount > 0 && (
                            <div className="text-xs text-gray-500">
                              {stats.transactionCount} visits
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-900">
                          ${customer.totalSpent.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast({ title: "Edit functionality coming soon" })}
                              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Security Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => {
          setIsSecurityModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        title="Delete Customer"
        description="This action will permanently delete the customer and all associated data. Please enter your security PIN to continue."
      />
    </div>
  );
}
