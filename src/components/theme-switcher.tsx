"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Check, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  
  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme)
    if (selectedTheme === 'monochrome') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'monochrome');
    } else {
        const isCustomTheme = ['deep-sea', 'mint', 'sunset', 'lavender'].includes(selectedTheme);
        if(isCustomTheme) {
            document.documentElement.setAttribute('data-theme', selectedTheme);
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
  }

  const themes = [
    { name: "light", label: "Light" },
    { name: "dark", label: "Dark" },
    { name: "system", label: "System" },
    { name: "deep-sea", label: "Deep Sea" },
    { name: "mint", label: "Mint" },
    { name: "sunset", label: "Sunset" },
    { name: "lavender", label: "Lavender" },
    { name: "monochrome", label: "Monochrome" },
  ]

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
        {themes.map(({ name, label }) => (
          <DropdownMenuItem key={name} onClick={() => handleThemeChange(name)} className="justify-between">
            {label}
            {theme === name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
