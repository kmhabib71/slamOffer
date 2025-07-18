import OpenAI from 'openai'
import { PreviewRequest, PreviewResponse, COMPONENT_NAMES, ComponentId } from '../types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Global request counter to track OpenAI usage
let globalRequestCounter = 0
let globalTokenUsage = 0

function trackOpenAIRequest(functionName: string, tokens: number) {
  globalRequestCounter++
  globalTokenUsage += tokens
  console.log(`🌍 GLOBAL OPENAI STATS - Request #${globalRequestCounter}`)
  console.log(`💰 Total tokens used in session: ${globalTokenUsage}`)
  console.log(`📊 Function: ${functionName}`)
  console.log('---')
}

const SYSTEM_PROMPT = `You are an expert in Alex Hormozi's $100M Offers methodology. You understand the complete framework:

**VALUE EQUATION:** Value = (Dream Outcome × Perceived Likelihood) ÷ (Time Delay + Effort & Sacrifice)

**CORE PRINCIPLES:**
1. Dream Outcome - Specific, measurable transformation ("lose 20lbs in 6 weeks" not "get healthier")
2. Perceived Likelihood - Built through proof, guarantees, addressing "too good to be true" objections
3. Time Delay - Minimize time between purchase and benefit (include short-term wins)
4. Effort & Sacrifice - Make it "Done For You" > "Done With You" > "Do It Yourself"

**GRAND SLAM OFFER FRAMEWORK:**
1. Dream Outcome Identification - Ultimate transformation destination
2. Problems & Obstacles - Everything preventing achievement (before, during, after)
3. Solutions List - Transform each problem into "How to..." solutions
4. Solutions Delivery Vehicles - Various ways to deliver (1-on-1, group, scalable)
5. Trim & Stack - Remove high-cost/low-value, keep high-value items
6. High-Value Bundle - Irresistible package that makes competition impossible
7. Scarcity - Limited quantity, time, access, or cohort-based
8. Urgency - Deadline pressure with real consequences
9. Bonuses - Value-stacking that eclipses core offer value
10. Guarantees - Complete risk reversal (money-back, performance-based)
11. Naming - M.A.G.I.C. formula (Magnetic reason, Avatar, Goal, Interval, Container)

**GENERATION RULES:**
- Generate 3 specific, high-value items per component
- For Solutions List component (id: 3), each item must have a linked problem and solution format
- Use concrete numbers, timeframes, and outcomes
- Focus on transformation and results, not features
- Make each item directly impact the value equation
- Create urgency and scarcity in language
- Address specific customer obstacles and desires

For Solutions List component, format each item as:
{
  "title": "Solution Title - Main Benefit",
  "description": "Problem: [Full problem description from Problems List] | Solution: [Clear solution explanation]",
  "value": "Monetary value",
  "linkedProblem": "[Full problem description from Problems List]",
  "solutionDetails": "[Clear solution explanation]",
  "priority": "high/medium/low"
}`

// OPTIMIZED PREVIEW GENERATION - Generates 3 items for ALL 11 components in single API call
export async function generatePreview(businessContext: {
  businessDescription: string
}): Promise<Record<ComponentId, PreviewResponse>> {
  console.log('🚀 OPENAI REQUEST START - generatePreview')
  console.log('📊 Expected tokens: 5,000 MAX')
  console.log('🎯 Function: generatePreview (ALL 11 components preview)')
  console.log('📝 Business context length:', businessContext.businessDescription?.length || 0)

  try {
    // Single optimized prompt for all 11 components with 3 items each (max 5000 tokens)
    const batchPrompt = `Generate a comprehensive Grand Slam Offer preview for this business:

Business Description:
${businessContext.businessDescription}

Generate EXACTLY 3 high-impact preview items for each of the 11 components below. Follow Hormozi's Value Equation framework:
Value = (Dream Outcome × Perceived Likelihood) ÷ (Time Delay + Effort & Sacrifice)

Components to generate (3 items each):
1. Dream Outcome Identification - Ultimate transformation customers want
2. Problems & Obstacles List - What prevents achievement
3. Solutions List - How to overcome each problem
4. Solutions Delivery Vehicles - How you'll deliver solutions
5. Trim & Stack - High-value, low-cost optimizations
6. Ultimate High-Value Deliverable Bundle - Irresistible package
7. Scarcity - Limited supply elements
8. Urgency - Time-based pressure
9. Bonuses - Value-stacking additions
10. Guarantees - Risk reversal elements
11. Naming - Magnetic offer names

CRITICAL: Generate compelling preview content that makes users want to unlock the full version with 30-50 items per component.

Format as JSON with this exact structure:
{
  "components": {
    "1": {
      "componentName": "Dream Outcome Identification",
      "previewItems": [
        {"title": "Specific outcome title", "description": "How it impacts value equation", "value": "$X value"}
      ],
      "totalItemsAvailable": 12,
      "unlockCTA": "Custom urgency CTA"
    },
    "2": {
      "componentName": "Problems & Obstacles List",
      "previewItems": [
        {"title": "Problem title", "description": "Problem description", "value": "$X value"}
      ],
      "totalItemsAvailable": 35,
      "unlockCTA": "Custom urgency CTA"
    },
    "3": {
      "componentName": "Solutions List",
      "previewItems": [
        {"title": "Solution title", "description": "Solution description", "value": "$X value"}
      ],
      "totalItemsAvailable": 35,
      "unlockCTA": "Custom urgency CTA"
    },
    "4": {
      "componentName": "Solutions Delivery Vehicles",
      "previewItems": [
        {"title": "Delivery title", "description": "Delivery description", "value": "$X value"}
      ],
      "totalItemsAvailable": 17,
      "unlockCTA": "Custom urgency CTA"
    },
    "5": {
      "componentName": "Trim & Stack",
      "previewItems": [
        {"title": "Optimization title", "description": "Optimization description", "value": "$X value"}
      ],
      "totalItemsAvailable": 8,
      "unlockCTA": "Custom urgency CTA"
    },
    "6": {
      "componentName": "Ultimate High-Value Bundle",
      "previewItems": [
        {"title": "Bundle title", "description": "Bundle description", "value": "$X value"}
      ],
      "totalItemsAvailable": 12,
      "unlockCTA": "Custom urgency CTA"
    },
    "7": {
      "componentName": "Scarcity",
      "previewItems": [
        {"title": "Scarcity title", "description": "Scarcity description", "value": "$X value"}
      ],
      "totalItemsAvailable": 6,
      "unlockCTA": "Custom urgency CTA"
    },
    "8": {
      "componentName": "Urgency",
      "previewItems": [
        {"title": "Urgency title", "description": "Urgency description", "value": "$X value"}
      ],
      "totalItemsAvailable": 8,
      "unlockCTA": "Custom urgency CTA"
    },
    "9": {
      "componentName": "Bonuses",
      "previewItems": [
        {"title": "Bonus title", "description": "Bonus description", "value": "$X value"}
      ],
      "totalItemsAvailable": 15,
      "unlockCTA": "Custom urgency CTA"
    },
    "10": {
      "componentName": "Guarantees",
      "previewItems": [
        {"title": "Guarantee title", "description": "Guarantee description", "value": "$X value"}
      ],
      "totalItemsAvailable": 8,
      "unlockCTA": "Custom urgency CTA"
    },
    "11": {
      "componentName": "Naming",
      "previewItems": [
        {"title": "Name title", "description": "Name description", "value": "$X value"}
      ],
      "totalItemsAvailable": 6,
      "unlockCTA": "Custom urgency CTA"
    }
  }
}`

    console.log('⚡ Making OpenAI API call...')
    const startTime = Date.now()
    console.log('before offer generation - businessContext:', businessContext)

    console.log('after offer generation')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-efficient model for previews
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        { role: 'user', content: batchPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 5000, // Maximum allowed for high-value preview
    })
    // const completion = {
    //   choices: [
    //     {
    //       message: {
    //         content: JSON.stringify({
    //           components: {
    //             '1': {
    //               componentName: 'Dream Outcome Identification',
    //               previewItems: [
    //                 {
    //                   title: 'Achieve 6-Figure Revenue',
    //                   description: 'Transform your business to hit $100K+ annually',
    //                   value: '$5,000',
    //                 },
    //                 {
    //                   title: 'Double Your Client Base',
    //                   description: 'Grow from 50 to 100 clients in 6 months',
    //                   value: '$3,000',
    //                 },
    //                 {
    //                   title: 'Launch New Product Line',
    //                   description: 'Expand offerings with a new service or product',
    //                   value: '$4,000',
    //                 },
    //               ],
    //               totalItemsAvailable: 12,
    //               unlockCTA: 'Unlock more dream outcomes →',
    //             },
    //             // ... other components with similar structure
    //           },
    //         }),
    //       },
    //     },
    //   ],
    // }

    const endTime = Date.now()
    console.log('✅ OPENAI REQUEST COMPLETE - generatePreview')
    console.log('🎯 Actual tokens used:', completion.usage?.total_tokens || 'unknown')
    console.log('⏱️ Request duration:', endTime - startTime, 'ms')
    console.log('📊 Token breakdown:', {
      prompt: completion.usage?.prompt_tokens || 'unknown',
      completion: completion.usage?.completion_tokens || 'unknown',
      total: completion.usage?.total_tokens || 'unknown',
    })

    // Track this request globally
    trackOpenAIRequest('generatePreview', completion.usage?.total_tokens || 0)

    const response = JSON.parse(completion.choices[0].message.content || '{}')

    if (!response.components) {
      throw new Error('Invalid batch response format from OpenAI')
    }

    // Transform to expected format
    const result: Record<ComponentId, PreviewResponse> = {} as any

    for (let i = 1; i <= 11; i++) {
      const componentId = i as ComponentId
      const componentData = response.components[i.toString()]

      if (componentData) {
        result[componentId] = {
          componentName: COMPONENT_NAMES[componentId],
          previewItems: componentData.previewItems || [],
          totalItemsAvailable: componentData.totalItemsAvailable || 12,
          unlockCTA:
            componentData.unlockCTA ||
            `Unlock ${(componentData.totalItemsAvailable || 12) - 3} more strategies →`,
        }
      } else {
        // Fallback for missing components
        result[componentId] = {
          componentName: COMPONENT_NAMES[componentId],
          previewItems: [],
          totalItemsAvailable: 12,
          unlockCTA: 'Unlock full component →',
        }
      }
    }

    return result
  } catch (error) {
    console.error('Error in preview generation:', error)
    throw error
  }
}

// Complete Grand Slam Offer Generation - Premium version
export async function generateCompleteGrandSlamOffer(
  request: import('../types').CompleteOfferRequest
): Promise<import('../types').CompleteGrandSlamOffer> {
  const { businessContext, userTier, generateComplete = false } = request

  console.log('🚀 OPENAI REQUEST START - generateCompleteGrandSlamOffer')
  console.log('👤 User tier:', userTier)
  console.log('🎯 Generate complete:', generateComplete)
  console.log('📝 Business context length:', businessContext.businessDescription?.length || 0)
  //stop execution before making api call to test the function by something like returning a mock response
  // add return and stop  next code execution

  try {
    const isProUser = userTier === 'pro' && generateComplete

    console.log('🔥 Is Pro User:', isProUser)
    console.log('📊 Expected tokens:', isProUser ? '16,000 MAX' : '4,000 MAX')
    console.log('before offer generation - businessContext:', businessContext)
    return {
      _id: `offer-mock-${Date.now()}`,
      user_id: 'mock-user',
      businessContext,
      components: [],
      totalOfferValue: '$100,000+',
      createdAt: new Date(),
      metadata: {
        tokenUsage: 0,
        generationTime: 0,
        model: 'mock',
      },
    }
    console.log('after offer generation')
    // Generate dynamic item counts for variation - AI will choose between 30-50 for problems and solutions
    const generateDynamicCount = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min

    // Realistic component item counts based on Hormozi methodology
    const componentItemCounts = {
      1: isProUser ? 12 : 3, // Dream Outcomes
      2: isProUser ? generateDynamicCount(30, 50) : 3, // Problems (dynamic 30-50)
      3: isProUser ? generateDynamicCount(30, 50) : 3, // Solutions (dynamic 30-50)
      4: isProUser ? 17 : 3, // Delivery Vehicles
      5: isProUser ? 8 : 3, // Trim & Stack (optimization)
      6: isProUser ? 12 : 3, // Value Bundle
      7: isProUser ? 6 : 3, // Scarcity
      8: isProUser ? 8 : 3, // Urgency
      9: isProUser ? 15 : 3, // Bonuses
      10: isProUser ? 8 : 3, // Guarantees
      11: isProUser ? 6 : 3, // Naming
    }

    // Add full 30% context for Pro users
    const hormoziContext = isProUser
      ? `
## COMPLETE HORMOZI $100M OFFERS METHODOLOGY

### VALUE EQUATION FOUNDATION
Value = (Dream Outcome × Perceived Likelihood of Achievement) ÷ (Time Delay + Effort & Sacrifice)

**Four Value Drivers:**
1. Dream Outcome (Increase) - Specific, measurable transformation ("lose 20lbs in 6 weeks" not "get healthier")
2. Perceived Likelihood (Increase) - Built through proof, testimonials, addressing "too good to be true" objections  
3. Time Delay (Decrease) - Minimize time between purchase and benefit (include short-term wins)
4. Effort & Sacrifice (Decrease) - Make it "Done For You" > "Done With You" > "Do It Yourself"

### COMPLETE 5-STEP FRAMEWORK

**Step 1: Dream Outcome Identification**
- Focus on destination, not journey ("sell vacation, not plane flight")
- Must be specific, measurable, emotional
- Examples: "Generate first $100K in 90 days" vs "make more money"

**Step 2: Problems & Obstacles (Before/During/After)**
- Think customer experience sequence in insane detail
- 32-64+ specific problem scenarios across 4 value drivers:
  * Dream Outcome → "This won't be financially worth it"
  * Likelihood → "Won't work for me specifically/can't stick with it"
  * Effort & Sacrifice → "Too hard, confusing, won't like it"
  * Time → "Takes too long, too busy, not convenient"

**Step 3: Solutions List**
- Transform each problem into "How to..." solutions
- Address every single obstacle identified
- Make solutions specific and benefit-focused

**Step 4: Solutions Delivery Vehicles**
- Personal Attention: 1-on-1, Small Group, 1-to-Many
- Effort Level: DIY, DWY (Done With You), DFY (Done For You)
- Medium: In-person, phone, email, text, video, audio, written
- Response Time: 24/7, business hours, within minutes/hours/days
- Use 10x/1x test for creative thinking

**Step 5: Trim & Stack**
- Remove high-cost, low-value first
- Remove low-cost, low-value second  
- Keep high-value items (both high-cost and low-cost)
- Focus on "one-to-many" solutions for scalability

### OFFER ENHANCEMENT (6 Additional Components)

**Scarcity Types:**
- Limited Supply of Seats/Slots
- Limited Supply of Bonuses
- Never Available Again
- Use honest scarcity based on actual capacity

**Urgency Tactics:**
- Rolling Cohorts ("Start Monday or wait")
- Seasonal Urgency (Holiday/event deadlines)
- Pricing Urgency (Limited-time discounts)
- Exploding Opportunity (Time-sensitive arbitrage)

**Bonus Strategy:**
- Address specific concerns/obstacles with targeted bonuses
- Explain how you discovered/created each bonus
- Make bonus value eclipse core offer value
- Include tools, checklists, templates over training

**Guarantee Types:**
- Unconditional (No questions asked refunds)
- Conditional (Performance-based with requirements)
- Anti-Guarantees (All sales final with reasoning)
- Implied (Performance/revenue share models)

**M.A.G.I.C. Naming Formula:**
- Magnetic Reason Why (Free, discount, event hook)
- Avatar (Specific target audience)
- Goal (Clear dream outcome)
- Interval (Timeframe for achievement)
- Container (Blueprint, challenge, system, intensive)

### SALES TO FULFILLMENT CONTINUUM
- Easy to sell = Hard to fulfill
- Easy to fulfill = Hard to sell  
- Mantra: "Create flow. Monetize flow. Then add friction."
- Over-deliver initially, optimize for efficiency later
`
      : ''

    const completePrompt = `${hormoziContext}

Generate a complete Grand Slam Offer for this business:

Business Description:
${businessContext.businessDescription}

${
  isProUser
    ? `
PRO USER - COMPREHENSIVE GENERATION:
Generate the exact number of items specified for each component with detailed implementation strategies, specific examples, and actionable steps.
For the Solutions List component (3), each item must follow this format:
- Title: Clear benefit or outcome
- Problem: Use the FULL problem description from the Problems List, not just the title
- Solution: Clear, actionable solution that directly addresses the problem
`
    : `
FREE USER - PREVIEW GENERATION:
Generate 3 high-impact preview items per component that demonstrate value and create curiosity for the full version.
For the Solutions List component (3), each preview must use the complete problem description from the Problems List.
`
}

Generate components with these exact item counts:
1. Dream Outcome Identification (${componentItemCounts[1]} items) - Specific, measurable transformation outcomes
2. Problems & Obstacles List (${componentItemCounts[2]} items) - Everything preventing achievement (before/during/after) [AI-selected count between 30-50]
3. Solutions List (${componentItemCounts[3]} items) - "How to" solutions for every problem [AI-selected count between 30-50]
4. Solutions Delivery Vehicles (${componentItemCounts[4]} items) - Scalable ways to deliver solutions
5. Trim & Stack (${componentItemCounts[5]} items) - High-value, low-cost optimization
6. Ultimate High-Value Deliverable Bundle (${componentItemCounts[6]} items) - Irresistible package creation
7. Scarcity (${componentItemCounts[7]} items) - Limited supply/access elements
8. Urgency (${componentItemCounts[8]} items) - Time-based pressure tactics
9. Bonuses (${componentItemCounts[9]} items) - Value-stacking additions
10. Guarantees (${componentItemCounts[10]} items) - Risk reversal strategies
11. Naming (${componentItemCounts[11]} items) - M.A.G.I.C. formula implementation

CRITICAL: You MUST generate ALL 11 components with the exact item counts specified. Do not skip any components.

Format as JSON with this EXACT structure:
{
  "components": {
    "1": {
      "componentName": "Dream Outcome Identification",
      "description": "Component description",
      "items": [
        {
          "id": "1-1",
          "title": "Specific outcome title",
          "description": "Detailed description with actionable steps",
          "value": "$2,000",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$10,000",
      "totalAvailable": ${componentItemCounts[1]}
    },
    "2": {
      "componentName": "Problems & Obstacles List",
      "description": "Component description",
      "items": [
        {
          "id": "2-1",
          "title": "Problem title",
          "description": "Problem description",
          "value": "$1,500",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$15,000",
      "totalAvailable": ${componentItemCounts[2]}
    },
    "3": {
      "componentName": "Solutions List",
      "description": "Component description",
      "items": [
        {
          "id": "3-1",
          "title": "Solution title",
          "description": "Solution description",
          "value": "$3,000",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$20,000",
      "totalAvailable": ${componentItemCounts[3]}
    },
    "4": {
      "componentName": "Solutions Delivery Vehicles",
      "description": "Component description",
      "items": [
        {
          "id": "4-1",
          "title": "Delivery vehicle title",
          "description": "Delivery vehicle description",
          "value": "$2,500",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$12,000",
      "totalAvailable": ${componentItemCounts[4]}
    },
    "5": {
      "componentName": "Trim & Stack",
      "description": "Component description",
      "items": [
        {
          "id": "5-1",
          "title": "Optimization title",
          "description": "Optimization description",
          "value": "$1,800",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$8,000",
      "totalAvailable": ${componentItemCounts[5]}
    },
    "6": {
      "componentName": "Ultimate High-Value Bundle",
      "description": "Component description",
      "items": [
        {
          "id": "6-1",
          "title": "Bundle title",
          "description": "Bundle description",
          "value": "$4,000",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$18,000",
      "totalAvailable": ${componentItemCounts[6]}
    },
    "7": {
      "componentName": "Scarcity",
      "description": "Component description",
      "items": [
        {
          "id": "7-1",
          "title": "Scarcity title",
          "description": "Scarcity description",
          "value": "$1,200",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$5,000",
      "totalAvailable": ${componentItemCounts[7]}
    },
    "8": {
      "componentName": "Urgency",
      "description": "Component description",
      "items": [
        {
          "id": "8-1",
          "title": "Urgency title",
          "description": "Urgency description",
          "value": "$1,000",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$4,000",
      "totalAvailable": ${componentItemCounts[8]}
    },
    "9": {
      "componentName": "Bonuses",
      "description": "Component description",
      "items": [
        {
          "id": "9-1",
          "title": "Bonus title",
          "description": "Bonus description",
          "value": "$2,200",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$12,000",
      "totalAvailable": ${componentItemCounts[9]}
    },
    "10": {
      "componentName": "Guarantees",
      "description": "Component description",
      "items": [
        {
          "id": "10-1",
          "title": "Guarantee title",
          "description": "Guarantee description",
          "value": "$1,500",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$6,000",
      "totalAvailable": ${componentItemCounts[10]}
    },
    "11": {
      "componentName": "Naming",
      "description": "Component description",
      "items": [
        {
          "id": "11-1",
          "title": "Naming title",
          "description": "Naming description",
          "value": "$800",
          "category": "core",
          "priority": "high",
          "order": 1
        }
      ],
      "totalValue": "$3,000",
      "totalAvailable": ${componentItemCounts[11]}
    }
  },
  "totalOfferValue": "$100,000+",
  "summary": "Brief offer summary"
}`

    const startTime = Date.now()

    console.log('⚡ Making OpenAI API call for COMPLETE offer generation...')
    console.log('🎯 Generation mode:', isProUser ? 'COMPREHENSIVE PRO' : 'PREVIEW FREE')
    console.log('📏 Max tokens allowed:', isProUser ? 16000 : 4000)

    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              SYSTEM_PROMPT +
              `\n\nGeneration Mode: ${isProUser ? 'COMPREHENSIVE PRO' : 'PREVIEW FREE'}`,
          },
          { role: 'user', content: completePrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
        max_tokens: isProUser ? 16000 : 4000,
      })
    } catch (openaiError) {
      console.error('❌ OpenAI API Error:', openaiError)
      throw new Error(
        `OpenAI API failed: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`
      )
    }

    const endTime = Date.now()

    console.log('✅ OPENAI REQUEST COMPLETE - generateCompleteGrandSlamOffer')
    console.log('🎯 Actual tokens used:', completion.usage?.total_tokens || 'unknown')
    console.log('⏱️ Request duration:', endTime - startTime, 'ms')
    console.log('📊 Token breakdown:', {
      prompt: completion.usage?.prompt_tokens || 'unknown',
      completion: completion.usage?.completion_tokens || 'unknown',
      total: completion.usage?.total_tokens || 'unknown',
    })
    console.log('🎯 Generation type:', isProUser ? 'PRO (Full offer)' : 'FREE (Preview)')

    // Track this request globally
    trackOpenAIRequest('generateCompleteGrandSlamOffer', completion.usage?.total_tokens || 0)

    // Get the raw content from OpenAI
    const rawContent = completion.choices[0].message.content || '{}'

    // Try to fix common JSON issues
    let cleanedContent = rawContent

    // Remove any markdown code blocks
    cleanedContent = cleanedContent.replace(/```json\s*/, '').replace(/```\s*$/, '')

    // Try to fix unterminated strings by finding the last complete object
    if (cleanedContent.includes('SyntaxError') || !cleanedContent.trim().endsWith('}')) {
      // Find the last complete component
      const lastCompleteIndex = cleanedContent.lastIndexOf('    }')
      if (lastCompleteIndex > 0) {
        // Find the closing of components object
        const componentsEndIndex = cleanedContent.indexOf('  },', lastCompleteIndex)
        if (componentsEndIndex > 0) {
          cleanedContent =
            cleanedContent.substring(0, componentsEndIndex + 4) +
            '\n  "totalOfferValue": "$100,000+",\n  "summary": "Complete offer package"\n}'
        }
      }
    }

    let response
    try {
      response = JSON.parse(cleanedContent)
      console.log('Successfully parsed OpenAI response')
      console.log('Response components:', Object.keys(response.components || {}))

      // Validate that we have the expected structure
      if (!response.components || typeof response.components !== 'object') {
        throw new Error('Invalid response structure: missing components object')
      }

      // For pro users, validate we have all 11 components
      if (isProUser) {
        const componentKeys = Object.keys(response.components)
        if (componentKeys.length < 11) {
          throw new Error(
            `Incomplete response: only ${componentKeys.length} components found, expected 11`
          )
        }
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Raw content length:', rawContent.length)
      console.error('Cleaned content preview:', cleanedContent.substring(0, 1000))
      console.error('Cleaned content ending:', cleanedContent.substring(-1000))

      // For pro users, this is a critical error - don't use fallback
      if (isProUser) {
        throw new Error(
          `Failed to parse OpenAI response for pro user: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
        )
      }

      // Fallback: create a minimal valid response for free users only
      response = {
        components: {},
        totalOfferValue: '$100,000+',
        summary: 'Generated offer (parsing error occurred)',
      }
    }

    if (!response.components) {
      console.warn('No components in response, creating fallback')
      response.components = {}
    }

    // Transform to expected format
    const components: import('../types').CompleteOfferComponent[] = []

    for (let i = 1; i <= 11; i++) {
      const componentId = i as import('../types').ComponentId
      const componentData = response.components[i.toString()]

      if (componentData && componentData.items) {
        const totalAvailable =
          componentData.totalAvailable || componentItemCounts[componentId] || 12

        components.push({
          componentId,
          componentName: COMPONENT_NAMES[componentId],
          description: componentData.description || getComponentDescription(componentId),
          items: componentData.items.map((item: any, index: number) => {
            // Special handling for Solutions List component
            if (componentId === 3) {
              // Find the corresponding problem from component 2 (Problems List)
              const problemComponent = components.find(c => c.componentId === 2)
              const [problemPart, solutionPart] = item.description.split(' | Solution: ')
              const problemText = problemPart.replace('Problem: ', '').trim()

              // Try to find the full problem description by matching either title or description
              const matchingProblem = problemComponent?.items.find(p => {
                const pDesc = typeof p === 'string' ? p : p.description
                const pTitle = typeof p === 'string' ? p : p.title
                return (
                  pDesc.toLowerCase().includes(problemText.toLowerCase()) ||
                  pTitle.toLowerCase().includes(problemText.toLowerCase()) ||
                  problemText.toLowerCase().includes(pDesc.toLowerCase()) ||
                  problemText.toLowerCase().includes(pTitle.toLowerCase())
                )
              })

              // Get the full problem text
              const fullProblemText = matchingProblem
                ? typeof matchingProblem === 'string'
                  ? matchingProblem
                  : matchingProblem.description
                : problemText

              return {
                id: item.id || `${componentId}-${index + 1}`,
                title: item.title,
                description: `Problem: ${fullProblemText} | Solution: ${solutionPart.trim()}`,
                value: item.value,
                category: item.category || 'core',
                priority: item.priority || 'medium',
                order: item.order || index + 1,
                linkedProblem: fullProblemText,
                solutionDetails: solutionPart.trim(),
              }
            }
            return {
              id: item.id || `${componentId}-${index + 1}`,
              title: item.title,
              description: item.description,
              value: item.value,
              category: item.category || 'core',
              priority: item.priority || 'medium',
              order: item.order || index + 1,
            }
          }),
          totalValue: componentData.totalValue,
          isLocked: false, // Always unlock for purchased offers
          previewCount: componentData.items.length,
          totalAvailable: totalAvailable,
          conversionMessage: null, // No conversion message for purchased offers
        })
      } else {
        // If we're missing components for pro users, this is an error - don't use mock data
        if (isProUser) {
          console.error(`Missing component ${componentId} in OpenAI response for pro user`)
          throw new Error(`Failed to generate complete component ${componentId}. Please try again.`)
        }

        // For free users, create minimal fallback
        const totalAvailable = componentItemCounts[componentId] || 12
        components.push({
          componentId,
          componentName: COMPONENT_NAMES[componentId],
          description: getComponentDescription(componentId),
          items: [],
          isLocked: true,
          previewCount: 3,
          totalAvailable: totalAvailable,
          conversionMessage: `There are ${totalAvailable - 3} more items. Upgrade to Pro to unlock all and export to PDF!`,
        })
      }
    }

    const result: import('../types').CompleteGrandSlamOffer = {
      _id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as any,
      user_id: 'temp-user' as any,
      businessContext,
      components,
      totalOfferValue: response.totalOfferValue || '$100,000+',
      createdAt: new Date(),
      metadata: {
        tokenUsage: completion.usage?.total_tokens || 0,
        generationTime: endTime - startTime,
        model: 'gpt-4o-mini',
      },
    }

    return result
  } catch (error) {
    console.error('Error in complete offer generation:', error)
    throw error
  }
}

// Helper function to get component descriptions
function getComponentDescription(componentId: import('../types').ComponentId): string {
  const descriptions = {
    1: "Identify your prospect's ultimate destination and transformation",
    2: 'List everything that could prevent success using 4 value drivers',
    3: 'Transform every problem into actionable "How to" solutions',
    4: 'Determine scalable ways to deliver each solution effectively',
    5: 'Optimize for maximum value at minimum cost through strategic trimming',
    6: 'Combine everything into an irresistible, high-value package',
    7: 'Create authentic scarcity to increase perceived value',
    8: 'Add legitimate time-based pressure to drive decisions',
    9: 'Stack bonuses that eclipse core offer value',
    10: 'Implement risk reversal to eliminate purchase resistance',
    11: 'Create magnetic names using M.A.G.I.C. formula',
  }
  return descriptions[componentId] || 'Component description'
}
