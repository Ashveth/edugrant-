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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_id: string | null
          document_type: string
          id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_id?: string | null
          document_type: string
          id?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_id?: string | null
          document_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "user_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          education_level: string | null
          email: string | null
          field_of_study: string | null
          full_name: string | null
          gpa_percentage: number | null
          id: string
          institution_name: string | null
          is_direct_apply: boolean | null
          notes: string | null
          phone: string | null
          scholarship_id: string
          statement_of_purpose: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?: string | null
          email?: string | null
          field_of_study?: string | null
          full_name?: string | null
          gpa_percentage?: number | null
          id?: string
          institution_name?: string | null
          is_direct_apply?: boolean | null
          notes?: string | null
          phone?: string | null
          scholarship_id: string
          statement_of_purpose?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?: string | null
          email?: string | null
          field_of_study?: string | null
          full_name?: string | null
          gpa_percentage?: number | null
          id?: string
          institution_name?: string | null
          is_direct_apply?: boolean | null
          notes?: string | null
          phone?: string | null
          scholarship_id?: string
          statement_of_purpose?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          organization_name: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          organization_name: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          organization_name?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      saved_scholarships: {
        Row: {
          id: string
          saved_at: string
          scholarship_id: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          scholarship_id: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          scholarship_id?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarship_doc_checklist: {
        Row: {
          created_at: string
          document_name: string
          file_path: string | null
          id: string
          is_completed: boolean
          scholarship_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          file_path?: string | null
          id?: string
          is_completed?: boolean
          scholarship_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          file_path?: string | null
          id?: string
          is_completed?: boolean
          scholarship_id?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarship_reminders: {
        Row: {
          created_at: string
          email: string
          id: string
          last_reminded_at: string | null
          remind_1_day: boolean
          remind_3_days: boolean
          remind_7_days: boolean
          scholarship_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_reminded_at?: string | null
          remind_1_day?: boolean
          remind_3_days?: boolean
          remind_7_days?: boolean
          scholarship_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_reminded_at?: string | null
          remind_1_day?: boolean
          remind_3_days?: boolean
          remind_7_days?: boolean
          scholarship_id?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          accepts_direct_apply: boolean
          amount: number
          application_process: string | null
          application_url: string | null
          categories: string[] | null
          competition_level: string
          country: string
          created_at: string
          deadline: string
          description: string
          education_levels: string[] | null
          eligibility_criteria: string | null
          fields_of_study: string[] | null
          funding_type: string
          genders: string[] | null
          id: string
          is_active: boolean
          max_income: number | null
          min_percentage: number | null
          name: string
          provider: string
          provider_type: string
          provider_user_id: string | null
          required_documents: string[] | null
          states: string[] | null
          tags: string[] | null
          university: string | null
          updated_at: string
        }
        Insert: {
          accepts_direct_apply?: boolean
          amount?: number
          application_process?: string | null
          application_url?: string | null
          categories?: string[] | null
          competition_level?: string
          country?: string
          created_at?: string
          deadline: string
          description?: string
          education_levels?: string[] | null
          eligibility_criteria?: string | null
          fields_of_study?: string[] | null
          funding_type?: string
          genders?: string[] | null
          id: string
          is_active?: boolean
          max_income?: number | null
          min_percentage?: number | null
          name: string
          provider: string
          provider_type?: string
          provider_user_id?: string | null
          required_documents?: string[] | null
          states?: string[] | null
          tags?: string[] | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          accepts_direct_apply?: boolean
          amount?: number
          application_process?: string | null
          application_url?: string | null
          categories?: string[] | null
          competition_level?: string
          country?: string
          created_at?: string
          deadline?: string
          description?: string
          education_levels?: string[] | null
          eligibility_criteria?: string | null
          fields_of_study?: string[] | null
          funding_type?: string
          genders?: string[] | null
          id?: string
          is_active?: boolean
          max_income?: number | null
          min_percentage?: number | null
          name?: string
          provider?: string
          provider_type?: string
          provider_user_id?: string | null
          required_documents?: string[] | null
          states?: string[] | null
          tags?: string[] | null
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          academic_percentage: number
          age: number
          annual_family_income: number
          category: string
          created_at: string
          education_level: string
          field_of_study: string
          full_name: string
          gender: string
          id: string
          state: string
          target_course_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_percentage?: number
          age?: number
          annual_family_income?: number
          category?: string
          created_at?: string
          education_level?: string
          field_of_study?: string
          full_name?: string
          gender?: string
          id?: string
          state?: string
          target_course_cost?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_percentage?: number
          age?: number
          annual_family_income?: number
          category?: string
          created_at?: string
          education_level?: string
          field_of_study?: string
          full_name?: string
          gender?: string
          id?: string
          state?: string
          target_course_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          document_name: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_name: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_name?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_as_provider: {
        Args: {
          _contact_email?: string
          _description?: string
          _organization_name: string
          _website?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "provider" | "user"
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
    Enums: {
      app_role: ["admin", "provider", "user"],
    },
  },
} as const
