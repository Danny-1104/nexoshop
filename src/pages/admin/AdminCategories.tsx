import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingBag, ArrowLeft, Loader2, Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });

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

  const resetForm = () => {
    setFormData({ name: "", description: "", image_url: "" });
    setEditingCategory(null);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: formData.name,
          description: formData.description || null,
          image_url: formData.image_url || null,
        })
        .eq("id", editingCategory.id);

      if (error) {
        toast.error("Error al actualizar categoría");
      } else {
        toast.success("Categoría actualizada");
        setIsModalOpen(false);
        resetForm();
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({
          name: formData.name,
          description: formData.description || null,
          image_url: formData.image_url || null,
        });

      if (error) {
        toast.error("Error al crear categoría");
      } else {
        toast.success("Categoría creada");
        setIsModalOpen(false);
        resetForm();
        fetchCategories();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.")) return;
    
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar categoría");
    } else {
      toast.success("Categoría eliminada");
      fetchCategories();
    }
  };

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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderOpen className="w-8 h-8" />
            Gestión de Categorías
          </h1>
          <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="nexo-gradient-primary text-primary-foreground border-0">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre de la categoría"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de la categoría"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">URL de Imagen</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="nexo-gradient-primary text-primary-foreground border-0">
                    {editingCategory ? "Guardar" : "Crear"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay categorías</h2>
            <p className="text-muted-foreground">Crea tu primera categoría para organizar los productos</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl nexo-shadow-sm overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={category.image_url || "/placeholder.svg"}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

export default AdminCategories;
