import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Edit, Trash2 } from "lucide-react";
import { Product } from "@/lib/types";
import { localStorageManager } from "@/lib/localStorage";
import { SecurityModal } from "./security-modal";
import { EditProductModal } from "./edit-product-modal";

interface ProductGridProps {
  products: Product[];
  onProductUpdate: () => void;
}

export function ProductGrid({ products, onProductUpdate }: ProductGridProps) {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setPendingAction('delete');
      setShowSecurityModal(true);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setPendingAction('edit');
    setShowSecurityModal(true);
  };

  const handleSecuritySuccess = () => {
    if (pendingAction === 'delete' && selectedProduct) {
      localStorageManager.deleteProduct(selectedProduct.id);
      onProductUpdate();
    } else if (pendingAction === 'edit' && selectedProduct) {
      setShowEditModal(true);
    }
    setPendingAction(null);
  };

  const handleSecurityCancel = () => {
    setSelectedProduct(null);
    setPendingAction(null);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    onProductUpdate();
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (product.stock <= product.lowStockThreshold) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "prescription":
        return "Prescription Drug";
      case "otc":
        return "OTC Medication";
      case "medical-supplies":
        return "Medical Supplies";
      case "vitamins":
        return "Vitamins & Supplements";
      default:
        return category;
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Add some products to get started.</p>
      </div>
    );
  }

  return (
    <div className="inventory-grid">
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        
        return (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm text-gray-900">{getCategoryLabel(product.category)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className={`text-sm font-medium ${product.stock <= product.lowStockThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock} units
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-medium text-gray-900">${product.price}</span>
                </div>

                {product.expiryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expires:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <SecurityModal
        isOpen={showSecurityModal}
        onClose={handleSecurityCancel}
        onSuccess={handleSecuritySuccess}
        title={pendingAction === 'delete' ? 'Delete Product' : 'Edit Product'}
        description={
          pendingAction === 'delete'
            ? `Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`
            : `Enter your security PIN to edit "${selectedProduct?.name}".`
        }
      />
      
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        product={selectedProduct}
        onProductUpdate={handleEditComplete}
      />
    </div>
  );
}
