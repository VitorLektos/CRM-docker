// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL')!,
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { tasks, ...cardData } = body;

    // Validate required card data
    if (!cardData.title || !cardData.stage_id) {
      return new Response(JSON.stringify({ error: 'Title and stage_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Create the card
    const { data: newCard, error: cardError } = await supabase
      .from('cards')
      .insert({ ...cardData, created_by: user.id })
      .select()
      .single();

    if (cardError) {
      console.error('Card creation error:', cardError);
      throw new Error(`Failed to create card: ${cardError.message}`);
    }

    // 2. Create associated tasks, if any
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const tasksToInsert = tasks.map((task: any) => ({
        ...task,
        card_id: newCard.id,
        created_by: user.id,
      }));

      const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert);

      if (tasksError) {
        console.error('Tasks creation error:', tasksError);
        // Note: In a real-world scenario, you might want to roll back the card creation here.
        // For simplicity, we'll just log the error.
        throw new Error(`Card created, but failed to create tasks: ${tasksError.message}`);
      }
    }

    return new Response(JSON.stringify(newCard), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});