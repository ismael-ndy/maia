import { LoginForm } from "@/components/auth/login-form"
import { MaiaLogo } from "@/components/maia-logo"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-muted/50 via-muted/30 to-background p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-3">
          <MaiaLogo className="h-10 w-10" />
          <span className="text-2xl font-semibold text-foreground">Maia</span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground leading-tight">Welcome back to your safe space</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Continue your journey toward emotional wellness with Maia by your side.
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
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="text-muted-foreground">Enter your credentials to continue</p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
