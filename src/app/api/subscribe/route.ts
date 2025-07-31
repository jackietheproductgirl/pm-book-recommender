import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { firstName, email } = await request.json();
    
    const subscription = { 
      first_name: firstName, 
      email, 
      timestamp: new Date().toISOString() 
    };
    
    // Log the subscription
    console.log('New subscription:', subscription);
    
    // Write to file only in development
    if (process.env.NODE_ENV === 'development') {
      const logPath = join(process.cwd(), 'subscriptions.log');
      appendFileSync(logPath, JSON.stringify(subscription) + '\n');
    }
    
    // Store in Supabase database
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscription]);
      
      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to store subscription' },
          { status: 500 }
        );
      }
      
      console.log('Stored in Supabase:', data);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with success even if DB fails (graceful degradation)
    }
    
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