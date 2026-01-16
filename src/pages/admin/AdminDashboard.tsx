import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, ShoppingCart, Truck, Users, DollarSign, LogOut, ChevronRight, LayoutDashboard, Archive } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [products, orders] = await Promise.all([
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("orders").select("id, total_amount, status"),
    ]);

    const totalRevenue = orders.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const pendingOrders = orders.data?.filter((o) => o.status === "pending" || o.status === "processing").length || 0;

    setStats({
      totalProducts: products.count || 0,
      totalOrders: orders.data?.length || 0,
      pendingOrders,
      totalRevenue,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: Package, label: "Productos", href: "/admin/products", desc: "Gestionar catálogo" },
    { icon: ShoppingCart, label: "Pedidos", href: "/admin/orders", desc: "Ver y procesar pedidos" },
    { icon: Archive, label: "Inventario", href: "/admin/inventory", desc: "Control de stock" },
    { icon: Truck, label: "Envíos", href: "/admin/shipments", desc: "Gestión de envíos" },
  ];

  const statCards = [
    { icon: Package, label: "Productos", value: stats.totalProducts, color: "nexo-gradient-primary" },
    { icon: ShoppingCart, label: "Pedidos Totales", value: stats.totalOrders, color: "nexo-gradient-accent" },
    { icon: Users, label: "Pedidos Pendientes", value: stats.pendingOrders, color: "bg-warning" },
    { icon: DollarSign, label: "Ingresos Totales", value: `$${stats.totalRevenue.toFixed(2)}`, color: "bg-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 nexo-gradient-primary rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NexoShop</span>
            </Link>
            <span className="px-3 py-1 bg-sidebar-accent rounded-lg text-sm font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:text-sidebar-primary-foreground">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Panel Cliente
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sidebar-foreground hover:text-sidebar-primary-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Bienvenido, {profile?.full_name || "Administrador"}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 nexo-shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Menu */}
        <h2 className="text-xl font-bold mb-4">Gestión</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link to={item.href}>
                <div className="flex items-center gap-4 p-6 bg-card rounded-2xl nexo-shadow-sm nexo-card-hover group">
                  <div className="w-14 h-14 nexo-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
