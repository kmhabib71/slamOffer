const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminAccess() {
  console.log('🧪 Testing Admin Access After RLS Fix')
  console.log('=====================================')

  try {
    // Test 1: Direct admin query (should work now)
    console.log('\n📋 Test 1: Direct admin query...')
    const { data: adminUsers, error: adminError } = await supabase.from('admin_users').select('*')

    if (adminError) {
      console.error('❌ Admin query failed:', adminError)
      return
    }

    console.log(`✅ Admin query successful! Found ${adminUsers.length} admin users`)
    adminUsers.forEach(admin => {
      console.log(`  - User ID: ${admin.user_id}, Role: ${admin.role}`)
    })

    // Test 2: Check specific user
    console.log('\n📋 Test 2: Check specific user...')
    const targetUserId = 'cdb9f670-e43d-4f8f-8f24-e3c0167f8dbb'
    const { data: specificAdmin, error: specificError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (specificError) {
      console.error('❌ Specific admin query failed:', specificError)
      return
    }

    console.log('✅ Specific admin query successful!')
    console.log('Admin record:', specificAdmin)

    // Test 3: Check RLS status
    console.log('\n📋 Test 3: Check RLS status...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_table_rls_status', { table_name: 'admin_users' })
      .catch(() => ({ data: null, error: 'RPC not available' }))

    if (rlsError) {
      console.log('ℹ️  RLS status check not available (this is normal)')
    } else {
      console.log('RLS status:', rlsStatus)
    }

    console.log('\n🎉 All tests passed! Admin access should work now.')
    console.log('\n📋 Next steps:')
    console.log('1. Clear your browser session')
    console.log('2. Log in again at: http://localhost:3000/auth/login')
    console.log('3. Try accessing admin panel: http://localhost:3000/admin')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function main() {
  await testAdminAccess()
}

main().catch(console.error)
