import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CyberButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative h-14 w-full bg-transparent border-red-600 border text-red-500 hover:bg-red-950/30 hover:text-red-400 transition-all overflow-visible",
          "before:absolute before:-top-0.5 before:-left-0.5 before:w-3 before:h-3 before:border-t-2 before:border-l-2 before:border-red-500",
          "after:absolute after:-bottom-0.5 after:-right-0.5 after:w-3 after:h-3 after:border-b-2 after:border-r-2 after:border-red-500",
          className
        )}
        {...props}
      >
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-red-500" />
        <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-red-500" />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/10 blur-md rounded-md" />
        
        <span className="relative z-10 font-bold tracking-widest text-lg w-full flex justify-between items-center px-4">
          <span className="flex-1 text-center">{children}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-red-500"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </Button>
    )
  }
)
CyberButton.displayName = "CyberButton"

export { CyberButton }
