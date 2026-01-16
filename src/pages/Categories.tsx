import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    if (data) setCategories(data);
    setIsLoading(false);
  };

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
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">Catálogo</Link>
            <Link to="/categories" className="text-foreground font-medium">Categorías</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Grid3X3 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Categorías</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/catalog?category=${category.id}`}>
                  <div className="group relative bg-card rounded-2xl overflow-hidden nexo-shadow-md nexo-card-hover h-64">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 nexo-gradient-primary opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <div className="text-center py-20">
            <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay categorías</h2>
            <p className="text-muted-foreground">Vuelve pronto para ver nuevas categorías.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
