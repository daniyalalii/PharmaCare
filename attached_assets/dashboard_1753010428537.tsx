import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Package, Users, UserPlus, ShoppingCart } from 'lucide-react';
import StatsCards from '@/components/dashboard/stats-cards';
import { LocalStorageManager } from '@/lib/localStorage';
import { animatePageEnter, animateButtonClick } from '@/lib/gsapUtils';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const transactions = LocalStorageManager.getTransactions();
  const customers = LocalStorageManager.getCustomers();
  const products = LocalStorageManager.getProducts();

  useEffect(() => {
    if (pageRef.current) {
      animatePageEnter(pageRef.current);
    }
  }, []);

  const exportToExcel = () => {
    toast({ title: "Preparing data export..." });

    setTimeout(() => {
      try {
        const workbook = XLSX.utils.book_new();
        
        // Export products
        const productsData = products.map(p => ({
          ID: p.id,
          Name: p.name,
          Category: p.category,
          Price: p.price,
          Stock: p.stock,
          'Expiry Date': p.expiry,
          Manufacturer: p.manufacturer,
          'Batch Number': p.batch,
        }));
        const productsSheet = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
        
        // Export customers
        const customersData = customers.map(c => ({
          ID: c.id,
          Name: c.name,
          Email: c.email,
          Phone: c.phone,
          Address: c.address,
          'Date of Birth': c.dateOfBirth,
          'Registration Date': c.registrationDate,
          'Total Spent': c.totalSpent,
          'Last Visit': c.lastVisit || 'Never',
        }));
        const customersSheet = XLSX.utils.json_to_sheet(customersData);
        XLSX.utils.book_append_sheet(workbook, customersSheet, 'Customers');
        
        // Export transactions
        const transactionsData = transactions.map(t => ({
          ID: t.id,
          'Customer ID': t.customerId || 'Walk-in',
          'Items Count': t.items.length,
          Subtotal: t.subtotal,
          Tax: t.tax,
          Total: t.total,
          'Payment Method': t.paymentMethod,
          Date: t.createdAt,
        }));
        const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
        
        // Export settings
        const settings = LocalStorageManager.getSettings();
        const settingsData = [{
          'Store Name': settings.storeName,
          'Store Address': settings.storeAddress,
          'Store Phone': settings.storePhone,
          'Tax Rate': settings.taxRate,
          Currency: settings.currency,
        }];
        const settingsSheet = XLSX.utils.json_to_sheet(settingsData);
        XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Settings');
        
        // Download file
        const fileName = `PharmaCare_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        toast({ title: "Data exported successfully!" });
      } catch (error) {
        toast({ 
          title: "Export failed", 
          description: "There was an error exporting your data",
          variant: "destructive" 
        });
      }
    }, 1000);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const recentTransactions = transactions
    .slice(-5)
    .reverse()
    .map(transaction => {
      const customer = customers.find(c => c.id === transaction.customerId);
      return {
        ...transaction,
        customerName: customer ? customer.name : 'Walk-in Customer'
      };
    });

  return (
    <div ref={pageRef} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. Johnson</p>
        </div>
        <Button 
          onClick={exportToExcel}
          className="bg-green-500 hover:bg-green-600 text-white"
          onMouseDown={(e) => animateButtonClick(e.currentTarget)}
        >
          <FileText className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setLocation('/billing')}
              className="w-full justify-start"
              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Sale
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/prescriptions')}
              className="w-full justify-start"
              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Prescription
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/inventory')}
              className="w-full justify-start"
              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
            >
              <Package className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/customers')}
              className="w-full justify-start"
              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/reports')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent transactions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            TXN-{String(transaction.id).padStart(6, '0')}
                          </p>
                          <p className="text-sm text-gray-600">{transaction.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${transaction.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
