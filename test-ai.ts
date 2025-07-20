// Quick test script for AI sentiment analysis
// Run with: npx tsx test-ai.ts

import { aiSentimentAnalyzer } from './app/lib/sentimentAI';

async function testAISentiment() {
  console.log('🧪 Testing AI Sentiment Analysis...\n');

  const tests = [
    "This workshop was absolutely fantastic! I learned so much.",
    "The presentation was boring and terrible.",
    "It was okay, nothing special.",
    "Excellent atelier, très interactif! Les robots étaient impressionnants.",
    "Un peu décevant, j'attendais mieux.",
    "The content was great but the speaker sucked.",
  ];

  for (const text of tests) {
    try {
      const result = await aiSentimentAnalyzer.analyzeSentiment(text);
      const confidence = result.dominant === 'pos' ? result.positive : 
                        result.dominant === 'neg' ? result.negative : result.neutral;
      
      console.log(`📝 "${text}"`);
      console.log(`🎯 ${result.dominant.toUpperCase()} (${(confidence * 100).toFixed(1)}% confidence)`);
      console.log(`📊 Pos:${result.positive.toFixed(2)} Neg:${result.negative.toFixed(2)} Neu:${result.neutral.toFixed(2)}`);
      console.log('---');
    } catch (error) {
      console.error(`❌ Failed: "${text}"`, error);
    }
  }
}

if (require.main === module) {
  testAISentiment().catch(console.error);
}