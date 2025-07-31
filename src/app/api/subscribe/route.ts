import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, email } = await request.json();
    
    // Log the subscription for now
    console.log('New subscription:', { firstName, email, timestamp: new Date().toISOString() });
    
    // TODO: In production, you would:
    // 1. Store this in a database (e.g., PostgreSQL, MongoDB)
    // 2. Add to your email service (e.g., ConvertKit, Mailchimp, etc.)
    // 3. Send a welcome email
    // 4. Add to your CRM
    
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription successful',
      subscriber: { firstName, email }
    });
    
  } catch (error) {
    console.error('Error processing subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process subscription' },
      { status: 500 }
    );
  }
} 