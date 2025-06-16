import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Analyze sentiment using our simple algorithm
    const sentimentResult = analyzeSentiment(text);
    
    return NextResponse.json({
      sentiment_score: {
        pos: sentimentResult.positive,
        neu: sentimentResult.neutral, 
        neg: sentimentResult.negative,
        compound: sentimentResult.compound
      },
      dominant_sentiment: sentimentResult.dominant
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json({ error: 'Failed to analyze sentiment' }, { status: 500 });
  }
}

// Enhanced sentiment analysis function
function analyzeSentiment(text: string) {
  // French and English positive words
  const positiveWords = [
    'excellent', 'génial', 'super', 'fantastique', 'parfait', 'impressionnant',
    'intéressant', 'passionnant', 'merveilleux', 'extraordinaire', 'bien', 
    'bonne', 'bon', 'cool', 'top', 'formidable', 'adoré', 'fascinant',
    'great', 'awesome', 'amazing', 'good', 'love', 'wonderful', 'fantastic',
    'brilliant', 'outstanding', 'incredible', 'enjoyed', 'learn', 'learned'
  ];
  
  // French and English negative words  
  const negativeWords = [
    'mauvais', 'nul', 'ennuyeux', 'décevant', 'difficile', 'complexe',
    'confus', 'incompréhensible', 'fade', 'pas terrible', 'décevant',
    'bad', 'poor', 'terrible', 'hate', 'worst', 'boring', 'awful',
    'disappointed', 'confusing', 'waste', 'useless', 'frustrating'
  ];
  
  // French and English neutral words
  const neutralWords = [
    'correct', 'moyen', 'standard', 'ordinaire', 'quelconque',
    'okay', 'fine', 'average', 'normal', 'regular'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  words.forEach(word => {
    // Check for positive words
    if (positiveWords.some(pos => word.includes(pos))) {
      positiveScore += 1;
    }
    // Check for negative words  
    else if (negativeWords.some(neg => word.includes(neg))) {
      negativeScore += 1;
    }
    // Check for neutral words
    else if (neutralWords.some(neu => word.includes(neu))) {
      neutralScore += 0.5;
    }
  });
  
  const totalScore = positiveScore + negativeScore + neutralScore;
  
  // Normalize scores
  const positive = totalScore > 0 ? positiveScore / totalScore : 0;
  const negative = totalScore > 0 ? negativeScore / totalScore : 0;
  const neutral = totalScore > 0 ? neutralScore / totalScore : 1 - positive - negative;
  
  // Calculate compound score
  const compound = positive - negative;
  
  // Determine dominant sentiment
  let dominant = 'neu';
  if (positive > negative && positive > neutral) {
    dominant = 'pos';
  } else if (negative > positive && negative > neutral) {
    dominant = 'neg';
  }
  
  return {
    positive: Math.round(positive * 100) / 100,
    negative: Math.round(negative * 100) / 100,
    neutral: Math.round(neutral * 100) / 100,
    compound: Math.round(compound * 100) / 100,
    dominant
  };
}