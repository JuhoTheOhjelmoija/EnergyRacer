"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { Coffee, Eye, EyeOff, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { AuthApiError } from '@supabase/supabase-js'
import { useAuth } from "@/components/auth-provider"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { toast } from "sonner"

// Finlands cities
const cities = [
  "Akaa", "Alajärvi", "Alavus", "Espoo", "Forssa", "Haapajärvi", "Haapavesi", "Hamina", 
  "Hanko", "Harjavalta", "Heinola", "Helsinki", "Huittinen", "Hyvinkää", "Hämeenlinna", 
  "Iisalmi", "Ikaalinen", "Imatra", "Joensuu", "Jyväskylä", "Jämsä", "Järvenpää", 
  "Kaarina", "Kajaani", "Kalajoki", "Kangasala", "Kankaanpää", "Kannus", "Karkkila", 
  "Kaskinen", "Kauhajoki", "Kauhava", "Kauniainen", "Kemi", "Kemijärvi", "Kerava", 
  "Keuruu", "Kitee", "Kiuruvesi", "Kokemäki", "Kokkola", "Kotka", "Kouvola", "Kuopio", 
  "Kurikka", "Kuusamo", "Lahti", "Laitila", "Lappeenranta", "Lapua", "Lieksa", 
  "Lohja", "Loimaa", "Loviisa", "Maarianhamina", "Mikkeli", "Mänttä-Vilppula", 
  "Naantali", "Nivala", "Nokia", "Nurmes", "Orimattila", "Orivesi", "Oulainen", 
  "Oulu", "Outokumpu", "Paimio", "Parainen", "Parkano", "Pieksämäki", "Pietarsaari", 
  "Pori", "Porvoo", "Pudasjärvi", "Pyhäjärvi", "Raahe", "Raasepori", "Raisio", 
  "Rauma", "Riihimäki", "Rovaniemi", "Saarijärvi", "Salo", "Sastamala", "Savonlinna", 
  "Seinäjoki", "Siuntio", "Somero", "Suonenjoki", "Tampere", "Tornio", "Turku", 
  "Ulvila", "Uusikaarlepyy", "Uusikaupunki", "Vaasa", "Valkeakoski", "Vantaa", 
  "Varkaus", "Viitasaari", "Virrat", "Ylivieska", "Ylöjärvi", "Ähtäri", "Äänekoski"
]

interface FormData {
  name: string
  email: string
  password: string
  region: string
  isPasswordValid: boolean
}

const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export function AuthForm({ mode }: { mode: string }) {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownTime, setCooldownTime] = useState<number | undefined>(undefined)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    region: "",
    isPasswordValid: true
  })
  const [open, setOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [error, setError] = useState<Error | null>(null)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === "signin") {
        await handleSignIn()
      } else if (mode === "signup") {
        await handleSignUp()
      } else {
        console.error("Invalid mode:", mode)
        toast.error("Invalid form mode")
      }
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [mode, formData, selectedCity])

  const handleSignIn = useCallback(async () => {
    try {
      // Validate email format
      if (!validateEmail(formData.email)) {
        toast.error("Please enter a valid email address")
        return
      }

      // Validate password
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return
      }

      console.log('Attempting sign in with:', formData.email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      })

      if (error) {
        console.error('Sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        
        if (error.message === 'Invalid login credentials') {
          toast.error('Wrong email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email for the confirmation link before signing in.')
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many attempts. Please try again later.')
        } else {
          toast.error(`Sign in failed: ${error.message}`)
        }
        return
      }

      if (!data?.user) {
        console.error('No user data returned after successful sign in')
        toast.error('Sign in successful but no user data received')
        return
      }

      console.log('Sign in successful, user:', data.user)
      toast.success("Sign in successful!")
      
      // Add a small delay to ensure the session is properly set
      await new Promise(resolve => setTimeout(resolve, 500))
      
      router.push("/login")
    } catch (error) {
      console.error("Unexpected sign in error:", error)
      if (error instanceof Error) {
        toast.error(`An unexpected error occurred: ${error.message}`)
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    }
  }, [formData, router])

  const handleSignUp = useCallback(async () => {
    if (cooldownTime && cooldownTime > Date.now()) {
      const secondsLeft = Math.ceil((cooldownTime - Date.now()) / 1000)
      toast.error(`Please wait ${secondsLeft} seconds before trying again`)
      return
    }

    // Validate all fields
    if (!formData.name || formData.name.length < 2) {
      toast.error("Name must be at least 2 characters long")
      return
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (!selectedCity) {
      toast.error("Please select your city")
      return
    }

    try {
      console.log('Starting sign up process for:', formData.email)
      
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            region: selectedCity
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) {
        console.error("Auth error during sign up:", authError)
        if (authError.message.includes("User already registered")) {
          toast.error("This email is already registered. Please sign in instead.")
          const tabsList = document.querySelector('[role="tablist"]') as HTMLElement
          const signinTab = tabsList?.querySelector('[value="signin"]') as HTMLElement
          if (signinTab) {
            signinTab.click()
          }
          return
        }
        toast.error(`Registration failed: ${authError.message}`)
        return
      }

      if (!authData.user) {
        console.error("No user data returned after sign up")
        toast.error("Failed to create user account")
        return
      }

      console.log('User created in Auth:', authData.user.id)

      // 2. Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: formData.name.trim(),
          region: selectedCity,
          daily_goal: 400,
          total_caffeine: 0,
          show_in_region_ranking: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        toast.error("Failed to create user profile: " + profileError.message)
        return
      }

      console.log('User profile created successfully')
      toast.success("Account created successfully! Please check your email to confirm your account.")
      
      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        region: "",
        isPasswordValid: true
      })
      setSelectedCity("")

    } catch (error: any) {
      console.error("Sign up error:", error)
      toast.error(error.message || "An unexpected error occurred during registration")
    } finally {
      setCooldownTime(Date.now() + 5000)
    }
  }, [formData, selectedCity, cooldownTime])

  const validatePassword = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      password: value,
      isPasswordValid: value.length >= 6
    }))
  }, [])

  const handleDeleteAccount = useCallback(async () => {
    if (!authUser) {
      toast.error("Please sign in first")
      return
    }

    try {
      const [deleteEntriesError, deleteAchievementsError, deleteProfileError] = await Promise.all([
        supabase.from('consumption').delete().eq('user_id', authUser.id),
        supabase.from('user_achievements').delete().eq('user_id', authUser.id),
        supabase.from('users').delete().eq('id', authUser.id)
      ]).then(results => results.map(result => result.error))

      if (deleteEntriesError) throw deleteEntriesError
      if (deleteAchievementsError) throw deleteAchievementsError
      if (deleteProfileError) throw deleteProfileError

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      toast.success("Account deleted successfully")
      router.push("/auth")
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error("Error deleting account")
    }
  }, [authUser, router])

  const isCooldownActive = useMemo(() => 
    cooldownTime !== undefined && cooldownTime > Date.now(), 
    [cooldownTime]
  )

  const cooldownSeconds = useMemo(() => 
    isCooldownActive ? Math.ceil((cooldownTime! - Date.now()) / 1000) : 0,
    [isCooldownActive, cooldownTime]
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue={mode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleAuth} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input 
                  id="signin-email" 
                  name="email"
                  type="email" 
                  placeholder="email@example.com" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleAuth} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input 
                  id="signup-name" 
                  name="name"
                  placeholder="Your name" 
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  name="email"
                  type="email" 
                  placeholder="email@example.com" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-region">City</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="signup-region"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedCity ? selectedCity : "Select a city..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search for a city..." className="h-9" />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {cities.map((city) => (
                          <CommandItem
                            key={city}
                            onSelect={() => {
                              setSelectedCity(city)
                              setFormData(prev => ({ ...prev, region: city }))
                              setOpen(false)
                            }}
                          >
                            {city}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedCity === city ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signup-password">Password</Label>
                  {!formData.isPasswordValid && formData.password.length > 0 && (
                    <span className="text-xs text-destructive">At least 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) => validatePassword(e.target.value)}
                            className={!formData.isPasswordValid && formData.password.length > 0 ? "border-destructive" : ""}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Password must be at least 6 characters long</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isCooldownActive}
              >
                {isLoading 
                  ? "Creating account..." 
                  : isCooldownActive
                    ? `Wait ${cooldownSeconds}s...`
                    : "Create Account"
                }
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </div>
      </CardFooter>
    </Card>
  )
} 