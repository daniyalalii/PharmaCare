import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { Product } from "@/lib/localStorage";

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Low Stock Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-yellow-700 mb-4">
          {products.length} product(s) are running low on stock and need attention.
        </p>
        <div className="flex flex-wrap gap-2">
          {products.slice(0, 8).map((product) => (
            <Badge key={product.id} variant="secondary" className="bg-yellow-200 text-yellow-800">
              {product.name} ({product.stock} left)
            </Badge>
          ))}
          {products.length > 8 && (
            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
              +{products.length - 8} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}