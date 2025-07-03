const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigrations() {
  console.log('🚀 Applying database migrations...')

  try {
    // Read and execute the initial schema
    console.log('\n📄 Creating initial schema...')
    const initialSchema = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/001_initial_schema.sql'),
      'utf8'
    )

    // Execute the SQL through the dashboard URL
    console.log('✅ Initial schema loaded. Please apply it manually in the Supabase dashboard.')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql')

    // Create a consolidated script
    const allMigrations = [
      fs.readFileSync(path.join(__dirname, 'supabase/migrations/001_initial_schema.sql'), 'utf8'),
      fs.readFileSync(path.join(__dirname, 'supabase/migrations/002_pdf_designs.sql'), 'utf8'),
      fs.readFileSync(path.join(__dirname, 'setup_admin_tables.sql'), 'utf8'),
    ]

    const consolidatedSQL = `-- Grand Slam Generator - Complete Database Setup
-- Apply this in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql

${allMigrations.join('\n\n-- ============================================================================\n-- NEXT MIGRATION\n-- ============================================================================\n\n')}

-- Create default PDF templates
INSERT INTO public.pdf_design_templates (name, description, category, status, is_default) VALUES
  ('Modern Business', 'Clean and professional business template', 'business', 'published', true),
  ('Minimal Clean', 'Simple and elegant minimal design', 'minimal', 'published', false),
  ('Corporate Professional', 'Traditional corporate styling', 'corporate', 'published', false),
  ('Creative Bold', 'Eye-catching creative design', 'creative', 'published', false)
ON CONFLICT DO NOTHING;

-- Create default styles for templates
INSERT INTO public.pdf_design_styles (template_id, styles) 
SELECT id, '{
  "colors": {
    "primary": "#2563eb",
    "secondary": "#64748b",
    "accent": "#3b82f6",
    "text": "#1e293b",
    "background": "#ffffff"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter",
    "sizes": {
      "h1": "24px",
      "h2": "20px",
      "h3": "18px",
      "body": "14px"
    }
  },
  "spacing": {
    "margin": "20px",
    "padding": "16px"
  },
  "layout": {
    "pageSize": "A4",
    "orientation": "portrait"
  }
}' FROM public.pdf_design_templates
WHERE NOT EXISTS (SELECT 1 FROM public.pdf_design_styles WHERE template_id = public.pdf_design_templates.id);

-- Verify setup
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
`

    fs.writeFileSync('complete-database-setup.sql', consolidatedSQL)

    console.log('\n✅ Created complete-database-setup.sql')
    console.log('📋 Next steps:')
    console.log('   1. Open: https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak/sql')
    console.log('   2. Copy and paste the contents of complete-database-setup.sql')
    console.log('   3. Click "Run" to execute the script')
    console.log('   4. Run: npm run debug:supabase to verify')
    console.log('   5. Access admin panel at: http://localhost:3000/admin')
  } catch (error) {
    console.error('❌ Error creating migration script:', error.message)
  }
}

applyMigrations()
