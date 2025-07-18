# 🤖 CLAUDE.md - AI Assistant Project Memory & Instructions

**Project:** Grand Slam Offer Generator  
**Version:** 1.0  
**Last Updated:** July 17, 2025

---

## 🎯 **CRITICAL SESSION START PROTOCOL**

**ALWAYS DO THIS AT THE START OF EVERY NEW CONVERSATION:**

1. ✅ **Read PROJECT_OVERVIEW.md** - Understand what we're building
2. ✅ **Read PROJECT_RULES_AND_OBJECTIVES.md** - Follow all established rules
3. ✅ **Read planning.md** - Understand current architecture decisions
4. ✅ **Read prd.md** - Product requirements and current status
5. ✅ **Check tasks.md** - See what's pending, in-progress, or completed
6. ✅ **Ask for current context** - What are we working on today?

**Never start coding without reviewing these files first!**

---

## 🧠 **PROJECT MEMORY BANK**

### **Core Mission**
Build an AI-powered SaaS application that generates complete business offers using Alex Hormozi's "$100M Offers" methodology. Help entrepreneurs create irresistible offers in minutes instead of months.

### **Revenue-First Approach**
- **Conversion Optimization:** Every page designed to convert visitors to users to customers
- **Prompt Engineering:** AI quality directly impacts user satisfaction and retention
- **Data-Driven Decisions:** A/B testing and analytics guide all improvements

### **Key Technologies**
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, MongoDB, NextAuth.js  
- **AI:** OpenAI GPT-4 for content generation
- **Auth:** Google OAuth (primary)
- **Database:** MongoDB with unified collections

### **Critical Business Rules**
- **Free Tier:** 3 total credits, 1 per day, preview-only (3 items/component)
- **Starter Spark ($9):** 1 complete offer only
- **Growth Engine ($47):** 10 complete offers 
- **Agency Arsenal ($99):** 30 complete offers
- **NO BREAKING CHANGES:** Preserve existing functionality always

---

## 🚫 **NEVER DO THESE THINGS**

### **Code & Functionality**
- ❌ Break existing user workflows or payment systems
- ❌ Change credit deduction logic without careful testing
- ❌ Modify tier restrictions or pricing without approval
- ❌ Remove or alter existing API endpoints
- ❌ Change database schema without migration planning

### **Development Practices**
- ❌ Assume libraries are available - always check package.json first
- ❌ Create duplicate components - reuse existing patterns
- ❌ Skip error handling for user-facing features
- ❌ Implement features without considering performance impact
- ❌ Make database changes without atomic operations

### **AI Integration**
- ❌ Increase token usage without cost analysis
- ❌ Remove fallback strategies for API failures
- ❌ Skip input validation for AI prompts
- ❌ Ignore rate limiting considerations

---

## ✅ **ALWAYS DO THESE THINGS**

### **Before Starting Any Task**
1. ✅ Review relevant existing code patterns
2. ✅ Check package.json for available libraries
3. ✅ Understand user flow impact
4. ✅ Plan for error handling and edge cases
5. ✅ Consider mobile responsiveness

### **During Development**
1. ✅ Follow existing TypeScript patterns
2. ✅ Use established Tailwind CSS classes
3. ✅ Implement comprehensive error handling
4. ✅ Test credit deduction flows thoroughly
5. ✅ Preserve existing component interfaces

### **Code Quality Standards**
- ✅ TypeScript strict mode compliance
- ✅ Functional components with proper hooks
- ✅ Consistent naming conventions
- ✅ Proper error boundaries
- ✅ Responsive design patterns

---

## 🗂️ **PROJECT FILE STRUCTURE GUIDE**

### **Core Application**
```
src/app/                     # Next.js app router pages
├── api/                     # Backend API routes
│   ├── offers/             # Offer management
│   ├── auth/               # Authentication
│   ├── purchase-*/         # Payment processing
│   └── user/               # User management
├── dashboard/              # Main user interface
├── offer-*/                # Offer-related pages
└── providers/              # Context providers
```

### **Components Structure**
```
src/components/
├── auth/                   # Authentication components
├── dashboard/              # Dashboard-specific UI
├── offer/                  # Offer display components
├── pdf/                    # PDF generation
├── ui/                     # Reusable UI components
└── mindmap/                # Visualization components
```

### **Critical Configuration Files**
- `src/lib/auth-config.ts` - Authentication setup
- `src/lib/db.ts` - Database operations
- `src/lib/pricing-plans.ts` - Tier definitions
- `src/middleware.ts` - Route protection

---

## 🔧 **COMMON DEVELOPMENT PATTERNS**

### **Database Operations**
```typescript
// ALWAYS use atomic operations for credits
const result = await db.collection('user_profiles').findOneAndUpdate(
  { email: userEmail, currentCredits: { $gte: 1 } },
  { $inc: { currentCredits: -1 } },
  { returnDocument: 'after' }
);
```

### **Error Handling Pattern**
```typescript
try {
  // Operation
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: 500 }
  );
}
```

### **Component Patterns**
- Use `'use client'` for interactive components
- Import UI components from `@/components/ui/`
- Follow existing prop interfaces
- Implement loading states consistently

---

## 🎯 **TIER SYSTEM IMPLEMENTATION GUIDE**

### **Free Tier (Lead Magnet)**
- **Credits:** 3 total, 1 per day
- **Content:** Preview only (3 items per component)
- **Experience:** High-quality preview with upgrade prompts
- **Features:** Basic preview with upgrade prompts

### **Starter Spark ($9)**
- **Credits:** 1 complete offer
- **Experience:** Complete offer generation
- **Implementation:** Standard credit deduction for single offer

### **Growth Engine ($47) & Agency Arsenal ($99)**
- **Credits:** 10 or 30 complete offers
- **Experience:** Full flexibility, multiple offers
- **Implementation:** Standard credit deduction

---

## 📊 **CRITICAL METRICS TO PRESERVE**

### **User Experience**
- **Generation Time:** <30 seconds for complete offers
- **Page Load:** <3 seconds initial load
- **Error Rate:** <1% for successful payments
- **Credit Accuracy:** 100% correct deductions

### **Business Metrics**
- **Free-to-Paid Conversion:** Target >10%
- **User Registration:** >99% success rate
- **Payment Processing:** >99% success rate
- **API Costs:** Monitor token usage

---

## 🔄 **TESTING REQUIREMENTS**

### **Before Any Deployment**
- ✅ Test all user tier workflows
- ✅ Verify credit deduction accuracy
- ✅ Test payment processing flows
- ✅ Check mobile responsiveness
- ✅ Validate error handling

### **Regression Testing**
- ✅ User registration flow
- ✅ Offer generation for each tier
- ✅ Purchase and upgrade flows
- ✅ PDF export functionality
- ✅ Authentication persistence

---

## 🚨 **DEBUGGING COMMON ISSUES**

### **Credit System Problems**
1. Check atomic operation implementation
2. Verify tier assignment logic
3. Test edge cases (negative credits)
4. Validate purchase flow integration

### **AI Generation Issues**
1. Check prompt structure and length
2. Verify API key configuration
3. Test fallback mechanisms
4. Monitor token usage patterns

### **Authentication Problems**
1. Verify NextAuth configuration
2. Check middleware route protection
3. Test session persistence
4. Validate OAuth callback URLs

---

## 📝 **SESSION SUMMARY TEMPLATE**

**Use this template when ending sessions:**

```markdown
## Session Summary - [Date]

### Completed Tasks
- [List what was accomplished]

### Current Status
- [What's working/tested]

### Known Issues
- [Any problems discovered]

### Next Steps
- [What should be done next]

### Updated Files
- [List of modified files]
```

---

## 🎪 **PROJECT PHASE TRACKING**

### **Current Phase:** Testing & Optimization
- **Focus:** End-to-end testing, AI prompt optimization, conversion improvement
- **Key Components:** Purchase flows, generation quality, landing page optimization
- **Priority Issues:** OpenAI prompt engineering, landing page conversion, comprehensive testing

### **Completed Phases**
- ✅ Documentation Framework (5-file system: CLAUDE.md, planning.md, prd.md, tasks.md, PROJECT_RULES)
- ✅ Core Platform Development (Authentication, generation, payment flows)
- ✅ Packing Animation Implementation
- ✅ Basic UI/UX and responsive design

### **Current Focus Areas**
- 🔄 **Testing Phase:** End-to-end workflow validation
- 📈 **AI Optimization:** OpenAI prompt engineering for better output quality and cost efficiency  
- 🎯 **Conversion Optimization:** Landing page copy, pricing strategy, user flow improvements
- 📊 **Performance:** Generation speed, page load optimization, error handling

---

## 🤝 **COLLABORATION RULES**

### **When Working with Human Developer**
1. Always ask for clarification on ambiguous requirements
2. Propose solutions before implementing
3. Explain trade-offs for different approaches
4. Request testing guidance for critical changes
5. Document all architectural decisions

### **Code Review Checklist**
- [ ] Follows existing patterns
- [ ] Includes proper error handling
- [ ] Maintains tier system integrity
- [ ] Preserves user experience
- [ ] Includes appropriate testing

---

**🎯 Remember: Every change should help entrepreneurs create better offers and build successful businesses. This is our north star.**

---

## 📚 **KEY REFERENCE PRIORITIES**

**ALWAYS READ FIRST:**
1. **PROJECT_RULES_AND_OBJECTIVES.md** - The law of the project
2. **PROJECT_OVERVIEW.md** - The vision and scope  
3. **prd.md** - Current product requirements and status
4. **planning.md** - Technical architecture decisions
5. **tasks.md** - What needs to be done

**CURRENT PRIORITY FOCUS:**
- **OpenAI Prompt Engineering** - Improve generation quality and reduce costs
- **Conversion Optimization** - Landing page copy and user flow improvements
- **End-to-End Testing** - Comprehensive workflow validation
- **Performance Optimization** - Speed and reliability improvements

**When in doubt, ask before coding. Better to clarify than to fix later.**