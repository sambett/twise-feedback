import { NextResponse } from 'next/server';
import { db } from '../../../firebase';
import { ref, get } from 'firebase/database';

export async function GET() {
  try {
    const feedbackRef = ref(db, 'feedback');
    const snapshot = await get(feedbackRef);
    const data = snapshot.val();
    
    // Convert Firebase object to array with IDs
    const feedbackArray = data ? Object.entries(data).map(([id, value]) => ({
      id,
      ...value as {
        activity: string;
        rating: number;
        feedback: string;
        sentiment: 'pos' | 'neg' | 'neu' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
        timestamp: string;
      }
    })) : [];

    return NextResponse.json(feedbackArray);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}