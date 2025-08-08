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
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { setTheme, theme, systemTheme } = useTheme()
  const [activeTheme, setActiveTheme] = React.useState(theme)
  
  React.useEffect(() => {
    setActiveTheme(theme)
  }, [theme])

  const handleThemeChange = (selectedTheme: string) => {
    const isCustomTheme = ['deep-sea', 'mint', 'sunset', 'lavender', 'monochrome'].includes(selectedTheme);
    
    if (isCustomTheme) {
      document.documentElement.setAttribute('data-theme', selectedTheme);
      if (selectedTheme === 'monochrome') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // We still call setTheme to keep next-themes in sync
      setTheme(selectedTheme)
    } else {
      document.documentElement.removeAttribute('data-theme');
      setTheme(selectedTheme);
      if (selectedTheme === 'system') {
        if (systemTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (selectedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
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
            {activeTheme === name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
