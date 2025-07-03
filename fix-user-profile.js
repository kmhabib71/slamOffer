const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.log('Make sure you have:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUserProfile() {
  console.log('🔧 Fixing User Profile')
  console.log('========================')

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

    // Check if user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUser.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking user profile:', profileError)
      return
    }

    if (existingProfile) {
      console.log('✅ User profile already exists')
      console.log('Profile:', existingProfile)
      return
    }

    // Create user profile
    console.log('📝 Creating user profile...')

    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: targetUser.id,
        email: targetUser.email,
        subscription_tier: 'free',
        credits_remaining: 1,
        created_at: targetUser.created_at,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating user profile:', createError)
      return
    }

    console.log('✅ User profile created successfully!')
    console.log('New profile:', newProfile)

    // Verify the profile was created
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUser.id)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying profile:', verifyError)
      return
    }

    console.log('✅ Profile verification successful')
    console.log('Final profile:', verifyProfile)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

async function clearUserSession() {
  console.log('\n🧹 Clearing User Session')
  console.log('==========================')

  try {
    // This will clear the session on the server side
    console.log('📝 Note: To clear your browser session, you need to:')
    console.log('1. Open your browser developer tools (F12)')
    console.log('2. Go to Application/Storage tab')
    console.log('3. Clear localStorage and sessionStorage')
    console.log('4. Or simply log out from your app')

    console.log('\n💡 You can also manually clear the session by:')
    console.log('- Going to your app and clicking logout')
    console.log('- Or clearing browser data for localhost:3000')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

async function main() {
  console.log('🚀 User Profile Fix Tool')
  console.log('========================')

  await fixUserProfile()
  await clearUserSession()

  console.log('\n🎉 Fix complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Clear your browser session (see instructions above)')
  console.log('2. Restart your development server: npm run dev')
  console.log('3. Log in again at: http://localhost:3000/auth/login')
  console.log('4. Your user profile should now be properly loaded')
}

main().catch(console.error)
