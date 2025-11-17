import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { DetectionRequest, DetectionResponse } from '@/app/types/translator';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest): Promise<NextResponse<DetectionResponse>> {
    try {
        const body: DetectionRequest = await request.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json(
                { success: false, error: 'No text provided' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Detect the language of this text and respond with ONLY the language name in English (e.g., "English", "Spanish", "French", etc.): "${text}"`;

        const result = await model.generateContent(prompt);
        const detectedLanguage = result.response.text().trim();

        return NextResponse.json({
            success: true,
            language: detectedLanguage
        });
    } catch (error) {
        console.error('Language detection error:', error);
        return NextResponse.json(
            { success: false, error: 'Language detection failed' },
            { status: 500 }
        );
    }
}