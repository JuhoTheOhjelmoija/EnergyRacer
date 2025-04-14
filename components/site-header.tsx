"use client"

import Link from "next/link"
import { Coffee, Home, Trophy, Award, User } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

const items = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Tracking",
    href: "/tracking",
    icon: Coffee
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy
  },
  {
    title: "Achievements",
    href: "/achievements",
    icon: Award
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User
  }
]

export function SiteHeader() {
  const { user: authUser } = useAuth()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href={authUser ? "/dashboard" : "/"} className="flex items-center space-x-2 mr-4">
          <Coffee className="h-6 w-6 text-green-500" />
          <span className="font-bold text-xl hidden sm:inline-block">EnergyRacer</span>
        </Link>
        {!isHomePage && authUser && (
          <div className="hidden md:flex flex-1">
            <MainNav items={items} />
          </div>
        )}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isHomePage && !authUser ? (
            <>
              <Button variant="outline" size="sm" asChild className="hidden md:flex">
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="hidden md:flex">
                <Link href="/auth">Sign Up</Link>
              </Button>
            </>
          ) : null}
          {authUser && (
            <div className="md:hidden">
              <MobileNav />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
