// Test script for warm outreach workflow
const fetch = require('node-fetch')

async function testWarmOutreach() {
  console.log('🧪 Testing Warm Outreach Workflow Integration...\n')

  // Test data
  const testData = {
    workflowType: 'warm-outreach',
    data: {
      userId: 'test-user-123',
      contacts: [
        {
          email: 'test1@example.com',
          name: 'John Doe',
          company: 'Test Company 1',
        },
        {
          email: 'test2@example.com',
          name: 'Jane Smith',
          company: 'Test Company 2',
        },
      ],
      message_template: 'Hi {{name}}, I wanted to reach out about your business at {{company}}...',
    },
  }

  try {
    // 1. Test direct n8n webhook
    console.log('1. Testing direct n8n webhook...')
    const n8nResponse = await fetch('http://localhost:5678/webhook/warm-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData.data),
    })

    console.log(`   n8n Response: ${n8nResponse.status} ${n8nResponse.statusText}`)

    // 2. Test Next.js API trigger (would need authentication in real use)
    console.log('\n2. Testing Next.js API trigger...')
    const apiResponse = await fetch('http://localhost:3000/api/n8n-workflows/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    })

    if (apiResponse.ok) {
      const result = await apiResponse.json()
      console.log('   API Response:', result)

      // 3. Test status check
      if (result.executionId) {
        console.log('\n3. Testing status check...')
        const statusResponse = await fetch(
          `http://localhost:3000/api/n8n-workflows/status?executionId=${result.executionId}`
        )

        if (statusResponse.ok) {
          const status = await statusResponse.json()
          console.log('   Status:', status)
        }
      }
    } else {
      console.log(`   API Error: ${apiResponse.status} ${apiResponse.statusText}`)
    }

    console.log('\n✅ Test completed! Check n8n execution logs for details.')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔍 Troubleshooting:')
    console.log('- Make sure n8n is running at http://localhost:5678')
    console.log('- Make sure your Next.js app is running at http://localhost:3000')
    console.log('- Check that the "warm-outreach" workflow is active in n8n')
    console.log('- Verify the webhook URL is correct')
  }
}

// Run the test
testWarmOutreach()
