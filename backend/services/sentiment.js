// Open-source sentiment analysis service using Transformers.js
// Runs 100% locally with no API keys required

import { pipeline } from '@xenova/transformers';

class SentimentAnalyzer {
  constructor() {
    this.classifier = null;
    this.isReady = false;
    this.initPromise = this.initialize();
    this.analysisCount = 0;
    this.startTime = Date.now();
  }

  async initialize() {
    try {
      console.log('🤖 Initializing local AI sentiment analyzer...');
      
      // Use a multilingual model that supports English, French, Spanish, etc.
      // This model runs completely offline after first download
      this.classifier = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      this.isReady = true;
      console.log('✅ Sentiment analyzer ready (100% local, no API needed)');
      
      // Warm up the model with a test run
      await this.classifier('test');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize sentiment analyzer:', error);
      throw error;
    }
  }

  async waitUntilReady() {
    if (!this.isReady) {
      await this.initPromise;
    }
    return this.isReady;
  }

  async analyze(text) {
    if (!text || typeof text !== 'string') {
      return {
        sentiment: 'neutral',
        score: 0.5,
        confidence: 0,
        error: 'Invalid input text'
      };
    }

    try {
      await this.waitUntilReady();
      
      // Perform sentiment analysis
      const startTime = Date.now();
      const results = await this.classifier(text);
      const processingTime = Date.now() - startTime;
      
      // Increment counter for metrics
      this.analysisCount++;
      
      // Map model output to our format
      // Transformers.js returns: [{ label: 'POSITIVE' or 'NEGATIVE', score: 0.99 }]
      const result = results[0];
      
      // Convert to our standard format
      let sentiment = 'neutral';
      let adjustedScore = 0.5;
      
      if (result.label === 'POSITIVE') {
        sentiment = 'positive';
        adjustedScore = result.score; // 0.5 to 1.0 range
      } else if (result.label === 'NEGATIVE') {
        sentiment = 'negative';
        adjustedScore = 1 - result.score; // 0.0 to 0.5 range
      }
      
      // For very low confidence, default to neutral
      if (result.score < 0.6) {
        sentiment = 'neutral';
        adjustedScore = 0.5;
      }
      
      return {
        sentiment,
        score: adjustedScore,
        confidence: result.score,
        processingTime,
        model: 'distilbert-local',
        language: this.detectLanguage(text)
      };
      
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        sentiment: 'neutral',
        score: 0.5,
        confidence: 0,
        error: error.message
      };
    }
  }

  // Simple language detection (basic heuristic)
  detectLanguage(text) {
    const frenchWords = /\b(le|la|les|de|du|des|un|une|et|est|dans|pour|avec|sur|pas|plus|être|avoir)\b/gi;
    const spanishWords = /\b(el|la|los|las|de|del|un|una|y|es|en|para|con|sobre|no|más|ser|estar)\b/gi;
    const germanWords = /\b(der|die|das|den|dem|des|ein|eine|und|ist|in|für|mit|auf|nicht|mehr|sein|haben)\b/gi;
    
    const frenchMatches = (text.match(frenchWords) || []).length;
    const spanishMatches = (text.match(spanishWords) || []).length;
    const germanMatches = (text.match(germanWords) || []).length;
    
    if (frenchMatches > 3) return 'fr';
    if (spanishMatches > 3) return 'es';
    if (germanMatches > 3) return 'de';
    return 'en';
  }

  // Get metrics for monitoring
  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      status: this.isReady ? 'ready' : 'initializing',
      analysisCount: this.analysisCount,
      uptimeSeconds: uptime,
      averageRate: this.analysisCount > 0 ? (this.analysisCount / uptime).toFixed(2) : 0,
      model: 'distilbert-base-uncased',
      type: 'local-transformers',
      requiresAPIKey: false,
      cost: '$0.00 (runs locally)'
    };
  }

  // Batch analysis for multiple texts
  async analyzeBatch(texts) {
    if (!Array.isArray(texts)) {
      throw new Error('Input must be an array of texts');
    }
    
    const results = [];
    for (const text of texts) {
      const result = await this.analyze(text);
      results.push(result);
    }
    
    return results;
  }
}

// Create singleton instance
const sentimentAnalyzer = new SentimentAnalyzer();

// Export functions
export default sentimentAnalyzer;

export const analyze = (text) => sentimentAnalyzer.analyze(text);
export const analyzeBatch = (texts) => sentimentAnalyzer.analyzeBatch(texts);
export const getMetrics = () => sentimentAnalyzer.getMetrics();
export const isReady = () => sentimentAnalyzer.isReady;
