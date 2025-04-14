"use client"

import React, { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Coffee, Zap, Flame, Rocket, Crown } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface ConsumptionLevel {
  id: string
  name: string
  description: string
  dailyGoal: number
  icon: React.ReactNode
}

const consumptionLevels: ConsumptionLevel[] = [
  {
    id: "lightweight",
    name: "Lightweight",
    description: "100mg daily - Perfect for occasional caffeine consumers",
    dailyGoal: 100,
    icon: <Coffee className="h-6 w-6 text-green-500" />
  },
  {
    id: "moderate",
    name: "Moderate",
    description: "200mg daily - For regular coffee drinkers",
    dailyGoal: 200,
    icon: <Zap className="h-6 w-6 text-yellow-500" />
  },
  {
    id: "enthusiast",
    name: "Enthusiast",
    description: "400mg daily - For those who need a significant boost",
    dailyGoal: 400,
    icon: <Flame className="h-6 w-6 text-orange-500" />
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "600mg daily - For experienced caffeine consumers",
    dailyGoal: 600,
    icon: <Rocket className="h-6 w-6 text-red-500" />
  },
  {
    id: "legend",
    name: "Legend",
    description: "800mg daily - For the most dedicated caffeine enthusiasts",
    dailyGoal: 800,
    icon: <Crown className="h-6 w-6 text-purple-500" />
  }
]

export default function PreferencesPage() {
  const { user: authUser } = useAuth()
  const [selectedLevel, setSelectedLevel] = useState<string>("moderate")
  const [isLoading, setIsLoading] = useState(false)
  const [currentGoal, setCurrentGoal] = useState<number>(200)

  useEffect(() => {
    if (authUser) {
      fetchUserPreferences()
    }
  }, [authUser])

  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('daily_goal')
        .eq('id', authUser?.id)
        .single()

      if (error) throw error

      if (data) {
        setCurrentGoal(data.daily_goal || 200)
        
        // Find the matching level
        const level = consumptionLevels.find(level => level.dailyGoal === data.daily_goal)
        if (level) {
          setSelectedLevel(level.id)
        }
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      toast.error('Failed to load your preferences')
    }
  }

  const handleSavePreferences = async () => {
    if (!authUser) {
      toast.error('You must be logged in to save preferences')
      return
    }

    setIsLoading(true)

    try {
      const selectedLevelData = consumptionLevels.find(level => level.id === selectedLevel)
      
      if (!selectedLevelData) {
        throw new Error('Invalid consumption level selected')
      }

      const { error } = await supabase
        .from('users')
        .update({ 
          daily_goal: selectedLevelData.dailyGoal,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)

      if (error) throw error

      setCurrentGoal(selectedLevelData.dailyGoal)
      toast.success('Preferences saved successfully')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
            <p className="text-muted-foreground">
              Customize your EnergyRacer experience
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Consumption Level</CardTitle>
              <CardDescription>
                Select your preferred daily caffeine consumption level. This will set your daily goal and affect your achievements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <RadioGroup 
                  value={selectedLevel} 
                  onValueChange={setSelectedLevel}
                  className="grid gap-4"
                >
                  {consumptionLevels.map((level) => (
                    <div key={level.id} className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={level.id} className="flex items-center gap-2 text-base font-medium">
                          {level.icon}
                          {level.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                <div className="pt-4">
                  <Button 
                    onClick={handleSavePreferences} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
              <CardDescription>
                Your current preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Daily Caffeine Goal</p>
                    <p className="text-sm text-muted-foreground">
                      {currentGoal}mg per day
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    {currentGoal}mg
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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