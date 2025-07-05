'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Target,
  Brain,
  BarChart3,
  Rocket,
  ArrowRight,
  User,
  Zap,
  Star,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  DollarSign,
  Clock,
  Shield,
  TrendingUp,
} from 'lucide-react'
import { analytics } from '@/lib/posthog'
import { useAuth } from './providers/auth-provider'
import { AuthModal } from '@/components/auth/auth-modal'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// Jupyter Notebook Demo Component
function JupyterNotebookDemo() {
  const [openCells, setOpenCells] = useState<number[]>([0]) // First cell open by default
  const [showMoreItems, setShowMoreItems] = useState<{ [key: number]: boolean }>({})

  const toggleCell = (index: number) => {
    setOpenCells(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]))
  }

  const toggleShowMore = (cellId: number) => {
    setShowMoreItems(prev => ({
      ...prev,
      [cellId]: !prev[cellId],
    }))
  }

  const notebookCells = [
    {
      id: 0,
      title: 'DREAM OUTCOME IDENTIFICATION',
      icon: Target,
      gradient: 'from-violet-500 to-sky-500',
      description: "Identify your prospect's ultimate destination",
      quote:
        '"Focus on the end result, not the process - sell the vacation, not the plane flight" - Alex Hormozi',
      content: [
        '• Transform from overweight and insecure to confident fitness model physique',
        '• Achieve sustainable 25-30 lb weight loss in 12 weeks',
        '• Build lean muscle while burning fat simultaneously',
        '• Develop unshakeable confidence and self-discipline',
        '• Create a lifestyle that maintains results permanently',
      ],
      output:
        '🎯 Dream Outcome: "Transform into a confident, lean, and strong version of yourself in 12 weeks - the body you\'ve always wanted with the energy to match"',
      value: '$50,000+ (lifetime confidence boost)',
    },
    {
      id: 1,
      title: 'PROBLEMS & OBSTACLES LIST',
      icon: Brain,
      gradient: 'from-sky-500 to-yellow-500',
      description: 'List everything that could prevent success using 4 value drivers',
      quote:
        '"We must identify EVERY pain point in insane detail to create the perfect solution" - Alex Hormozi',
      content: [
        "• Don't know which exercises actually burn fat vs build muscle",
        '• Confused by conflicting nutrition advice online',
        '• No time to meal prep with busy work schedule',
        '• Gym intimidation and not knowing proper form',
        '• Past diet failures creating self-doubt',
      ],
      moreContent: [
        '• Plateau after initial weight loss',
        '• Social pressure to eat unhealthy foods',
        '• Lack of accountability and motivation',
        '• Expensive healthy food costs',
        '• Work stress leading to emotional eating',
        '• Family not supporting healthy lifestyle',
        '• Inconsistent sleep affecting metabolism',
        '• Travel disrupting workout routines',
        '• Hormonal imbalances slowing progress',
        '• Old injuries limiting exercise options',
        '• Perfectionism leading to all-or-nothing mindset',
        '• Comparison to others on social media',
        '• Lack of knowledge about supplements',
        '• Time constraints with family obligations',
        '• Weather affecting outdoor activities',
      ],
      output:
        '📋 Identified 47 specific obstacles across all 4 value drivers with urgency scores 7.8-9.4/10',
      value: 'Priceless (prevents 90% of failure scenarios)',
    },
    {
      id: 2,
      title: 'SOLUTIONS LIST',
      icon: CheckCircle,
      gradient: 'from-yellow-500 to-violet-500',
      description: 'Transform every problem into a solution',
      quote:
        '"Every obstacle becomes an opportunity when you flip it into solution-focused language" - Alex Hormozi',
      content: [
        '• How to design the perfect fat-burning + muscle-building workout plan',
        '• How to create simple meal plans that fit your busy lifestyle',
        '• How to meal prep in 90 minutes for the entire week',
        '• How to feel confident in any gym environment',
        '• How to build unbreakable consistency habits',
      ],
      moreContent: [
        '• How to break through weight loss plateaus scientifically',
        '• How to handle social situations without derailing progress',
        '• How to stay accountable with built-in tracking systems',
        '• How to eat healthy on any budget',
        '• How to manage stress eating triggers',
        '• How to get family support for your transformation',
        '• How to optimize sleep for maximum fat loss',
        '• How to maintain routines while traveling',
        '• How to work with hormonal challenges',
        '• How to modify exercises for any injury',
        '• How to develop a healthy relationship with food',
        '• How to use social media for motivation, not comparison',
        '• How to choose the right supplements for your goals',
        '• How to balance family time with fitness goals',
      ],
      output: '✅ Created 47 specific "How to..." solutions addressing every identified obstacle',
      value: '$25,000+ (comprehensive problem-solving system)',
    },
    {
      id: 3,
      title: 'SOLUTIONS DELIVERY VEHICLES',
      icon: Rocket,
      gradient: 'from-violet-500 to-sky-500',
      description: "Determine how you'll deliver each solution",
      quote: '"The HOW is what separates amateur offers from $100M offers" - Alex Hormozi',
      content: [
        '• 1-on-1 Transformation Coaching (Weekly 60-min calls)',
        '• Custom Workout Plans (Updated every 4 weeks)',
        '• Personalized Nutrition Protocol (Macro-based system)',
        '• 24/7 Text Support (Direct access to coach)',
        '• Weekly Group Masterminds (Peer accountability)',
      ],
      moreContent: [
        '• Meal Prep Video Library (50+ recipes)',
        '• Exercise Form Video Database (200+ movements)',
        '• Habit Tracking Mobile App (Custom-built)',
        '• Monthly Body Composition Analysis',
        '• Supplement Protocol & Sourcing',
        '• Travel Workout Guide (Hotel/home routines)',
        '• Stress Management Toolkit',
        '• Sleep Optimization Protocol',
        '• Social Situation Navigation Scripts',
        '• Plateau-Breaking Strategies Manual',
        '• Family Integration Handbook',
        '• Mindset Mastery Audio Program',
      ],
      output: '🚀 17 delivery vehicles spanning DFY, DWY, and DIY approaches with 24/7 support',
      value: '$15,000+ (comprehensive delivery system)',
    },
    {
      id: 4,
      title: 'TRIM & STACK OPTIMIZATION',
      icon: TrendingUp,
      gradient: 'from-sky-500 to-yellow-500',
      description: 'Optimize for maximum value at minimum cost',
      quote:
        '"Remove the expensive stuff that doesn\'t matter, keep the cheap stuff that does" - Alex Hormozi',
      content: [
        '• Removed: In-person training (High cost, limited scalability)',
        '• Kept: Video coaching calls (High value, scalable)',
        '• Enhanced: Text support (Low cost, massive value)',
        '• Streamlined: Nutrition to macro-based system (Simple + effective)',
        '• Added: Group elements for community (1-to-many efficiency)',
      ],
      output: '⚡ Optimized delivery stack: 90% value retention at 40% cost reduction',
      value: '$30,000+ (efficiency optimization)',
    },
    {
      id: 5,
      title: 'HIGH-VALUE DELIVERABLE BUNDLE',
      icon: Star,
      gradient: 'from-yellow-500 to-violet-500',
      description: 'Combine everything into an irresistible package',
      quote: "\"Create the 'All that? Seriously? Yes, I'm in!' moment\" - Alex Hormozi",
      content: [
        '• The Complete Transformation System ($4,997 value)',
        '• 12-Week Personal Coaching Program ($3,000 value)',
        '• Custom Nutrition & Workout Plans ($1,500 value)',
        '• 24/7 Coach Access via Text ($2,000 value)',
        '• Weekly Group Mastermind Access ($1,200 value)',
      ],
      moreContent: [
        '• Meal Prep Mastery Course ($497 value)',
        '• Exercise Form Video Library ($297 value)',
        '• Habit Tracking App License ($197 value)',
        '• Monthly Progress Analysis ($600 value)',
        '• Supplement Protocol Guide ($297 value)',
        '• Travel Fitness Toolkit ($197 value)',
        '• Stress Management System ($397 value)',
        '• Sleep Optimization Guide ($197 value)',
      ],
      output: '💎 Total Bundle Value: $14,576 → Offered at $1,997 (86% savings)',
      value: '$14,576 perceived value',
    },
    {
      id: 6,
      title: 'SCARCITY IMPLEMENTATION',
      icon: Clock,
      gradient: 'from-violet-500 to-sky-500',
      description: 'Decrease supply to increase demand',
      quote:
        '"Scarcity must be real and honest - your capacity is your natural limit" - Alex Hormozi',
      content: [
        '• Limited to 25 clients per quarter (Coaching capacity limit)',
        '• Only 5 spots available this month (Rolling cohort model)',
        '• Exclusive bonus package never offered again',
        '• Personal phone number access (Limited to current clients only)',
        '• Custom meal planning (Time-intensive, naturally scarce)',
      ],
      output: '⏰ Authentic scarcity: 25 total spots, 5 remaining this month',
      value: 'Priceless (exclusivity premium)',
    },
    {
      id: 7,
      title: 'URGENCY CREATION',
      icon: Zap,
      gradient: 'from-sky-500 to-yellow-500',
      description: 'Add time-based pressure to drive decisions',
      quote: '"Create legitimate deadlines with real consequences" - Alex Hormozi',
      content: [
        '• 72-hour decision window (Spot holds expire)',
        '• Early Bird Bonus expires Friday at midnight',
        "• Next cohort doesn't start for 6 weeks",
        '• Summer body deadline (Beach season urgency)',
        '• Pricing increases $500 next month (Grandfathered rates)',
      ],
      output: '⚡ Multiple urgency layers: 72hrs to decide, bonus expires Friday',
      value: '$2,500+ (urgency premium)',
    },
    {
      id: 8,
      title: 'STRATEGIC BONUS STACK',
      icon: Star,
      gradient: 'from-yellow-500 to-violet-500',
      description: "Stack value to break the prospect's mind",
      quote: '"Make bonus value eclipse core offer value" - Alex Hormozi',
      content: [
        '• BONUS #1: "Date Night Ready" 30-Day Challenge ($497 value)',
        '• BONUS #2: Confidence Transformation Mindset Course ($297 value)',
        '• BONUS #3: Partner Support System Guide ($197 value)',
        '• BONUS #4: Plateau-Proof Metabolism Manual ($397 value)',
        '• BONUS #5: Lifetime Alumni Community Access ($997 value)',
      ],
      moreContent: [
        '• BONUS #6: Emergency Fat Loss Protocol ($297 value)',
        '• BONUS #7: Hormone Optimization Guide ($397 value)',
        '• BONUS #8: Social Confidence Bootcamp ($197 value)',
        '• BONUS #9: Maintenance Mode Manual ($297 value)',
        '• BONUS #10: Recipe Makeover Masterclass ($197 value)',
      ],
      output: '🎁 Bonus Stack Value: $3,771 (Exceeds core offer value)',
      value: '$3,771 bonus value',
    },
    {
      id: 9,
      title: 'RISK REVERSAL GUARANTEES',
      icon: Shield,
      gradient: 'from-violet-500 to-sky-500',
      description: 'Reverse risk to eliminate purchase resistance',
      quote: '"Make guarantees stronger than simple money-back" - Alex Hormozi',
      content: [
        '• 60-Day Transformation Guarantee (Lose 15+ lbs or full refund)',
        '• Progress Guarantee (See results in 2 weeks or money back)',
        '• Satisfaction Guarantee (Love the program or 100% refund)',
        '• Effort Guarantee (Follow the plan, get results, or we pay you)',
        '• Lifetime Support Guarantee (Questions answered forever)',
      ],
      output: '🛡️ 5-Layer guarantee system removes all purchase risk',
      value: 'Priceless (risk elimination)',
    },
    {
      id: 10,
      title: 'MAGNETIC NAMING (M.A.G.I.C.)',
      icon: Sparkles,
      gradient: 'from-sky-500 to-yellow-500',
      description: 'Create magnetic offer names using proven formula',
      quote: '"The name is the first impression - make it magnetic" - Alex Hormozi',
      content: [
        '• Magnetic Reason: "Summer Body Emergency"',
        '• Avatar: "Busy Professionals"',
        '• Goal: "Beach-Ready Transformation"',
        '• Interval: "12-Week"',
        '• Container: "Intensive"',
      ],
      output:
        '✨ Final Name: "Summer Body Emergency: 12-Week Beach-Ready Transformation Intensive for Busy Professionals"',
      value: '$5,000+ (naming psychology premium)',
    },
  ]

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
      {/* Notebook Header */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-sm font-semibold text-slate-600">
              grand_slam_offer_generator.ipynb
            </span>
          </div>
          <div className="text-xs text-slate-500 bg-gradient-to-r from-violet-100 to-sky-100 px-3 py-1 rounded-full border border-violet-200">
            Live Demo: Fitness Coaching Business
          </div>
        </div>
      </div>

      {/* Demo Business Context */}
      <div className="bg-gradient-to-r from-violet-50 to-sky-50 px-6 py-4 border-b border-violet-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-500 rounded-lg flex items-center justify-center">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              Business Input: "Fitness Coaching for Busy Professionals"
            </h4>
            <p className="text-xs text-slate-600">
              Watch AI transform this simple idea into a $100M-style offer using all 11 components
            </p>
          </div>
        </div>
      </div>

      {/* Notebook Cells */}
      <div className="relative">
        {/* Connecting Lines */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-300 via-sky-300 to-yellow-300 opacity-30"></div>

        {notebookCells.map((cell, index) => (
          <motion.div
            key={cell.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="relative border-b border-slate-100 last:border-b-0"
          >
            {/* Cell Header */}
            <div
              className="flex items-center p-6 cursor-pointer hover:bg-slate-50/50 transition-colors group"
              onClick={() => toggleCell(cell.id)}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cell.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <cell.icon className="h-5 w-5 text-white" />
                  </div>
                  {/* Connecting dot */}
                  {/* <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-violet-300 rounded-full shadow-sm"></div> */}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      [{cell.id + 1}]:
                    </span>
                    <h3 className="text-lg font-black text-slate-800">{cell.title}</h3>
                    <div className="text-xs bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
                      {cell.value}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-semibold mt-1">{cell.description}</p>
                  <p className="text-xs text-violet-600 italic mt-1 font-medium">{cell.quote}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {openCells.includes(cell.id) ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Cell Content */}
            <motion.div
              initial={false}
              animate={{
                height: openCells.includes(cell.id) ? 'auto' : 0,
                opacity: openCells.includes(cell.id) ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 ml-14">
                {/* Input Section */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Play className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-mono text-slate-500">AI Processing:</span>
                  </div>
                  <div className="space-y-2">
                    {cell.content.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-slate-700 font-medium flex items-start space-x-2"
                      >
                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </div>
                    ))}

                    {cell.moreContent && (
                      <>
                        <motion.div
                          initial={false}
                          animate={{
                            height: showMoreItems[cell.id] ? 'auto' : 0,
                            opacity: showMoreItems[cell.id] ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 pt-2">
                            {cell.moreContent.map((item, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-slate-700 font-medium flex items-start space-x-2"
                              >
                                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>

                        <button
                          onClick={e => {
                            e.stopPropagation()
                            toggleShowMore(cell.id)
                          }}
                          className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center space-x-1 mt-3 bg-violet-50 hover:bg-violet-100 px-3 py-1 rounded-full border border-violet-200 transition-colors"
                        >
                          <span>
                            {showMoreItems[cell.id]
                              ? 'Show Less'
                              : `Show ${cell.moreContent.length} More Items`}
                          </span>
                          {showMoreItems[cell.id] ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Output Section */}
                <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg p-4 border border-violet-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-mono text-slate-500">AI Output:</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700">{cell.output}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Notebook Footer */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI Engine: Claude 4 Sonnet | Status: Processing Complete</span>
          </div>
          <div className="text-xs text-slate-500">
            Total Offer Value: $47,347 → Your Price: $1,997 | Execution time: 2.3s
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()
  useEffect(() => {
    analytics.landingPageView()
  }, [])

  const handleCTAClick = (location: string) => {
    analytics.ctaClick(location)
    if (!user) {
      setAuthMode('signup')
      setAuthModalOpen(true)
    } else {
      // TODO: Navigate to generation page

      router.push('/dashboard')
      console.log('Navigate to generation page')
    }
  }

  const handleSignInClick = () => {
    setAuthMode('signin')
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen relative bg-[#F9FAFB] dotted-bg">
      {/* Animated Connecting Lines */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-violet-300/30 to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              height: '100vh',
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">GrandSlamGenerator.ai</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-slate-600 hover:text-violet-600 transition-colors font-semibold"
            >
              Features
            </a>
            <a
              href="#examples"
              className="text-slate-600 hover:text-violet-600 transition-colors font-semibold"
            >
              Examples
            </a>
            <Link
              href="/react-flow-tutorial"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-semibold flex items-center space-x-2"
            >
              <Brain className="h-4 w-4" />
              <span>React Flow Tutorial</span>
            </Link>
            <Link
              href="/slam-offer-mindmap"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Slam Offer Mindmap</span>
            </Link>

            {loading ? (
              <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-slate-700">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-semibold">{user.email}</span>
                  {user.profile && (
                    <span className="text-xs bg-gradient-to-r from-violet-100 to-sky-100 text-violet-700 px-3 py-1 rounded-full border border-violet-200 font-semibold">
                      {user.profile.subscription_tier}
                    </span>
                  )}
                </div>
                <button
                  onClick={signOut}
                  className="text-slate-500 hover:text-slate-700 transition-colors text-sm font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignInClick}
                className="bg-gradient-to-r from-violet-500 to-sky-500 text-white font-semibold text-sm px-5 py-2 rounded-lg hover:from-violet-600 hover:to-sky-600 transition-all duration-300 shadow-lg"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-12 lg:py-16 z-10 min-h-[85vh] flex items-center">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              {/* Premium Badge */}
              <motion.div
                className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-violet-200 px-6 py-3 rounded-full mb-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Star className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-semibold text-slate-700">
                  AI-Powered by Alex Hormozi's $100M Methodology
                </span>
                <Zap className="h-4 w-4 text-yellow-500" />
              </motion.div>

              <h1 className="text-4xl lg:text-6xl font-black text-slate-800 mb-4 leading-tight">
                Turn Any Idea Into An
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-yellow-500 bg-clip-text text-transparent">
                  Irresistible $100M Offer
                </span>
                <br />
                <span className="text-3xl lg:text-4xl text-violet-600 font-black">
                  In 90 Seconds
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 mb-6 leading-relaxed font-medium">
                AI-powered offer generation that transforms your business ideas into
                <span className="text-sky-600 font-bold">
                  {' '}
                  irresistible offers customers can't refuse
                </span>
                <br />
                <span className="text-slate-500 text-base font-semibold">
                  Based on Alex Hormozi's proven methodology.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  onClick={() => handleCTAClick('hero-primary')}
                  className="bg-gradient-to-r from-violet-500 to-sky-500 hover:from-violet-600 hover:to-sky-600 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-2xl shadow-violet-500/25 flex items-center space-x-3 group transition-all duration-300 hover:shadow-violet-500/40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="h-5 w-5 group-hover:animate-spin" />
                  <span>Watch AI Build Your Offer Live</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <button className="bg-white/60 backdrop-blur-md border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-violet-300 hover:bg-white/80 transition-all duration-300 shadow-lg">
                  <span className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Interactive Demo</span>
                  </span>
                </button>
              </div>

              {/* Premium Social Proof */}
              <div className="text-slate-700 space-y-4">
                <p className="text-base font-bold">
                  🚀 Join <span className="font-black text-sky-600">2,847 entrepreneurs</span>{' '}
                  who've generated{' '}
                  <span className="font-black text-yellow-600">$12.4M in new offers</span>
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-emerald-200 px-4 py-2 rounded-lg shadow-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="font-bold text-slate-700">94% Success Rate</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-sky-200 px-4 py-2 rounded-lg shadow-lg">
                    <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                    <span className="font-bold text-slate-700">90 Second Generation</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-violet-200 px-4 py-2 rounded-lg shadow-lg">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    <span className="font-bold text-slate-700">$100M Methodology</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Visual/Demo Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-slate-200 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">AI Offer Generator</h3>
                  <p className="text-slate-600 text-sm">See the magic happen in real-time</p>
                </div>

                <div className="space-y-3">
                  {[
                    'Analyzing your idea...',
                    'Generating problems & outcomes...',
                    'Building value stack...',
                    'Optimizing pricing...',
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-violet-50 to-sky-50 rounded-lg border border-violet-100"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-sky-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* User Status */}
              {user && (
                <motion.div
                  className="mt-6 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-bold text-slate-700 flex items-center space-x-2">
                        <span>Welcome back!</span>
                        <Sparkles className="h-4 w-4 text-sky-500" />
                      </p>
                      <p className="text-sm text-slate-600 font-semibold">
                        {user.profile?.subscription_tier === 'free'
                          ? `✨ ${user.profile?.credits_remaining || 0} free generations remaining`
                          : '🚀 Unlimited cosmic generations available'}
                      </p>
                    </div>
                    <div className="text-2xl">🎯</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Jupyter Notebook Demo Section */}
      <section className="px-6 py-16 relative z-10 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mb-4">
                Watch AI Build Your{' '}
                <span className="bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent">
                  $100M Offer
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-semibold">
                Interactive demo showing our 5-component framework in action
              </p>
            </motion.div>
          </div>

          <JupyterNotebookDemo />
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="px-6 py-16 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mb-4">
                See the{' '}
                <span className="bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent">
                  AI Magic
                </span>{' '}
                happen
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-semibold">
                AI that reads your mind and creates irresistible offers through our enhanced
                5-component framework
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: 'AI Dream Analysis',
                description: 'Problems & outcomes generation using 4 value drivers',
                gradient: 'from-violet-500 to-sky-500',
                bgColor: 'bg-violet-50/80',
                borderColor: 'border-violet-200',
              },
              {
                icon: Brain,
                title: 'Smart Mindmaps',
                description: 'Interactive visualizations with premium animations',
                gradient: 'from-sky-500 to-yellow-500',
                bgColor: 'bg-sky-50/80',
                borderColor: 'border-sky-200',
              },
              {
                icon: BarChart3,
                title: '5-Component Scoring',
                description: 'Professional analysis with AI optimization',
                gradient: 'from-yellow-500 to-violet-500',
                bgColor: 'bg-yellow-50/80',
                borderColor: 'border-yellow-200',
              },
              {
                icon: Rocket,
                title: 'Premium Exports',
                description: 'Beautiful branded PDFs ready for launch',
                gradient: 'from-violet-500 to-yellow-500',
                bgColor: 'bg-violet-50/80',
                borderColor: 'border-violet-200',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`text-center p-8 rounded-2xl ${feature.bgColor} backdrop-blur-md border ${feature.borderColor} hover:border-violet-300 hover:bg-white/60 transition-all duration-300 group shadow-lg hover:shadow-xl`}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-semibold">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-violet-500 via-sky-500 to-yellow-500 relative overflow-hidden">
        {/* Geometric overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern
                id="cta-geometric"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="5" cy="5" r="2" fill="currentColor" className="text-white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-geometric)" />
          </svg>
        </div>

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to create your Grand Slam Offer?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of entrepreneurs who've transformed their businesses with AI-powered
            offer generation.
          </p>
          <motion.button
            onClick={() => handleCTAClick('footer-cta')}
            className="bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="h-5 w-5" />
            <span>Get Started Free</span>
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-violet-500" />
              <span className="text-lg font-bold text-slate-800">Grand Slam Generator</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2024 Grand Slam Generator. Based on Alex Hormozi's $100M Offers methodology.
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  )
}
