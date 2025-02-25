import { NextResponse } from 'next/server';

// This is a fallback in case the Python API is unavailable
export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // First, try to call our Python function
    try {
      const pyResponse = await fetch(`${request.headers.get('origin')}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (pyResponse.ok) {
        return NextResponse.json(await pyResponse.json());
      }
      // If Python API fails, continue to fallback
    } catch (pyError) {
      console.log('Python API unavailable, using fallback:', pyError);
    }
    
    // Fallback: Simple sentiment analysis function
    const sentimentResult = analyzeSentiment(text);
    
    return NextResponse.json({
      sentiment_score: {
        pos: sentimentResult === 'pos' ? 0.7 : sentimentResult === 'neu' ? 0.3 : 0.1,
        neu: sentimentResult === 'neu' ? 0.7 : 0.2,
        neg: sentimentResult === 'neg' ? 0.7 : sentimentResult === 'neu' ? 0.3 : 0.1,
        compound: sentimentResult === 'pos' ? 0.8 : sentimentResult === 'neg' ? -0.8 : 0
      },
      dominant_sentiment: sentimentResult
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json({ error: 'Failed to analyze sentiment' }, { status: 500 });
  }
}

// Basic sentiment analysis function
function analyzeSentiment(text: string): string {
  const positiveWords = ['great', 'awesome', 'excellent', 'good', 'love', 'amazing', 'interesting', 'enjoyed', 'learn', 'fascinating'];
  const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'worst', 'boring', 'difficult', 'disappointed', 'confusing', 'waste'];
  
  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = words.filter(word => positiveWords.some(pos => word.includes(pos))).length;
  const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length;
  
  if (positiveCount > negativeCount) return 'pos';
  if (negativeCount > positiveCount) return 'neg';
  return 'neu';
}