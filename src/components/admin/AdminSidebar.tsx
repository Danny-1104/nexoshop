import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  ShoppingCart, 
  Archive, 
  Truck, 
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  LogOut,
  User,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Productos", href: "/admin/products" },
  { icon: FolderOpen, label: "Categorías", href: "/admin/categories" },
  { icon: ShoppingCart, label: "Pedidos", href: "/admin/orders" },
  { icon: Archive, label: "Inventario", href: "/admin/inventory" },
  { icon: Truck, label: "Envíos", href: "/admin/shipments" },
  { icon: Users, label: "Usuarios", href: "/admin/users" },
];

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 nexo-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-xl font-bold">NexoShop</span>}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/admin" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                collapsed && "mx-auto"
              )} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          )}
        >
          <User className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="font-medium">Panel Cliente</span>}
        </Link>
        
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive w-full",
          )}
        >
          <LogOut className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>

        {/* User Info */}
        {!collapsed && profile && (
          <div className="px-3 py-3 mt-2 bg-sidebar-accent/50 rounded-xl">
            <p className="text-sm font-medium truncate">{profile.full_name || 'Admin'}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{profile.email}</p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
