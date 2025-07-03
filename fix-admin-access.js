const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminAccess() {
  console.log('🔧 Fixing Admin Access')
  console.log('======================')

  try {
    // Get the user from auth
    const {
      data: { users },
      error: authError,
    } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    const targetUser = users.find(u => u.email === 'km.habibs@gmail.com')

    if (!targetUser) {
      console.error('❌ User km.habibs@gmail.com not found in auth.users')
      return
    }

    console.log(`✅ Found user: ${targetUser.email} (${targetUser.id})`)

    // Check if admin_users table exists and has data
    const { data: adminUsers, error: adminError } = await supabase.from('admin_users').select('*')

    if (adminError) {
      console.error('❌ Error checking admin_users table:', adminError)
      console.log("💡 This might mean the table doesn't exist or has issues")
      return
    }

    console.log(`📊 Found ${adminUsers.length} admin users in table`)

    // Check if this user is already an admin
    const existingAdmin = adminUsers.find(admin => admin.user_id === targetUser.id)

    if (existingAdmin) {
      console.log('✅ User is already an admin!')
      console.log('Admin record:', existingAdmin)
      return
    }

    // Create admin user record
    console.log('📝 Creating admin user record...')

    const { data: newAdmin, error: createError } = await supabase
      .from('admin_users')
      .insert({
        user_id: targetUser.id,
        role: 'super_admin',
        permissions: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating admin user:', createError)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('New admin record:', newAdmin)

    // Verify the admin user was created
    const { data: verifyAdmin, error: verifyError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', targetUser.id)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying admin user:', verifyError)
      return
    }

    console.log('✅ Admin user verification successful!')
    console.log('Final admin record:', verifyAdmin)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

async function testAdminAccess() {
  console.log('\n🧪 Testing Admin Access')
  console.log('========================')

  try {
    // Test direct admin query
    const { data: adminUsers, error } = await supabase.from('admin_users').select('*')

    if (error) {
      console.error('❌ Admin query failed:', error)
      return
    }

    console.log(`✅ Admin query successful! Found ${adminUsers.length} admin users`)

    adminUsers.forEach(admin => {
      console.log(`  - User ID: ${admin.user_id}, Role: ${admin.role}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function main() {
  console.log('🚀 Admin Access Fix Tool')
  console.log('========================')

  await fixAdminAccess()
  await testAdminAccess()

  console.log('\n🎉 Fix complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Clear your browser session')
  console.log('2. Log in again at: http://localhost:3001/auth/login')
  console.log('3. Try accessing admin panel: http://localhost:3001/admin')
  console.log('4. You should now have admin access!')
}

main().catch(console.error)
