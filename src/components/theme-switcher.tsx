"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  const handleThemeChange = (selectedTheme: string) => {
    const isCustomTheme = ['deep-sea', 'mint', 'sunset', 'lavender', 'monochrome'].includes(selectedTheme);

    if (isCustomTheme) {
      document.documentElement.setAttribute('data-theme', selectedTheme);
      if (selectedTheme === 'monochrome') {
        document.documentElement.classList.add('dark');
        setTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setTheme('light'); 
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      setTheme(selectedTheme);
    }
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>

          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('deep-sea')}>
          Deep Sea
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('mint')}>
          Mint
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('sunset')}>
          Sunset
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('lavender')}>
         Lavender
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('monochrome')}>
          Monochrome
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
