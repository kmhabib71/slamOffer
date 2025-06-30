"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Brain,
  BarChart3,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { analytics } from "@/lib/posthog";

export default function Home() {
  useEffect(() => {
    analytics.landingPageView();
  }, []);

  const handleCTAClick = (location: string) => {
    analytics.ctaClick(location);
    // TODO: Navigate to generation page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-50 px-6 py-4">
        <nav className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">
              Grand Slam Generator
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#examples"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Examples
            </a>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Sign In
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6">
              Turn your idea into an
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                irresistible offer
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              AI-powered offer generation based on Alex Hormozi's proven $100M
              methodology. Transform your business idea into a Grand Slam Offer
              in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                onClick={() => handleCTAClick("hero-primary")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5" />
                <span>Create My Grand Slam Offer</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-slate-400 transition-colors">
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="text-slate-500 text-sm">
              <p>
                Join{" "}
                <span className="font-semibold text-indigo-600">
                  1,247 entrepreneurs
                </span>{" "}
                who've created winning offers
              </p>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Target className="h-16 w-16 text-indigo-500 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Brain className="h-20 w-20 text-purple-500 animate-bounce" />
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="px-6 py-20 bg-white/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              See the magic happen
            </h2>
            <p className="text-xl text-slate-600">
              AI that reads your mind and creates irresistible offers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: "AI reads your mind",
                description:
                  "Dream outcome generation based on your target audience",
              },
              {
                icon: Brain,
                title: "Visual thinking",
                description: "Mindmap mode preview (unlock to see full power)",
              },
              {
                icon: BarChart3,
                title: "Offer scoring",
                description:
                  "Professional grade analysis with improvement suggestions",
              },
              {
                icon: Rocket,
                title: "Pitch-ready export",
                description:
                  "Beautiful PDF exports ready for your next presentation",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-white/80 hover:bg-white transition-colors border border-slate-200"
              >
                <feature.icon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to create your Grand Slam Offer?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of entrepreneurs who've transformed their businesses
            with AI-powered offer generation.
          </p>
          <motion.button
            onClick={() => handleCTAClick("footer-cta")}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="h-5 w-5" />
            <span>Get Started Free</span>
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="text-lg font-bold text-white">
                Grand Slam Generator
              </span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 Grand Slam Generator. Based on Alex Hormozi's $100M Offers
              methodology.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
