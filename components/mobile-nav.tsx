"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Award, Coffee, Home, Menu, Trophy, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: <Home className="h-5 w-5 mr-3" />,
    },
    {
      name: "Tracking",
      href: "/tracking",
      icon: <Coffee className="h-5 w-5 mr-3" />,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: <Trophy className="h-5 w-5 mr-3" />,
    },
    {
      name: "Achievements",
      href: "/achievements",
      icon: <Award className="h-5 w-5 mr-3" />,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5 mr-3" />,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
            <Coffee className="h-6 w-6 text-green-500" />
            <span className="font-bold text-xl">EnergyRacer</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close navigation menu</span>
          </Button>
        </div>
        <nav className="mt-8 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center py-3 text-lg font-medium transition-colors hover:text-foreground",
                pathname === item.href ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
