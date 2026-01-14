"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MaiaLogo } from "@/components/maia-logo"
import { ArrowRight, MessageCircle, Shield, Heart, Users, FileText, Bell, TrendingUp, Clock, BookOpen } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background overflow-x-hidden">
      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fade-in-right 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .opacity-0 { opacity: 0; }
      `}</style>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MaiaLogo className="h-8 w-8" />
            <span className="text-xl font-semibold text-foreground">Maia</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#for-therapists" className="text-muted-foreground hover:text-foreground transition-colors">
              For Therapists
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 opacity-0 animate-fade-in-up">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Your AI companion for mental wellness</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance opacity-0 animate-fade-in-up animation-delay-100">
                Where every conversation brings{" "}
                <span className="inline-flex items-center gap-2">
                  <MaiaLogo className="h-10 w-10 md:h-12 md:w-12 inline animate-float-slow" />
                </span>{" "}
                <span className="text-muted-foreground">peace of mind</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed opacity-0 animate-fade-in-up animation-delay-200">
                Maia complements real-world therapy by offering gentle, 24/7 support between sessions — helping you reflect, practice skills, and stay grounded in moments that matter.
              </p>

              <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up animation-delay-300">
                <Button size="lg" className="gap-2 group" asChild>
                  <Link href="/signup">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#about">Learn More</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground opacity-0 animate-fade-in-up animation-delay-400">
                Maia is an AI support companion. It is not a replacement for professional therapy.
              </p>
            </div>

            {/* Right Content - Hero Visual */}
            <div className="relative opacity-0 animate-fade-in-right animation-delay-200">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Glassmorphism card */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden animate-float">
                  {/* Chat preview mockup */}
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                      <MaiaLogo className="h-10 w-10" />
                      <div>
                        <p className="font-medium text-foreground">Maia</p>
                        <p className="text-xs text-emerald-600">Online</p>
                      </div>
                    </div>

                    <div className="flex-1 py-6 space-y-4 overflow-hidden">
                      <div className="flex gap-3">
                        <MaiaLogo className="h-8 w-8 shrink-0" />
                        <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm text-foreground">Hello! I'm Maia. How are you feeling today?</p>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm">I've been feeling a bit overwhelmed lately...</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <MaiaLogo className="h-8 w-8 shrink-0" />
                        <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm text-foreground">
                            I hear you. It takes courage to share that. Would you like to tell me more about what's been
                            on your mind?
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-3">
                        <span className="text-sm text-muted-foreground">Type your message...</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-amber-300/20 rounded-full blur-2xl animate-glow" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-violet-200/40 to-purple-300/20 rounded-full blur-3xl animate-glow animation-delay-200" />
                <div className="absolute top-1/2 -right-12 w-20 h-20 bg-gradient-to-br from-pink-200/30 to-rose-300/20 rounded-full blur-2xl animate-float-slow animation-delay-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Maia?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A safe space designed with care for your emotional wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Always Available</h3>
              <p className="text-muted-foreground leading-relaxed">
                Maia is here 24/7, ready to listen whenever you need someone to talk to.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Safe & Private</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your conversations are secure and confidential. We prioritize your privacy.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Therapist Connected</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with real therapists who can monitor your progress and provide guidance.
              </p>
            </div>
          </div>
        </section>

        {/* For Therapists Section */}
        <section id="for-therapists" className="bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">For Mental Health Professionals</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Empower Your Practice with Maia</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Extend your care beyond the therapy room. Maia helps you stay connected with patients and gain deeper insights into their wellbeing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">24/7 Patient Support</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Maia provides continuous support between sessions, helping patients practice coping skills and stay grounded when you're not available.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Generated Reports</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Receive weekly summaries of patient conversations, mood patterns, and key themes to prepare for more effective sessions.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Safety Alerts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get notified immediately when Maia detects concerning patterns or crisis indicators in patient conversations.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor patient engagement and emotional trends over time to measure therapeutic progress and adjust treatment plans.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Session Notes Integration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload session notes to help Maia provide more personalized and context-aware support aligned with your treatment approach.
                </p>
              </div>

              <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Built with privacy and security in mind. All patient data is encrypted and handled according to healthcare privacy standards.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="gap-2 group" asChild>
                <Link href="/signup">
                  Join as a Therapist
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400/30 to-purple-400/30 blur-xl animate-glow" />
              <MaiaLogo className="relative h-16 w-16 mx-auto animate-float-slow" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Maia</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Maia is your AI companion designed to provide emotional support and a safe space for self-reflection.
              While Maia is not a replacement for professional therapy, it can help you process your thoughts, track
              your emotional patterns, and stay connected with your therapist.
            </p>
            <Button size="lg" className="group" asChild>
              <Link href="/signup">
                Begin Your Journey
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MaiaLogo className="h-6 w-6" />
              <span className="font-medium text-foreground">Maia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Maia. All rights reserved. Not a replacement for professional therapy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
