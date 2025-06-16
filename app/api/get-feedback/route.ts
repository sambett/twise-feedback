import { NextResponse } from 'next/server';
import { db } from '@/app/firebase';
import { ref, get } from 'firebase/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    let feedbackRef;
    if (eventId) {
      // Get feedback for specific event
      feedbackRef = ref(db, `events/${eventId}/feedback`);
    } else {
      // Fallback: get feedback from old structure for backward compatibility
      feedbackRef = ref(db, 'feedback');
    }
    
    const snapshot = await get(feedbackRef);
    const data = snapshot.val();
    
    // Convert Firebase object to array with IDs
    const feedbackArray = data ? Object.entries(data).map(([id, value]) => ({
      id,
      ...value as {
        activity: string;
        rating: number;
        feedback: string;
        sentiment: 'pos' | 'neg' | 'neu';
        timestamp: string;
        eventId?: string;
      }
    })) : [];

    return NextResponse.json(feedbackArray);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}