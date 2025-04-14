import { NextResponse } from "next/server"
import { seedAchievements } from "../seed"

export async function POST() {
  try {
    await seedAchievements()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in seed route:', error)
    return NextResponse.json({ success: false, error: 'Failed to seed achievements' }, { status: 500 })
  }
} 