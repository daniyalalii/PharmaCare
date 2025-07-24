import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Package, Users, AlertTriangle } from 'lucide-react';
import { LocalStorageManager } from '@/lib/localStorage';
import { animateStatsCards, animateCounter } from '@/lib/gsapUtils';

export default function StatsCards() {
  const cardsRef = useRef<HTMLDivElement>(null);

  const products = LocalStorageManager.getProducts();
  const customers = LocalStorageManager.getCustomers();
  const transactions = LocalStorageManager.getTransactions();
  
  // Calculate stats
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const lowStockItems = products.filter(p => p.stock <= 10).length;

  const cardData = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      change: "+20.1% from last month",
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
      format: "currency"
    },
    {
      title: "Total Products",
      value: totalProducts,
      change: `${products.filter(p => new Date(p.createdAt || '') > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} new this month`,
      icon: Package,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-blue-600",
      format: "number"
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      change: `${customers.filter(c => new Date(c.registrationDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} new this week`,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-green-600",
      format: "number"
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      change: lowStockItems > 0 ? "Need attention" : "All items in stock",
      icon: AlertTriangle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      changeColor: lowStockItems > 0 ? "text-red-600" : "text-green-600",
      format: "number"
    }
  ];

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.stat-card');
      animateStatsCards(cards as NodeListOf<Element>);
      
      // Animate counters
      cards.forEach((card, index) => {
        const counterElement = card.querySelector('[data-counter]') as HTMLElement;
        if (counterElement) {
          const target = cardData[index].value;
          setTimeout(() => {
            animateCounter(counterElement, target);
          }, index * 200);
        }
      });
    }
  }, [cardData]);

  return (
    <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card, index) => (
        <Card key={index} className="stat-card p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p 
                  className="text-3xl font-bold text-gray-900" 
                  data-counter={card.value}
                >
                  {card.format === 'currency' ? '$0' : '0'}
                </p>
                <p className={`text-sm mt-1 ${card.changeColor}`}>
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
