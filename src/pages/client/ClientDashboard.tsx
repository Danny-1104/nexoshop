import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Package, CreditCard, LogOut, ShoppingCart, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ClientDashboard = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: User, label: "Mi Perfil", href: "/dashboard/profile", desc: "Edita tus datos personales" },
    { icon: Package, label: "Mis Pedidos", href: "/dashboard/orders", desc: "Historial y seguimiento" },
    { icon: CreditCard, label: "Métodos de Pago", href: "/dashboard/payment-methods", desc: "Gestiona tus tarjetas" },
    { icon: ShoppingCart, label: "Ir al Catálogo", href: "/catalog", desc: "Explora productos" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 nexo-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 nexo-gradient-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NexoShop</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">Panel Admin</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            ¡Hola, {profile?.full_name || "Usuario"}!
          </h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de cliente
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
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

export default ClientDashboard;
