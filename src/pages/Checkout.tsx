import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingBag, CreditCard, Truck, Loader2, ArrowLeft, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  const [shippingData, setShippingData] = useState({
    address: profile?.address || "",
    city: profile?.city || "",
    postalCode: profile?.postal_code || "",
    country: profile?.country || "Ecuador",
  });

  const taxRate = 0.12;
  const taxAmount = totalAmount * taxRate;
  const shippingCost = 0;
  const grandTotal = totalAmount + taxAmount + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingData.address || !shippingData.city) {
      toast.error("Por favor completa la dirección de envío");
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: user!.id,
          order_number: orderNumber,
          total_amount: grandTotal,
          subtotal: totalAmount,
          tax_amount: taxAmount,
          shipping_cost: shippingCost,
          status: "confirmed" as const,
          shipping_address: shippingData.address,
          shipping_city: shippingData.city,
          shipping_postal_code: shippingData.postalCode,
          shipping_country: shippingData.country,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      await supabase.from("order_items").insert(orderItems);

      // Update product stock using secure database function
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrease_product_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        });
        if (stockError) {
          console.error('Stock update error:', stockError);
          throw new Error(`Error actualizando stock: ${stockError.message}`);
        }
      }

      // Create payment record
      await supabase.from("payments").insert({
        order_id: order.id,
        user_id: user!.id,
        amount: grandTotal,
        status: "completed",
        transaction_id: `TXN-${Date.now()}`,
      });

      // Create shipment record
      await supabase.from("shipments").insert({
        order_id: order.id,
        user_id: user!.id,
        status: "processing",
        tracking_number: `NEXO-${Date.now()}`,
        carrier: "NexoExpress",
      });

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await supabase.from("invoices").insert([{
        order_id: order.id,
        user_id: user!.id,
        invoice_number: invoiceNumber,
        subtotal: totalAmount,
        tax_amount: taxAmount,
        total_amount: grandTotal,
        status: "paid",
      }]);

      // Clear cart
      await clearCart();

      toast.success("¡Pedido realizado con éxito!");
      navigate("/payment-success", { state: { orderId: order.id, orderNumber: order.order_number } });
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Error al procesar el pedido");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-muted-foreground">Tu carrito está vacío</p>
        <Link to="/catalog">
          <Button>Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al carrito
        </Link>

        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 nexo-shadow-sm"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Dirección de Envío
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      placeholder="Calle, número, piso..."
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      placeholder="Ciudad"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      placeholder="00000"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 nexo-shadow-sm"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Método de Pago
                </h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <span className="font-medium">Tarjeta de Crédito/Débito</span>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <span className="font-medium">PayPal</span>
                      <p className="text-sm text-muted-foreground">Pago seguro con tu cuenta PayPal</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <span className="font-medium">Pago contra entrega</span>
                      <p className="text-sm text-muted-foreground">Paga en efectivo al recibir tu pedido</p>
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl p-6 nexo-shadow-md sticky top-24"
              >
                <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>
                
                <div className="space-y-3 mb-4 max-h-48 overflow-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <img
                        src={item.product.image_url || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>IVA (12%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span className="text-success">Gratis</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isProcessing}
                  className="w-full h-14 nexo-gradient-accent text-accent-foreground border-0 text-lg"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirmar Pago
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
