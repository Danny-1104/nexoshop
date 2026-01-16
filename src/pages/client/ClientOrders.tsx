import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowLeft, Loader2, Package, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  confirmed: "bg-primary/20 text-primary",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-accent/20 text-accent",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const ClientOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total_amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 nexo-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 nexo-gradient-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NexoShop</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </Link>

        <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No tienes pedidos aún</h2>
            <p className="text-muted-foreground mb-8">¡Explora nuestro catálogo y realiza tu primera compra!</p>
            <Link to="/catalog">
              <Button className="nexo-gradient-primary text-primary-foreground border-0">
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-6 nexo-shadow-sm flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-lg">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                  <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
                  <Link to={`/dashboard/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrders;
