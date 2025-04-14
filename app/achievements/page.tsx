"use client"

import React, { useEffect, useState } from "react"
import type { JSX } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Coffee,
  Flame,
  Zap,
  Clock,
  Calendar,
  TrendingUp,
  Star,
  Medal,
  Trophy,
  Droplet,
  Sunrise,
  Sunset,
  Lightbulb,
  Target,
  Crown,
  Heart,
  Sparkles,
  Leaf,
  Rocket,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { format, isWithinInterval, subDays } from "date-fns"

interface Achievement {
  id: string
  title: string
  description: string
  longDescription: string
  icon: JSX.Element
  progress: number
  completed: boolean
  date?: string
  current?: number
  total: number
  category: string
}

interface ConsumptionEntry {
  id: string
  user_id: string
  drink_name: string
  caffeine_amount: number
  created_at: string
  updated_at: string | null
}

interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  completed_at: string | null
  progress: number
  created_at: string
  updated_at: string | null
}

export default function AchievementsPage() {
  const { user: authUser } = useAuth()
  const [entries, setEntries] = useState<ConsumptionEntry[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])

  const categories = [
    { id: "all", name: "All Achievements" },
    { id: "daily", name: "Daily Habits" },
    { id: "milestones", name: "Milestones" },
    { id: "challenges", name: "Challenges" },
    { id: "special", name: "Special" },
  ]

  useEffect(() => {
    if (authUser) {
      fetchEntries()
      fetchUserAchievements()
    }
  }, [authUser])

  const fetchEntries = async () => {
    try {
      if (!authUser?.id) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('consumption')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map(entry => ({
        ...entry,
        user_id: entry.user_id || authUser.id
      })) as ConsumptionEntry[]

      setEntries(formattedData)
      calculateAchievements(formattedData)
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Error fetching entries')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserAchievements = async () => {
    try {
      if (!authUser?.id) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', authUser.id)

      if (error) throw error

      const formattedData = (data || []).map(achievement => ({
        id: achievement.id,
        user_id: achievement.user_id,
        achievement_id: achievement.achievement_id,
        completed_at: achievement.achieved_at || null,
        progress: 0,
        created_at: achievement.created_at,
        updated_at: achievement.updated_at
      })) as UserAchievement[]

      setUserAchievements(formattedData)
    } catch (error) {
      console.error('Error fetching user achievements:', error)
      toast.error('Error fetching achievements')
    }
  }

  const updateAchievement = async (achievementId: string, progress: number, completed: boolean) => {
    try {
      if (!authUser?.id) {
        throw new Error('No authenticated user')
      }

      const existingAchievement = userAchievements.find(
        ua => ua.achievement_id === achievementId
      )

      if (completed && !existingAchievement?.completed_at) {
        const { error } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: authUser.id,
            achievement_id: achievementId,
            completed_at: new Date().toISOString(),
            progress: 100
          })

        if (error) throw error

        toast.success('New achievement earned!')
        await fetchUserAchievements()
      } else if (!completed && progress !== existingAchievement?.progress) {
        const { error } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: authUser.id,
            achievement_id: achievementId,
            progress: progress,
            completed_at: null
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating achievement:', error)
    }
  }

  const calculateAchievements = (entries: ConsumptionEntry[]) => {
    const now = new Date()
    const achievementsList: Achievement[] = [
      {
        id: "1",
      title: "First Timer",
        description: "Log your first caffeine entry to start your journey",
        longDescription: "Every journey begins with a single step. Log your first caffeine entry to start tracking your consumption and unlock your caffeine journey.",
      icon: <Coffee className="h-8 w-8 text-green-500" />,
        progress: entries.length > 0 ? 100 : 0,
        completed: entries.length > 0,
        date: entries.length > 0 ? format(new Date(entries[entries.length - 1].created_at), 'yyyy-MM-dd') : undefined,
        total: 1,
        category: "daily"
      },
      {
        id: "2",
        title: "Morning Ritual",
        description: "Log caffeine before 8:00 AM for 5 consecutive days",
        longDescription: "Start your day right! Log your morning caffeine intake before 8:00 AM for 5 consecutive days to prove your dedication to the morning ritual.",
        icon: <Sunrise className="h-8 w-8 text-orange-400" />,
        progress: 0,
        completed: false,
        current: 0,
        total: 5,
        category: "daily"
      },
      {
        id: "3",
        title: "Night Owl",
        description: "Log caffeine after 8:00 PM for 3 consecutive days",
        longDescription: "Burning the midnight oil? Log your evening caffeine intake after 8:00 PM for 3 consecutive days to earn your Night Owl status.",
        icon: <Sunset className="h-8 w-8 text-indigo-400" />,
        progress: 0,
        completed: false,
        current: 0,
        total: 3,
        category: "daily"
      },
      {
        id: "4",
        title: "Consistent Consumer",
        description: "Log at least one caffeine entry every day for 2 weeks",
        longDescription: "Consistency is key! Log at least one caffeine entry every day for 2 weeks straight to demonstrate your unwavering commitment.",
        icon: <Calendar className="h-8 w-8 text-blue-500" />,
        progress: 0,
        completed: false,
        current: 0,
        total: 14,
        category: "daily"
      },
      {
        id: "5",
        title: "Variety Seeker",
        description: "Log 5 different types of caffeine sources in a single week",
        longDescription: "Expand your horizons! Log 5 different types of caffeine sources (coffee, tea, energy drinks, etc.) within a single week to show your diverse taste.",
        icon: <Droplet className="h-8 w-8 text-cyan-500" />,
        progress: 0,
        completed: false,
        current: 0,
        total: 5,
        category: "daily"
      },

      {
        id: "6",
        title: "Caffeine Apprentice",
        description: "Reach a total of 1,000mg of caffeine consumed",
        longDescription: "You're just getting started! Reach a total of 1,000mg of caffeine consumed to earn your first milestone on the path to caffeine mastery.",
        icon: <Award className="h-8 w-8 text-yellow-500" />,
        progress: 0,
        completed: false,
        total: 1000,
        category: "milestones"
      },
      {
        id: "7",
        title: "Caffeine Enthusiast",
        description: "Reach a total of 5,000mg of caffeine consumed",
        longDescription: "Your enthusiasm is showing! Reach a total of 5,000mg of caffeine consumed to demonstrate your growing appreciation for the energy-boosting elixir.",
        icon: <Award className="h-8 w-8 text-yellow-500" />,
        progress: 0,
        completed: false,
        total: 5000,
        category: "milestones"
      },
      {
        id: "8",
        title: "Caffeine Addict",
        description: "Reach a total of 10,000mg of caffeine consumed",
        longDescription: "Your dedication is undeniable! Reach a total of 10,000mg of caffeine consumed to cement your status as a true caffeine aficionado.",
        icon: <Award className="h-8 w-8 text-yellow-500" />,
        progress: 0,
        completed: false,
        total: 10000,
        category: "milestones"
      },
      {
        id: "9",
      title: "Caffeine Master",
        description: "Reach a total of 25,000mg of caffeine consumed",
        longDescription: "Ascend to mastery! Reach a total of 25,000mg of caffeine consumed to join the elite ranks of caffeine connoisseurs.",
        icon: <Crown className="h-8 w-8 text-yellow-500" />,
        progress: 0,
        completed: false,
        total: 25000,
        category: "milestones"
      },
      {
        id: "10",
        title: "Caffeine Legend",
        description: "Reach a total of 50,000mg of caffeine consumed",
        longDescription: "Become a living legend! Reach a total of 50,000mg of caffeine consumed to achieve legendary status in the caffeine community.",
        icon: <Star className="h-8 w-8 text-yellow-500" />,
        progress: 0,
        completed: false,
        total: 50000,
        category: "milestones"
      },

      {
        id: "11",
        title: "Entry Milestone: 10",
        description: "Log 10 caffeine entries",
        longDescription: "You're building a habit! Log 10 caffeine entries to mark your first tracking milestone.",
        icon: <TrendingUp className="h-8 w-8 text-green-500" />,
        progress: Math.min((entries.length / 10) * 100, 100),
        completed: entries.length >= 10,
        current: entries.length,
        total: 10,
        category: "milestones"
      },
      {
        id: "12",
        title: "Entry Milestone: 50",
        description: "Log 50 caffeine entries",
        longDescription: "Your tracking is becoming serious! Log 50 caffeine entries to demonstrate your commitment to monitoring your consumption.",
        icon: <TrendingUp className="h-8 w-8 text-green-500" />,
        progress: Math.min((entries.length / 50) * 100, 100),
        completed: entries.length >= 50,
        current: entries.length,
        total: 50,
        category: "milestones"
      },
      {
        id: "13",
        title: "Entry Milestone: 100",
      description: "Log 100 caffeine entries",
        longDescription: "You're a dedicated tracker! Log 100 caffeine entries to showcase your impressive commitment to monitoring your caffeine journey.",
        icon: <TrendingUp className="h-8 w-8 text-green-600" />,
        progress: Math.min((entries.length / 100) * 100, 100),
        completed: entries.length >= 100,
        current: entries.length,
      total: 100,
        category: "milestones"
      },
      {
        id: "14",
        title: "Entry Milestone: 500",
        description: "Log 500 caffeine entries",
        longDescription: "Your dedication is extraordinary! Log 500 caffeine entries to join the elite ranks of the most meticulous caffeine trackers.",
        icon: <TrendingUp className="h-8 w-8 text-green-700" />,
        progress: Math.min((entries.length / 500) * 100, 100),
        completed: entries.length >= 500,
        current: entries.length,
        total: 500,
        category: "milestones"
      },

      {
        id: "15",
      title: "Energy Bomb",
        description: "Consume 500mg of caffeine in a single day",
        longDescription: "Push your limits! Consume 500mg of caffeine in a single day to experience the full power of caffeine's energy-boosting effects.",
      icon: <Zap className="h-8 w-8 text-purple-500" />,
        progress: 0,
        completed: false,
        total: 500,
        category: "challenges"
      },
      {
        id: "16",
      title: "Weekly Streak",
      description: "Log caffeine for 7 consecutive days",
        longDescription: "Build momentum! Log your caffeine intake for 7 consecutive days to establish a solid tracking routine.",
      icon: <Flame className="h-8 w-8 text-red-500" />,
        progress: 0,
        completed: false,
        total: 7,
        category: "challenges"
      },
      {
        id: "17",
      title: "Monthly Streak",
      description: "Log caffeine for 30 consecutive days",
        longDescription: "Maintain your discipline! Log your caffeine intake for 30 consecutive days to prove your unwavering commitment to tracking.",
        icon: <Flame className="h-8 w-8 text-red-600" />,
        progress: 0,
        completed: false,
        total: 30,
        category: "challenges"
      },
      {
        id: "18",
        title: "Quarterly Streak",
        description: "Log caffeine for 90 consecutive days",
        longDescription: "Demonstrate extraordinary dedication! Log your caffeine intake for 90 consecutive days to achieve a rare feat of consistent tracking.",
        icon: <Flame className="h-8 w-8 text-red-700" />,
        progress: 0,
        completed: false,
        total: 90,
        category: "challenges"
      },
      {
        id: "19",
        title: "Coffee Connoisseur",
        description: "Log 50 cups of coffee",
        longDescription: "Appreciate the finer things! Log 50 cups of coffee to showcase your appreciation for the world's most popular caffeine source.",
        icon: <Coffee className="h-8 w-8 text-amber-700" />,
        progress: 0,
        completed: false,
        total: 50,
        category: "challenges"
      },
      {
        id: "20",
        title: "Energy Drink Enthusiast",
        description: "Log 20 energy drinks",
        longDescription: "Embrace the buzz! Log 20 energy drinks to demonstrate your enthusiasm for high-octane caffeine delivery systems.",
        icon: <Zap className="h-8 w-8 text-blue-500" />,
        progress: 0,
        completed: false,
        total: 20,
        category: "challenges"
      },
      {
        id: "21",
        title: "Tea Aficionado",
        description: "Log 30 cups of tea",
        longDescription: "Appreciate the subtle art! Log 30 cups of tea to show your refined taste for this ancient and sophisticated caffeine source.",
        icon: <Leaf className="h-8 w-8 text-green-500" />,
        progress: 0,
      completed: false,
      total: 30,
        category: "challenges"
      },
      {
        id: "22",
        title: "Espresso Express",
        description: "Log 5 espressos in a single day",
        longDescription: "Intensity is your style! Log 5 espressos in a single day to prove your love for concentrated caffeine experiences.",
        icon: <Rocket className="h-8 w-8 text-red-500" />,
        progress: 0,
        completed: false,
        total: 5,
        category: "challenges"
      },

      {
        id: "23",
      title: "Early Bird",
        description: "Log caffeine before 6:00 AM five times",
        longDescription: "Rise and shine! Log your caffeine intake before 6:00 AM five times to earn recognition for your early morning dedication.",
        icon: <Clock className="h-8 w-8 text-orange-500" />,
        progress: 0,
        completed: false,
        total: 5,
        category: "special"
      },
      {
        id: "24",
        title: "Weekend Warrior",
        description: "Log caffeine on 5 consecutive weekends",
        longDescription: "No days off! Log your caffeine intake on 5 consecutive weekends to show your commitment extends beyond the work week.",
        icon: <Calendar className="h-8 w-8 text-indigo-500" />,
        progress: 0,
        completed: false,
        total: 5,
        category: "special"
      },
      {
        id: "25",
        title: "Global Explorer",
        description: "Log 5 different drink types",
        longDescription: "Expand your horizons! Log 5 different types of drinks (coffee, tea, energy drinks, etc.) to demonstrate your diverse caffeine palette.",
        icon: <Target className="h-8 w-8 text-blue-500" />,
        progress: 0,
      completed: false,
      total: 5,
        category: "special"
      },
      {
        id: "26",
        title: "Caffeine Scholar",
        description: "Read 10 articles about caffeine in the app",
        longDescription: "Knowledge is power! Read 10 articles about caffeine in the app to deepen your understanding of your favorite stimulant.",
        icon: <Lightbulb className="h-8 w-8 text-yellow-400" />,
        progress: 0,
        completed: false,
        total: 10,
        category: "special"
      },
      {
        id: "27",
        title: "Social Sipper",
        description: "Share your caffeine stats on social media 3 times",
        longDescription: "Spread the word! Share your caffeine stats on social media 3 times to inspire others to join the caffeine tracking movement.",
        icon: <Heart className="h-8 w-8 text-pink-500" />,
        progress: 0,
        completed: false,
        total: 3,
        category: "special"
      },
      {
        id: "28",
        title: "Leaderboard Legend",
        description: "Reach the top 3 on your regional leaderboard",
        longDescription: "Rise to fame! Reach the top 3 positions on your regional leaderboard to gain recognition for your impressive caffeine consumption.",
        icon: <Trophy className="h-8 w-8 text-yellow-500" />,
        progress: 0,
      completed: false,
        total: 1,
        category: "special"
      },
      {
        id: "29",
        title: "Perfect Balance",
        description: "Maintain the same daily caffeine intake (±10mg) for 7 days",
        longDescription: "Master of consistency! Maintain the same daily caffeine intake (with a margin of ±10mg) for 7 consecutive days to demonstrate your precise control.",
        icon: <Sparkles className="h-8 w-8 text-purple-400" />,
        progress: 0,
        completed: false,
        total: 7,
        category: "special"
      },
      {
        id: "30",
        title: "Caffeine Scientist",
        description: "Track your mood alongside caffeine for 14 days",
        longDescription: "Correlation or causation? Track your mood alongside your caffeine intake for 14 days to uncover personal insights about how caffeine affects you.",
        icon: <Medal className="h-8 w-8 text-blue-400" />,
        progress: 0,
        completed: false,
        total: 14,
        category: "special"
      }
    ]

    const dailyConsumption = entries.reduce((acc, entry) => {
      const date = format(new Date(entry.created_at), 'yyyy-MM-dd')
      acc[date] = (acc[date] || 0) + entry.caffeine_amount
      return acc
    }, {} as Record<string, number>)

    const totalCaffeine = entries.reduce((sum, entry) => sum + entry.caffeine_amount, 0)

    achievementsList.forEach(achievement => {
      if (achievement.category === "milestones" && achievement.id >= "6" && achievement.id <= "10") {
        achievement.progress = Math.min((totalCaffeine / achievement.total) * 100, 100)
        achievement.completed = totalCaffeine >= achievement.total
        achievement.current = totalCaffeine
      }
    })


    achievementsList.forEach(achievement => {
      const wasCompleted = achievement.completed
      const oldProgress = achievement.progress


      if (wasCompleted !== achievement.completed || oldProgress !== achievement.progress) {
        updateAchievement(achievement.id, achievement.progress, achievement.completed)
      }
    })

    setAchievements(achievementsList)
  }

  const getFilteredAchievements = (category: string, completed: boolean) => {
    return achievements.filter((a) => (category === "all" || a.category === category) && a.completed === completed)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="text-center">Ladataan saavutuksia...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
            <p className="text-muted-foreground">
              Earn achievements by tracking your caffeine consumption and completing challenges
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Stats</CardTitle>
                <CardDescription>Your progress in collecting achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Award className="h-10 w-10 text-yellow-500 mb-2" />
                    <h3 className="text-lg font-bold">{achievements.filter((a) => a.completed).length}</h3>
                    <p className="text-sm text-muted-foreground">Earned</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Award className="h-10 w-10 text-gray-500 mb-2" />
                    <h3 className="text-lg font-bold">{achievements.filter((a) => !a.completed).length}</h3>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Award className="h-10 w-10 text-green-500 mb-2" />
                    <h3 className="text-lg font-bold">
                      {Math.round((achievements.filter((a) => a.completed).length / achievements.length) * 100)}%
                    </h3>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Star className="h-10 w-10 text-purple-500 mb-2" />
                    <h3 className="text-lg font-bold">{categories.length - 1}</h3>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full flex justify-start overflow-auto">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex-shrink-0"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="grid gap-6">
                    {getFilteredAchievements(category.id, false).length > 0 && (
            <Card>
              <CardHeader>
                          <CardTitle>In Progress</CardTitle>
                <CardDescription>Achievements you are currently working towards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {getFilteredAchievements(category.id, false).map((achievement) => (
                    <div key={achievement.id} className="bg-muted p-4 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="bg-background p-2 rounded-full">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <Progress value={achievement.progress} className="h-2 mb-1" />
                          <p className="text-xs text-right text-muted-foreground">
                                      {achievement.current || 0} / {achievement.total}
                          </p>
                                    <div className="mt-2 pt-2 border-t border-background">
                                      <p className="text-xs text-muted-foreground">{achievement.longDescription}</p>
                                    </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
                    )}

            {/* done achievements */}
                    {getFilteredAchievements(category.id, true).length > 0 && (
            <Card>
              <CardHeader>
                          <CardTitle>Completed</CardTitle>
                          <CardDescription>Achievements you have already earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {getFilteredAchievements(category.id, true).map((achievement) => (
                    <div key={achievement.id} className="bg-muted p-4 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="bg-background p-2 rounded-full">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold">{achievement.title}</h3>
                            <Badge variant="outline" className="ml-2">
                              Completed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground">
                                      Earned: {achievement.date ? format(new Date(achievement.date), "MMM d, yyyy") : "Unknown date"}
                          </p>
                                    <div className="mt-2 pt-2 border-t border-background">
                                      <p className="text-xs text-muted-foreground">{achievement.longDescription}</p>
                                    </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
                    )}

                    {getFilteredAchievements(category.id, true).length === 0 && 
                     getFilteredAchievements(category.id, false).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>No achievements in this category yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
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
