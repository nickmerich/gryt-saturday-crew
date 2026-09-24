export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      partner_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          involvement: string
          ip_hash: string | null
          message: string | null
          name: string
          organization: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          involvement: string
          ip_hash?: string | null
          message?: string | null
          name: string
          organization?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          involvement?: string
          ip_hash?: string | null
          message?: string | null
          name?: string
          organization?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          category: string
          created_at: string
          id: string
          ip_hash: string | null
          message: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          message: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          message?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          contact: string
          created_at: string
          event_id: string | null
          event_label: string | null
          first_timer: boolean
          hero_variant: string | null
          id: string
          ip_hash: string | null
          name: string
          notion_attendance_page_id: string | null
          notion_last_error: string | null
          notion_member_page_id: string | null
          notion_synced: boolean
          notion_synced_at: string | null
          party_size: number
          source: string | null
          user_agent: string | null
        }
        Insert: {
          contact: string
          created_at?: string
          event_id?: string | null
          event_label?: string | null
          first_timer?: boolean
          hero_variant?: string | null
          id?: string
          ip_hash?: string | null
          name: string
          notion_attendance_page_id?: string | null
          notion_last_error?: string | null
          notion_member_page_id?: string | null
          notion_synced?: boolean
          notion_synced_at?: string | null
          party_size?: number
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          contact?: string
          created_at?: string
          event_id?: string | null
          event_label?: string | null
          first_timer?: boolean
          hero_variant?: string | null
          id?: string
          ip_hash?: string | null
          name?: string
          notion_attendance_page_id?: string | null
          notion_last_error?: string | null
          notion_member_page_id?: string | null
          notion_synced?: boolean
          notion_synced_at?: string | null
          party_size?: number
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      run_checkin_audit: {
        Row: {
          action: string
          actor: string
          checkin_id: string | null
          created_at: string
          detail: Json | null
          event_id: string
          id: string
          person_key: string
        }
        Insert: {
          action: string
          actor: string
          checkin_id?: string | null
          created_at?: string
          detail?: Json | null
          event_id: string
          id?: string
          person_key: string
        }
        Update: {
          action?: string
          actor?: string
          checkin_id?: string | null
          created_at?: string
          detail?: Json | null
          event_id?: string
          id?: string
          person_key?: string
        }
        Relationships: []
      }
      run_checkins: {
        Row: {
          checked_in_at: string
          checked_in_by: string
          contact: string | null
          event_date: string
          event_id: string
          id: string
          name: string
          note: string | null
          person_key: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          checked_in_at?: string
          checked_in_by: string
          contact?: string | null
          event_date: string
          event_id: string
          id?: string
          name: string
          note?: string | null
          person_key: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string
          contact?: string | null
          event_date?: string
          event_id?: string
          id?: string
          name?: string
          note?: string | null
          person_key?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      signup_sessions: {
        Row: {
          contact: string | null
          created_at: string
          event_label: string | null
          expires_at: string
          id: string
          name: string | null
          rsvp_id: string | null
          token_hash: string
          updated_at: string
          waiver_id: string | null
          waiver_signed_on: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          event_label?: string | null
          expires_at?: string
          id?: string
          name?: string | null
          rsvp_id?: string | null
          token_hash: string
          updated_at?: string
          waiver_id?: string | null
          waiver_signed_on?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          event_label?: string | null
          expires_at?: string
          id?: string
          name?: string | null
          rsvp_id?: string | null
          token_hash?: string
          updated_at?: string
          waiver_id?: string | null
          waiver_signed_on?: string | null
        }
        Relationships: []
      }
      story_submissions: {
        Row: {
          consent_contact: boolean
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          links: string | null
          location: string | null
          name: string
          story: string
          why_interview: string
        }
        Insert: {
          consent_contact?: boolean
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          links?: string | null
          location?: string | null
          name: string
          story: string
          why_interview: string
        }
        Update: {
          consent_contact?: boolean
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          links?: string | null
          location?: string | null
          name?: string
          story?: string
          why_interview?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      waiver_signatures: {
        Row: {
          created_at: string
          date_of_birth: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          full_name: string
          guardian_name: string | null
          guardian_relationship: string | null
          id: string
          ip_hash: string | null
          is_minor: boolean
          phone: string | null
          season: number
          signature_text: string
          signed_on: string
          user_agent: string | null
          waiver_version: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          full_name: string
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          ip_hash?: string | null
          is_minor?: boolean
          phone?: string | null
          season?: number
          signature_text: string
          signed_on?: string
          user_agent?: string | null
          waiver_version?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          email?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          full_name?: string
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          ip_hash?: string | null
          is_minor?: boolean
          phone?: string | null
          season?: number
          signature_text?: string
          signed_on?: string
          user_agent?: string | null
          waiver_version?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
