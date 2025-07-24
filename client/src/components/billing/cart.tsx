import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";
import { CartItem, Customer, Transaction } from "@/lib/types";
import { localStorageManager } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }: CartProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "insurance">("cash");
  const { toast } = useToast();

  const customers = localStorageManager.getCustomers();
  const settings = localStorageManager.getSettings();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * settings.taxRate;
  const discount = 0;
  const total = subtotal + tax - discount;

  const handleProcessSale = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

    const transaction: Transaction = {
      id: `trans_${Date.now()}`,
      customerId: selectedCustomer === "walk-in" ? undefined : selectedCustomer || undefined,
      customerName: selectedCustomer === "walk-in" ? "Walk-in Customer" : (selectedCustomerData?.name || "Walk-in Customer"),
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    // Update product stock
    cartItems.forEach(item => {
      const products = localStorageManager.getProducts();
      const product = products.find(p => p.id === item.productId);
      if (product) {
        localStorageManager.updateProduct(product.id, {
          stock: Math.max(0, product.stock - item.quantity)
        });
      }
    });

    // Update customer total purchases
    if (selectedCustomerData && selectedCustomer !== "walk-in") {
      localStorageManager.updateCustomer(selectedCustomer, {
        totalPurchases: selectedCustomerData.totalPurchases + total,
        lastVisit: new Date().toISOString(),
      });
    }

    // Save transaction
    localStorageManager.addTransaction(transaction);

    toast({
      title: "Sale Completed",
      description: `Transaction ${transaction.id} completed successfully`,
    });

    onClearCart();
    setSelectedCustomer("walk-in");
    setPaymentMethod("cash");
  };

  return (
    <Card className="h-fit">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Sale</h2>

        {/* Cart Items */}
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Cart is empty</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-xs text-gray-500">${item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => onUpdateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm font-semibold text-gray-900 ml-3">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Customer Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Walk-in Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in Customer</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {(["cash", "card", "insurance"] as const).map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMethod(method)}
                className="capitalize"
              >
                {method}
              </Button>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="text-gray-900">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="text-green-600">-${discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClearCart}
            disabled={cartItems.length === 0}
          >
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={handleProcessSale}
            disabled={cartItems.length === 0}
          >
            Complete Sale
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
