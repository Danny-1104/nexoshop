import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, Shield, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 nexo-gradient-hero min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse-slow" />
        </div>
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
              Tu destino para compras <span className="text-accent">inteligentes</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl">
              Descubre miles de productos de calidad con los mejores precios. Envío rápido y seguro a todo el país.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6">
                  Explorar Catálogo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6">
                  Crear Cuenta Gratis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Envío Rápido", desc: "Entrega en 24-48 horas a todo el país" },
              { icon: Shield, title: "Compra Segura", desc: "Protección total en todas tus transacciones" },
              { icon: Star, title: "Calidad Premium", desc: "Productos seleccionados con los mejores estándares" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-card nexo-shadow-md nexo-card-hover text-center"
              >
                <div className="w-16 h-16 nexo-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Únete a miles de clientes satisfechos y descubre lo mejor del comercio en línea.
          </p>
          <Link to="/register">
            <Button size="lg" className="nexo-gradient-primary text-primary-foreground border-0 text-lg px-8">
              Crear Cuenta Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 nexo-gradient-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">NexoShop</span>
            </div>
            <p className="text-sidebar-foreground/60 text-sm">
              © 2026 NexoShop. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
