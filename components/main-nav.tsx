"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface MainNavProps {
  items?: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}

export const MainNav = React.memo(({ items }: MainNavProps) => {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 md:gap-10">
      {items?.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-lg font-medium transition-colors hover:text-primary",
              pathname === item.href
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            <Icon className="h-5 w-5 mr-2" />
            {item.title}
          </Link>
        )
      })}
    </div>
  )
})
