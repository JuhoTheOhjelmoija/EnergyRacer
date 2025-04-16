"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search } from "lucide-react"
import Link from "next/link"

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

const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

interface FormData {
  name: string
  email: string
  password: string
  city: string
  isPasswordValid: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    city: "",
    isPasswordValid: true
  })
  const [open, setOpen] = useState(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password || !formData.city) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setIsLoading(true)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            region: formData.city
          }
        }
      })

      if (signUpError) {
        console.error('Auth error:', signUpError)
        toast.error(signUpError.message)
        return
      }

      if (!signUpData.user) {
        console.error('No user returned from sign up')
        toast.error('Registration failed')
        return
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          name: formData.name,
          region: formData.city,
          daily_goal: 400,
          total_caffeine: 0,
          show_in_region_ranking: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        toast.error('Failed to create user profile')
        return
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        city: '',
        isPasswordValid: true
      })

      toast.success('Registration successful! Redirecting to login...')
      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Join EnergyRacer to track your caffeine consumption and compete with others!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                required
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {formData.city || "Select a city..."}
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
                            setFormData(prev => ({ ...prev, city }))
                            setOpen(false)
                          }}
                        >
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <Link href="/" className="underline underline-offset-4 hover:text-primary">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 