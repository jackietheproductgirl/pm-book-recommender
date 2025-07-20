import { NextRequest, NextResponse } from 'next/server';
import { getBookRecommendations } from '@/lib/recommendations';
import { QuizAnswers } from '@/types/quiz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers }: { answers: QuizAnswers } = body;

    // Validate input
    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'Quiz answers are required' },
        { status: 400 }
      );
    }

    // Get recommendations using hybrid algorithm
    const recommendations = await getBookRecommendations(answers);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 