import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function GET() {
  try {
    console.log('Testing database connection and featured stacks...');
    
    // Test basic connection
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('display_name, is_featured, is_verified')
      .eq('is_featured', true);

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch profiles',
        details: profileError 
      }, { status: 500 });
    }

    const { data: stacks, error: stackError } = await supabase
      .from('stacks')
      .select('stack_name, is_featured, source_title')
      .eq('is_featured', true);

    if (stackError) {
      console.error('Stack error:', stackError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch stacks',
        details: stackError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        featured_profiles: profiles,
        featured_stacks: stacks
      }
    });

  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 