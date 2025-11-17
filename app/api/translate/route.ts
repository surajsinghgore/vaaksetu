import { NextRequest, NextResponse } from 'next/server';
import { TranslationRequest, TranslationResponse } from '@/app/types/translator';

// Define fallback models in order of preference
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest'
];

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

async function tryTranslateWithModel(
  model: string, 
  prompt: string, 
  apiKey: string
): Promise<{ success: boolean; translation?: string; error?: string }> {
  try {
    const response = await fetch(
      `${API_ENDPOINT}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (response.status === 503) {
      // Model is overloaded
      return { success: false, error: 'overloaded' };
    }

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: errorData };
    }

    const data = await response.json();
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (translation) {
      console.log(`✅ Translation successful using model: ${model}`);
      return { success: true, translation: translation.trim() };
    }

    return { success: false, error: 'No translation in response' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is not configured');
      return NextResponse.json(
        { success: false, error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Parse and validate request
    const body: TranslationRequest = await request.json();
    const { text, sourceLang, targetLang } = body;

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare the prompt
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. 
    Only provide the translation, no explanations or additional text.
    
    Text to translate: "${text}"`;

    // Try each model in sequence until one works
    let lastError = '';
    let overloadedCount = 0;
    
    for (const model of MODELS) {
      console.log(`🔄 Trying model: ${model}`);
      
      const result = await tryTranslateWithModel(model, prompt, apiKey);
      
      if (result.success && result.translation) {
        return NextResponse.json({
          success: true,
          translation: result.translation,
          model: model // Include which model was used
        });
      }
      
      if (result.error === 'overloaded') {
        overloadedCount++;
        console.log(`⚠️ Model ${model} is overloaded`);
      } else {
        lastError = result.error || 'Unknown error';
      }
      
      // Small delay before trying next model
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // All models failed
    if (overloadedCount === MODELS.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All models are currently overloaded. Please try again in a few moments.',
          retryAfter: 10 // Suggest retry after 10 seconds
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Translation failed with all available models.',
        details: lastError
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Translation failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}