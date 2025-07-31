import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { firstName, email } = await request.json();
    
    const subscription = { firstName, email, timestamp: new Date().toISOString() };
    
    // Log the subscription for now
    console.log('New subscription:', subscription);
    
    // Also write to a file for easy access
    const logPath = join(process.cwd(), 'subscriptions.log');
    appendFileSync(logPath, JSON.stringify(subscription) + '\n');
    
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