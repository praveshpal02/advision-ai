
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";


export default function Stepper({ steps, currentStep, onStepClick, className }) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol role="list" className="flex items-center justify-between space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <li key={step.name} className="relative flex-1">
            {index < steps.length -1 && (
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={cn(
                    "h-0.5 w-full",
                    step.id < currentStep ? "bg-primary" : "bg-border"
                 )} />
              </div>
            )}

            <button
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick} // Disable click if no handler provided
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200",
                step.id < currentStep ? "bg-primary text-primary-foreground hover:bg-primary/90" : "",
                step.id === currentStep ? "border-2 border-primary bg-background text-primary ring-2 ring-primary ring-offset-2" : "",
                step.id > currentStep ? "border-2 border-border bg-background text-muted-foreground hover:border-muted-foreground" : "",
                 !onStepClick ? "cursor-default" : "cursor-pointer"
              )}
              aria-current={step.id === currentStep ? 'step' : undefined}
            >
              {step.id < currentStep ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-xs font-medium">{step.id}</span>
              )}
               <span className="sr-only">{step.name}</span>
            </button>
            {/* Added text-center to ensure alignment */}
            <p className={cn(
                "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-center sm:text-sm",
                 step.id === currentStep ? "text-primary" : "text-muted-foreground"
                )}>
                {step.name}
            </p>
          </li>
        ))}
      </ol>
    </nav>
  );
}
