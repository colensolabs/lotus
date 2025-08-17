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
      user_preferences: {
        Row: {
          id: string
          user_id: string
          topics_of_interest: string[]
          buddhist_tradition: 'secular' | 'general_buddhist' | 'theravada' | 'mahayana' | 'tibetan' | 'zen'
          save_conversations: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          topics_of_interest?: string[]
          buddhist_tradition?: 'secular' | 'general_buddhist' | 'theravada' | 'mahayana' | 'tibetan' | 'zen'
          save_conversations?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          topics_of_interest?: string[]
          buddhist_tradition?: 'secular' | 'general_buddhist' | 'theravada' | 'mahayana' | 'tibetan' | 'zen'
          save_conversations?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
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
      feedback: {
        Row: {
          id: string
          user_id: string
          feedback_type: 'bug' | 'feature_request' | 'general' | 'praise' | 'complaint'
          message: string
          rating: number | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          feedback_type?: 'bug' | 'feature_request' | 'general' | 'praise' | 'complaint'
          message: string
          rating?: number | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          feedback_type?: 'bug' | 'feature_request' | 'general' | 'praise' | 'complaint'
          message?: string
          rating?: number | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      feedback_type: 'bug' | 'feature_request' | 'general' | 'praise' | 'complaint'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}