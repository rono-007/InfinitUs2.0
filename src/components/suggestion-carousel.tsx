"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getSuggestions } from "@/ai/flows/suggestion-carousel"
import type { SuggestionOutput } from "@/lib/ai-types"
import { Skeleton } from "./ui/skeleton"

interface SuggestionCarouselProps {
    onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionCarousel({ onSuggestionClick }: SuggestionCarouselProps) {
  const [suggestions, setSuggestions] = React.useState<SuggestionOutput>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchSuggestions() {
      try {
        const result = await getSuggestions()
        setSuggestions(result)
      } catch (error) {
        console.error("Failed to fetch suggestions:", error)
        // Fallback suggestions
        setSuggestions([
            "What is Next.js?",
            "Explain server components.",
            "How does Tailwind CSS work?",
            "What are React Hooks?",
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [])

  return (
    <div className="relative w-full overflow-hidden mb-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:z-10 before:w-24 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:bottom-0 after:z-10 after:w-24 after:bg-gradient-to-l after:from-background after:to-transparent">
        <div className="flex animate-marquee">
            {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="p-1 flex-shrink-0">
                        <Skeleton className="h-[80px] w-[200px]" />
                    </div>
                ))
            ) : (
                [...suggestions, ...suggestions].map((suggestion, index) => (
                    <div key={index} className="p-1 flex-shrink-0">
                        <Card 
                            className="h-[80px] w-[200px] shadow-sm bg-transparent hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer hover:shadow-lg"
                            onClick={() => onSuggestionClick(suggestion)}
                        >
                            <CardContent className="flex items-center justify-center p-4 text-center">
                                <span className="text-sm font-medium">{suggestion}</span>
                            </CardContent>
                        </Card>
                    </div>
                ))
            )}
        </div>
    </div>
  )
}
