import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, Search, ScanLine } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductCatalog({ products, onAddToCart }: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "prescription", label: "Prescription" },
    { id: "otc", label: "OTC" },
    { id: "medical-supplies", label: "Supplies" },
    { id: "vitamins", label: "Vitamins" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  return (
    <div className="lg:col-span-2 space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button variant="outline" size="sm">
                <ScanLine className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-sm font-medium"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Pill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onAddToCart(product)}
                >
                  <CardContent className="p-3">
                    <div className="w-full h-20 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                      <Pill className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                    <p className="text-lg font-bold text-primary">${product.price}</p>
                    <p className="text-xs text-green-600">{product.stock} in stock</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
