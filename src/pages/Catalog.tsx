import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingBag, ShoppingCart, Search, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

const Catalog = () => {
  const { user } = useAuth();
  const { addToCart, totalItems } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, description, price, stock, image_url, category:category_id(name)")
      .eq("is_active", true);
    if (data) setProducts(data as unknown as Product[]);
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name");
    if (data) setCategories(data);
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error("Inicia sesión para agregar productos al carrito");
      navigate("/login");
      return;
    }
    await addToCart(productId);
  };

  // Search suggestions
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  const handleSuggestionClick = (product: Product) => {
    navigate(`/product/${product.id}`);
    setShowSuggestions(false);
    setSearchTerm("");
  };

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });

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
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline">Mi Cuenta</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="nexo-gradient-primary text-primary-foreground border-0">Iniciar Sesión</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
              <PopoverTrigger asChild>
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                  onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                />
              </PopoverTrigger>
              <PopoverContent 
                className="w-[var(--radix-popover-trigger-width)] p-0" 
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command>
                  <CommandList>
                    {suggestions.length === 0 ? (
                      <CommandEmpty>No se encontraron productos</CommandEmpty>
                    ) : (
                      <CommandGroup heading="Sugerencias">
                        {suggestions.map((product) => (
                          <CommandItem
                            key={product.id}
                            onSelect={() => handleSuggestionClick(product)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <img
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 h-12">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 h-12">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre A-Z</SelectItem>
              <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <h1 className="text-3xl font-bold mb-6">
          Catálogo de Productos
          <span className="text-muted-foreground text-lg font-normal ml-3">
            ({filteredProducts.length} productos)
          </span>
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl overflow-hidden nexo-shadow-md nexo-card-hover group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {product.category?.name || "Sin categoría"}
                  </p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className="nexo-gradient-accent text-accent-foreground border-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                  {product.stock === 0 && (
                    <p className="text-xs text-destructive mt-2">Agotado</p>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-xs text-warning mt-2">¡Últimas {product.stock} unidades!</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
