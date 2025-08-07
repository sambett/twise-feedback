// Test script for sentiment analysis
// Run with: node test-sentiment.js

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Test cases for sentiment analysis
const testCases = [
  // English tests
  { text: "This workshop was absolutely amazing! I learned so much!", expected: "positive" },
  { text: "The event was terrible and poorly organized.", expected: "negative" },
  { text: "It was okay, nothing special really.", expected: "neutral" },
  { text: "Fantastic presentation! Really inspiring!", expected: "positive" },
  { text: "Waste of time. Very disappointing.", expected: "negative" },
  
  // French tests
  { text: "J'ai adoré cet événement! C'était fantastique!", expected: "positive" },
  { text: "C'était terrible et mal organisé.", expected: "negative" },
  { text: "C'était correct, rien de spécial.", expected: "neutral" },
  
  // Spanish tests
  { text: "¡Este evento fue increíble! ¡Me encantó!", expected: "positive" },
  { text: "Fue terrible y aburrido.", expected: "negative" },
  
  // Mixed language
  { text: "The food was délicieux and the ambiance was fantástico!", expected: "positive" }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testSentimentAnalysis() {
  console.log(`${colors.cyan}${colors.bright}
╔════════════════════════════════════════════════════════╗
║     Testing Sentiment Analysis API                        ║
╚════════════════════════════════════════════════════════╝${colors.reset}
`);
  
  console.log(`🔗 API URL: ${API_URL}`);
  console.log(`📊 Running ${testCases.length} test cases...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}/${testCases.length}: "${testCase.text.substring(0, 50)}..."`);
    
    try {
      const response = await fetch(`${API_URL}/api/sentiment/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: testCase.text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.result) {
        const sentiment = data.result.sentiment;
        const confidence = data.result.confidence;
        
        // Check if sentiment matches expected (loosely)
        const isCorrect = sentiment === testCase.expected || 
                         (testCase.expected === 'neutral' && confidence < 0.6);
        
        if (isCorrect) {
          console.log(`  ${colors.green}✅ PASS${colors.reset} - Sentiment: ${sentiment} (confidence: ${confidence?.toFixed(2)})`);
          passed++;
        } else {
          console.log(`  ${colors.red}❌ FAIL${colors.reset} - Expected: ${testCase.expected}, Got: ${sentiment}`);
          failed++;
        }
        
        if (data.result.language) {
          console.log(`     Language detected: ${data.result.language}`);
        }
        if (data.result.processingTime) {
          console.log(`     Processing time: ${data.result.processingTime}ms`);
        }
      } else {
        console.log(`  ${colors.red}❌ FAIL${colors.reset} - Invalid response structure`);
        failed++;
      }
      
    } catch (error) {
      console.log(`  ${colors.red}❌ ERROR${colors.reset} - ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  // Test batch analysis
  console.log(`${colors.cyan}Testing Batch Analysis...${colors.reset}`);
  try {
    const batchTexts = testCases.slice(0, 5).map(tc => tc.text);
    const response = await fetch(`${API_URL}/api/sentiment/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ texts: batchTexts })
    });
    
    const data = await response.json();
    if (data.success && data.results) {
      console.log(`  ${colors.green}✅ Batch analysis successful${colors.reset} - Analyzed ${data.count} texts`);
      passed++;
    } else {
      console.log(`  ${colors.red}❌ Batch analysis failed${colors.reset}`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${colors.red}❌ Batch test error${colors.reset} - ${error.message}`);
    failed++;
  }
  
  // Test feedback submission with sentiment
  console.log(`\n${colors.cyan}Testing Feedback Submission with Sentiment...${colors.reset}`);
  try {
    const feedbackData = {
      starRating: 5,
      activity: "Workshop",
      comment: "This was an incredible learning experience! Highly recommend!",
      eventId: "test_event_001",
      userName: "Test User"
    };
    
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedbackData)
    });
    
    const data = await response.json();
    if (data.success && data.data) {
      console.log(`  ${colors.green}✅ Feedback submitted successfully${colors.reset}`);
      console.log(`     ID: ${data.data.id}`);
      console.log(`     Sentiment: ${data.data.sentiment} (confidence: ${data.data.sentimentConfidence?.toFixed(2)})`);
      passed++;
    } else {
      console.log(`  ${colors.red}❌ Feedback submission failed${colors.reset}`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${colors.red}❌ Feedback test error${colors.reset} - ${error.message}`);
    failed++;
  }
  
  // Get statistics
  console.log(`\n${colors.cyan}Testing Statistics Endpoint...${colors.reset}`);
  try {
    const response = await fetch(`${API_URL}/api/feedback/stats`);
    const data = await response.json();
    
    if (data.success && data.stats) {
      console.log(`  ${colors.green}✅ Statistics retrieved successfully${colors.reset}`);
      console.log(`     Total feedback: ${data.stats.totalFeedback}`);
      console.log(`     Average rating: ${data.stats.averageRating}`);
      console.log(`     Sentiment breakdown:`, data.stats.sentimentBreakdown);
      passed++;
    } else {
      console.log(`  ${colors.red}❌ Statistics retrieval failed${colors.reset}`);
      failed++;
    }
  } catch (error) {
    console.log(`  ${colors.red}❌ Statistics test error${colors.reset} - ${error.message}`);
    failed++;
  }
  
  // Summary
  console.log(`\n${colors.cyan}${colors.bright}
╔════════════════════════════════════════════════════════╗
║                    TEST RESULTS                           ║
╚════════════════════════════════════════════════════════╝${colors.reset}`);
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n  Total Tests: ${total}`);
  console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`  Success Rate: ${percentage}%\n`);
  
  if (failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 All tests passed! The API is working correctly.${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Check the API logs for details.${colors.reset}\n`);
  }
}

// Run tests
console.log('Starting tests in 2 seconds (make sure the server is running)...\n');
setTimeout(() => {
  testSentimentAnalysis().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    console.log('\nMake sure the backend server is running on port 3001');
    console.log('Run: cd backend && npm run dev\n');
  });
}, 2000);
