import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Direct REST API call to Google AI API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check for authentication errors
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { 
            error: 'Invalid API key',
            details: 'The provided API key is invalid or does not have access',
            apiKeyValid: false
          },
          { status: 401 }
        );
      }
      
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Process models
    const models = data.models || [];
    
    // Filter for generative models that support content generation
    const generativeModels = models
      .filter((model: any) => 
        model.supportedGenerationMethods?.includes('generateContent') ||
        model.supportedGenerationMethods?.includes('generateMessage')
      )
      .map((model: any) => {
        // Extract model name (e.g., "gemini-1.5-flash" from "models/gemini-1.5-flash")
        const modelId = model.name.replace('models/', '');
        
        return {
          id: modelId,
          name: model.name,
          displayName: model.displayName || modelId,
          version: model.version || 'latest',
          description: model.description || 'No description available',
          inputTokenLimit: model.inputTokenLimit || 0,
          outputTokenLimit: model.outputTokenLimit || 0,
          supportedMethods: model.supportedGenerationMethods || [],
          temperature: model.temperature,
          topP: model.topP,
          topK: model.topK,
        };
      });

    // Sort models by name
    generativeModels.sort((a: any, b: any) => a.id.localeCompare(b.id));

    return NextResponse.json({
      success: true,
      apiKeyValid: true,
      totalModels: models.length,
      generativeModelsCount: generativeModels.length,
      models: generativeModels,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching Gemini models:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error',
        apiKeyValid: false,
        hint: 'Please check your API key and internet connection'
      },
      { status: 500 }
    );
  }
}