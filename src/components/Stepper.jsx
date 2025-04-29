
"use client";

import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

export default function Stepper({ steps, currentStep, onStepClick, className }) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className, "mt-8")}>
      <ol role="list" className="flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <li key={step.name} className="relative flex flex-col items-center w-full">
            
            
            
            <div className="absolute top-[18px] left-0 flex w-full items-center" aria-hidden="true">
                  <div className={cn("h-1 w-full", step.id < currentStep ? "bg-primary" : "bg-gray-200",index === steps.length ? "hidden":"")}/>
            </div>
            <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  disabled={!onStepClick}
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200",
                    step.id < currentStep
                      ? "bg-primary text-white hover:bg-purple-600"
                      : step.id === currentStep
                      ? "border-2 border-primary bg-white ring-2 ring-primary ring-offset-2"
                      : "border-2 border-gray-200 bg-white text-gray-400 hover:border-gray-400",
                  !onStepClick ? "cursor-default" : "cursor-pointer",
                  " focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                )}
                aria-current={step.id === currentStep ? "step" : undefined}
              >
                {step.id < currentStep ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <Circle className="h-4 w-4" aria-hidden="true" />
                )}
                  <span className="sr-only">{step.name}</span>
                </button>
                <p
                  className={cn(
                    "mt-2 text-center text-sm font-medium w-full",
                    step.id === currentStep ? "text-primary" : "text-gray-400"
                  )}
                >
                  {step.name}
                </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
