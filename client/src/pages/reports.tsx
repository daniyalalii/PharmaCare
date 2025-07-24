import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, TrendingUp, DollarSign, Package, Users, BarChart3 } from "lucide-react";
import { localStorageManager } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, exportToCSV, exportToJSON } from "@/lib/utils";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState("sales");
  const { toast } = useToast();

  const transactions = localStorageManager.getTransactions();
  const products = localStorageManager.getProducts();
  const customers = localStorageManager.getCustomers();
  const prescriptions = localStorageManager.getPrescriptions();

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt).toDateString();
    const startDate = new Date(dateRange.start).toDateString();
    const endDate = new Date(dateRange.end).toDateString();
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // Calculate metrics
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const totalDiscount = filteredTransactions.reduce((sum, t) => sum + t.discount, 0);

  // Sales by day
  const salesByDay = filteredTransactions.reduce((acc: Record<string, number>, t) => {
    const date = new Date(t.createdAt).toDateString();
    acc[date] = (acc[date] || 0) + t.total;
    return acc;
  }, {});

  // Top selling products
  const productSales = filteredTransactions.reduce((acc: Record<string, { name: string; quantity: number; revenue: number }>, t) => {
    t.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].revenue += item.total;
    });
    return acc;
  }, {});

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  // Customer analytics
  const customerStats = filteredTransactions.reduce((acc: Record<string, { name: string; orders: number; spent: number }>, t) => {
    if (!acc[t.customerId]) {
      acc[t.customerId] = { name: t.customerName, orders: 0, spent: 0 };
    }
    acc[t.customerId].orders += 1;
    acc[t.customerId].spent += t.total;
    return acc;
  }, {});

  const topCustomers = Object.entries(customerStats)
    .sort((a, b) => b[1].spent - a[1].spent)
    .slice(0, 10);

  const handleExportSales = () => {
    const salesData = filteredTransactions.map(t => ({
      'Transaction ID': t.id,
      'Date': formatDate(t.createdAt),
      'Customer': t.customerName,
      'Items': t.items.map(i => `${i.productName} (${i.quantity})`).join(', '),
      'Subtotal': t.subtotal,
      'Discount': t.discount,
      'Tax': t.tax,
      'Total': t.total,
      'Payment Method': t.paymentMethod,
    }));
    exportToCSV(salesData, `sales-report-${dateRange.start}-to-${dateRange.end}.csv`);
    toast({
      title: "Export Complete",
      description: "Sales report exported to CSV file.",
    });
  };

  const handleExportProducts = () => {
    const productData = topProducts.map(([id, data]) => ({
      'Product': data.name,
      'Quantity Sold': data.quantity,
      'Revenue': data.revenue,
    }));
    exportToCSV(productData, `product-sales-${dateRange.start}-to-${dateRange.end}.csv`);
    toast({
      title: "Export Complete",
      description: "Product sales report exported to CSV file.",
    });
  };

  const handleExportCustomers = () => {
    const customerData = topCustomers.map(([id, data]) => ({
      'Customer': data.name,
      'Orders': data.orders,
      'Total Spent': data.spent,
    }));
    exportToCSV(customerData, `customer-report-${dateRange.start}-to-${dateRange.end}.csv`);
    toast({
      title: "Export Complete",
      description: "Customer report exported to CSV file.",
    });
  };

  const handleExportAll = () => {
    const allData = {
      summary: {
        dateRange: `${dateRange.start} to ${dateRange.end}`,
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        totalDiscount,
      },
      transactions: filteredTransactions,
      topProducts: topProducts.map(([id, data]) => ({ id, ...data })),
      topCustomers: topCustomers.map(([id, data]) => ({ id, ...data })),
    };
    exportToJSON(allData, `complete-report-${dateRange.start}-to-${dateRange.end}.json`);
    toast({
      title: "Export Complete",
      description: "Complete report exported to JSON file.",
    });
  };

  // Revenue chart data (simplified)
  const chartData = Object.entries(salesByDay)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7); // Last 7 days with data

  const maxRevenue = Math.max(...chartData.map(([_, revenue]) => revenue), 1000);

  return (
    <MainLayout title="Reports & Analytics" description="View business insights and performance metrics">
      <div className="p-6 space-y-6">
        {/* Date Range and Export Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="customers">Customer Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleExportAll} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-green-600">
                    {filteredTransactions.length} transactions
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</p>
                  <p className="text-xs text-blue-600">
                    Per transaction
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-xs text-purple-600">
                    In inventory
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Customers</p>
                  <p className="text-2xl font-bold">{Object.keys(customerStats).length}</p>
                  <p className="text-xs text-orange-600">
                    In period
                  </p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Trend</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportSales}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Sales
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {chartData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No sales data for selected period
                  </div>
                ) : (
                  chartData.map(([date, revenue], index) => {
                    const height = (revenue / maxRevenue) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full relative">
                          <div 
                            className="bg-primary rounded-t w-full transition-all duration-1000 ease-out"
                            style={{ 
                              height: `${Math.max(height, 2)}%`,
                              minHeight: '8px'
                            }}
                            title={`${formatDate(date)}: ${formatCurrency(revenue)}`}
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          <div>{new Date(date).getDate()}</div>
                          <div className="font-medium">${revenue.toFixed(0)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Selling Products</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportProducts}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Products
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {topProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No product sales data</p>
                ) : (
                  topProducts.map(([id, data], index) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{data.name}</p>
                          <p className="text-xs text-gray-500">{data.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(data.revenue)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Customers</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportCustomers}>
                <Download className="w-4 h-4 mr-2" />
                Export Customers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Avg Per Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No customer data for selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  topCustomers.map(([id, data], index) => (
                    <TableRow key={id}>
                      <TableCell>
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{data.name}</p>
                      </TableCell>
                      <TableCell>{data.orders}</TableCell>
                      <TableCell>{formatCurrency(data.spent)}</TableCell>
                      <TableCell>{formatCurrency(data.spent / data.orders)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}