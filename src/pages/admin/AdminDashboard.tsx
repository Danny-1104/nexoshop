import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("id, stock"),
      supabase.from("orders").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(5),
    ]);

    const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const pendingOrders = ordersRes.data?.filter((o) => o.status === "pending" || o.status === "processing").length || 0;
    const lowStockProducts = productsRes.data?.filter((p) => p.stock <= 5).length || 0;

    setStats({
      totalProducts: productsRes.data?.length || 0,
      totalOrders: ordersRes.data?.length || 0,
      pendingOrders,
      totalRevenue,
      lowStockProducts,
    });

    setRecentOrders(ordersRes.data || []);
    setIsLoading(false);
  };

  const statCards = [
    { icon: Package, label: "Total Productos", value: stats.totalProducts, color: "bg-blue-500", trend: "+12%" },
    { icon: ShoppingCart, label: "Pedidos Totales", value: stats.totalOrders, color: "bg-emerald-500", trend: "+8%" },
    { icon: Clock, label: "Pedidos Pendientes", value: stats.pendingOrders, color: "bg-amber-500", trend: null },
    { icon: DollarSign, label: "Ingresos Totales", value: `$${stats.totalRevenue.toFixed(2)}`, color: "bg-violet-500", trend: "+15%" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "confirmed": return "bg-blue-100 text-blue-700";
      case "processing": return "bg-indigo-100 text-indigo-700";
      case "shipped": return "bg-cyan-100 text-cyan-700";
      case "delivered": return "bg-emerald-100 text-emerald-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "confirmed": return "Confirmado";
      case "processing": return "Procesando";
      case "shipped": return "Enviado";
      case "delivered": return "Entregado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  return (
    <AdminLayout title="Dashboard" subtitle={`Bienvenido, ${profile?.full_name || 'Administrador'}`}>
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {stat.trend}
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alerts & Recent Orders Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="bg-card rounded-2xl border border-border p-6 h-full">
            <h3 className="font-semibold text-lg mb-4">Alertas</h3>
            <div className="space-y-3">
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Stock Bajo</p>
                    <p className="text-xs text-amber-600 dark:text-amber-300">{stats.lowStockProducts} productos</p>
                  </div>
                  <Link to="/admin/inventory">
                    <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700">
                      Ver
                    </Button>
                  </Link>
                </div>
              )}
              {stats.pendingOrders > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Pedidos Pendientes</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">{stats.pendingOrders} pedidos</p>
                  </div>
                  <Link to="/admin/orders">
                    <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                      Ver
                    </Button>
                  </Link>
                </div>
              )}
              {stats.lowStockProducts === 0 && stats.pendingOrders === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hay alertas pendientes</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Pedidos Recientes</h3>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay pedidos recientes</p>
              ) : (
                recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.profiles?.full_name || order.profiles?.email || 'Cliente'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total_amount?.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <h3 className="font-semibold text-lg mb-4">Acciones Rápidas</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/products">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Package className="w-6 h-6" />
              <span>Agregar Producto</span>
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Gestionar Categorías</span>
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <ShoppingCart className="w-6 h-6" />
              <span>Ver Pedidos</span>
            </Button>
          </Link>
          <Link to="/admin/inventory">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Revisar Inventario</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
