const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin(email, role = 'admin') {
  console.log(`👑 Creating admin user: ${email}`)

  try {
    // Find user by email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching users:', authError.message)
      return
    }

    const user = authUsers.users.find(u => u.email === email)

    if (!user) {
      console.error('❌ User not found with email:', email)
      console.log('💡 Available users:')
      authUsers.users.forEach(u => console.log(`  - ${u.email}`))
      return
    }

    // Check if user is already an admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingAdmin) {
      console.log('⚠️  User is already an admin with role:', existingAdmin.role)
      return
    }

    // Create admin user
    const { data: newAdmin, error: createError } = await supabase
      .from('admin_users')
      .insert([
        {
          user_id: user.id,
          role: role,
          permissions: {},
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating admin user:', createError.message)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${email}`)
    console.log(`   Role: ${role}`)
    console.log(`   User ID: ${user.id}`)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function listAdmins() {
  console.log('👑 Current Admin Users:')
  console.log('========================')

  try {
    const { data: admins, error: adminError } = await supabase.from('admin_users').select(`
        *,
        users!inner(email)
      `)

    if (adminError) {
      console.error('❌ Error fetching admins:', adminError.message)
      return
    }

    if (admins.length === 0) {
      console.log('ℹ️  No admin users found')
      return
    }

    admins.forEach(admin => {
      console.log(`  - ${admin.users.email} (${admin.role})`)
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function listUsers() {
  console.log('👥 All Users:')
  console.log('==============')

  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching users:', authError.message)
      return
    }

    if (authUsers.users.length === 0) {
      console.log('ℹ️  No users found')
      return
    }

    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'})`)
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function main() {
  const command = process.argv[2]
  const email = process.argv[3]
  const role = process.argv[4] || 'admin'

  console.log('🔍 Admin Management Tool')
  console.log('========================')

  switch (command) {
    case 'create':
      if (!email) {
        console.error('❌ Email required: node create-admin.js create your@email.com [role]')
        process.exit(1)
      }
      await createAdmin(email, role)
      break

    case 'list':
      await listAdmins()
      break

    case 'users':
      await listUsers()
      break

    default:
      console.log('Usage:')
      console.log('  node create-admin.js create EMAIL [ROLE]  - Create admin user')
      console.log('  node create-admin.js list                 - List admin users')
      console.log('  node create-admin.js users                - List all users')
      console.log('')
      console.log('Examples:')
      console.log('  node create-admin.js create john@example.com admin')
      console.log('  node create-admin.js create jane@example.com super_admin')
      console.log('  node create-admin.js list')
  }
}

main().catch(console.error)
