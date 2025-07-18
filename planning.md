# 🏗️ PLANNING.md - Technical Architecture & Decisions

**Project:** Grand Slam Offer Generator  
**Version:** 1.0  
**Last Updated:** July 14, 2025

---

## 🎯 **ARCHITECTURE OVERVIEW**

### **System Architecture**
```
Frontend (Next.js) ↔ API Routes ↔ MongoDB ↔ AI Services
     ↓                    ↓           ↓         ↓
  User Interface    Business Logic  Data Store  Content Gen
```

### **Technology Stack**

#### **Frontend**
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** Custom components + Lucide React icons
- **State Management:** React hooks + Context API
- **Visualization:** React Flow for mindmaps
- **Animation:** CSS transitions + custom animations

#### **Backend**
- **API:** Next.js API routes
- **Authentication:** NextAuth.js with Google OAuth
- **Database:** MongoDB with Mongoose ODM
- **File Storage:** Local filesystem for temporary files
- **Payment Processing:** Integrated payment system

#### **API Route Architecture**
```
/api/purchase-offer          # Main generation endpoint (tier-aware routing)
/api/purchase-offer-stream   # Streaming generation for unlock purchases  
/api/generate-all-components # Batch preview generation (legacy)
/api/offers                  # User offer management
/api/auth/[...nextauth]      # Authentication endpoints
/api/purchase-package        # Tier upgrade purchases
/api/export-pdf              # PDF generation
```

#### **AI Integration**
- **Primary:** OpenAI GPT-4 for content generation
- **Backup:** Claude API as fallback option
- **Token Management:** Cost optimization strategies
- **Rate Limiting:** Built-in protection mechanisms

#### **Deployment**
- **Platform:** Vercel (optimized for Next.js)
- **Database:** MongoDB Atlas (cloud)
- **CDN:** Vercel Edge Network
- **Environment:** Production, staging, development

---

## 🗄️ **DATABASE ARCHITECTURE**

### **Core Collections**

#### **user_profiles**
```javascript
{
  _id: ObjectId,
  email: string,
  name: string,
  image: string,
  subscription_tier: "free" | "starter_spark" | "growth_engine" | "agency_arsenal",
  credits_remaining: number,
  total_offers_generated: number,
  last_generation_date: Date,
  last_credit_reset: Date,
  package_details: {
    original_business_context: Object, // For regenerations
    purchase_date: Date,
    credits_purchased: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### **grand_slam_offers** (Free tier generations)
```javascript
{
  _id: ObjectId,
  user_id: string, // email
  businessContext: {
    businessDescription: string
  },
  components: [{
    componentId: number,
    componentName: string,
    description: string,
    items: [{
      id: string,
      title: string,
      description: string,
      value: string,
      category: string,
      priority: string,
      order: number
    }],
    isLocked: boolean,
    previewCount: number,
    totalAvailable: number,
    conversionMessage: string
  }],
  totalOfferValue: string,
  createdAt: Date,
  metadata: {
    tokenUsage: number,
    generationTime: number,
    model: string
  }
}
```

#### **purchased_offers** (Paid tier generations)
```javascript
{
  _id: ObjectId,
  userId: string, // email
  offerId: string,
  businessContext: Object,
  components: [/* Same as grand_slam_offers */],
  totalOfferValue: string,
  purchase_tier: string,
  status: "active" | "archived",
  createdAt: Date,
  metadata: {
    tokenUsage: number,
    generationTime: number,
    model: string
  }
}
```

#### **generation_locks** (Concurrency control)
```javascript
{
  _id: ObjectId,
  offerId: string,
  userId: string,
  status: "in_progress",
  created_at: Date
}
```

### **Database Operations Patterns**

#### **Atomic Credit Deduction**
```javascript
// ALWAYS use findOneAndUpdate for credit operations
const result = await db.collection('user_profiles').findOneAndUpdate(
  { 
    email: userEmail, 
    credits_remaining: { $gte: 1 } 
  },
  { 
    $inc: { credits_remaining: -1 } 
  },
  { returnDocument: 'after' }
);
```

#### **Tier-Based Generation Routing**
```javascript
// Route to appropriate AI function based on user tier
if (generationTier === 'free') {
  // Free users: Use preview generation
  const previewData = await generatePreview({
    businessDescription: businessContext.businessDescription
  });
  // Convert to standard format
} else {
  // Paid users: Use complete generation
  const completeOffer = await generateCompleteGrandSlamOffer({
    businessContext,
    userTier: generationTier,
    generateComplete: true
  });
}
```

#### **Daily Credit Reset Logic (Free Tier)**
```javascript
// Check if daily reset needed (free tier only)
const now = new Date();
const lastReset = user.last_credit_reset;
const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

if (hoursSinceReset >= 24 && user.subscription_tier === 'free') {
  await resetDailyCredit(user.email);
}
```

---

## 🔐 **AUTHENTICATION ARCHITECTURE**

### **NextAuth.js Configuration**
- **Primary Provider:** Google OAuth 2.0
- **Session Strategy:** JWT tokens
- **Callbacks:** Custom user profile creation
- **Middleware:** Route protection for authenticated pages

### **Route Protection Pattern**
```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  // Protect dashboard and API routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return withAuth(request);
  }
  if (request.nextUrl.pathname.startsWith('/api/offers')) {
    return withAuth(request);
  }
}
```

### **User Session Management**
- **Session Duration:** 30 days
- **Auto-refresh:** Enabled
- **Storage:** HTTP-only cookies
- **CSRF Protection:** Built-in NextAuth protection

---

## 🎨 **UI/UX ARCHITECTURE**

### **Design System**

#### **Color Palette**
```css
:root {
  --primary-dark: #0A0E1A;     /* Rich Midnight */
  --secondary-dark: #1A1F2E;   /* Charcoal Slate */
  --accent-light: #F8FAFC;     /* Pure White */
  --electric-cyan: #06B6D4;    /* Vibrant Cyan */
  --emerald-green: #059669;    /* Success Green */
  --amber-gold: #D97706;       /* Premium Gold */
  --violet-glow: #8B5CF6;      /* Elegant Purple */
}
```

#### **Typography**
- **Primary:** Inter font family
- **Code/Data:** Geist Mono
- **Hierarchy:** Consistent scale (text-sm to text-4xl)

#### **Component Library Structure**
```
src/components/ui/
├── button.tsx          # Primary action buttons
├── navbar.tsx          # Site navigation
├── navigation.tsx      # Dashboard navigation
└── switch.tsx          # Toggle components
```

### **Responsive Design Strategy**
- **Mobile-first:** Tailwind CSS responsive utilities
- **Breakpoints:** sm(640px), md(768px), lg(1024px), xl(1280px)
- **Navigation:** Collapsible mobile menu
- **Content:** Flexible grid layouts

---

## 🤖 **AI INTEGRATION ARCHITECTURE**

### **Content Generation Pipeline**
```
User Input → User Tier Check → Route to Appropriate Function → Response Processing → Component Assembly
```

### **Generation Flow by User Type**
```
Dashboard (Free Preview) → /api/purchase-offer → generatePreview() → 3 items per component
Dashboard (Paid User) → /api/purchase-offer → generateCompleteGrandSlamOffer() → Full offer
Offer Page (Unlock) → /api/purchase-offer-stream → generateCompleteGrandSlamOffer() → Full offer
Previous Offers (Regenerate) → /api/purchase-offer → generateCompleteGrandSlamOffer() → Full offer
```

### **AI Function Architecture**
#### **generatePreview() - Free Users**
- **Purpose:** Generate 3 preview items for all 11 components
- **Token Limit:** ~4,000 tokens maximum
- **Model:** gpt-4o-mini (cost-efficient)
- **Output:** Preview format with unlock CTAs

#### **generateCompleteGrandSlamOffer() - Paid Users**
- **Purpose:** Generate complete offers with 30-50 items per component
- **Token Limit:** ~16,000 tokens maximum for pro users
- **Model:** gpt-4o-mini
- **Output:** Complete offer format

### **Prompt Engineering Strategy**
- **Tier-based Prompts:** Different complexity based on user tier
- **Context Management:** Business context preservation across generations
- **Token Optimization:** Efficient prompt design for cost control
- **Error Handling:** Fallback prompts and retry mechanisms

### **AI Service Configuration**
```javascript
// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000
});

// Generation Parameters by Tier
const generationConfig = {
  preview: {
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  },
  complete: {
    model: "gpt-4o-mini", 
    temperature: 0.7,
    max_tokens: 16000,
    response_format: { type: 'json_object' }
  }
};
```

### **Content Quality Assurance**
- **Tier Validation:** Ensure correct function called for user tier
- **Structure Validation:** Ensure all components present
- **Content Filtering:** Remove inappropriate content
- **Format Consistency:** Standardized output format
- **Error Handling:** Smart retry mechanisms with credit refunds

---

## 💳 **PAYMENT SYSTEM ARCHITECTURE**

### **Pricing Tier Implementation**
```javascript
const PRICING_PLANS = {
  free: {
    name: "Free",
    price: 0,
    credits: 3,
    dailyLimit: 1,
    features: ["Preview only", "3 items per component"]
  },
  starter_spark: {
    name: "Starter Spark",
    price: 9,
    credits: 1,
    features: ["Single complete offer"]
  },
  growth_engine: {
    name: "Growth Engine", 
    price: 47,
    credits: 10,
    features: ["Multiple complete offers", "Full flexibility"]
  },
  agency_arsenal: {
    name: "Agency Arsenal",
    price: 99, 
    credits: 30,
    features: ["High-volume generation", "Agency features"]
  }
};
```

### **Credit Management System**
- **Atomic Operations:** Prevent race conditions
- **Audit Trail:** Track all credit transactions
- **Refund Logic:** Automatic refunds on failures
- **Top-up Support:** Same-tier repurchases allowed

---

## 📊 **PERFORMANCE ARCHITECTURE**

### **Optimization Strategies**
- **Code Splitting:** Dynamic imports for large components
- **Image Optimization:** Next.js Image component
- **Caching:** API response caching where appropriate
- **Bundle Analysis:** Regular bundle size monitoring

### **Performance Targets**
- **Initial Load:** <3 seconds
- **API Response:** <2 seconds
- **AI Generation:** <30 seconds
- **Database Query:** <500ms average

### **Monitoring & Analytics**
- **Error Tracking:** Custom error boundaries
- **Performance Metrics:** Web Vitals monitoring
- **User Analytics:** PostHog integration
- **API Monitoring:** Request/response tracking

---

## 🔧 **DEVELOPMENT WORKFLOW**

### **Code Quality Standards**
```json
{
  "typescript": "strict mode",
  "linting": "ESLint with Next.js config",
  "formatting": "Prettier with Tailwind plugin",
  "testing": "Manual testing + user workflow validation"
}
```

### **File Organization Principles**
- **Feature-based:** Group related functionality
- **Reusability:** Shared components in /ui/
- **Separation:** Clear API/component boundaries
- **Naming:** Descriptive, consistent naming

### **Error Handling Strategy**
```javascript
// Standard error handling pattern
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: 'User-friendly message',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
}
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Environment Configuration**
```
Development → Staging → Production
     ↓           ↓          ↓
Local Dev    Preview     Live Site
```

### **Environment Variables**
```bash
# Core Configuration
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
MONGODB_URI=

# AI Services  
OPENAI_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

### **Deployment Checklist**
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] AI API keys validated
- [ ] Performance testing passed
- [ ] Security review completed

---

## 🔍 **SECURITY ARCHITECTURE**

### **Data Protection**
- **Input Validation:** All user inputs sanitized
- **SQL Injection:** Prevented via Mongoose ODM
- **XSS Protection:** React's built-in protection
- **CSRF Protection:** NextAuth.js built-in

### **Authentication Security**
- **OAuth 2.0:** Industry-standard authentication
- **JWT Tokens:** Secure session management
- **Route Protection:** Middleware-based protection
- **Session Expiry:** Automatic timeout handling

### **API Security**
- **Rate Limiting:** Prevent abuse
- **Input Validation:** Strict parameter checking
- **Error Handling:** No sensitive data in responses
- **Audit Logging:** Track important actions

---

## 📈 **SCALABILITY CONSIDERATIONS**

### **Horizontal Scaling**
- **Stateless Design:** No server-side state
- **Database Optimization:** Proper indexing
- **CDN Usage:** Static asset delivery
- **API Optimization:** Efficient query patterns

### **Vertical Scaling**
- **Memory Management:** Efficient data structures
- **CPU Optimization:** Async/await patterns
- **I/O Optimization:** Connection pooling
- **Cache Strategy:** Strategic caching implementation

---

## 🎯 **TECHNICAL DEBT TRACKING**

### **Known Technical Debt**
- [ ] Add comprehensive error logging
- [ ] Implement automated testing suite
- [ ] Optimize AI token usage
- [ ] Add performance monitoring dashboard
- [ ] Current openai.ts needs comprehensive prompt engineering
- [ ] Landing page copy needs conversion optimization
- [ ] A/B testing infrastructure missing
- [ ] Advanced analytics and user behavior tracking needed

### **Future Architecture Improvements**
- [ ] Implement Redis caching layer
- [ ] Add real-time notifications
- [ ] Create admin dashboard
- [ ] Build API versioning strategy

### **Conversion Optimization Architecture**
- [ ] A/B testing framework integration
- [ ] Analytics event tracking system
- [ ] Content management system for copy variations
- [ ] User behavior tracking and heatmaps

### **AI Prompt Engineering Architecture**
- [ ] Prompt template management system
- [ ] Token usage monitoring and optimization
- [ ] Quality assessment and validation pipeline
- [ ] Industry-specific prompt variation system

---

## 📚 **ARCHITECTURAL DECISIONS RECORD**

### **Decision 1: Next.js App Router**
- **Date:** 2025-07-01
- **Context:** Modern routing and server components
- **Decision:** Use App Router over Pages Router
- **Consequences:** Better performance, modern patterns

### **Decision 2: MongoDB Document Structure**
- **Date:** 2025-07-01  
- **Context:** User and offer data relationships
- **Decision:** Embedded documents for offer content
- **Consequences:** Faster queries, some data duplication

### **Decision 3: Tier-based Credit System**
- **Date:** 2025-07-01
- **Context:** Monetization and user management
- **Decision:** Four-tier system with different features
- **Consequences:** Complex logic but clear value proposition

### **Decision 4: Conversion-First Development Approach**
- **Date:** 2025-07-14
- **Context:** Revenue optimization and user acquisition
- **Decision:** Prioritize conversion optimization alongside core functionality
- **Consequences:** Higher development complexity but better ROI

### **Decision 5: Advanced AI Prompt Engineering Priority**
- **Date:** 2025-07-14
- **Context:** Product quality and operational costs
- **Decision:** Dedicated milestone for prompt optimization
- **Consequences:** Better output quality and lower operational costs

### **Decision 6: Tier-Based AI Function Routing**
- **Date:** 2025-07-18
- **Context:** Free users incorrectly calling expensive complete generation function
- **Decision:** Route free users to generatePreview(), paid users to generateCompleteGrandSlamOffer()
- **Consequences:** Proper cost control, correct user experience, optimized token usage

---

**🎯 This planning document should be updated whenever major architectural decisions are made or system components are significantly modified.**