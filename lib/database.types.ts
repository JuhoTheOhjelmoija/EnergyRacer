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
          region: string | null
          total_caffeine: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          region?: string | null
          total_caffeine?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          region?: string | null
          total_caffeine?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 