import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, Users, TrendingUp, AlertTriangle, FileText, ShoppingCart } from "lucide-react";
import { localStorageManager } from "@/lib/localStorage";
import { formatCurrency } from "@/lib/utils";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";

export default function Dashboard() {
  const [products] = useState(() => localStorageManager.getProducts());
  const [customers] = useState(() => localStorageManager.getCustomers());
  const [transactions] = useState(() => localStorageManager.getTransactions());
  const [prescriptions] = useState(() => localStorageManager.getPrescriptions());

  // Calculate today's sales
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(t => 
    new Date(t.createdAt).toDateString() === today
  );
  const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);

  // Calculate this month's sales
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.createdAt);
    return transactionDate.getMonth() === thisMonth && transactionDate.getFullYear() === thisYear;
  });
  const monthSales = monthTransactions.reduce((sum, t) => sum + t.total, 0);

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  // Total inventory value
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Prescription status counts
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
  const readyPrescriptions = prescriptions.filter(p => p.status === 'ready').length;

  return (
    <MainLayout title="Dashboard" description="Overview of your pharmacy operations">
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today's Sales</p>
                  <p className="text-2xl font-bold">{formatCurrency(todaySales)}</p>
                  <p className="text-xs text-green-600">
                    {todayTransactions.length} transactions
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
                  <p className="text-sm text-gray-500">Monthly Sales</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthSales)}</p>
                  <p className="text-xs text-blue-600">
                    {monthTransactions.length} transactions
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
                    {formatCurrency(inventoryValue)} value
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
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                  <p className="text-xs text-orange-600">
                    Active database
                  </p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <LowStockAlert products={lowStockProducts} />
        )}

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <SalesChart transactions={transactions} />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent transactions</p>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{transaction.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {transaction.items.length} item(s) • {transaction.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(transaction.total)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescription Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Prescriptions</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingPrescriptions}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ready for Pickup</p>
                  <p className="text-2xl font-bold text-green-600">{readyPrescriptions}</p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
                </div>
                <Package className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Prescriptions</p>
                  <p className="text-2xl font-bold">{prescriptions.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium">New Sale</h3>
                    <p className="text-sm text-gray-500">Process a new transaction</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="font-medium">New Prescription</h3>
                    <p className="text-sm text-gray-500">Add a prescription</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-purple-500" />
                  <div>
                    <h3 className="font-medium">Add Product</h3>
                    <p className="text-sm text-gray-500">Add to inventory</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}