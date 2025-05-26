import { NextResponse } from 'next/server';
import { supabase } from '../../supabase';

export async function GET() {
  try {
    console.log('Checking database structure...');
    
    // Check what tables exist
    const { data: tables, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        ` 
      });

    if (tableError) {
      console.error('Table check error:', tableError);
    }

    // Check supplements table structure
    const { data: supplements, error: suppError } = await supabase
      .from('supplements')
      .select('*')
      .limit(1);

    // Try to check user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      tables: tables || 'Unable to fetch tables',
      supplements_test: { 
        success: !suppError, 
        error: suppError?.message,
        data: supplements 
      },
      profiles_test: { 
        success: !profileError, 
        error: profileError?.message,
        data: profiles 
      }
    });

  } catch (error) {
    console.error('Database check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 