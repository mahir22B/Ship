// // components/InsufficientCreditsDialog.tsx
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
//   } from "@/components/ui/dialog";
//   import { Button } from "@/components/ui/button";
  
//   interface InsufficientCreditsDialogProps {
//     isOpen: boolean;
//     onClose: () => void;
//   }
  
//   const InsufficientCreditsDialog = ({ isOpen, onClose }: InsufficientCreditsDialogProps) => {
//     return (
//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="bg-[#14171f] text-white border-gray-800">
//           <DialogHeader>
//             <DialogTitle>Insufficient Credits</DialogTitle>
//             <DialogDescription className="text-gray-400">
//               You don't have enough credits to generate this content.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="mt-4 flex flex-col gap-4">
//             <Button 
//               className="bg-violet-600 hover:bg-violet-700 text-white"
//               onClick={() => {
//                 // Add your purchase credits logic here
//                 console.log('Purchase credits clicked');
//               }}
//             >
//               Purchase Credits
//             </Button>
//             <Button 
//               variant="ghost" 
//               className="text-gray-400 hover:text-white hover:bg-white/10"
//               onClick={onClose}
//             >
//               Cancel
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   };
  
//   export default InsufficientCreditsDialog;

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, HelpCircle, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase/client";

const plans = [
  {
    name: "Basic",
    price: "19.99",
    tagline: "For independent creators:",
    // variantId: "686086",
    variantId: "487847",
    features: [
      "100 credits per month",
      "Basic support access"
    ]
  },
  {
    name: "Pro",
    price: "49.99",
    tagline: "For growing businesses:",
    // variantId: "688242",
    variantId: "487845",
    popular: true,
    features: [
      "Everything in Basic, plus",
      {
        text: "3X credits per month",
        tooltip: "300 credits per month"
      },
      "Premium support access"
    ]
  },
  {
    name: "Enterprise",
    price: "99.99",
    tagline: "For scale & performance:",
    // variantId: "688243",
    variantId: "487846",
    features: [
      "Everything in Pro, plus",
      {
        text: "Extra credits per month",
        tooltip: "600 + 100 extra credits per month"
      },
      "Early access to new features",
      "Dedicated support team"
    ]
  }
];

interface InsufficientCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const InsufficientCreditsDialog = ({ isOpen, onClose }: InsufficientCreditsDialogProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    setError(null);
    setIsLoading(plan.name);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please sign in to subscribe');
        setIsLoading(null); // Reset loading only if there's no session
        return;
      }

      // Call your API route to create checkout
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variantId: plan.variantId,
          userId: session.user.id,
          email: session.user.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Don't reset loading state here - we're about to redirect
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Error creating checkout:', error);
      setError('Failed to create checkout. Please try again.');
      setIsLoading(null); // Reset loading only on error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-[#14171f] to-[#1a1d27] text-white border-gray-800 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-violet-600">
            Select Your Plan
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose the perfect plan to unlock your AI development potential
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="group relative flex flex-col rounded-2xl p-px overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/20 to-violet-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col h-[500px] rounded-2xl border border-gray-800 bg-[#1a1d27] p-8">
                {plan.popular && (
                  <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                )}
                
                <div className="flex flex-col min-h-[160px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.popular && (
                      <span className="flex items-center gap-1 text-xs font-medium text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
                        <Sparkles className="h-3 w-3" />
                        POPULAR
                      </span>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-400">{plan.tagline}</p>
                  
                  <div className="mt-auto mb-8">
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-violet-500/10 shrink-0">
                        <Check className="h-3 w-3 text-violet-400" />
                      </div>
                      <span className="text-sm text-gray-300 flex items-center gap-2">
                        {typeof feature === 'string' ? feature : (
                          <>
                            {feature.text}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="h-3 w-3 text-gray-400 hover:text-violet-400 transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{feature.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                  {/* Placeholder items for consistent height */}
                  {Array.from({ length: 4 - plan.features.length }).map((_, index) => (
                    <li key={`placeholder-${index}`} className="flex items-center gap-3 opacity-0">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-violet-500/10 shrink-0">
                        <Check className="h-3 w-3 text-violet-400" />
                      </div>
                      <span className="text-sm text-gray-300">placeholder</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white transition-all duration-300 shadow-lg shadow-violet-700/20"
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading === plan.name}
                >
                  {isLoading === plan.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsufficientCreditsDialog;