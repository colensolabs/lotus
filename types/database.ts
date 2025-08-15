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
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          preview: string | null
          created_at: string | null
          updated_at: string | null
          is_archived: boolean | null
          message_count: number | null
          last_message_at: string | null
          is_pinned: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          preview?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_archived?: boolean | null
          message_count?: number | null
          last_message_at?: string | null
          is_pinned?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          preview?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_archived?: boolean | null
          message_count?: number | null
          last_message_at?: string | null
          is_pinned?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          content: string
          is_user: boolean
          guidance_data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          content: string
          is_user?: boolean
          guidance_data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          content?: string
          is_user?: boolean
          guidance_data?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}