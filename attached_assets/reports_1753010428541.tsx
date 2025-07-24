import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, DollarSign, FileText, Calendar, Download, TrendingUp, Package, Users } from 'lucide-react';
import { LocalStorageManager } from '@/lib/localStorage';
import { animatePageEnter, animateStatsCards, animateTableRows, animateButtonClick, animateCounter } from '@/lib/gsapUtils';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('sales');
  
  const pageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const transactions = LocalStorageManager.getTransactions();
  const products = LocalStorageManager.getProducts();
  const customers = LocalStorageManager.getCustomers();

  useEffect(() => {
    if (pageRef.current) {
      animatePageEnter(pageRef.current);
    }

    // Animate stats cards
    setTimeout(() => {
      const cards = document.querySelectorAll('.report-card');
      animateStatsCards(cards as NodeListOf<Element>);
      
      // Animate counters
      cards.forEach((card, index) => {
        const counterElement = card.querySelector('[data-counter]') as HTMLElement;
        if (counterElement) {
          const target = parseInt(counterElement.getAttribute('data-counter') || '0');
          setTimeout(() => {
            animateCounter(counterElement, target);
          }, index * 200);
        }
      });
    }, 300);
  }, []);

  const getDateFilter = () => {
    const days = parseInt(dateRange);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return cutoff;
  };

  const getFilteredTransactions = () => {
    const cutoff = getDateFilter();
    return transactions.filter(t => new Date(t.createdAt) >= cutoff);
  };

  const generateSalesReport = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Top selling products
    const productSales: Record<number, { name: string; quantity: number; revenue: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              name: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id: parseInt(id), ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalTransactions,
      averageTransaction,
      topProducts
    };
  };

  const generateInventoryReport = () => {
    const lowStockItems = products.filter(p => p.stock <= 10);
    const outOfStockItems = products.filter(p => p.stock === 0);
    const expiringSoonItems = products.filter(p => {
      const expiry = new Date(p.expiry);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiry <= thirtyDaysFromNow;
    });

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalProducts = products.length;

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      expiringSoonItems
    };
  };

  const generateCustomerReport = () => {
    const cutoff = getDateFilter();
    const activeCustomers = customers.filter(c => 
      c.lastVisit && new Date(c.lastVisit) >= cutoff
    );
    
    const newCustomers = customers.filter(c => 
      new Date(c.registrationDate) >= cutoff
    );

    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageSpent = customers.length > 0 ? totalSpent / customers.length : 0;

    const topCustomers = [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      newCustomers: newCustomers.length,
      averageSpent,
      topCustomers
    };
  };

  const exportReport = () => {
    toast({ title: "Generating report..." });

    setTimeout(() => {
      try {
        const workbook = XLSX.utils.book_new();
        
        if (reportType === 'sales') {
          const salesData = generateSalesReport();
          const salesSheet = XLSX.utils.json_to_sheet([
            { Metric: 'Total Revenue', Value: salesData.totalRevenue },
            { Metric: 'Total Transactions', Value: salesData.totalTransactions },
            { Metric: 'Average Transaction', Value: salesData.averageTransaction },
          ]);
          XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Summary');
          
          const topProductsSheet = XLSX.utils.json_to_sheet(salesData.topProducts);
          XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Top Products');
        } else if (reportType === 'inventory') {
          const inventoryData = generateInventoryReport();
          const summarySheet = XLSX.utils.json_to_sheet([
            { Metric: 'Total Products', Value: inventoryData.totalProducts },
            { Metric: 'Total Inventory Value', Value: inventoryData.totalValue },
            { Metric: 'Low Stock Items', Value: inventoryData.lowStockItems.length },
            { Metric: 'Out of Stock Items', Value: inventoryData.outOfStockItems.length },
            { Metric: 'Expiring Soon Items', Value: inventoryData.expiringSoonItems.length },
          ]);
          XLSX.utils.book_append_sheet(workbook, summarySheet, 'Inventory Summary');
          
          if (inventoryData.lowStockItems.length > 0) {
            const lowStockSheet = XLSX.utils.json_to_sheet(inventoryData.lowStockItems);
            XLSX.utils.book_append_sheet(workbook, lowStockSheet, 'Low Stock');
          }
        } else if (reportType === 'customers') {
          const customerData = generateCustomerReport();
          const summarySheet = XLSX.utils.json_to_sheet([
            { Metric: 'Total Customers', Value: customerData.totalCustomers },
            { Metric: 'Active Customers', Value: customerData.activeCustomers },
            { Metric: 'New Customers', Value: customerData.newCustomers },
            { Metric: 'Average Spent', Value: customerData.averageSpent },
          ]);
          XLSX.utils.book_append_sheet(workbook, summarySheet, 'Customer Summary');
          
          const topCustomersSheet = XLSX.utils.json_to_sheet(customerData.topCustomers);
          XLSX.utils.book_append_sheet(workbook, topCustomersSheet, 'Top Customers');
        }

        const fileName = `${reportType}_report_${dateRange}days_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        toast({ title: "Report exported successfully!" });
      } catch (error) {
        toast({ 
          title: "Export failed", 
          description: "There was an error generating the report",
          variant: "destructive" 
        });
      }
    }, 1000);
  };

  const renderSalesReport = () => {
    const salesData = generateSalesReport();
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={Math.floor(salesData.totalRevenue)}>
                    $0
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={salesData.totalTransactions}>
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Transaction</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={Math.floor(salesData.averageTransaction)}>
                    $0
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.topProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>${product.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderInventoryReport = () => {
    const inventoryData = generateInventoryReport();
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={inventoryData.totalProducts}>
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={Math.floor(inventoryData.totalValue)}>
                    $0
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={inventoryData.lowStockItems.length}>
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {inventoryData.lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.lowStockItems.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.stock} units
                        </span>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  const renderCustomerReport = () => {
    const customerData = generateCustomerReport();
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={customerData.totalCustomers}>
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={customerData.activeCustomers}>
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Customers</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={customerData.newCustomers}>
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="report-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Spent</p>
                  <p className="text-2xl font-bold text-gray-900" data-counter={Math.floor(customerData.averageSpent)}>
                    $0
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerData.topCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div ref={pageRef} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Analyze your pharmacy's performance</p>
        </div>
        <Button 
          onClick={exportReport}
          className="bg-green-500 hover:bg-green-600 text-white"
          onMouseDown={(e) => animateButtonClick(e.currentTarget)}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Report Type:</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="customers">Customer Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Date Range:</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportType === 'sales' && renderSalesReport()}
      {reportType === 'inventory' && renderInventoryReport()}
      {reportType === 'customers' && renderCustomerReport()}
    </div>
  );
}
