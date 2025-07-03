const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Supabase Debug & Diagnostic Tool')
console.log('====================================')

// Initialize clients
const anonClient = createClient(supabaseUrl, supabaseAnonKey)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function checkConnection() {
  console.log('\n🔌 Connection Status:')
  console.log('Project URL:', supabaseUrl)
  console.log(
    'Anon Key:',
    supabaseAnonKey ? `✅ Set (${supabaseAnonKey.substring(0, 20)}...)` : '❌ Missing'
  )
  console.log(
    'Service Key:',
    supabaseServiceKey ? `✅ Set (${supabaseServiceKey.substring(0, 20)}...)` : '❌ Missing'
  )
}

async function listTables() {
  console.log('\n📊 Database Tables:')

  try {
    // Query the information_schema to get table names
    const { data, error } = await adminClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (error) {
      console.log('❌ Error fetching tables:', error.message)
      return
    }

    if (data.length === 0) {
      console.log('⚠️  No tables found - database may not be initialized')
      console.log('💡 You may need to run migrations first')
      return
    }

    console.log(`✅ Found ${data.length} tables:`)
    data.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
  } catch (err) {
    console.log('❌ Connection error:', err.message)
    console.log('💡 Make sure your service role key is correct')
  }
}

async function testAuth() {
  console.log('\n🔐 Authentication Testing:')

  try {
    // Test current session
    const { data: session, error: sessionError } = await anonClient.auth.getSession()
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message)
    } else {
      console.log('✅ Session check:', session.session ? 'User logged in' : 'No active session')
      if (session.session) {
        console.log('  - User ID:', session.session.user.id)
        console.log('  - Email:', session.session.user.email)
      }
    }

    // Test auth config
    const { data: user, error: userError } = await anonClient.auth.getUser()
    if (userError) {
      console.log('❌ User fetch error:', userError.message)
    } else {
      console.log('✅ User data:', user.user ? 'Available' : 'Not logged in')
    }
  } catch (err) {
    console.log('❌ Auth test error:', err.message)
  }
}

async function testRLS() {
  console.log('\n🛡️  Row Level Security (RLS) Testing:')

  try {
    // Test with anonymous client (should respect RLS)
    console.log('📝 Testing with anonymous client...')
    const { data: anonData, error: anonError } = await anonClient
      .from('users')
      .select('count')
      .limit(1)

    if (anonError) {
      console.log('❌ Anonymous access error:', anonError.message)
      console.log('💡 This is expected if RLS is properly configured')
    } else {
      console.log('✅ Anonymous access successful')
      console.log('⚠️  This might indicate RLS is not properly configured')
    }

    // Test with service role (should bypass RLS)
    console.log('🔑 Testing with service role...')
    const { data: adminData, error: adminError } = await adminClient
      .from('users')
      .select('count')
      .limit(1)

    if (adminError) {
      console.log('❌ Service role access error:', adminError.message)
    } else {
      console.log('✅ Service role access successful')
    }
  } catch (err) {
    console.log('❌ RLS test error:', err.message)
  }
}

async function checkUsers() {
  console.log('\n👥 User Management:')

  try {
    // Get user count
    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select('id, email, subscription_tier, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (usersError) {
      console.log('❌ Users query error:', usersError.message)
      return
    }

    console.log(`✅ Found ${users.length} users (showing latest 10):`)
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.subscription_tier}) - ${user.created_at}`)
    })

    // Check auth.users table
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers()
    if (authError) {
      console.log('❌ Auth users error:', authError.message)
    } else {
      console.log(`✅ Auth users found: ${authUsers.users.length}`)
      authUsers.users.slice(0, 5).forEach(user => {
        console.log(`  - ${user.email} (${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'})`)
      })
    }
  } catch (err) {
    console.log('❌ User check error:', err.message)
  }
}

async function testPolicies() {
  console.log('\n📋 Database Policies:')

  try {
    // This requires a raw SQL query to access pg_policies
    const { data, error } = await adminClient.rpc('get_policies')

    if (error) {
      console.log('❌ Policy check error:', error.message)
      console.log('💡 Create a function to check policies or use SQL editor')
    } else {
      console.log('✅ Policies retrieved')
      console.log(data)
    }
  } catch (err) {
    console.log('❌ Policy test error:', err.message)
    console.log(
      '💡 You can check policies in the Supabase dashboard under Authentication > Policies'
    )
  }
}

async function suggestFixes() {
  console.log('\n💡 Debugging Suggestions:')
  console.log('========================')

  console.log('🔧 Common Authentication Issues:')
  console.log('  1. Check if users table exists and has proper RLS policies')
  console.log('  2. Verify JWT settings in Supabase dashboard')
  console.log('  3. Check if email confirmations are required')
  console.log('  4. Verify redirect URLs are correctly configured')

  console.log('\n🔧 Admin Access Issues:')
  console.log('  1. Check if admin users have proper roles/permissions')
  console.log('  2. Verify service role key has admin privileges')
  console.log('  3. Check if admin-specific tables/functions exist')
  console.log('  4. Verify RLS policies allow admin access')

  console.log('\n🔧 CLI Commands for Further Debugging:')
  console.log('  - npx supabase projects list')
  console.log('  - npx supabase gen types typescript --project-id foeeztuuxsjqozscjoak')
  console.log('  - node supabase-debug.js')
  console.log(
    '  - Check Supabase dashboard logs at https://supabase.com/dashboard/project/foeeztuuxsjqozscjoak'
  )
}

async function main() {
  await checkConnection()
  await listTables()
  await testAuth()
  await testRLS()
  await checkUsers()
  await testPolicies()
  await suggestFixes()

  console.log('\n✨ Debug complete! Check the output above for issues and suggestions.')
}

// Allow running specific tests
const command = process.argv[2]
switch (command) {
  case 'tables':
    listTables()
    break
  case 'auth':
    testAuth()
    break
  case 'users':
    checkUsers()
    break
  case 'rls':
    testRLS()
    break
  default:
    main()
}
