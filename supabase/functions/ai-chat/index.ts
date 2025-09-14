import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, language = 'english' } = await req.json();
    
    if (!question) {
      throw new Error('Question is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log('Processing AI chat request for user:', user.id);
    console.log('Question:', question);
    console.log('Language:', language);

    // Prepare system prompt for farming assistant
    const systemPrompt = language === 'malayalam' 
      ? `നിങ്ങൾ കേരളത്തിലെ കർഷകർക്കുള്ള ഒരു AI സഹായിയാണ്. കൃഷി, വളം, കീടനാശിനികൾ, കാലാവസ്ഥ, മണ്ണിന്റെ ആരോഗ്യം എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് മലയാളത്തിൽ വ്യക്തവും സഹായകരവുമായ ഉത്തരങ്ങൾ നൽകുക. കേരളത്തിന്റെ കാലാവസ്ഥയും കൃഷി സാഹചര്യങ്ങളും മനസ്സിൽ വെച്ച് ഉത്തരം നൽകുക.`
      : `You are an AI farming assistant for Kerala farmers. Provide clear, helpful answers in English about crops, fertilizers, pesticides, weather advice, and soil health. Consider Kerala's tropical climate and farming conditions in your responses. Keep answers practical and actionable for small-scale farmers.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Save to chat history
    const { error: insertError } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        question: question,
        response: aiResponse,
        language: language
      });

    if (insertError) {
      console.error('Error saving chat history:', insertError);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});