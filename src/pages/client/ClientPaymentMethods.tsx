import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingBag, ArrowLeft, Loader2, CreditCard, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: string;
  type: string;
  card_last_four: string | null;
  card_brand: string | null;
  card_holder_name: string | null;
  is_default: boolean;
}

const ClientPaymentMethods = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: "card",
    card_holder_name: "",
    card_last_four: "",
    card_brand: "Visa",
  });

  useEffect(() => {
    fetchMethods();
  }, [user]);

  const fetchMethods = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    
    if (data) setMethods(data);
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!user) return;

    const { error } = await supabase.from("payment_methods").insert({
      user_id: user.id,
      type: newMethod.type,
      card_holder_name: newMethod.card_holder_name,
      card_last_four: newMethod.card_last_four.slice(-4),
      card_brand: newMethod.card_brand,
      is_default: methods.length === 0,
    });

    if (error) {
      toast.error("Error al agregar método de pago");
    } else {
      toast.success("Método de pago agregado");
      setIsOpen(false);
      fetchMethods();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("payment_methods").delete().eq("id", id);
    toast.success("Método de pago eliminado");
    fetchMethods();
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    
    await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
    toast.success("Método predeterminado actualizado");
    fetchMethods();
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al panel
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Métodos de Pago</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="nexo-gradient-primary text-primary-foreground border-0">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Método de Pago</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <RadioGroup value={newMethod.type} onValueChange={(v) => setNewMethod({ ...newMethod, type: v })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Tarjeta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                  </RadioGroup>
                </div>
                {newMethod.type === "card" && (
                  <>
                    <div className="space-y-2">
                      <Label>Nombre del titular</Label>
                      <Input
                        value={newMethod.card_holder_name}
                        onChange={(e) => setNewMethod({ ...newMethod, card_holder_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Últimos 4 dígitos</Label>
                      <Input
                        maxLength={4}
                        value={newMethod.card_last_four}
                        onChange={(e) => setNewMethod({ ...newMethod, card_last_four: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <Button onClick={handleAdd} className="w-full nexo-gradient-primary text-primary-foreground border-0">
                  Agregar Método
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No tienes métodos de pago</h2>
            <p className="text-muted-foreground">Agrega una tarjeta para agilizar tus compras</p>
          </div>
        ) : (
          <div className="space-y-4">
            {methods.map((method, i) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-6 nexo-shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    {method.card_brand || method.type} {method.card_last_four && `•••• ${method.card_last_four}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{method.card_holder_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {method.is_default ? (
                    <span className="text-sm text-success font-medium">Predeterminado</span>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(method.id)}>
                      Predeterminar
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPaymentMethods;
