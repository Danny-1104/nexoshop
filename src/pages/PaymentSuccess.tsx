import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CheckCircle, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  const location = useLocation();
  const { orderNumber } = location.state || {};

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

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 nexo-gradient-accent rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-12 h-12 text-accent-foreground" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">¡Pago Exitoso!</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Tu pedido ha sido confirmado
          </p>
          {orderNumber && (
            <p className="text-lg font-medium text-primary mb-8">
              Número de pedido: {orderNumber}
            </p>
          )}

          <div className="bg-card rounded-2xl p-6 nexo-shadow-md mb-8">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tu pedido está en camino</h3>
                <p className="text-sm text-muted-foreground">
                  Recibirás un email con los detalles del envío
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard/orders">
              <Button size="lg" className="nexo-gradient-primary text-primary-foreground border-0">
                Ver mis pedidos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/catalog">
              <Button size="lg" variant="outline">
                Seguir comprando
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
