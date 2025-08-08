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
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme, theme, resolvedTheme } = useTheme()

  const themes = [
    { name: "light", label: "Light" },
    { name: "mint", label: "Mint" },
    { name: "sunset", label: "Sunset" },
  ]
  
  const darkThemes = [
    { name: "dark", label: "Dark" },
    { name: "deep-sea", label: "Deep Sea" },
    { name: "dark-monochrome", label: "Dark Monochrome" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:hidden" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Light Themes</DropdownMenuLabel>
        <DropdownMenuGroup>
          {themes.map(({ name, label }) => (
            <DropdownMenuItem key={name} onClick={() => setTheme(name)} className="justify-between">
              {label}
              {theme === name && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Dark Themes</DropdownMenuLabel>
        <DropdownMenuGroup>
            {darkThemes.map(({ name, label }) => (
                <DropdownMenuItem key={name} onClick={() => setTheme(name)} className="justify-between">
                {label}
                {theme === name && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
