import OpenAI from 'openai'
import { PreviewRequest, PreviewResponse, COMPONENT_NAMES, ComponentId } from '../types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

const generatePrompt = (request: PreviewRequest): string => {
  const { businessContext, componentId } = request
  const componentName = COMPONENT_NAMES[componentId]

  // Component-specific value drivers based on Hormozi's framework
  const valueDrivers = {
    1: 'Dream Outcome - Focus on specific, measurable end results',
    2: 'Problems that prevent achievement of the dream outcome',
    3: 'Solutions that directly address each problem and increase perceived likelihood',
    4: 'Delivery vehicles that minimize time delay and effort required',
    5: 'High-value, low-cost solutions that maximize the value equation',
    6: 'Value stacking that makes the offer irresistible',
    7: 'Scarcity elements that increase perceived value',
    8: 'Urgency triggers that decrease time delay',
    9: 'Bonuses that increase dream outcome and perceived likelihood',
    10: 'Guarantees that maximize perceived likelihood of achievement',
    11: 'Names that capture dream outcome and speed of achievement',
  }

  return `Generate 3 high-impact preview items for ${componentName} that align with Hormozi's value equation and ${valueDrivers[componentId]}.

Business Description:
${businessContext.businessDescription}

Requirements:
1. Each preview must directly impact the value equation by either:
   - Increasing Dream Outcome or Perceived Likelihood (numerator)
   - Decreasing Time Delay or Effort & Sacrifice (denominator)
2. Use specific numbers and timeframes
3. Focus on transformation, not features
4. Create curiosity for remaining items
5. Make it specific to the business context

Format each preview item as JSON:
{
  "previewItems": [
    {
      "title": "Benefit-driven title showing transformation",
      "description": "Specific description showing how it impacts the value equation",
      "value": "Monetary value based on impact to dream outcome"
    }
  ],
  "totalItemsAvailable": 12,
  "componentName": "${componentName}",
  "unlockCTA": "Custom call-to-action that creates urgency"
}`
}

export async function generatePreview(request: PreviewRequest): Promise<PreviewResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-efficient model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: generatePrompt(request) },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 1500, // Limit tokens for cost control
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}') as PreviewResponse

    // Validate response format
    if (!response.previewItems || !Array.isArray(response.previewItems)) {
      throw new Error('Invalid response format from OpenAI')
    }

    // Ensure preview items follow value equation
    const enhancedItems = response.previewItems.map(item => ({
      ...item,
      value: item.value || calculateValueImpact(item.description),
    }))

    return {
      ...response,
      previewItems: enhancedItems,
      componentName: COMPONENT_NAMES[request.componentId],
      totalItemsAvailable: response.totalItemsAvailable || 12,
      unlockCTA:
        response.unlockCTA ||
        `Unlock ${response.totalItemsAvailable - 3} more ${COMPONENT_NAMES[request.componentId]} strategies →`,
    }
  } catch (error) {
    console.error('Error generating preview:', error)
    throw error
  }
}

// Helper function to estimate value impact if not provided
function calculateValueImpact(description: string): string {
  // This is a placeholder - you could implement more sophisticated value calculation
  return '$1,000+ in value'
}

// Batch generation for all 11 components - optimized for cost and efficiency
export async function generateAllComponents(businessContext: {
  businessDescription: string
}): Promise<Record<ComponentId, PreviewResponse>> {
  try {
    // Single optimized prompt for all components
    const batchPrompt = `Generate a complete Grand Slam Offer for this business:

Business Description:
${businessContext.businessDescription}

Generate 3 high-impact items for each of the 11 components below. Follow Hormozi's Value Equation framework:
Value = (Dream Outcome × Perceived Likelihood) ÷ (Time Delay + Effort & Sacrifice)

Components to generate:
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
    // ... repeat for components 2-11
  }
}`

    const completion = await openai.chat.completions.create({
      model: 'GPT-4.1',
      messages: [
        {
          role: 'system',
          content:
            "You are an expert in Alex Hormozi's $100M Offers methodology. Generate comprehensive Grand Slam Offers using the Value Equation framework.",
        },
        { role: 'user', content: batchPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 4000, // Increased for full response
    })

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
            `Unlock ${componentData.totalItemsAvailable - 3} more strategies →`,
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
    console.error('Error in batch generation:', error)
    throw error
  }
}

// Optimized single component generation (fallback)
export async function generateSingleComponent(
  businessContext: PreviewRequest['businessContext'],
  componentId: ComponentId
): Promise<PreviewResponse> {
  const request: PreviewRequest = { businessContext, componentId }
  return generatePreview(request)
}

// Complete Grand Slam Offer Generation - Premium version
export async function generateCompleteGrandSlamOffer(
  request: import('../types').CompleteOfferRequest
): Promise<import('../types').CompleteGrandSlamOffer> {
  const { businessContext, userTier, generateComplete = false } = request

  try {
    const isProUser = userTier === 'pro' && generateComplete

    // Realistic component item counts based on Hormozi methodology
    const componentItemCounts = {
      1: isProUser ? 12 : 3, // Dream Outcomes
      2: isProUser ? 47 : 3, // Problems (most comprehensive)
      3: isProUser ? 47 : 3, // Solutions (matches problems)
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
2. Problems & Obstacles List (${componentItemCounts[2]} items) - Everything preventing achievement (before/during/after)
3. Solutions List (${componentItemCounts[3]} items) - "How to" solutions for every problem  
4. Solutions Delivery Vehicles (${componentItemCounts[4]} items) - Scalable ways to deliver solutions
5. Trim & Stack (${componentItemCounts[5]} items) - High-value, low-cost optimization
6. Ultimate High-Value Deliverable Bundle (${componentItemCounts[6]} items) - Irresistible package creation
7. Scarcity (${componentItemCounts[7]} items) - Limited supply/access elements
8. Urgency (${componentItemCounts[8]} items) - Time-based pressure tactics
9. Bonuses (${componentItemCounts[9]} items) - Value-stacking additions
10. Guarantees (${componentItemCounts[10]} items) - Risk reversal strategies
11. Naming (${componentItemCounts[11]} items) - M.A.G.I.C. formula implementation

Format as JSON:
{
  "components": {
    "1": {
      "componentName": "Dream Outcome Identification",
      "description": "Component description",
      "items": [
        {
          "id": "dream-1",
          "title": "Specific outcome title",
          "description": "Detailed description with actionable steps",
          "value": "$X,XXX value",
          "category": "core",
          "priority": "high",
          "order": 1,
          "linkedProblem": "Only for Solutions List component - reference to problem",
          "solutionDetails": "Only for Solutions List component - detailed solution"
        }
      ],
      "totalValue": "$XX,XXX",
      "totalAvailable": ${componentItemCounts[1]}
    }
    // ... repeat for all 11 components
  },
  "totalOfferValue": "$XXX,XXX",
  "summary": "Brief offer summary"
}`

    const startTime = Date.now()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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
      max_tokens: isProUser ? 8000 : 4000,
    })

    const endTime = Date.now()
    const response = JSON.parse(completion.choices[0].message.content || '{}')

    if (!response.components) {
      throw new Error('Invalid complete offer response format from OpenAI')
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
          isLocked: !isProUser,
          previewCount: isProUser ? componentData.items.length : 3,
          totalAvailable: totalAvailable,
          conversionMessage: isProUser
            ? null
            : `There are ${totalAvailable - 3} more items. Upgrade to Pro to unlock all and export to PDF!`,
        })
      } else {
        // Fallback for missing components
        const totalAvailable = componentItemCounts[componentId] || 12

        components.push({
          componentId,
          componentName: COMPONENT_NAMES[componentId],
          description: getComponentDescription(componentId),
          items: [],
          isLocked: !isProUser,
          previewCount: 3,
          totalAvailable: totalAvailable,
          conversionMessage: isProUser
            ? null
            : `There are ${totalAvailable - 3} more items. Upgrade to Pro to unlock all and export to PDF!`,
        })
      }
    }

    const result: import('../types').CompleteGrandSlamOffer = {
      id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      businessContext,
      components,
      totalOfferValue: response.totalOfferValue || '$100,000+',
      createdAt: new Date().toISOString(),
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
