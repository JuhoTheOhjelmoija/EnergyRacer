"use client"

import Link from "next/link"
import Image from "next/image"
import { Award, Coffee, Droplet, Flame, Trophy, Zap } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track Your Caffeine. Race to the Top.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    EnergyRacer helps you track your caffeine intake and compete with others in your region. Join the
                    race today!
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/coffee.png"
                width={550}
                height={550}
                alt="Kahvikuppi"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                priority
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to track your caffeine intake and compete with others
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Droplet className="h-10 w-10 text-green-500 mb-2" />
                  <CardTitle>Track Consumption</CardTitle>
                  <CardDescription>Log your caffeine intake from various sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Keep track of your daily caffeine consumption from coffee, energy drinks, tea, and more.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="h-10 w-10 text-yellow-500 mb-2" />
                  <CardTitle>Regional Leaderboards</CardTitle>
                  <CardDescription>Compete with others in your region</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>See how you rank against others in your area and climb to the top of the leaderboard.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Flame className="h-10 w-10 text-red-500 mb-2" />
                  <CardTitle>Insights & Stats</CardTitle>
                  <CardDescription>Get detailed analytics on your habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>View trends, patterns, and insights about your caffeine consumption over time.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join the Race</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Create an account today and start tracking your caffeine intake
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/auth">Sign Up Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Achievements</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Earn badges and unlock achievements as you track your caffeine journey
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
                <Coffee className="h-12 w-12 text-green-500" />
                <h3 className="text-xl font-bold">First Timer</h3>
                <p className="text-sm text-muted-foreground text-center">Log your first caffeine entry</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
                <Award className="h-12 w-12 text-yellow-500" />
                <h3 className="text-xl font-bold">Caffeine Master</h3>
                <p className="text-sm text-muted-foreground text-center">Log 100 caffeine entries</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
                <Zap className="h-12 w-12 text-purple-500" />
                <h3 className="text-xl font-bold">Energy Bomb</h3>
                <p className="text-sm text-muted-foreground text-center">Consume 500mg caffeine in one day</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
                <Flame className="h-12 w-12 text-red-500" />
                <h3 className="text-xl font-bold">Weekly Streak</h3>
                <p className="text-sm text-muted-foreground text-center">Log caffeine for 7 consecutive days</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} EnergyRacer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 