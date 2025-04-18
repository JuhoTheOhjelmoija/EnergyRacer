export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar_url: string | null
          daily_goal: number
          total_caffeine: number
          region: string | null
          show_in_region_ranking: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          daily_goal?: number
          total_caffeine?: number
          region?: string | null
          show_in_region_ranking?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          daily_goal?: number
          total_caffeine?: number
          region?: string | null
          show_in_region_ranking?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      consumption: {
        Row: {
          id: string
          user_id: string | null
          drink_name: string
          caffeine_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          drink_name: string
          caffeine_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          drink_name?: string
          caffeine_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
          total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          progress: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          progress?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          progress?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
