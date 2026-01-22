import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save, AlertTriangle, Search, Package, TrendingDown, TrendingUp } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

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

  const bulkSaveAll = async () => {
    const updates = Object.entries(editedStocks);
    if (updates.length === 0) return;

    for (const [id, stock] of updates) {
      await supabase.from("products").update({ stock }).eq("id", id);
    }
    toast.success(`${updates.length} productos actualizados`);
    setEditedStocks({});
    fetchProducts();
  };

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === "all" ? true :
      filter === "low" ? (p.stock > 0 && p.stock <= 5) :
      filter === "out" ? p.stock === 0 : true;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { icon: Package, label: "Total Productos", value: products.length, color: "bg-blue-500" },
    { icon: TrendingDown, label: "Stock Bajo", value: lowStockProducts.length, color: "bg-amber-500" },
    { icon: AlertTriangle, label: "Sin Stock", value: outOfStockProducts.length, color: "bg-red-500" },
  ];

  return (
    <AdminLayout title="Control de Inventario" subtitle="Gestiona el stock de tus productos">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todos
            </Button>
            <Button 
              variant={filter === "low" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("low")}
              className={filter === "low" ? "" : "text-amber-600 border-amber-200 hover:bg-amber-50"}
            >
              Stock Bajo ({lowStockProducts.length})
            </Button>
            <Button 
              variant={filter === "out" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("out")}
              className={filter === "out" ? "" : "text-red-600 border-red-200 hover:bg-red-50"}
            >
              Sin Stock ({outOfStockProducts.length})
            </Button>
          </div>
        </div>
        {Object.keys(editedStocks).length > 0 && (
          <Button onClick={bulkSaveAll} className="gap-2">
            <Save className="w-4 h-4" />
            Guardar Todos ({Object.keys(editedStocks).length})
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
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
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className={
                      product.stock === 0 
                        ? "bg-red-50 dark:bg-red-900/10" 
                        : product.stock <= 5 
                        ? "bg-amber-50 dark:bg-amber-900/10" 
                        : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image_url || "/placeholder.svg"} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-lg object-cover" 
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.categories?.name || "-"}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.stock === 0 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {product.stock > 0 && product.stock <= 5 && <TrendingDown className="w-4 h-4 text-amber-500" />}
                        <span className={
                          product.stock === 0 
                            ? "text-red-600 font-semibold" 
                            : product.stock <= 5 
                            ? "text-amber-600 font-semibold" 
                            : ""
                        }>
                          {product.stock}
                        </span>
                      </div>
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
                        variant="outline"
                        onClick={() => saveStock(product.id)}
                        disabled={editedStocks[product.id] === undefined}
                        className="gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Guardar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </AdminLayout>
  );
};

export default AdminInventory;
