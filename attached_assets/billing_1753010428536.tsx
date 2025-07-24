import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Minus, X, ShoppingCart, Printer } from 'lucide-react';
import { LocalStorageManager } from '@/lib/localStorage';
import { animatePageEnter, animateButtonClick } from '@/lib/gsapUtils';
import { useToast } from '@/hooks/use-toast';
import { Product, Customer, TransactionItem } from '@shared/schema';

interface CartItem extends TransactionItem {
  name: string;
  maxStock: number;
}

export default function Billing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const pageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const taxRate = LocalStorageManager.getSettings().taxRate;

  useEffect(() => {
    loadData();
    if (pageRef.current) {
      animatePageEnter(pageRef.current);
    }
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadData = () => {
    setProducts(LocalStorageManager.getProducts());
    setCustomers(LocalStorageManager.getCustomers());
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products.slice(0, 20)); // Show first 20 products
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 20));
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({ title: "Product out of stock", variant: "destructive" });
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        updateCartQuantity(product.id, existingItem.quantity + 1);
      } else {
        toast({ title: "Not enough stock available", variant: "destructive" });
      }
    } else {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxStock: product.stock,
      };
      setCart(prev => [...prev, newItem]);
      toast({ title: "Product added to cart" });
    }
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          if (newQuantity <= 0) {
            return null;
          } else if (newQuantity > item.maxStock) {
            toast({ title: "Not enough stock available", variant: "destructive" });
            return item;
          } else {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const processSale = () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    const customerId = selectedCustomerId ? parseInt(selectedCustomerId) : null;

    try {
      // Create transaction
      const transaction = LocalStorageManager.addTransaction({
        customerId,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
        createdAt: new Date().toISOString(),
      });

      // Update product stock
      const products = LocalStorageManager.getProducts();
      cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
          LocalStorageManager.updateProduct(product.id, {
            stock: product.stock - cartItem.quantity
          });
        }
      });

      // Update customer total spent and last visit
      if (customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          LocalStorageManager.updateCustomer(customerId, {
            totalSpent: customer.totalSpent + total,
            lastVisit: new Date().toISOString(),
          });
        }
      }

      // Print receipt
      printReceipt(transaction, cart);

      // Clear cart and reset form
      setCart([]);
      setSelectedCustomerId('');
      loadData(); // Reload data to update stock levels

      toast({ title: "Sale processed successfully!" });
    } catch (error) {
      toast({ 
        title: "Failed to process sale", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  };

  const printReceipt = (transaction: any, cartItems: CartItem[]) => {
    const customer = selectedCustomerId ? customers.find(c => c.id === parseInt(selectedCustomerId)) : null;
    const settings = LocalStorageManager.getSettings();

    const receiptContent = `
      <div style="font-family: monospace; width: 300px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2>${settings.storeName}</h2>
          <p style="margin: 0; font-size: 12px;">${settings.storeAddress}</p>
          <p style="margin: 0; font-size: 12px;">Phone: ${settings.storePhone}</p>
        </div>
        
        <div style="margin-bottom: 15px; font-size: 12px;">
          <p>Transaction ID: TXN-${String(transaction.id).padStart(6, '0')}</p>
          <p>Date: ${new Date(transaction.createdAt).toLocaleString()}</p>
          <p>Customer: ${customer ? customer.name : 'Walk-in Customer'}</p>
          <p>Payment: ${paymentMethod}</p>
        </div>
        
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <thead style="border-bottom: 1px solid #000;">
            <tr>
              <th style="text-align: left; padding: 5px 0;">Item</th>
              <th style="text-align: center; padding: 5px 0;">Qty</th>
              <th style="text-align: right; padding: 5px 0;">Price</th>
              <th style="text-align: right; padding: 5px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems.map(item => `
              <tr>
                <td style="padding: 3px 0;">${item.name}</td>
                <td style="text-align: center; padding: 3px 0;">${item.quantity}</td>
                <td style="text-align: right; padding: 3px 0;">$${item.price.toFixed(2)}</td>
                <td style="text-align: right; padding: 3px 0;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>$${transaction.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Tax:</span>
            <span>$${transaction.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
            <span>Total:</span>
            <span>$${transaction.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p>Thank you for your business!</p>
          <p>Please come again.</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Receipt - TXN-${String(transaction.id).padStart(6, '0')}</title></head>
          <body>${receiptContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div ref={pageRef} className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-600">Process sales and generate receipts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Products */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products to add to cart..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors cursor-pointer hover:shadow-sm"
                    onClick={() => addToCart(product)}
                  >
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category}</div>
                    <div className="text-sm font-semibold text-primary-600">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No products found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart */}
        <Card>
          <CardHeader>
            <CardTitle>Shopping Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Walk-in Customer</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cart Items */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">${item.price.toFixed(2)} each</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        onMouseDown={(e) => animateButtonClick(e.currentTarget)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        onMouseDown={(e) => animateButtonClick(e.currentTarget)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700"
                        onMouseDown={(e) => animateButtonClick(e.currentTarget)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Process Sale Button */}
            <Button 
              onClick={processSale}
              disabled={cart.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onMouseDown={(e) => animateButtonClick(e.currentTarget)}
            >
              <Printer className="w-4 h-4 mr-2" />
              Process Sale
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
