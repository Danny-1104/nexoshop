import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2, Check, AlertCircle, Users } from "lucide-react";
import { motion } from "framer-motion";

const SetupTestUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<{ email: string; status: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setupUsers = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("setup-test-users");
      
      if (error) throw error;
      
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "Error al crear usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-2xl p-8 nexo-shadow-md text-center"
      >
        <div className="w-16 h-16 nexo-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Configurar Usuarios de Prueba</h1>
        <p className="text-muted-foreground mb-6">
          Crea los usuarios de demostración para probar la aplicación.
        </p>

        <div className="bg-muted rounded-lg p-4 mb-6 text-left text-sm">
          <p className="font-medium mb-2">Usuarios que se crearán:</p>
          <p className="text-muted-foreground">• admin@nexoshop.com / admin123 (Admin)</p>
          <p className="text-muted-foreground">• cliente@nexoshop.com / cliente123 (Cliente)</p>
        </div>

        {!results && !error && (
          <Button
            onClick={setupUsers}
            disabled={isLoading}
            className="w-full h-12 nexo-gradient-primary text-primary-foreground border-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Crear Usuarios de Prueba
              </>
            )}
          </Button>
        )}

        {results && (
          <div className="space-y-3">
            {results.map((result, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  result.status === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-success/10 text-success"
                }`}
              >
                {result.status === "error" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{result.email}</span>
                <span className="text-xs ml-auto">
                  {result.status === "created" && "Creado"}
                  {result.status === "already_exists" && "Ya existe"}
                  {result.status === "error" && "Error"}
                </span>
              </div>
            ))}
            <Link to="/login">
              <Button className="w-full mt-4 nexo-gradient-accent text-accent-foreground border-0">
                Ir a Iniciar Sesión
              </Button>
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 mb-2 mx-auto" />
            <p className="text-sm">{error}</p>
            <Button
              onClick={setupUsers}
              variant="outline"
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            <ShoppingBag className="w-4 h-4 inline mr-1" />
            Volver a NexoShop
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupTestUsers;
