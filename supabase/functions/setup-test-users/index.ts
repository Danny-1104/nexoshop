import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const users = [
      {
        email: "admin@nexoshop.com",
        password: "admin123",
        full_name: "Admin NexoShop",
        role: "admin" as const,
      },
      {
        email: "cliente@nexoshop.com",
        password: "cliente123",
        full_name: "Cliente Demo",
        role: "cliente" as const,
      },
    ];

    const results = [];

    for (const user of users) {
      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

      if (existingUser) {
        results.push({ email: user.email, status: "already_exists" });
        continue;
      }

      // Create user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name },
      });

      if (authError) {
        results.push({ email: user.email, status: "error", error: authError.message });
        continue;
      }

      // Create profile
      await supabaseAdmin.from("profiles").upsert({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
      });

      // Create role
      await supabaseAdmin.from("user_roles").upsert({
        user_id: authData.user.id,
        role: user.role,
      });

      results.push({ email: user.email, status: "created" });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
