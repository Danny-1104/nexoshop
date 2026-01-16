import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowLeft, Loader2, Package, Truck, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  status: string;
  shipping_address: string | null;
  shipping_city: string | null;
  created_at: string;
}

interface Shipment {
  tracking_number: string | null;
  carrier: string | null;
  status: string;
}

interface Invoice {
  invoice_number: string;
  status: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const ClientOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (orderData) setOrder(orderData);

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);
    
    if (itemsData) setItems(itemsData);

    const { data: shipmentData } = await supabase
      .from("shipments")
      .select("tracking_number, carrier, status")
      .eq("order_id", id)
      .maybeSingle();
    
    if (shipmentData) setShipment(shipmentData);

    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("invoice_number, status")
      .eq("order_id", id)
      .maybeSingle();
    
    if (invoiceData) setInvoice(invoiceData);

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-muted-foreground">Pedido no encontrado</p>
        <Link to="/dashboard/orders">
          <Button>Volver a mis pedidos</Button>
        </Link>
      </div>
    );
  }

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
        <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver a mis pedidos
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge className="w-fit px-4 py-2 text-base" variant="outline">
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 nexo-shadow-sm"
            >
              <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.product_image || "/placeholder.svg"}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.unit_price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">${item.total_price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shipping */}
            {shipment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 nexo-shadow-sm"
              >
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Envío
                </h2>
                <div className="space-y-2">
                  <p><span className="text-muted-foreground">Dirección:</span> {order.shipping_address}, {order.shipping_city}</p>
                  <p><span className="text-muted-foreground">Transportista:</span> {shipment.carrier || "Por asignar"}</p>
                  <p><span className="text-muted-foreground">Número de seguimiento:</span> {shipment.tracking_number || "Por generar"}</p>
                  <p><span className="text-muted-foreground">Estado:</span> {statusLabels[shipment.status] || shipment.status}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl p-6 nexo-shadow-md h-fit sticky top-24"
          >
            <h2 className="font-bold text-xl mb-4">Resumen</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA</span>
                <span>${order.tax_amount?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-success">{order.shipping_cost === 0 ? "Gratis" : `$${order.shipping_cost?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-primary">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {invoice && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Factura
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{invoice.invoice_number}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Factura
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClientOrderDetail;
