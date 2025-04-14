"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Coffee, Eye, EyeOff, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { AuthApiError } from '@supabase/supabase-js'

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
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownTime, setCooldownTime] = useState<number | null>(null)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === "signin") {
        await handleSignIn()
      } else {
        await handleSignUp()
      }
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error('Sign in error:', error)
        if (error.message === 'Invalid login credentials') {
          toast.error('Wrong email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email for the confirmation link before signing in.')
        } else {
          toast.error(`Sign in failed: ${error.message}`)
        }
        return
      }

      toast.success("Sign in successful!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  const handleSignUp = async () => {
    if (cooldownTime && cooldownTime > Date.now()) {
      const secondsLeft = Math.ceil((cooldownTime - Date.now()) / 1000)
      toast.error(`Please wait ${secondsLeft} seconds before trying again`)
      return
    }

    if (!validateEmail(formData.email)) {
      toast.error("Invalid email address")
      return
    }

    if (!formData.isPasswordValid) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (!selectedCity) {
      toast.error("Please select a city")
      return
    }

    if (!formData.name || formData.name.length < 2) {
      toast.error("Name is required and must be at least 2 characters long")
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            region: selectedCity,
            daily_goal: 400,
            total_caffeine: 0,
            show_in_region_ranking: true
          }
        }
      })

      if (authError?.status === 422 || authError?.message?.includes("User already registered")) {
        toast.error("Email address is already registered")
        const tabsList = document.querySelector('[role="tablist"]') as HTMLElement
        const signinTab = tabsList?.querySelector('[value="signin"]') as HTMLElement
        if (signinTab) {
          signinTab.click()
        }
        return
      }

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Failed to create user")
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          name: formData.name.trim(),
          region: selectedCity,
          daily_goal: 400,
          total_caffeine: 0,
          show_in_region_ranking: true
        })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        throw new Error("Failed to create profile: " + profileError.message)
      }

      toast.success("Account created successfully!")
      router.push("/dashboard")

    } catch (error: any) {
      if (!error.message?.includes("User already registered")) {
        console.error("Sign up error:", error)
      }
      toast.error(error.message || "An unexpected error occurred")
    } finally {
      setCooldownTime(Date.now() + 5000)
    }
  }

  const validatePassword = (value: string) => {
    setFormData(prev => ({
      ...prev,
      password: value,
      isPasswordValid: value.length >= 6
    }))
  }

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
                disabled={isLoading || Boolean(cooldownTime && cooldownTime > Date.now())}
              >
                {isLoading 
                  ? "Creating account..." 
                  : cooldownTime && cooldownTime > Date.now()
                    ? `Wait ${Math.ceil((cooldownTime - Date.now()) / 1000)}s...`
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