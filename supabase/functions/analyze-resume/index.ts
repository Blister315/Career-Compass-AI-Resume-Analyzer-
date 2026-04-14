import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Resume text is too short (minimum 50 characters)',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Use Gemini API Key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'GEMINI_API_KEY not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert NLP-based resume analyzer.
Return ONLY valid JSON. Your response must be a single JSON object with no introductory or concluding text.

Required JSON structure:
{
  "overallScore": number (0-100),
  "skills": [{"skill": string, "found": boolean, "category": string, "confidence": number}],
  "entities": {
    "companies": string[],
    "jobTitles": string[],
    "institutions": string[],
    "degrees": string[],
    "certifications": string[],
    "locations": string[]
  },
  "keywords": [{"word": string, "tfidfScore": number, "count": number}],
  "sections": [{"name": string, "found": boolean}],
  "matchedRoles": [{"role": string, "confidence": number}],
  "suggestions": string[],
  "jobMatchScore": number,
  "missingKeywords": string[]
}`;

    const userPrompt = `Analyze this resume using NER and NLP techniques:

---RESUME START---
${resumeText.substring(0, 8000)}
---RESUME END---
${jobDescription ? `\n---JOB DESCRIPTION START---\n${jobDescription.substring(0, 3000)}\n---JOB DESCRIPTION END---` : ''}`;

    // ✅ Gemini API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt + "\n\n" + userPrompt }
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Gemini API Error (${response.status})`, 
          details: errText 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // ✅ Extract text response
    const textOutput =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      console.error('Invalid Gemini response:', data);
      return new Response(
        JSON.stringify({ success: false, error: 'AI returned an empty response. Check safety settings or quota.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔥 Robust JSON Extraction
    let cleanedText = textOutput.trim();

    // 1. Remove markdown code blocks
    if (cleanedText.includes("```")) {
      cleanedText = cleanedText.replace(/```json|```/g, "").trim();
    }

    // 2. Find the actual JSON object bounds
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    let analysis;

    try {
      analysis = JSON.parse(cleanedText);
    } catch (err) {
      console.error('JSON parse error:', cleanedText);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI did not return valid JSON. Please try again.',
          raw: cleanedText.substring(0, 200) + '...',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('analyze-resume error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown server error',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});