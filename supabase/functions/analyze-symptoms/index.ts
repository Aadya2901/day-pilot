import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();

    if (!symptoms || symptoms.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Please describe your symptoms' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing symptoms:', symptoms.substring(0, 100));

    const systemPrompt = `You are SympSense, a caring and empathetic AI health assistant. Your role is to help users understand their symptoms in a friendly, non-alarming way.

IMPORTANT DISCLAIMERS:
- You are NOT a doctor and cannot provide medical diagnoses
- Always recommend consulting a healthcare professional for serious concerns
- Be empathetic and supportive in your tone

For the user's symptoms, provide a structured JSON response with:
1. summary: A brief, empathetic summary of what the user is experiencing
2. possible_conditions: An array of 2-4 possible conditions that could explain the symptoms (common ones first)
3. severity: "low", "medium", or "high" based on the symptoms described
4. next_steps: An array of 3-5 actionable recommendations

Respond ONLY with valid JSON in this exact format:
{
  "summary": "string",
  "possible_conditions": ["string"],
  "severity": "low|medium|high",
  "next_steps": ["string"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze these symptoms and provide health insights: ${symptoms}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('Raw AI response:', content.substring(0, 200));

    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Provide fallback response
      analysis = {
        summary: "I've noted your symptoms. For accurate assessment, please consult a healthcare provider.",
        possible_conditions: ["Unable to analyze - please provide more details"],
        severity: "medium",
        next_steps: [
          "Consult a healthcare professional",
          "Monitor your symptoms",
          "Rest and stay hydrated"
        ]
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-symptoms:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to analyze symptoms',
        summary: "I'm having trouble analyzing your symptoms right now.",
        possible_conditions: [],
        severity: "medium",
        next_steps: ["Please try again or consult a healthcare professional"]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
