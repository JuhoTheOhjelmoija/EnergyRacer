"use client"

import { useEffect, useState, JSX } from "react"
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
import { QRScannerModal } from "@/components/qr-scanner-modal"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface User {
  id: string
  name: string
  avatar_url: string | null
  daily_goal: number
  total_caffeine: number
  region: string
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

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  total: number
  created_at: string
  updated_at: string
}

interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  achieved_at: string
  created_at: string
  updated_at: string
}

interface UserAchievementWithDetails {
  id: string
  achievement_id: string
  progress: number
  completed_at: string | null
  achievements: {
    id: string
    title: string
    description: string
    icon: string
    total: number
  }
}

interface UserProgress {
  id: string
  user_id: string
  achievement_id: string
  progress: number
  completed_at: string | null
}

interface LeaderboardUser {
  id: string
  name: string
  avatar_url: string | null
  total_caffeine: number
  region: string
}

interface InProgressAchievement {
  id: string
  title: string
  description: string
  icon: JSX.Element
  progress: number
  current: number
  total: number
}

interface CompletedAchievement {
  id: string
  title: string
  description: string
  icon: JSX.Element
  date: string
  total: number
}

interface DBUserAchievement {
  id: string
  achievement_id: string
  progress: number
  completed_at: string | null
  achievements: {
    id: string
    title: string
    description: string
    icon: string
    total: number
  }
}

const recentAchievements: Achievement[] = []

const inProgressAchievements: InProgressAchievement[] = []

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [entries, setEntries] = useState<Consumption[]>([])
  const [recentEntries, setRecentEntries] = useState<Consumption[]>([])
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([])
  const [inProgressAchievements, setInProgressAchievements] = useState<InProgressAchievement[]>([])
  const [recentAchievements, setRecentAchievements] = useState<CompletedAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const router = useRouter()
  const [dailyTotal, setDailyTotal] = useState(0)
  const [weeklyTotal, setWeeklyTotal] = useState(0)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [weeklyData, setWeeklyData] = useState<{ name: string; amount: number }[]>([])

  useEffect(() => {
    if (!authLoading) {
      loadData()
    }
  }, [authLoading, authUser])

  const loadData = async () => {
    try {
      if (!authUser) {
        console.log('No auth user, skipping data fetch')
        setLoading(false)
        return
      }

      console.log('Starting data fetch for user:', authUser.id)

      const { data: entriesData, error: entriesError } = await supabase
        .from('consumption')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (entriesError) {
        console.error('Error fetching entries:', entriesError)
        throw entriesError
      }
      console.log('Entries data:', entriesData)
      setEntries(entriesData || [])
      setRecentEntries(entriesData?.slice(0, 5) || [])

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        throw userError
      }
      console.log('User data:', userData)
      setUser(userData)

      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError)
        throw achievementsError
      }
      console.log('All achievements:', achievements)

      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', authUser.id)

      if (userAchievementsError) {
        console.error('Error fetching user achievements:', userAchievementsError)
        throw userAchievementsError
      }
      console.log('User achievements:', userAchievements)

      if (achievements && userAchievements) {
        const inProgress = achievements
          .map(achievement => {
            let current = 0
            let total = 1

            console.log('Processing achievement:', achievement.id, achievement.title)
            console.log('User entries:', entriesData)
            console.log('User achievements:', userAchievements)

            if (achievement.id === "1") {
              current = entriesData?.length > 0 ? 1 : 0
              total = 1
            } else if (achievement.id === "2") {
              const morningEntries = entriesData?.filter(entry => {
                const hour = new Date(entry.created_at!).getHours()
                return hour < 8
              }) || []
              current = morningEntries.length
              total = 5
            } else if (achievement.id === "3") {
              const nightEntries = entriesData?.filter(entry => {
                const hour = new Date(entry.created_at!).getHours()
                return hour >= 20
              }) || []
              current = nightEntries.length
              total = 3
            } else if (achievement.id === "4") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 14
            } else if (achievement.id === "5") {
              const uniqueDrinks = new Set(entriesData?.map(entry => entry.drink_name))
              current = uniqueDrinks.size
              total = 5
            } else if (achievement.id === "6") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 1000
            } else if (achievement.id === "7") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 5000
            } else if (achievement.id === "8") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 10000
            } else if (achievement.id === "9") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 25000
            } else if (achievement.id === "10") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 50000
            } else if (achievement.id === "11") {
              current = entriesData?.length || 0
              total = 10
            } else if (achievement.id === "12") {
              current = entriesData?.length || 0
              total = 50
            } else if (achievement.id === "13") {
              current = entriesData?.length || 0
              total = 100
            } else if (achievement.id === "14") {
              current = entriesData?.length || 0
              total = 500
            } else if (achievement.id === "15") {
              const dailyCaffeine = entriesData?.reduce((sum, entry) => {
                const date = new Date(entry.created_at!).toDateString()
                if (date === new Date().toDateString()) {
                  return sum + entry.caffeine_amount
                }
                return sum
              }, 0) || 0
              current = dailyCaffeine
              total = 500
            } else if (achievement.id === "16") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 7
            } else if (achievement.id === "17") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 30
            } else if (achievement.id === "18") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 90
            } else if (achievement.id === "19") {
              const coffeeEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('coffee')
              ) || []
              current = coffeeEntries.length
              total = 50
            } else if (achievement.id === "20") {
              const energyDrinkEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('energy')
              ) || []
              current = energyDrinkEntries.length
              total = 20
            } else if (achievement.id === "21") {
              const teaEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('tea')
              ) || []
              current = teaEntries.length
              total = 30
            } else if (achievement.id === "22") {
              const espressoEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('espresso')
              ) || []
              current = espressoEntries.length
              total = 5
            } else if (achievement.id === "23") {
              const earlyEntries = entriesData?.filter(entry => {
                const hour = new Date(entry.created_at!).getHours()
                return hour < 6
              }) || []
              current = earlyEntries.length
              total = 5
            } else if (achievement.id === "24") {
              const weekendEntries = entriesData?.filter(entry => {
                const day = new Date(entry.created_at!).getDay()
                return day === 0 || day === 6
              }) || []
              current = weekendEntries.length
              total = 5
            } else if (achievement.id === "25") {
              const uniqueDrinks = new Set(entriesData?.map(entry => entry.drink_name))
              current = uniqueDrinks.size
              total = 5
            }

            const progress = Math.min((current / total) * 100, 100)
            console.log('Final progress for', achievement.title, ':', progress, '%')
            
            if (current < total) {
              console.log('Adding to in-progress:', achievement.title)
              const result: InProgressAchievement = {
                id: achievement.id,
                title: achievement.title,
                description: achievement.description,
                icon: getAchievementIcon(achievement.icon),
                progress: progress,
                current: current,
                total: total
              }
              return result
            }
            return null
          })
          .filter((a): a is InProgressAchievement => a !== null)
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 2)

        console.log('Final in progress achievements:', inProgress)
        setInProgressAchievements(inProgress)

        const recentlyCompleted = achievements
          .map(achievement => {
            let current = 0
            let total = 1

            if (achievement.id === "1") {
              current = entriesData?.length > 0 ? 1 : 0
              total = 1
            } else if (achievement.id === "2") {
              const morningEntries = entriesData?.filter(entry => {
                const hour = new Date(entry.created_at!).getHours()
                return hour < 8
              }) || []
              current = morningEntries.length
              total = 5
            } else if (achievement.id === "3") {
              const nightEntries = entriesData?.filter(entry => {
                const hour = new Date(entry.created_at!).getHours()
                return hour >= 20
              }) || []
              current = nightEntries.length
              total = 3
            } else if (achievement.id === "4") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 14
            } else if (achievement.id === "5") {
              const uniqueDrinks = new Set(entriesData?.map(entry => entry.drink_name))
              current = uniqueDrinks.size
              total = 5
            } else if (achievement.id === "6") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 1000
            } else if (achievement.id === "7") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 5000
            } else if (achievement.id === "8") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 10000
            } else if (achievement.id === "9") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 25000
            } else if (achievement.id === "10") {
              const totalCaffeine = entriesData?.reduce((sum, entry) => sum + entry.caffeine_amount, 0) || 0
              current = totalCaffeine
              total = 50000
            } else if (achievement.id === "11") {
              current = entriesData?.length || 0
              total = 10
            } else if (achievement.id === "12") {
              current = entriesData?.length || 0
              total = 50
            } else if (achievement.id === "13") {
              current = entriesData?.length || 0
              total = 100
            } else if (achievement.id === "14") {
              current = entriesData?.length || 0
              total = 500
            } else if (achievement.id === "15") {
              const dailyCaffeine = entriesData?.reduce((sum, entry) => {
                const date = new Date(entry.created_at!).toDateString()
                if (date === new Date().toDateString()) {
                  return sum + entry.caffeine_amount
                }
                return sum
              }, 0) || 0
              current = dailyCaffeine
              total = 500
            } else if (achievement.id === "16") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 7
            } else if (achievement.id === "17") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 30
            } else if (achievement.id === "18") {
              const uniqueDays = new Set(entriesData?.map(entry => 
                new Date(entry.created_at!).toDateString()
              ))
              current = uniqueDays.size
              total = 90
            } else if (achievement.id === "19") {
              const coffeeEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('coffee')
              ) || []
              current = coffeeEntries.length
              total = 50
            } else if (achievement.id === "20") {
              const energyDrinkEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('energy')
              ) || []
              current = energyDrinkEntries.length
              total = 20
            } else if (achievement.id === "21") {
              const teaEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('tea')
              ) || []
              current = teaEntries.length
              total = 30
            } else if (achievement.id === "22") {
              const espressoEntries = entriesData?.filter(entry => 
                entry.drink_name.toLowerCase().includes('espresso')
              ) || []
              current = espressoEntries.length
              total = 5
            } else if (achievement.id === "23") {
              const earlyEntries = entriesData?.filter(entry => {
                const hour = new Date(entry.created_at!).getHours()
                return hour < 6
              }) || []
              current = earlyEntries.length
              total = 5
            } else if (achievement.id === "24") {
              const weekendEntries = entriesData?.filter(entry => {
                const day = new Date(entry.created_at!).getDay()
                return day === 0 || day === 6
              }) || []
              current = weekendEntries.length
              total = 5
            } else if (achievement.id === "25") {
              const uniqueDrinks = new Set(entriesData?.map(entry => entry.drink_name))
              current = uniqueDrinks.size
              total = 5
            }

            if (current >= total) {
              const userProgress = userAchievements.find(ua => ua.achievement_id === achievement.id)
              const completedAt = userProgress?.achieved_at || new Date().toISOString()
              
              const result: CompletedAchievement = {
                id: achievement.id,
                title: achievement.title,
                description: achievement.description,
                icon: getAchievementIcon(achievement.icon),
                date: new Date(completedAt).toLocaleDateString(),
                total: total
              }
              return result
            }
            return null
          })
          .filter((a): a is CompletedAchievement => a !== null)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 2)

        console.log('Recently completed achievements:', recentlyCompleted)
        setRecentAchievements(recentlyCompleted)
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      const dailyEntries = entriesData?.filter(entry => {
        if (!entry.created_at) return false
        const entryDate = new Date(entry.created_at)
        return entryDate.getFullYear() === today.getFullYear() &&
               entryDate.getMonth() === today.getMonth() &&
               entryDate.getDate() === today.getDate()
      }) || []

      const weeklyEntries = entriesData?.filter(entry => {
        if (!entry.created_at) return false
        const entryDate = new Date(entry.created_at)
        return entryDate >= weekAgo
      }) || []

      const monthlyEntries = entriesData?.filter(entry => {
        if (!entry.created_at) return false
        const entryDate = new Date(entry.created_at)
        return entryDate >= monthAgo
      }) || []

      const dailySum = dailyEntries.reduce((sum, entry) => sum + entry.caffeine_amount, 0)
      const weeklySum = weeklyEntries.reduce((sum, entry) => sum + entry.caffeine_amount, 0)
      const monthlySum = monthlyEntries.reduce((sum, entry) => sum + entry.caffeine_amount, 0)

      setDailyTotal(dailySum)
      setWeeklyTotal(weeklySum)
      setMonthlyTotal(monthlySum)

      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const todayDate = new Date()
      const weeklyStats = Array(7).fill(0).map((_, index) => {
        const date = new Date(todayDate)
        date.setDate(date.getDate() - (6 - index))
        const dayEntries = entriesData?.filter(entry => {
          if (!entry.created_at) return false
          const entryDate = new Date(entry.created_at)
          return entryDate.getDate() === date.getDate() &&
                 entryDate.getMonth() === date.getMonth() &&
                 entryDate.getFullYear() === date.getFullYear()
        }) || []
        return {
          name: weekDays[date.getDay()],
          amount: dayEntries.reduce((sum, entry) => sum + entry.caffeine_amount, 0)
        }
      })
      setWeeklyData(weeklyStats)

      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('users')
        .select('id, name, avatar_url, total_caffeine, region')
        .order('total_caffeine', { ascending: false })
        .limit(3)

      if (leaderboardError) throw leaderboardError
      setTopUsers(leaderboardData)

    } catch (error) {
      console.error('Error in loadData:', error)
      if (error instanceof Error) {
        setError(error.message)
        toast.error(error.message)
      } else {
        setError('Unknown error occurred')
        toast.error('Unknown error occurred')
      }
    } finally {
      setLoading(false)
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

  const handleQRCodeScanned = async (data: string) => {
    if (!authUser || !user) {
      toast.error('Please sign in first')
      return
    }

    try {
      const jsonData = JSON.parse(data)
      if (jsonData.type === 'drink') {
        const { data: insertData, error: insertError } = await supabase
          .from('consumption')
          .insert([{
            user_id: authUser.id,
            drink_name: jsonData.name,
            caffeine_amount: jsonData.caffeine_amount
          }])

        if (insertError) throw insertError

        toast.success('Entry added successfully!')
        loadData()
      }
    } catch (error) {
      toast.error('Error reading QR code')
    }
  }

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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={() => loadData()} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!authUser) {
    router.push('/auth')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name || 'User'}!</h1>
              <p className="text-muted-foreground">Here's a summary of your caffeine consumption</p>
            </div>
            <Button asChild>
              <Link href="/tracking">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Link>
            </Button>
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
                  <div className="text-sm text-muted-foreground">/ {user?.daily_goal || 400} mg</div>
                </div>
                <Progress value={(dailyTotal / (user?.daily_goal || 400)) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((dailyTotal / (user?.daily_goal || 400)) * 100)}% of your daily goal
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
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Coffee className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{entry.drink_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="font-bold">{entry.caffeine_amount} mg</div>
                    </div>
                  ))}
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Rankings</CardTitle>
                <CardDescription>Best users in your region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6">
                          {index === 0 ? (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <span className="text-lg font-medium text-muted-foreground">{index + 1}</span>
                          )}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.name}</div>
                      </div>
                      <div className="font-bold">{user.total_caffeine} mg</div>
                    </div>
                  ))}
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
                              <Progress value={achievement.progress} className="h-1.5 mb-1" />
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
                              <p className="text-xs text-muted-foreground">{achievement.date}</p>
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
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onCodeScanned={handleQRCodeScanned}
      />
    </div>
  )
}

const calculateAchievementProgress = (achievement: Achievement, entries: Consumption[]) => {
  let current = 0
  let total = 1

  if (achievement.id === "1") {
    current = entries.length > 0 ? 1 : 0
    total = 1
  } else if (achievement.id === "2") {
    const morningEntries = entries.filter(entry => {
      const hour = new Date(entry.created_at!).getHours()
      return hour < 8
    })
    current = morningEntries.length
    total = 5
  }
}
