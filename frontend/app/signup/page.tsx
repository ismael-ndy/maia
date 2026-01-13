import { SignupForm } from "@/components/auth/signup-form"
import { MaiaLogo } from "@/components/maia-logo"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-muted/50 via-muted/30 to-background p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-3">
          <MaiaLogo className="h-10 w-10" />
          <span className="text-2xl font-semibold text-foreground">Maia</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground leading-tight">Begin your journey to wellness</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Create your account and take the first step toward a calmer, more centered you.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">© 2026 Maia. All rights reserved.</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <MaiaLogo className="h-10 w-10" />
            <span className="text-2xl font-semibold text-foreground">Maia</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Create account</h2>
            <p className="text-muted-foreground">Join Maia and start your wellness journey</p>
          </div>

          <SignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
