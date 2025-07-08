// Test script for batch generation API
const fetch = require('node-fetch')

const testBusinessContext = {
  businessType: 'Online Fitness Coaching',
  targetMarket: 'Busy professionals aged 25-45 who want to lose weight',
  mainProblem: 'No time for gym, complicated diet plans, lack of accountability',
  revenueGoal: '$10,000/month',
}

async function testBatchGeneration() {
  console.log('Starting batch generation test...')

  try {
    // Use environment variable or default to 3000
    const port = process.env.PORT || '3000'
    const baseUrl = `http://localhost:${port}`

    const response = await fetch(`${baseUrl}/api/generate-all-components`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessDescription:
          'A fitness coaching business that helps busy professionals lose weight and build muscle through personalized workout plans and nutrition guidance.',
        targetAudience:
          'Busy professionals aged 25-45 who want to get in shape but have limited time',
        mainProblem:
          'Lack of time and knowledge to create effective workout routines and meal plans',
        desiredOutcome: 'Lose 15-30 pounds and build lean muscle within 90 days',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Batch generation successful!')
    console.log('Generated components:', Object.keys(data))

    // Log a summary of each component
    Object.entries(data).forEach(([key, value]) => {
      console.log(`\n${key}:`, typeof value === 'string' ? value.substring(0, 100) + '...' : value)
    })
  } catch (error) {
    console.error('Error during batch generation:', error)
  }
}

// Run the test
testBatchGeneration()
