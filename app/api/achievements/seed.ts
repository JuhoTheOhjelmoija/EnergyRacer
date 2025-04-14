import { supabase } from "../../../lib/supabase/client"

export const achievements = [
  {
    id: "1",
    title: "First Timer",
    description: "Log your first caffeine entry to start your journey",
    icon: "coffee",
    total: 1
  },
  {
    id: "2",
    title: "Morning Ritual",
    description: "Log caffeine before 8:00 AM for 5 consecutive days",
    icon: "sunrise",
    total: 5
  },
  {
    id: "3",
    title: "Night Owl",
    description: "Log caffeine after 8:00 PM for 3 consecutive days",
    icon: "sunset",
    total: 3
  },
  {
    id: "4",
    title: "Consistent Consumer",
    description: "Log at least one caffeine entry every day for 2 weeks",
    icon: "calendar",
    total: 14
  },
  {
    id: "5",
    title: "Variety Seeker",
    description: "Log 5 different types of caffeine sources in a single week",
    icon: "droplet",
    total: 5
  },
  {
    id: "6",
    title: "Caffeine Apprentice",
    description: "Reach a total of 1,000mg of caffeine consumed",
    icon: "award",
    total: 1000
  },
  {
    id: "7",
    title: "Caffeine Enthusiast",
    description: "Reach a total of 5,000mg of caffeine consumed",
    icon: "award",
    total: 5000
  },
  {
    id: "8",
    title: "Caffeine Addict",
    description: "Reach a total of 10,000mg of caffeine consumed",
    icon: "award",
    total: 10000
  },
  {
    id: "9",
    title: "Caffeine Master",
    description: "Reach a total of 25,000mg of caffeine consumed",
    icon: "crown",
    total: 25000
  },
  {
    id: "10",
    title: "Caffeine Legend",
    description: "Reach a total of 50,000mg of caffeine consumed",
    icon: "star",
    total: 50000
  },
  {
    id: "11",
    title: "Entry Milestone: 10",
    description: "Log 10 caffeine entries",
    icon: "trending-up",
    total: 10
  },
  {
    id: "12",
    title: "Entry Milestone: 50",
    description: "Log 50 caffeine entries",
    icon: "trending-up",
    total: 50
  },
  {
    id: "13",
    title: "Entry Milestone: 100",
    description: "Log 100 caffeine entries",
    icon: "trending-up",
    total: 100
  },
  {
    id: "14",
    title: "Entry Milestone: 500",
    description: "Log 500 caffeine entries",
    icon: "trending-up",
    total: 500
  },
  {
    id: "15",
    title: "Energy Bomb",
    description: "Consume 500mg of caffeine in a single day",
    icon: "zap",
    total: 500
  },
  {
    id: "16",
    title: "Weekly Streak",
    description: "Log caffeine for 7 consecutive days",
    icon: "flame",
    total: 7
  },
  {
    id: "17",
    title: "Monthly Streak",
    description: "Log caffeine for 30 consecutive days",
    icon: "flame",
    total: 30
  },
  {
    id: "18",
    title: "Quarterly Streak",
    description: "Log caffeine for 90 consecutive days",
    icon: "flame",
    total: 90
  },
  {
    id: "19",
    title: "Coffee Connoisseur",
    description: "Log 50 cups of coffee",
    icon: "coffee",
    total: 50
  },
  {
    id: "20",
    title: "Energy Drink Enthusiast",
    description: "Log 20 energy drinks",
    icon: "zap",
    total: 20
  },
  {
    id: "21",
    title: "Tea Aficionado",
    description: "Log 30 cups of tea",
    icon: "leaf",
    total: 30
  },
  {
    id: "22",
    title: "Espresso Express",
    description: "Log 5 espressos in a single day",
    icon: "rocket",
    total: 5
  },
  {
    id: "23",
    title: "Early Bird",
    description: "Log caffeine before 6:00 AM five times",
    icon: "clock",
    total: 5
  },
  {
    id: "24",
    title: "Weekend Warrior",
    description: "Log caffeine on 5 consecutive weekends",
    icon: "calendar",
    total: 5
  },
  {
    id: "25",
    title: "Global Explorer",
    description: "Log 5 different drink types",
    icon: "target",
    total: 5
  },
  {
    id: "26",
    title: "Caffeine Scholar",
    description: "Read 10 articles about caffeine in the app",
    icon: "lightbulb",
    total: 10
  },
  {
    id: "27",
    title: "Social Sipper",
    description: "Share your caffeine stats on social media 3 times",
    icon: "heart",
    total: 3
  },
  {
    id: "28",
    title: "Leaderboard Legend",
    description: "Reach the top 3 on your regional leaderboard",
    icon: "trophy",
    total: 1
  },
  {
    id: "29",
    title: "Perfect Balance",
    description: "Maintain the same daily caffeine intake (±10mg) for 7 days",
    icon: "sparkles",
    total: 7
  },
  {
    id: "30",
    title: "Caffeine Scientist",
    description: "Track your mood alongside caffeine for 14 days",
    icon: "medal",
    total: 14
  }
]

export async function seedAchievements() {
  try {
    const { error: deleteUserAchievementsError } = await supabase
      .from('user_achievements')
      .delete()
      .neq('user_id', '00000000-0000-0000-0000-000000000000') 

    if (deleteUserAchievementsError) {
      console.error('Error deleting user achievements:', deleteUserAchievementsError)
      return
    }

    const { error: deleteAchievementsError } = await supabase
      .from('achievements')
      .delete()
      .neq('id', '0') 

    if (deleteAchievementsError) {
      console.error('Error deleting achievements:', deleteAchievementsError)
      return
    }

    const { error: insertError } = await supabase
      .from('achievements')
      .insert(achievements)

    if (insertError) {
      console.error('Error inserting achievements:', insertError)
      return
    }

    console.log('Successfully seeded achievements')
  } catch (error) {
    console.error('Error seeding achievements:', error)
  }
} 