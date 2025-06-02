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
      manufacturers: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_models: {
        Row: {
          id: string
          manufacturer_id: string
          name: string
          first_production_year: number
          last_production_year: number | null
          body_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manufacturer_id: string
          name: string
          first_production_year: number
          last_production_year?: number | null
          body_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manufacturer_id?: string
          name?: string
          first_production_year?: number
          last_production_year?: number | null
          body_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      model_trims: {
        Row: {
          id: string
          model_id: string
          name: string
          engine_type: string
          transmission_type: string
          drive_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_id: string
          name: string
          engine_type: string
          transmission_type: string
          drive_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          name?: string
          engine_type?: string
          transmission_type?: string
          drive_type?: string
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
      body_type: 'sedan' | 'suv' | 'coupe' | 'truck' | 'van' | 'wagon' | 'hatchback' | 'convertible'
      engine_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'hydrogen'
      transmission_type: 'manual' | 'automatic' | 'cvt' | 'dual-clutch' | 'single-speed'
      drive_type: 'fwd' | 'rwd' | 'awd' | '4wd'
    }
  }
}