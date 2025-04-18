"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Coffee, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { enGB } from "date-fns/locale"
import { buttonVariants } from "@/components/ui/button"

interface User {
  id: string
  name: string
  region: string
  daily_goal: number
  total_caffeine: number
}

interface Consumption {
  id: string
  user_id: string | null
  drink_name: string
  caffeine_amount: number
  created_at: string | null
  updated_at: string | null
}

interface FormattedEntry {
  id: string
  type: string
  amount: number
  time: string
  date: string
}

interface FormData {
  type: string
  amount: number | undefined
  date: Date
  time: string
}

export default function TrackingPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [entries, setEntries] = useState<Consumption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dailyTotal, setDailyTotal] = useState(0)
  const [weeklyTotal, setWeeklyTotal] = useState(0)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [weeklyData, setWeeklyData] = useState<{ name: string; amount: number }[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    type: "",
    amount: undefined,
    date: new Date(),
    time: format(new Date(), "HH:mm")
  })

  useEffect(() => {
    if (!authUser) {
      router.push("/login")
      return
    }

    loadData()
  }, [authUser, router])

  const loadData = async () => {
    if (!authUser) return

    try {
      setLoading(true)
      setError(null)

      const [userResponse, entriesResponse] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, region, daily_goal, total_caffeine')
          .eq('id', authUser.id)
          .single(),
        supabase
          .from('consumption')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
      ])

      if (userResponse.error) {
        console.error('Error fetching user:', userResponse.error)
        toast.error('Failed to load user data')
        return
      }

      if (entriesResponse.error) {
        console.error('Error fetching entries:', entriesResponse.error)
        toast.error('Failed to load entries')
        return
      }

      setUserData(userResponse.data)
      setEntries(entriesResponse.data || [])

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)

      const todayEntries = (entriesResponse.data || []).filter(entry => 
        new Date(entry.created_at) >= today
      )
      const weekEntries = (entriesResponse.data || []).filter(entry =>
        new Date(entry.created_at) >= weekAgo
      )
      const monthEntries = (entriesResponse.data || []).filter(entry =>
        new Date(entry.created_at) >= monthAgo
      )

      setDailyTotal(todayEntries.reduce((sum, entry) => sum + entry.caffeine_amount, 0))
      setWeeklyTotal(weekEntries.reduce((sum, entry) => sum + entry.caffeine_amount, 0))
      setMonthlyTotal(monthEntries.reduce((sum, entry) => sum + entry.caffeine_amount, 0))

      const weeklyData = weekEntries.reduce((acc, entry) => {
        const date = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' })
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += entry.caffeine_amount
        return acc
      }, {} as Record<string, number>)

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const chartData = days.map(day => ({
        name: day,
        amount: weeklyData[day] || 0
      }))

      setWeeklyData(chartData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authUser) return

    if (!formData.type || !formData.amount) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const timestamp = new Date(formData.date)
      const [hours, minutes] = formData.time.split(':')
      timestamp.setHours(parseInt(hours), parseInt(minutes))

      const { data: newEntry, error: insertError } = await supabase
        .from('consumption')
        .insert([{
          user_id: authUser.id,
          drink_name: formData.type,
          caffeine_amount: formData.amount,
          created_at: timestamp.toISOString()
        }])
        .select()
        .single()

      if (insertError) throw insertError

      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          total_caffeine: (userData?.total_caffeine || 0) + formData.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)

      if (updateError) throw updateError

      await loadData()
      toast.success("Entry added successfully")
      
      setFormData({
        type: "",
        amount: undefined,
        date: new Date(),
        time: format(new Date(), "HH:mm")
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error("Error adding entry")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        amount: value === "" ? undefined : parseInt(value)
      }))
    }
  }

  const entriesByDate = entries.reduce(
    (acc, entry: Consumption) => {
      const entryDate = entry.created_at ? new Date(entry.created_at) : new Date()
      const date = format(entryDate, 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push({
        id: entry.id,
        type: entry.drink_name,
        amount: entry.caffeine_amount,
        time: format(entryDate, 'HH:mm'),
        date: date
      })
      return acc
    },
    {} as Record<string, FormattedEntry[]>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Caffeine Tracking</h1>
            <p className="text-muted-foreground">Track your caffeine intake and keep a record of your consumption</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-500" />
                  Add New Entry
                </CardTitle>
                <CardDescription>Record a new caffeine intake</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caffeine-type">Type</Label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select beverage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coffee">Coffee</SelectItem>
                        <SelectItem value="espresso">Espresso</SelectItem>
                        <SelectItem value="energy-drink">Energy Drink</SelectItem>
                        <SelectItem value="tea">Tea</SelectItem>
                        <SelectItem value="cola">Cola</SelectItem>
                        <SelectItem value="custom">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (mg)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      min="0"
                      value={formData.amount === undefined ? "" : formData.amount}
                      onChange={handleAmountChange}
                      placeholder="Enter caffeine amount in mg" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP", { locale: enGB }) : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar 
                            mode="single" 
                            selected={formData.date} 
                            onSelect={(newDate) => {
                              setFormData(prev => ({ ...prev, date: newDate || new Date() }))
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("2024-01-01")
                            }
                            initialFocus
                            locale={enGB}
                            showOutsideDays={false}
                            weekStartsOn={1}
                            formatters={{
                              formatCaption: (date, options) => format(date, "MMMM yyyy", { locale: enGB }),
                              formatWeekdayName: () => ""
                            }}
                            classNames={{
                              head_row: "hidden",
                              row: "flex gap-1 w-full",
                              cell: "h-9 w-9 text-center p-0",
                              day: "h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 inline-flex items-center justify-center",
                              nav: "flex items-center justify-between pt-2 px-2",
                              nav_button: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0",
                              nav_button_previous: "ml-1",
                              nav_button_next: "mr-1",
                              caption: "flex justify-center py-2 px-4 text-sm font-medium",
                              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0"
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input 
                        id="time" 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={(e) => handleSubmit(e)} disabled={isLoading}>
                  <Coffee className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Entry"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Caffeine History</CardTitle>
                <CardDescription>Your previous caffeine entries</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="list" className="space-y-4 pt-4">
                    {Object.entries(entriesByDate).length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No entries yet. Start tracking your caffeine intake!
                      </div>
                    ) : (
                      Object.entries(entriesByDate).map(([date, entries]) => (
                      <div key={date} className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground">
                            {format(new Date(date), "EEEE, MMMM d, yyyy", { locale: enGB })}
                        </h3>
                        <div className="space-y-2">
                          {entries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <Coffee className="h-5 w-5 text-green-500" />
                                <div>
                                  <p className="font-medium">{entry.type}</p>
                                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                                </div>
                              </div>
                              <div className="font-bold">{entry.amount} mg</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      ))
                    )}
                  </TabsContent>
                  <TabsContent value="calendar" className="pt-4">
                    <div className="flex justify-center">
                      <Calendar 
                        mode="single" 
                        selected={formData.date} 
                        onSelect={(newDate) => {
                          setFormData(prev => ({ ...prev, date: newDate || new Date() }))
                        }}
                        className="rounded-md border"
                        locale={enGB}
                        showOutsideDays={false}
                        weekStartsOn={1}
                        formatters={{
                          formatCaption: (date, options) => format(date, "MMMM yyyy", { locale: enGB }),
                          formatWeekdayName: () => ""
                        }}
                        classNames={{
                          head_row: "hidden",
                          row: "flex gap-1 w-full",
                          cell: "h-9 w-9 text-center p-0",
                          day: "h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 inline-flex items-center justify-center",
                          nav: "flex items-center justify-between pt-2 px-2",
                          nav_button: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0",
                          nav_button_previous: "ml-1",
                          nav_button_next: "mr-1",
                          caption: "flex justify-center py-2 px-4 text-sm font-medium",
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0"
                        }}
                      />
                    </div>
                    {date && entriesByDate[format(date, "yyyy-MM-dd")] && (
                      <div className="mt-4 space-y-2">
                        <h3 className="font-medium">{format(date, "EEEE, MMMM d, yyyy", { locale: enGB })}</h3>
                        <div className="space-y-2">
                          {entriesByDate[format(date, "yyyy-MM-dd")]?.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <Coffee className="h-5 w-5 text-green-500" />
                                <div>
                                  <p className="font-medium">{entry.type}</p>
                                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                                </div>
                              </div>
                              <div className="font-bold">{entry.amount} mg</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
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
