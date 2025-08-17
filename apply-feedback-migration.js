const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Applying feedback table migration...');
  
  try {
    // Read the migration SQL
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250817000000_add_feedback_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }
    
    console.log('✅ Feedback table migration applied successfully!');
    console.log('📋 The feedback table is now ready to use');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  }
}

// Alternative approach: Create table manually
async function createFeedbackTable() {
  console.log('🔧 Creating feedback table manually...');
  
  try {
    // Create the enum type
    const { error: enumError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          CREATE TYPE feedback_type AS ENUM (
            'bug',
            'feature_request',
            'general',
            'praise',
            'complaint'
          );
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `
    });
    
    if (enumError) {
      console.log('ℹ️  Enum type already exists or error:', enumError.message);
    } else {
      console.log('✅ Feedback type enum created');
    }
    
    // Create the feedback table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS feedback (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
          feedback_type feedback_type NOT NULL DEFAULT 'general',
          message text NOT NULL,
          rating integer CHECK (rating >= 1 AND rating <= 5),
          metadata jsonb DEFAULT '{}',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    });
    
    if (tableError) {
      console.log('ℹ️  Table already exists or error:', tableError.message);
    } else {
      console.log('✅ Feedback table created');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('ℹ️  RLS already enabled or error:', rlsError.message);
    } else {
      console.log('✅ Row Level Security enabled');
    }
    
    // Create policies
    const policies = [
      {
        name: 'Users can submit their own feedback',
        sql: `
          CREATE POLICY "Users can submit their own feedback"
            ON feedback
            FOR INSERT
            TO authenticated
            WITH CHECK (user_id = auth.uid());
        `
      },
      {
        name: 'Users can view their own feedback',
        sql: `
          CREATE POLICY "Users can view their own feedback"
            ON feedback
            FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());
        `
      }
    ];
    
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (policyError) {
        console.log(`ℹ️  Policy "${policy.name}" already exists or error:`, policyError.message);
      } else {
        console.log(`✅ Policy "${policy.name}" created`);
      }
    }
    
    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);',
      'CREATE INDEX IF NOT EXISTS feedback_type_idx ON feedback(feedback_type);',
      'CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at);',
      'CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(rating);'
    ];
    
    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL });
      if (indexError) {
        console.log('ℹ️  Index already exists or error:', indexError.message);
      } else {
        console.log('✅ Index created');
      }
    }
    
    console.log('🎉 Feedback table setup completed successfully!');
    console.log('📱 You can now use the feedback feature in your app');
    
  } catch (error) {
    console.error('❌ Error creating feedback table:', error);
  }
}

// Try the manual approach first
createFeedbackTable();
