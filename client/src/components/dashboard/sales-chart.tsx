import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/localStorage";

interface SalesChartProps {
  transactions: Transaction[];
}

export function SalesChart({ transactions }: SalesChartProps) {
  // Get last 7 days of sales data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toDateString();
  });

  const salesByDay = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => 
      new Date(t.createdAt).toDateString() === date
    );
    const total = dayTransactions.reduce((sum, t) => sum + t.total, 0);
    return {
      date,
      total,
      count: dayTransactions.length
    };
  });

  const maxSales = Math.max(...salesByDay.map(day => day.total), 1000);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {salesByDay.map((day, index) => {
            const height = (day.total / maxSales) * 100;
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full relative mb-2">
                  <div 
                    className="bg-primary rounded-t w-full transition-all duration-1000 ease-out"
                    style={{ 
                      height: `${Math.max(height, 2)}%`,
                      minHeight: '8px'
                    }}
                    title={`${day.date}: ${formatCurrency(day.total)} (${day.count} transactions)`}
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">{dayName}</div>
                  <div className="text-xs font-medium">${day.total.toFixed(0)}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Total: {formatCurrency(salesByDay.reduce((sum, day) => sum + day.total, 0))}</span>
          <span>Transactions: {salesByDay.reduce((sum, day) => sum + day.count, 0)}</span>
        </div>
      </CardContent>
    </Card>
  );
}