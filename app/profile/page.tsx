"use client"

import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Award, Coffee, Edit, LineChart, LogOut, Save, Trophy, Zap, Flame, Rocket, Crown } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

interface User {
  id: string
  name: string
  email: string
  region: string
  avatar_url: string | null
  daily_goal: number
  total_caffeine: number
  created_at: string
  show_in_region_ranking: boolean
}

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedRegion, setEditedRegion] = useState("")
  const [editedEmail, setEditedEmail] = useState("")
  const [showInRegionRanking, setShowInRegionRanking] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>("moderate")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadUserData() {
      try {
        if (authLoading) return
        if (!authUser) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) throw error

        setUser(data)
        setEditedName(data.name)
        setEditedRegion(data.region)
        setEditedEmail(authUser.email || '')
        setShowInRegionRanking(data.show_in_region_ranking !== false)
        
        // Set the consumption level based on daily_goal
        const level = consumptionLevels.find(level => level.dailyGoal === data.daily_goal)
        if (level) {
          setSelectedLevel(level.id)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [authUser, authLoading])

  const handleSave = async () => {
    console.log('Starting profile update...')
    console.log('Current user:', user)
    console.log('Auth user:', authUser)

    if (!user || !authUser) {
      console.error('No user or auth user found')
      toast.error('You must be logged in to update your profile')
      return
    }

    try {
      console.log('Validating inputs...')
      console.log('Edited values:', {
        name: editedName,
        email: editedEmail,
        region: editedRegion,
        showInRegionRanking,
        selectedLevel
      })

      // Validate name
      if (!editedName || editedName.length < 2) {
        console.error('Invalid name:', editedName)
        toast.error('Name must be at least 2 characters long')
        return
      }

      // Validate region
      if (!editedRegion) {
        console.error('No region selected')
        toast.error('Please select a region')
        return
      }

      // Get the selected consumption level
      const selectedLevelData = consumptionLevels.find(level => level.id === selectedLevel)
      if (!selectedLevelData) {
        console.error('Invalid consumption level selected')
        toast.error('Invalid consumption level selected')
        return
      }

      // Update profile in database
      console.log('Updating profile in database...')
      const updateData = {
        name: editedName,
        region: editedRegion,
        show_in_region_ranking: showInRegionRanking,
        daily_goal: selectedLevelData.dailyGoal,
        updated_at: new Date().toISOString()
      }
      console.log('Update data:', updateData)
      console.log('User ID:', user.id)

      // First check if user exists
      const { data: checkData, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('User check response:', { checkData, checkError })

      if (checkError) {
        console.error('Error checking user:', checkError)
        toast.error('Failed to verify user account')
        return
      }

      if (!checkData) {
        console.error('User not found in database')
        toast.error('User account not found')
        return
      }

      // Then try to update
      const { data, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      console.log('Database update response:', { 
        data, 
        error: updateError,
        errorDetails: updateError ? {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        } : null
      })

      if (updateError) {
        console.error('Database update error:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        })
        toast.error(`Failed to update profile: ${updateError.message || 'Unknown error'}`)
        return
      }

      if (!data) {
        console.error('No data returned after update')
        throw new Error('No data returned after update')
      }

      console.log('Profile updated successfully:', data)
      setUser(data)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        })
      }
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const handleDeleteAccount = async () => {
    if (!authUser) {
      toast.error("Kirjaudu ensin sisään")
      return
    }

    try {
      // Poistetaan ensin käyttäjän merkinnät
      const { error: deleteEntriesError } = await supabase
        .from('consumption')
        .delete()
        .eq('user_id', authUser.id)

      if (deleteEntriesError) throw deleteEntriesError

      // Poistetaan käyttäjän saavutukset
      const { error: deleteAchievementsError } = await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', authUser.id)

      if (deleteAchievementsError) throw deleteAchievementsError

      // Poistetaan käyttäjän profiili
      const { error: deleteProfileError } = await supabase
        .from('users')
        .delete()
        .eq('id', authUser.id)

      if (deleteProfileError) throw deleteProfileError

      // Kirjaudutaan ulos
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      toast.success("Tili poistettu onnistuneesti")
      router.push("/auth")
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error("Virhe tilin poistamisessa")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || !e.target.files[0]) return
      if (!authUser) return

      setUploadingAvatar(true)
      const file = e.target.files[0]
      
      // Tarkistetaan tiedoston koko (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kuva on liian suuri. Maksimikoko on 2MB.")
        return
      }

      // Tarkistetaan tiedostotyyppi
      if (!file.type.startsWith('image/')) {
        toast.error("Vain kuvatiedostot ovat sallittuja.")
        return
      }

      // Luodaan uniikki tiedostonimi
      const fileExt = file.name.split('.').pop()
      const fileName = `${authUser.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Ladataan kuva Supabase Storageen
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Haetaan ladatun kuvan URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Päivitetään käyttäjän profiili uudella kuvalla
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', authUser.id)

      if (updateError) throw updateError

      // Päivitetään käyttäjän tila
      setUser(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      toast.success("Profiilikuva päivitetty onnistuneesti!")
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error("Profiilikuvan lataus epäonnistui")
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="text-center">Loading profile...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="text-center text-red-500">Error: {error}</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <p>You must be logged in to view your profile</p>
            <Button asChild className="mt-4">
          <Link href="/auth">Sign In</Link>
        </Button>
          </div>
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
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
                  </p>
                </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your personal information and account details
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                      <Select value={editedRegion} onValueChange={setEditedRegion}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Helsinki">Helsinki</SelectItem>
                        <SelectItem value="Tampere">Tampere</SelectItem>
                        <SelectItem value="Turku">Turku</SelectItem>
                        <SelectItem value="Oulu">Oulu</SelectItem>
                          <SelectItem value="Espoo">Espoo</SelectItem>
                          <SelectItem value="Vantaa">Vantaa</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showInRanking"
                        checked={showInRegionRanking}
                        onCheckedChange={(checked) => setShowInRegionRanking(checked === true)}
                      />
                      <Label htmlFor="showInRanking">Show me in regional rankings</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <label 
                          htmlFor="avatar-upload" 
                          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90"
                        >
                          <Edit className="h-4 w-4" />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Region</span>
                        <span className="text-sm">{user.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Daily Goal</span>
                        <span className="text-sm">{user.daily_goal}mg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Caffeine</span>
                        <span className="text-sm">{user.total_caffeine}mg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Show in Rankings</span>
                        <span className="text-sm">{user.show_in_region_ranking ? "Yes" : "No"}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Consumption Level</CardTitle>
                <CardDescription>
                  Select your preferred daily caffeine consumption level
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
                      onClick={handleSave} 
                      className="w-full"
                    >
                      Save Consumption Level
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account and data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
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
