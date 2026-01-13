import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MaiaLogo } from "@/components/maia-logo"
import { ArrowRight, MessageCircle, Shield, Heart } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Your AI companion for mental wellness</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                Where every conversation brings{" "}
                <span className="inline-flex items-center gap-2">
                  <MaiaLogo className="h-10 w-10 md:h-12 md:w-12 inline" />
                </span>{" "}
                <span className="text-muted-foreground">peace of mind</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                At Maia, we believe that every small step toward self-care can create ripples of change. Our
                compassionate AI companion is here to guide you on your journey toward emotional wellness.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/signup">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#about">Learn More</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Maia is an AI support companion. It is not a replacement for professional therapy.
              </p>
            </div>

            {/* Right Content - Hero Visual */}
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Glassmorphism card */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
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
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-amber-300/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-slate-200/40 to-slate-300/20 rounded-full blur-3xl" />
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
            <div className="group p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Always Available</h3>
              <p className="text-muted-foreground leading-relaxed">
                Maia is here 24/7, ready to listen whenever you need someone to talk to.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Safe & Private</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your conversations are secure and confidential. We prioritize your privacy.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Therapist Connected</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with real therapists who can monitor your progress and provide guidance.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <MaiaLogo className="h-16 w-16 mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Maia</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Maia is your AI companion designed to provide emotional support and a safe space for self-reflection.
              While Maia is not a replacement for professional therapy, it can help you process your thoughts, track
              your emotional patterns, and stay connected with your therapist.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">Begin Your Journey</Link>
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
