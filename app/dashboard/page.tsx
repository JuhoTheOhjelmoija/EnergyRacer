"use client"

import { useEffect, useState, JSX, useCallback } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Award, Coffee, LineChart, Plus, Trophy, Zap, Flame, Sunrise } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: string
  name: string | null
  avatar_url: string | null
  daily_goal: number
  total_caffeine: number
  region: string | null
  show_in_region_ranking: boolean
  created_at: string | null
  updated_at: string | null
}

interface Consumption {
  id: string
  user_id: string | null
  drink_name: string
  caffeine_amount: number
  created_at: string | null
  updated_at: string | null
}

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  total: number;
  created_at: string;
  updated_at: string;
}

type FormattedAchievement = {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  progress: number;
  current: number;
  total: number;
  date: string | null;
  created_at: string;
  updated_at: string;
}

type UserAchievementInsert = {
  user_id: string;
  achievement_id: string;
  progress: number;
  completed_at: string | null;
}

type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    total: number;
    created_at: string;
    updated_at: string;
  };
  achieved_at?: string;
}

interface LeaderboardUser {
  id: string
  name: string
  avatar_url: string | null
  total_caffeine: number
  region: string
}

const recentAchievements: Achievement[] = []

const inProgressAchievements: Achievement[] = []

const LeaderboardCard = ({ users }: { users: LeaderboardUser[] }) => {
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Rankings</CardTitle>
        <CardDescription>Top caffeine consumers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user, index) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6">
                    {index === 0 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <span className="text-lg font-medium text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.name || 'User'} />
                    <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.region || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-green-500" />
                  <span className="font-bold">{user.total_caffeine} mg</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link href="/leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            View All
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [entries, setEntries] = useState<Consumption[]>([])
  const [recentEntries, setRecentEntries] = useState<Consumption[]>([])
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([])
  const [inProgressAchievements, setInProgressAchievements] = useState<FormattedAchievement[]>([])
  const [recentAchievements, setRecentAchievements] = useState<FormattedAchievement[]>([])
  const [caffeineData, setCaffeineData] = useState<any[]>([])
  const [newCaffeine, setNewCaffeine] = useState({
    amount: "",
    source: "coffee",
    timestamp: new Date().toISOString()
  })
  const [dailyTotal, setDailyTotal] = useState(0)
  const [weeklyData, setWeeklyData] = useState<{ name: string; amount: number }[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) {
      return
    }

    try {
      setIsLoading(true)
      
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, name, region, daily_goal, total_caffeine, show_in_region_ranking, created_at, updated_at, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (userError) {
        console.error("Error fetching user profile:", userError)
        toast.error("Failed to load user data")
        return
      }

      if (!userProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || 'Anonymous',
            region: user.user_metadata?.region || 'Helsinki',
            daily_goal: 400,
            total_caffeine: 0,
            show_in_region_ranking: true,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating user profile:", createError)
          toast.error("Failed to create user profile")
          return
        }

        setUserData(newProfile)
      } else {
        setUserData(userProfile)
      }

      const { data: caffeineEntries, error: caffeineError } = await supabase
        .from('consumption')
        .select('id, user_id, drink_name, caffeine_amount, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (caffeineError) {
        console.error("Error fetching caffeine entries:", caffeineError)
        toast.error("Failed to load caffeine entries")
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEntries = caffeineEntries?.filter(entry => {
        const entryDate = new Date(entry.created_at)
        return entryDate >= today
      }) || []

      const todayTotal = todayEntries.reduce((sum, entry) => sum + (entry.caffeine_amount || 0), 0)

      const recentEntries = caffeineEntries?.slice(0, 5) || []

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weeklyEntries = caffeineEntries?.filter(entry => {
        const entryDate = new Date(entry.created_at)
        return entryDate >= weekAgo
      }) || []

      const weeklyData = weeklyEntries.reduce((acc, entry) => {
        const date = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' })
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += entry.caffeine_amount || 0
        return acc
      }, {} as Record<string, number>)

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const completeWeeklyData = days.map(day => ({
        name: day,
        amount: weeklyData[day] || 0
      }))

      const { data: topUsers, error: leaderboardError } = await supabase
        .from('users')
        .select('id, name, region, total_caffeine, avatar_url')
        .eq('show_in_region_ranking', true)
        .order('total_caffeine', { ascending: false })
        .limit(5)

      if (leaderboardError) {
        console.error("Error fetching top users:", leaderboardError)
        toast.error("Failed to load leaderboard data")
      } else {
        setTopUsers(topUsers || [])
      }

      const { data: allAchievements, error: allAchievementsError } = await supabase
        .from('achievements')
        .select('*')

      if (allAchievementsError) {
        console.error("Error fetching all achievements:", allAchievementsError)
        toast.error("Failed to load achievements")
        return
      }

      const { data: userAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          progress,
          completed_at,
          achievements (
            id,
            title,
            description,
            icon,
            total
          )
        `)
        .eq('user_id', user.id)

      if (achievementsError) {
        console.error("Error fetching achievements:", achievementsError)
        toast.error("Failed to load achievements")
      } else {
        const achievementsWithProgress = allAchievements?.map(achievement => {
          const userAchievement = userAchievements?.find(ua => ua.achievements.id === achievement.id)
          const progress = calculateAchievementProgress(achievement, caffeineEntries || [], userProfile)

          return {
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: getAchievementIcon(achievement.icon),
            progress,
            current: progress,
            total: achievement.total,
            date: userAchievement?.completed_at || null,
            created_at: achievement.created_at,
            updated_at: achievement.updated_at
          }
        }) || []

        const completed = achievementsWithProgress.filter(a => a.progress >= a.total)
        const inProgress = achievementsWithProgress.filter(a => a.progress < a.total)

        setRecentAchievements(completed.slice(0, 3))
        setInProgressAchievements(inProgress.slice(0, 3))

        for (const achievement of achievementsWithProgress) {
          const existingAchievement = userAchievements?.find(ua => ua.achievements.id === achievement.id)
          
          if (existingAchievement) {
            if (existingAchievement.progress !== achievement.progress) {
              const { error: updateError } = await supabase
                .from('user_achievements')
                .update({
                  progress: achievement.progress,
                  completed_at: achievement.progress >= achievement.total ? new Date().toISOString() : null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingAchievement.id)

              if (updateError) {
                console.error("Error updating achievement:", updateError)
              }
            }
          } else {
            const { error: insertError } = await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_id: achievement.id,
                progress: achievement.progress,
                completed_at: achievement.progress >= achievement.total ? new Date().toISOString() : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              console.error("Error creating achievement:", insertError)
            }
          }
        }
      }

      setCaffeineData(caffeineEntries || [])
      setDailyTotal(todayTotal)
      setRecentEntries(recentEntries)
      setWeeklyData(completeWeeklyData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="h-6 w-6 text-purple-500" />
      case 'flame':
        return <Flame className="h-6 w-6 text-red-500" />
      case 'coffee':
        return <Coffee className="h-6 w-6 text-green-500" />
      case 'award':
        return <Award className="h-6 w-6 text-yellow-500" />
      default:
        return <Award className="h-6 w-6 text-primary" />
    }
  }

  const handleAddCaffeine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsLoading(true)
      const amount = parseFloat(newCaffeine.amount)
      
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount")
        return
      }

      const { error } = await supabase
        .from('consumption')
        .insert({
          user_id: user.id,
          amount,
          source: newCaffeine.source,
          timestamp: newCaffeine.timestamp
        })

      if (error) {
        console.error("Error adding caffeine entry:", error)
        toast.error("Failed to add caffeine entry")
        return
      }

      // Update total caffeine
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_caffeine: (userData?.total_caffeine || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error("Error updating total caffeine:", updateError)
        toast.error("Failed to update total caffeine")
        return
      }

      toast.success("Caffeine entry added successfully!")
      setNewCaffeine({
        amount: "",
        source: "coffee",
        timestamp: new Date().toISOString()
      })
      loadData()
    } catch (error) {
      console.error("Error adding caffeine:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getProgressColor = (dailyTotal: number, dailyGoal: number) => {
    const percentage = (dailyTotal / dailyGoal) * 100;
    
    if (dailyGoal <= 100) {
      return percentage > 100 ? 'bg-red-500' : 'bg-green-500';
    } else if (dailyGoal <= 200) {
      return percentage > 100 ? 'bg-red-500' : 'bg-yellow-500';
    } else if (dailyGoal <= 400) {
      return percentage > 100 ? 'bg-red-500' : 'bg-orange-500';
    } else if (dailyGoal <= 600) {
      return percentage > 100 ? 'bg-red-500' : 'bg-red-500';
    } else {
      return percentage > 100 ? 'bg-red-500' : 'bg-purple-500';
    }
  };

  const progressPercentage = userData ? (dailyTotal / userData.daily_goal) * 100 : 0

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Welcome, {userData?.name || 'User'}!</h1>
              <p className="text-muted-foreground">Here's a summary of your caffeine consumption</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/tracking">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Daily Consumption</CardTitle>
                <CardDescription>Today's caffeine intake</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-3xl font-bold">{dailyTotal} mg</div>
                  <div className="text-sm text-muted-foreground">/ {userData?.daily_goal || 400} mg</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(dailyTotal, userData?.daily_goal || 400)}`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round(progressPercentage)}% of your daily goal
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/tracking">
                    <LineChart className="mr-2 h-4 w-4" />
                    View Stats
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Entries</CardTitle>
                <CardDescription>Your latest caffeine entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.length > 0 ? (
                    recentEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Coffee className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{entry.drink_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.created_at).toLocaleDateString('fi-FI')}
                            </p>
                          </div>
                        </div>
                        <div className="font-bold">{entry.caffeine_amount} mg</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Coffee className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No entries yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/tracking">
                    <Coffee className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <LeaderboardCard users={topUsers} />

            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Weekly Summary</CardTitle>
                <CardDescription>Your caffeine consumption over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => value > 0 ? [`${value} mg`, 'Caffeine'] : ['No entries', 'Caffeine']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--popover-foreground))'
                      }}
                      labelStyle={{ 
                        color: 'hsl(var(--popover-foreground))'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))"
                      minPointSize={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Achievements</CardTitle>
                <CardDescription>Your progress and recent achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">In Progress</h3>
                    {inProgressAchievements.length > 0 ? (
                      <div className="space-y-3">
                        {inProgressAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-start gap-3">
                            <div className="bg-muted p-1.5 rounded-full mt-0.5">
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{achievement.title}</p>
                              <p className="text-xs text-muted-foreground mb-1">{achievement.description}</p>
                              <Progress value={(achievement.current / achievement.total) * 100} className="h-1.5 mb-1" />
                              <p className="text-xs text-right text-muted-foreground">
                                {achievement.current} / {achievement.total}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Start tracking to earn achievements!</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Recently Earned</h3>
                    {recentAchievements.length > 0 ? (
                      <div className="space-y-3">
                        {recentAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-start gap-3">
                            <div className="bg-muted p-1.5 rounded-full mt-0.5">
                              {achievement.icon}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{achievement.title}</p>
                              <p className="text-xs text-muted-foreground mb-1">{achievement.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {achievement.date ? new Date(achievement.date).toLocaleDateString('fi-FI') : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No achievements yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/achievements">
                    <Award className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </CardFooter>
            </Card>
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

const calculateAchievementProgress = (achievement: Achievement, entries: Consumption[], user: User | null) => {
  let current = 0

  switch (achievement.id) {
    case '11111111-1111-1111-1111-111111111111': // First Cup
      current = entries.length > 0 ? 1 : 0
      break

    case '22222222-2222-2222-2222-222222222222': // Early Bird
      current = entries.filter(entry => {
        if (!entry.created_at) return false
        const hour = new Date(entry.created_at).getHours()
        return hour < 8
      }).length
      break

    case '33333333-3333-3333-3333-333333333333': // Caffeine Master
      current = user?.total_caffeine || 0
      break

    case '44444444-4444-4444-4444-444444444444': // Consistent Consumer
      const dates = new Set(entries.map(entry => 
        entry.created_at ? new Date(entry.created_at).toDateString() : ''
      ).filter(date => date !== ''))
      
      let consecutiveDays = 0
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        if (dates.has(date.toDateString())) {
          consecutiveDays++
        } else {
          break
        }
      }
      current = consecutiveDays
      break

    case '55555555-5555-5555-5555-555555555555': // Night Owl
      const nightEntries = entries.filter(entry => {
        if (!entry.created_at) return false
        const hour = new Date(entry.created_at).getHours()
        return hour >= 20
      })
      
      let consecutiveNights = 0
      const nightDates = new Set(nightEntries.map(entry => 
        entry.created_at ? new Date(entry.created_at).toDateString() : ''
      ))
      
      const checkDate = new Date()
      for (let i = 0; i < 3; i++) {
        if (nightDates.has(checkDate.toDateString())) {
          consecutiveNights++
        } else {
          break
        }
        checkDate.setDate(checkDate.getDate() - 1)
      }
      current = consecutiveNights
      break

    case '66666666-6666-6666-6666-666666666666': // Variety Seeker
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const uniqueDrinks = new Set(
        entries
          .filter(entry => entry.created_at && new Date(entry.created_at) >= weekAgo)
          .map(entry => entry.drink_name)
      )
      current = uniqueDrinks.size
      break

    // Kofeiinin kokonaismäärään perustuvat saavutukset
    case '77777777-7777-7777-7777-777777777777': // Caffeine Apprentice (1,000mg)
    case '88888888-8888-8888-8888-888888888888': // Caffeine Enthusiast (5,000mg)
    case '99999999-9999-9999-9999-999999999999': // Caffeine Addict (10,000mg)
    case 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': // Caffeine Master (25,000mg)
    case 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb': // Caffeine Legend (50,000mg)
      current = user?.total_caffeine || 0
      break

    // Merkintöjen määrään perustuvat saavutukset
    case 'cccccccc-cccc-cccc-cccc-cccccccccccc': // Entry Milestone: 10
    case 'dddddddd-dddd-dddd-dddd-dddddddddddd': // Entry Milestone: 50
    case 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee': // Entry Milestone: 100
    case 'ffffffff-ffff-ffff-ffff-ffffffffffff': // Entry Milestone: 500
      current = entries.length
      break

    default:
      current = 0
  }

  return Math.min(current, achievement.total)
}
