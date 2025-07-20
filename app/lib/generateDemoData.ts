// Demo data generator script - Run this once to populate your Firebase with sample data

import { ref, push } from 'firebase/database';
import { db } from '../firebase';

// Sample feedback data for different events
const sampleFeedback = {
  'twise-night': [
    {
      activity: 'AI Workshop & Innovation',
      rating: 5,
      feedback: 'Amazing workshop! Learned so much about neural networks and their applications.',
      sentiment: 'pos',
      timestamp: '2025-06-16T14:30:00Z'
    },
    {
      activity: 'Healthcare & Biotech',
      rating: 4,
      feedback: 'Very interesting presentations on medical AI. Would love to see more hands-on demos.',
      sentiment: 'pos',
      timestamp: '2025-06-16T14:45:00Z'
    },
    {
      activity: 'Quantum Computing Demo',
      rating: 5,
      feedback: 'Mind-blowing! The quantum supremacy examples were fascinating.',
      sentiment: 'pos',
      timestamp: '2025-06-16T15:00:00Z'
    },
    {
      activity: 'Environmental Projects',
      rating: 4,
      feedback: 'Great to see AI being used for climate solutions. Very inspiring!',
      sentiment: 'pos',
      timestamp: '2025-06-16T15:15:00Z'
    }
  ],
  
  'sam-wedding': [
    {
      activity: 'Venue & Decoration',
      rating: 5,
      feedback: 'Absolutely gorgeous venue! The decorations were perfect and so elegant.',
      sentiment: 'pos',
      timestamp: '2025-06-16T18:00:00Z'
    },
    {
      activity: 'Food & Catering',
      rating: 5,
      feedback: 'The food was incredible! Best wedding meal I have ever had.',
      sentiment: 'pos',
      timestamp: '2025-06-16T18:30:00Z'
    },
    {
      activity: 'Music & Entertainment',
      rating: 4,
      feedback: 'Great DJ! Music selection was perfect for dancing.',
      sentiment: 'pos',
      timestamp: '2025-06-16T19:00:00Z'
    },
    {
      activity: 'Photography & Videography',
      rating: 5,
      feedback: 'The photographers were amazing! They captured every special moment beautifully.',
      sentiment: 'pos',
      timestamp: '2025-06-16T19:30:00Z'
    }
  ],
  
  'techflow-demo': [
    {
      activity: 'User Interface Design',
      rating: 4,
      feedback: 'Clean and intuitive UI. The user experience flows really well.',
      sentiment: 'pos',
      timestamp: '2025-06-16T16:00:00Z'
    },
    {
      activity: 'Core Features & Functionality',
      rating: 5,
      feedback: 'Powerful features! The automation capabilities are impressive.',
      sentiment: 'pos',
      timestamp: '2025-06-16T16:15:00Z'
    },
    {
      activity: 'Performance & Speed',
      rating: 3,
      feedback: 'Good performance overall, but could be faster on mobile devices.',
      sentiment: 'neu',
      timestamp: '2025-06-16T16:30:00Z'
    },
    {
      activity: 'Pricing Strategy',
      rating: 3,
      feedback: 'The pricing seems a bit high for small businesses. Consider tiered pricing.',
      sentiment: 'neu',
      timestamp: '2025-06-16T16:45:00Z'
    }
  ]
};

// Function to generate demo data
export async function generateDemoData() {
  try {
    console.log('🚀 Generating demo data...');
    
    for (const [eventId, feedbacks] of Object.entries(sampleFeedback)) {
      console.log(`📝 Adding feedback for ${eventId}...`);
      
      for (const feedback of feedbacks) {
        const feedbackRef = ref(db, `events/${eventId}/feedback`);
        await push(feedbackRef, feedback);
      }
    }
    
    console.log('✅ Demo data generated successfully!');
    console.log('You can now view your dashboards at:');
    console.log('- TWISE Night: /admin/twise-night');
    console.log('- Sam\'s Wedding: /admin/sam-wedding'); 
    console.log('- TechFlow Demo: /admin/techflow-demo');
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
  }
}

// Uncomment the line below and run this script to generate demo data
// generateDemoData();