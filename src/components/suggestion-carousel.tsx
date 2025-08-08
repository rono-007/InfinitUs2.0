"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getSuggestions } from "@/ai/flows/suggestion-carousel"
import type { SuggestionOutput } from "@/lib/ai-types"
import { Skeleton } from "./ui/skeleton"
import Autoplay from "embla-carousel-autoplay"

interface SuggestionCarouselProps {
    onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionCarousel({ onSuggestionClick }: SuggestionCarouselProps) {
  const [suggestions, setSuggestions] = React.useState<SuggestionOutput>([])
  const [loading, setLoading] = React.useState(true)

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

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
    <div className="mb-4">
      <Carousel 
        plugins={[plugin.current]}
        opts={{ align: "start", loop: true }} 
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Skeleton className="h-[80px] w-full" />
                  </div>
                </CarouselItem>
              ))
            : suggestions.map((suggestion, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card 
                        className="h-[80px] border-0 shadow-sm bg-background hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer hover:shadow-lg"
                        onClick={() => onSuggestionClick(suggestion)}
                    >
                      <CardContent className="flex items-center justify-center p-4 text-center">
                        <span className="text-sm font-medium">{suggestion}</span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious className="ml-8" />
        <CarouselNext className="mr-8" />
      </Carousel>
    </div>
  )
}
