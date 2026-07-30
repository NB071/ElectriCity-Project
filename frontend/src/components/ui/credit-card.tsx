import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface CreditCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardNumber?: string;
  cardHolder?: string;
  expiresMonth?: string;
  expiresYear?: string;
  cvc?: string;
}

export const CreditCardVisual = React.forwardRef<HTMLDivElement, CreditCardProps>(
  ({ className, cardNumber = "", cardHolder = "", expiresMonth = "", expiresYear = "", ...props }, ref) => {
    // Format card number to add spaces
    const formattedCardNumber = cardNumber.replace(/\D/g, "").padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();

    return (
      <div 
        ref={ref}
        className={cn(
          "w-full max-w-[320px] mx-auto relative rounded-xl shadow-xl p-5 flex flex-col justify-between bg-zinc-950 text-white h-[190px] border border-white/10",
          className
        )}
        {...props}
      >
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none rounded-xl" />

        {/* Chip */}
        <div className="w-10 h-7 bg-linear-to-br from-amber-200 to-amber-500 rounded relative shadow-inner overflow-hidden mt-1">
          <div className="absolute inset-0 opacity-20 border border-black rounded" />
          {/* Chip lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-black/30" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-black/30" />
        </div>
        
        {/* Number */}
        <div className="mt-auto mb-4">
          <div className="text-xl tracking-widest font-medium font-mono flex h-6 relative">
            <AnimatePresence mode="popLayout">
              {formattedCardNumber.split("").map((char, i) => (
                <motion.div 
                  key={`${i}-${char === " " ? "space" : char}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className={char === " " ? "w-2 sm:w-3" : "w-3 sm:w-4 text-center"}
                  layout
                >
                  {char}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col flex-1 truncate pr-4">
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider mb-0.5 font-semibold">Card Holder</span>
            <span className="font-medium text-sm tracking-widest uppercase truncate">
              {cardHolder || "YOUR NAME"}
            </span>
          </div>
          
          <div className="flex flex-col">
             <span className="text-[9px] text-zinc-400 uppercase tracking-wider mb-0.5 font-semibold text-right">Expires</span>
             <span className="font-medium text-sm tracking-widest font-mono text-right">
                {expiresMonth || "MM"}/{expiresYear || "YY"}
             </span>
          </div>
        </div>
      </div>
    )
  }
)
CreditCardVisual.displayName = "CreditCardVisual"
