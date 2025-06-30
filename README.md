# 🎯 Grand Slam Offer Generator

Transform your business ideas into irresistible offers with AI-powered generation based on Alex Hormozi's proven $100M Offers methodology.

## ✨ Features

- **AI-Powered Generation**: Advanced AI reads your business model and creates compelling offers
- **Progressive Reveal**: Magical step-by-step generation with beautiful animations
- **Smart Paywall**: Freemium strategy with strategic upgrade prompts
- **Visual Mindmaps**: Interactive mindmap visualization of your offers
- **Professional Exports**: Beautiful PDF exports ready for presentations
- **Analytics Tracking**: Built-in PostHog analytics for conversion optimization

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd grand-slam-generator
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Fill in your API keys and configuration
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase
- **Analytics**: PostHog
- **Mindmaps**: React Flow
- **PDF Generation**: Puppeteer
- **Deployment**: Vercel

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI API (for AI generation)
OPENAI_API_KEY=your_openai_api_key

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── providers/         # React providers (PostHog, etc.)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   └── posthog.ts         # Analytics configuration
└── types/                 # TypeScript type definitions
    └── index.ts           # Main types
```

## 📚 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🎨 Development Workflow

1. **Day 1-2**: Technical foundation ✅
2. **Day 3-4**: Magical landing page
3. **Day 5-7**: Progressive generation UI
4. **Week 2**: Core generation engine + UI magic
5. **Week 3**: Freemium strategy + conversion optimization
6. **Week 4**: Premium features + export magic
7. **Week 5**: Launch strategy + viral triggers

## 📊 Key Metrics

- **Conversion Rate**: Landing page to trial
- **Generation Completion**: Users who complete offer generation
- **Upgrade Rate**: Free to paid conversion
- **Viral Coefficient**: Share-to-unlock performance
- **User Retention**: Monthly active users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Based on Alex Hormozi's $100M Offers methodology
- Built with modern web technologies for optimal performance
- Designed for conversion optimization and user delight

---

**Ready to create your Grand Slam Offer?** 🚀

Start the development server and visit [http://localhost:3000](http://localhost:3000) to see the magic!
