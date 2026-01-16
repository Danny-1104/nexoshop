import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, ArrowLeft, Loader2, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Shipment {
  id: string;
  order_id: string;
  tracking_number: string | null;
  carrier: string | null;
  status: string;
  created_at: string;
  orders: { order_number: string } | null;
  profiles: { full_name: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-accent/20 text-accent",
  in_transit: "bg-accent/20 text-accent",
  delivered: "bg-success/20 text-success",
  returned: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  in_transit: "En tránsito",
  delivered: "Entregado",
  returned: "Devuelto",
};

const AdminShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editedData, setEditedData] = useState<Record<string, { tracking?: string; carrier?: string }>>({});

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    const { data } = await supabase
      .from("shipments")
      .select("*, orders:order_id(order_number), profiles:user_id(full_name)")
      .order("created_at", { ascending: false });
    
    if (data) setShipments(data as unknown as Shipment[]);
    setIsLoading(false);
  };

  const updateStatus = async (shipmentId: string, newStatus: "pending" | "processing" | "shipped" | "in_transit" | "delivered" | "returned") => {
    const { error } = await supabase.from("shipments").update({ status: newStatus }).eq("id", shipmentId);
    if (error) {
      toast.error("Error al actualizar estado");
    } else {
      toast.success("Estado actualizado");
      fetchShipments();
    }
  };

  const handleEdit = (id: string, field: "tracking" | "carrier", value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveShipment = async (shipment: Shipment) => {
    const updates = editedData[shipment.id];
    if (!updates) return;

    const { error } = await supabase.from("shipments").update({
      tracking_number: updates.tracking ?? shipment.tracking_number,
      carrier: updates.carrier ?? shipment.carrier,
    }).eq("id", shipment.id);

    if (error) {
      toast.error("Error al guardar");
    } else {
      toast.success("Envío actualizado");
      setEditedData((prev) => {
        const { [shipment.id]: _, ...rest } = prev;
        return rest;
      });
      fetchShipments();
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

        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Truck className="w-8 h-8" />
          Gestión de Envíos
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl nexo-shadow-sm overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Transportista</TableHead>
                  <TableHead>N° Seguimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.orders?.order_number}</TableCell>
                    <TableCell>{shipment.profiles?.full_name || "Usuario"}</TableCell>
                    <TableCell>
                      <Input
                        className="w-32"
                        placeholder="Ej: DHL"
                        value={editedData[shipment.id]?.carrier ?? shipment.carrier ?? ""}
                        onChange={(e) => handleEdit(shipment.id, "carrier", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-40"
                        placeholder="Número de tracking"
                        value={editedData[shipment.id]?.tracking ?? shipment.tracking_number ?? ""}
                        onChange={(e) => handleEdit(shipment.id, "tracking", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={shipment.status} onValueChange={(v) => updateStatus(shipment.id, v as "pending" | "processing" | "shipped" | "in_transit" | "delivered" | "returned")}>
                        <SelectTrigger className="w-36">
                          <Badge className={statusColors[shipment.status]}>
                            {statusLabels[shipment.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="processing">Procesando</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="in_transit">En tránsito</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="returned">Devuelto</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => saveShipment(shipment)}
                        disabled={!editedData[shipment.id]}
                        className="nexo-gradient-primary text-primary-foreground border-0"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Guardar
                      </Button>
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

export default AdminShipments;
