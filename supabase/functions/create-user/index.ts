import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Utiliza a chave de serviço para ter privilégios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, firstName, lastName, role } = await req.json()

    if (!email || !password || !firstName || !role) {
        return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: email, senha, nome e função.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    // Cria o usuário no sistema de autenticação da Supabase
    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (createUserError) {
      // Se o email já existir, a API da Supabase retorna um erro específico
      if (createUserError.message.includes('already registered')) {
          return new Response(JSON.stringify({ error: 'Este endereço de e-mail já está em uso.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409, // Conflict
        })
      }
      throw createUserError
    }
    
    if (!user) {
        throw new Error("Falha ao criar usuário, nenhum usuário foi retornado.")
    }

    // O gatilho 'handle_new_user' já criou o perfil.
    // Agora, apenas atualizamos a função (role) do usuário.
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', user.id)

    if (updateProfileError) {
      // Se a atualização do perfil falhar, remove o usuário recém-criado para manter a consistência
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      throw updateProfileError
    }

    return new Response(JSON.stringify({ message: 'Usuário criado com sucesso!', user }), {
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