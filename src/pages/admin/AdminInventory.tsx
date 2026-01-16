import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, ArrowLeft, Loader2, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  image_url: string | null;
  categories: { name: string } | null;
}

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, stock, price, image_url, categories(name)")
      .order("stock", { ascending: true });
    
    if (data) setProducts(data);
    setIsLoading(false);
  };

  const handleStockChange = (productId: string, newStock: number) => {
    setEditedStocks({ ...editedStocks, [productId]: newStock });
  };

  const saveStock = async (productId: string) => {
    const newStock = editedStocks[productId];
    if (newStock === undefined) return;

    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    if (error) {
      toast.error("Error al actualizar stock");
    } else {
      toast.success("Stock actualizado");
      setEditedStocks((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
      fetchProducts();
    }
  };

  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 nexo-gradient-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NexoShop</span>
          </Link>
          <span className="px-3 py-1 bg-sidebar-accent rounded-lg text-sm font-medium ml-4">Admin</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </Link>

        <h1 className="text-3xl font-bold mb-8">Control de Inventario</h1>

        {lowStockProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning/10 border border-warning/30 rounded-2xl p-4 mb-8 flex items-center gap-4"
          >
            <AlertTriangle className="w-6 h-6 text-warning" />
            <div>
              <p className="font-semibold text-warning">Stock Bajo</p>
              <p className="text-sm text-muted-foreground">
                {lowStockProducts.length} productos tienen stock bajo (≤5 unidades)
              </p>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl nexo-shadow-sm overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Nuevo Stock</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={product.stock <= 5 ? "bg-warning/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.categories?.name || "-"}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stock <= 5 ? "text-warning font-semibold" : ""}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        className="w-24"
                        value={editedStocks[product.id] ?? product.stock}
                        onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => saveStock(product.id)}
                        disabled={editedStocks[product.id] === undefined}
                        className="nexo-gradient-primary text-primary-foreground border-0"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Guardar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
