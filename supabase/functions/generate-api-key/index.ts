import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// A chave JWT_SECRET precisa ser a mesma do seu projeto Supabase.
// É crucial que ela seja definida como uma variável de ambiente na sua Edge Function.
const JWT_SECRET = Deno.env.get('JWT_SECRET');
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não está definida nas variáveis de ambiente da função.");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Pega o usuário da sessão atual
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Pega o perfil do usuário para obter a role
    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return new Response(JSON.stringify({ error: 'Perfil do usuário não encontrado.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
        });
    }

    // Cria um token JWT de longa duração (1 ano)
    const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365); // 1 ano
    const payload = {
      sub: user.id,
      role: 'authenticated', // Papel padrão para RLS
      user_role: profile.role, // Papel customizado para RLS
      exp: expirationTime,
      iss: 'supabase',
    };

    const jwt = await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET);

    return new Response(JSON.stringify({ apiKey: jwt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})