import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userRes } = await userClient.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
  }

  const { title, stage_id, contact_id, description, value, source, company_name, business_type, closed_at } = payload || {};

  if (!title || typeof title !== "string" || !stage_id || typeof stage_id !== "string") {
    return new Response(JSON.stringify({ error: "title (string) and stage_id (string) are required" }), { status: 400, headers: corsHeaders });
  }

  const insertObj: Record<string, any> = {
    title,
    stage_id,
    contact_id: contact_id || null,
    description: description ?? null,
    value: typeof value === "number" ? value : null,
    source: source ?? null,
    company_name: company_name ?? null,
    business_type: business_type ?? null,
    closed_at: closed_at ?? null,
    created_by: user.id,
  };

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await admin.from("cards").insert(insertObj).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ data }), { status: 200, headers: corsHeaders });
});