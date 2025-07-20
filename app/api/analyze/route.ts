import { NextResponse } from 'next/server';
import { aiSentimentAnalyzer } from '../../lib/sentimentAI';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Use AI-powered sentiment analysis instead of the old keyword bullshit
    const sentimentResult = await aiSentimentAnalyzer.analyzeSentiment(text);
    
    return NextResponse.json({
      sentiment_score: {
        pos: sentimentResult.positive,
        neu: sentimentResult.neutral, 
        neg: sentimentResult.negative,
        compound: sentimentResult.compound
      },
      dominant_sentiment: sentimentResult.dominant,
      ai_powered: true, // Mark this as AI-generated
      model: 'distilbert-multilingual'
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json({ error: 'Failed to analyze sentiment' }, { status: 500 });
  }
}