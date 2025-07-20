// AI-powered sentiment analysis module
// Replaces the shitty keyword-based system with real AI

interface SentimentScores {
  positive: number;
  negative: number;
  neutral: number;
  compound: number;
  dominant: 'pos' | 'neg' | 'neu';
}

class AISentimentAnalyzer {
  private pipeline: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load the AI model for local inference
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Set to use local models (no internet required after first download)
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      
      // Load multilingual sentiment model (supports French & English)
      this.pipeline = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-multilingual-cased-sentiments-student',
        { revision: 'main' }
      );
      
      this.isInitialized = true;
      console.log('🧠 AI Sentiment Model Loaded Successfully');
    } catch (error) {
      console.error('❌ Failed to load AI model:', error);
      throw new Error('Failed to initialize AI sentiment analysis');
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentScores> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Clean and prepare text
      const cleanText = text.trim().slice(0, 512); // Limit for performance
      
      if (!cleanText) {
        return this.getNeutralResult();
      }

      // Run AI inference
      const result = await this.pipeline(cleanText);
      const aiResult = Array.isArray(result) ? result[0] : result;

      // Map AI output to our format
      return this.mapAIResult(aiResult);
      
    } catch (error) {
      console.error('❌ AI sentiment analysis failed:', error);
      // Fallback to neutral if AI fails
      return this.getNeutralResult();
    }
  }

  private mapAIResult(aiResult: any): SentimentScores {
    const label = aiResult.label.toUpperCase();
    const score = aiResult.score;

    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let dominant: 'pos' | 'neg' | 'neu' = 'neu';

    // Map AI confidence scores to our format
    switch (label) {
      case 'POSITIVE':
        positive = score;
        negative = (1 - score) * 0.2; // Small negative component
        neutral = 1 - positive - negative;
        dominant = 'pos';
        break;
      case 'NEGATIVE':
        negative = score;
        positive = (1 - score) * 0.2; // Small positive component
        neutral = 1 - negative - positive;
        dominant = 'neg';
        break;
      default:
        neutral = score;
        positive = (1 - score) / 2;
        negative = (1 - score) / 2;
        dominant = 'neu';
    }

    return {
      positive: Math.round(positive * 100) / 100,
      negative: Math.round(negative * 100) / 100,
      neutral: Math.round(neutral * 100) / 100,
      compound: Math.round((positive - negative) * 100) / 100,
      dominant
    };
  }

  private getNeutralResult(): SentimentScores {
    return {
      positive: 0,
      negative: 0,
      neutral: 1,
      compound: 0,
      dominant: 'neu'
    };
  }
}

// Singleton instance
export const aiSentimentAnalyzer = new AISentimentAnalyzer();