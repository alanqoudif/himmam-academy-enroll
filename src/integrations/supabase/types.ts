export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_transfer_settings: {
        Row: {
          account_name: string
          account_number: string
          additional_info: string | null
          bank_name: string
          branch_name: string | null
          created_at: string
          iban: string | null
          id: string
          is_active: boolean
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          additional_info?: string | null
          bank_name?: string
          branch_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          is_active?: boolean
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          additional_info?: string | null
          bank_name?: string
          branch_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          is_active?: boolean
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lesson_views: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          lesson_id: string
          student_id: string
          updated_at: string
          watch_duration_minutes: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          lesson_id: string
          student_id: string
          updated_at?: string
          watch_duration_minutes?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          lesson_id?: string
          student_id?: string
          updated_at?: string
          watch_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_views_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          file_size_mb: number | null
          grade: number
          id: string
          is_active: boolean | null
          pdf_url: string | null
          subject: string
          teacher_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          file_size_mb?: number | null
          grade: number
          id?: string
          is_active?: boolean | null
          pdf_url?: string | null
          subject: string
          teacher_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          file_size_mb?: number | null
          grade?: number
          id?: string
          is_active?: boolean | null
          pdf_url?: string | null
          subject?: string
          teacher_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          created_at: string
          id: string
          receipt_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          receipt_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          receipt_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_settings: {
        Row: {
          created_at: string
          discount_percentage: number | null
          grade_range: string
          id: string
          price_per_subject: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          grade_range: string
          id?: string
          price_per_subject: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          grade_range?: string
          id?: string
          price_per_subject?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          grade: number | null
          id: string
          phone: string
          role: string
          status: string
          subjects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          grade?: number | null
          id?: string
          phone: string
          role?: string
          status?: string
          subjects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          grade?: number | null
          id?: string
          phone?: string
          role?: string
          status?: string
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          created_at: string
          id: string
          is_answered: boolean | null
          lesson_id: string | null
          question_text: string
          student_id: string
          subject: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          lesson_id?: string | null
          question_text: string
          student_id: string
          subject: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          lesson_id?: string | null
          question_text?: string
          student_id?: string
          subject?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          access_credentials: string | null
          bank_transfer_details: string | null
          created_at: string
          email: string
          full_name: string
          grade: number
          id: string
          phone: string
          receipt_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selected_subjects: string[]
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          access_credentials?: string | null
          bank_transfer_details?: string | null
          created_at?: string
          email: string
          full_name: string
          grade: number
          id?: string
          phone: string
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_subjects: string[]
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          access_credentials?: string | null
          bank_transfer_details?: string | null
          created_at?: string
          email?: string
          full_name?: string
          grade?: number
          id?: string
          phone?: string
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_subjects?: string[]
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      subjects_pricing: {
        Row: {
          created_at: string
          grade: number
          id: string
          is_active: boolean
          price_per_subject: number
          subject_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade: number
          id?: string
          is_active?: boolean
          price_per_subject: number
          subject_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          is_active?: boolean
          price_per_subject?: number
          subject_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          grade: number
          id: string
          subject: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          grade: number
          id?: string
          subject: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          grade?: number
          id?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credentials: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_username: {
        Args: { role_type: string; full_name: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_by_id: {
        Args: { input_user_id: string }
        Returns: string
      }
      verify_user_credentials: {
        Args: { input_username: string; input_password: string }
        Returns: {
          user_id: string
          profile_data: Json
        }[]
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
