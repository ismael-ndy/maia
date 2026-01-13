import { cn } from "@/lib/utils"

interface MaiaLogoProps {
  className?: string
}

export function MaiaLogo({ className }: MaiaLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
    >
      {/* Crescent Moon */}
      <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.1" />
      <path
        d="M65 20C52 20 41 31 41 50C41 69 52 80 65 80C45 80 30 67 30 50C30 33 45 20 65 20Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Small star accent */}
      <circle cx="72" cy="32" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="78" cy="45" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  )
}
