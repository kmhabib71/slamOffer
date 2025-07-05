// Test script for batch generation API
const testBusinessContext = {
  businessType: "Online Fitness Coaching",
  targetMarket: "Busy professionals aged 25-45 who want to lose weight",
  mainProblem: "No time for gym, complicated diet plans, lack of accountability",
  revenueGoal: "$10,000/month"
}

async function testBatchGeneration() {
  try {
    console.log('Testing batch generation with context:', testBusinessContext)
    
    const response = await fetch('http://localhost:3000/api/generate-all-components', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessContext: testBusinessContext
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('\nAPI Response:', JSON.stringify(data, null, 2))
    
    if (data.success && data.data) {
      console.log('\n✅ SUCCESS: Generated all 11 components')
      console.log(`📊 Components generated: ${Object.keys(data.data).length}`)
      
      // Show summary of each component
      Object.entries(data.data).forEach(([componentId, component]) => {
        console.log(`\n${componentId}. ${component.componentName}: ${component.previewItems.length} items`)
        component.previewItems.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`)
        })
      })
    } else {
      console.log('❌ FAILED: Invalid response format')
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }
}

// Run the test
testBatchGeneration()
