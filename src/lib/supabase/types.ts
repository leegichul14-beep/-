export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      distributors: {
        Row: {
          id: string
          name: string
          type: 'offline' | 'online'
          short_code: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['distributors']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['distributors']['Insert']>
      }
      stores: {
        Row: {
          id: string
          distributor_id: string
          name: string
          full_name: string
          region: string | null
          store_type: '백화점' | '아울렛' | '몰' | '온라인' | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stores']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stores']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          group_name: string | null
          sort_order: number
          color_hex: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      brands: {
        Row: {
          id: string
          name: string
          category_id: string | null
          brand_grade: 'A' | 'B' | 'C' | 'D' | 'Unknown' | null
          origin: 'domestic' | 'foreign'
          url_musinsa: string | null
          url_zigzag: string | null
          url_29cm: string | null
          url_wconcept: string | null
          on_musinsa: boolean
          on_zigzag: boolean
          on_29cm: boolean
          on_wconcept: boolean
          memo: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['brands']['Insert']>
      }
      listings: {
        Row: {
          id: string
          store_id: string
          brand_id: string
          start_date: string
          end_date: string | null
          floor: string | null
          zone: string | null
          area_sqm: number | null
          status: 'active' | 'closed' | 'planned' | 'unmapped'
          source: string
          memo: string | null
          mapped_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          name: string
          role: 'leader' | 'md'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
    Views: {
      v_active_listings: {
        Row: {
          id: string
          distributor_name: string
          channel_type: string
          store_name: string
          region: string | null
          store_type: string | null
          brand_name: string
          brand_grade: string | null
          category_name: string | null
          category_group: string | null
          start_date: string
          floor: string | null
          area_sqm: number | null
          status: string
          on_musinsa: boolean
          on_zigzag: boolean
          on_29cm: boolean
          on_wconcept: boolean
        }
      }
      v_store_category_ratio: {
        Row: {
          store_id: string
          store_name: string
          distributor_name: string
          category_name: string | null
          brand_count: number
          ratio_pct: number
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// 편의 타입
export type Distributor = Database['public']['Tables']['distributors']['Row']
export type Store = Database['public']['Tables']['stores']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ActiveListing = Database['public']['Views']['v_active_listings']['Row']
export type StoreCategoryRatio = Database['public']['Views']['v_store_category_ratio']['Row']
