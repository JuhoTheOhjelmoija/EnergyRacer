"use client"

import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Coffee, Medal, Trophy, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/lib/database.types"

interface LeaderboardUser {
  id: string
  name: string
  region: string
  score: number
  avatar: string
}

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, region, total_caffeine, avatar_url')
          .order('total_caffeine', { ascending: false })

        if (error) {
          console.error('Supabase error:', error.message)
          console.error('Error details:', error.details)
          console.error('Error hint:', error.hint)
          return
        }

        if (!users) {
          console.log('No users found in the database')
          return
        }

        const formattedData = users.map((user) => ({
          id: user.id,
          name: user.name || 'Anonymous User',
          region: user.region || 'Unknown',
          score: user.total_caffeine || 0,
          avatar: user.avatar_url || '/placeholder.svg'
        }))

        setLeaderboardData(formattedData)
      } catch (error) {
        console.error('Error in fetchLeaderboardData:', error)
      }
    }

    fetchLeaderboardData()
  }, [])

  // Suomen isoimmat kaupungit
  const regions = [
    "All Regions",
    "Helsinki",
    "Tampere",
    "Turku",
    "Oulu",
    "Espoo",
    "Vantaa",
    "Jyväskylä",
    "Lahti",
    "Kuopio",
    "Pori",
    "Joensuu",
    "Lappeenranta",
    "Kotka",
    "Mikkeli"
  ]

  const filteredData = leaderboardData.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">See who's leading the caffeine race in your region</p>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or region..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="All Regions" className="space-y-4">
            <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
              <TabsList className="h-auto p-1 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-1">
                {regions.map((region) => (
                  <TabsTrigger key={region} value={region} className="px-3 py-1.5">
                    {region}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Badge variant="outline" className="hidden md:flex items-center gap-1">
                <Coffee className="h-3 w-3" />
                Updated daily
              </Badge>
            </div>

            {regions.map((region) => (
              <TabsContent key={region} value={region} className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top Caffeine Racers
                    </CardTitle>
                    <CardDescription>
                      {region === "All Regions"
                        ? "Showing top racers across all regions"
                        : `Showing top racers in ${region}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredData
                        .filter((user) => region === "All Regions" || user.region === region)
                        .map((user, index) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8">
                                {index === 0 ? (
                                  <Medal className="h-6 w-6 text-yellow-500" />
                                ) : index === 1 ? (
                                  <Medal className="h-6 w-6 text-gray-400" />
                                ) : index === 2 ? (
                                  <Medal className="h-6 w-6 text-amber-700" />
                                ) : (
                                  <span className="text-lg font-medium text-muted-foreground">{index + 1}</span>
                                )}
                              </div>
                              <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.region}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Coffee className="h-4 w-4 text-green-500" />
                              <span className="font-bold">{user.score} mg</span>
                            </div>
                          </div>
                        ))}
                        {filteredData.filter((user) => region === "All Regions" || user.region === region).length === 0 && (
                          <div className="text-center py-6 text-muted-foreground">
                            No racers found in this region
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
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
