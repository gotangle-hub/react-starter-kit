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
      class_documents: {
        Row: {
          body: string | null
          class_id: string
          created_at: string
          file_path: string | null
          id: string
          kind: Database["public"]["Enums"]["class_doc_kind"]
          link_url: string | null
          title: string
          uploader_id: string
        }
        Insert: {
          body?: string | null
          class_id: string
          created_at?: string
          file_path?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["class_doc_kind"]
          link_url?: string | null
          title: string
          uploader_id: string
        }
        Update: {
          body?: string | null
          class_id?: string
          created_at?: string
          file_path?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["class_doc_kind"]
          link_url?: string | null
          title?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_documents_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_invites: {
        Row: {
          class_id: string
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["class_role"]
          status: Database["public"]["Enums"]["class_invite_status"]
          token: string
        }
        Insert: {
          class_id: string
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["class_role"]
          status?: Database["public"]["Enums"]["class_invite_status"]
          token?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["class_role"]
          status?: Database["public"]["Enums"]["class_invite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_invites_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          joined_at: string
          role: Database["public"]["Enums"]["class_role"]
          status: Database["public"]["Enums"]["class_member_status"]
          user_id: string
        }
        Insert: {
          class_id: string
          joined_at?: string
          role?: Database["public"]["Enums"]["class_role"]
          status?: Database["public"]["Enums"]["class_member_status"]
          user_id: string
        }
        Update: {
          class_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["class_role"]
          status?: Database["public"]["Enums"]["class_member_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          allow_student_pins: boolean
          brief: string | null
          class_type: Database["public"]["Enums"]["class_kind"]
          conversation_id: string | null
          created_at: string
          id: string
          institution_id: string | null
          name: string
          professor_id: string
          updated_at: string
          year: string | null
        }
        Insert: {
          allow_student_pins?: boolean
          brief?: string | null
          class_type?: Database["public"]["Enums"]["class_kind"]
          conversation_id?: string | null
          created_at?: string
          id?: string
          institution_id?: string | null
          name: string
          professor_id: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          allow_student_pins?: boolean
          brief?: string | null
          class_type?: Database["public"]["Enums"]["class_kind"]
          conversation_id?: string | null
          created_at?: string
          id?: string
          institution_id?: string | null
          name?: string
          professor_id?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_members: {
        Row: {
          collab_id: string
          created_at: string
          invited_by: string | null
          role: string
          status: Database["public"]["Enums"]["collab_member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          collab_id: string
          created_at?: string
          invited_by?: string | null
          role?: string
          status?: Database["public"]["Enums"]["collab_member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          collab_id?: string
          created_at?: string
          invited_by?: string | null
          role?: string
          status?: Database["public"]["Enums"]["collab_member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_members_collab_id_fkey"
            columns: ["collab_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_milestones: {
        Row: {
          collab_id: string
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          collab_id: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          collab_id?: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_milestones_collab_id_fkey"
            columns: ["collab_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_tasks: {
        Row: {
          assignee_id: string | null
          collab_id: string
          created_at: string
          created_by: string | null
          done: boolean
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          collab_id: string
          created_at?: string
          created_by?: string | null
          done?: boolean
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          collab_id?: string
          created_at?: string
          created_by?: string | null
          done?: boolean
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_tasks_collab_id_fkey"
            columns: ["collab_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborations: {
        Row: {
          brief: string
          conversation_id: string | null
          created_at: string
          id: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          brief?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          owner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          brief?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_user_state: {
        Row: {
          competition_id: string
          created_at: string
          interested: boolean
          pinned: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          interested?: boolean
          pinned?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          interested?: boolean
          pinned?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_user_state_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          audience: string
          created_at: string
          deadline: string | null
          deadline_label: string | null
          eligibility: string
          external_id: string | null
          field: string
          id: string
          interested_count: number
          is_official: boolean
          last_seen_at: string
          location: string
          organiser: string
          prize: string | null
          prize_kind: string | null
          source: string
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          created_at?: string
          deadline?: string | null
          deadline_label?: string | null
          eligibility?: string
          external_id?: string | null
          field: string
          id?: string
          interested_count?: number
          is_official?: boolean
          last_seen_at?: string
          location: string
          organiser: string
          prize?: string | null
          prize_kind?: string | null
          source?: string
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          deadline?: string | null
          deadline_label?: string | null
          eligibility?: string
          external_id?: string | null
          field?: string
          id?: string
          interested_count?: number
          is_official?: boolean
          last_seen_at?: string
          location?: string
          organiser?: string
          prize?: string | null
          prize_kind?: string | null
          source?: string
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_requests: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_group: boolean
          last_message_at: string
          last_message_preview: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_at?: string
          last_message_preview?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_group?: boolean
          last_message_at?: string
          last_message_preview?: string | null
          title?: string | null
        }
        Relationships: []
      }
      dm_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      institution_registration_requests: {
        Row: {
          approx_students: number | null
          contact_email: string
          contact_name: string | null
          created_at: string
          id: string
          institution_name: string
          location: string | null
          notes: string | null
          role: string | null
          status: string
          submitted_by: string | null
        }
        Insert: {
          approx_students?: number | null
          contact_email: string
          contact_name?: string | null
          created_at?: string
          id?: string
          institution_name: string
          location?: string | null
          notes?: string | null
          role?: string | null
          status?: string
          submitted_by?: string | null
        }
        Update: {
          approx_students?: number | null
          contact_email?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          institution_name?: string
          location?: string | null
          notes?: string | null
          role?: string | null
          status?: string
          submitted_by?: string | null
        }
        Relationships: []
      }
      institutions: {
        Row: {
          alt_domains: string[]
          city: string
          country: string | null
          created_at: string
          domain: string
          faculty_email_regex: string | null
          id: string
          initials: string | null
          name: string
          slug: string
          sso_provider: string
          student_email_regex: string | null
          tint: string | null
          updated_at: string
        }
        Insert: {
          alt_domains?: string[]
          city: string
          country?: string | null
          created_at?: string
          domain: string
          faculty_email_regex?: string | null
          id?: string
          initials?: string | null
          name: string
          slug: string
          sso_provider?: string
          student_email_regex?: string | null
          tint?: string | null
          updated_at?: string
        }
        Update: {
          alt_domains?: string[]
          city?: string
          country?: string | null
          created_at?: string
          domain?: string
          faculty_email_regex?: string | null
          id?: string
          initials?: string | null
          name?: string
          slug?: string
          sso_provider?: string
          student_email_regex?: string | null
          tint?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          category: string | null
          created_at: string
          id: number
          kind: string
          target_id: string
          target_kind: string
          user_id: string
          weight: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: number
          kind: string
          target_id: string
          target_kind: string
          user_id: string
          weight?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: number
          kind?: string
          target_id?: string
          target_kind?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          target_id: string | null
          target_kind: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          target_id?: string | null
          target_kind?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          target_id?: string | null
          target_kind?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          kind: string
          metadata: Json
          reference: string
          status: string
          updated_at: string
          user_id: string | null
          ziina_intent_id: string | null
          ziina_redirect_url: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          kind: string
          metadata?: Json
          reference: string
          status?: string
          updated_at?: string
          user_id?: string | null
          ziina_intent_id?: string | null
          ziina_redirect_url?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          metadata?: Json
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          ziina_intent_id?: string | null
          ziina_redirect_url?: string | null
        }
        Relationships: []
      }
      post_metrics: {
        Row: {
          audience_size: number
          computed_at: string
          events_recent: number
          post_id: string
          reach_tier: number
          score: number
          velocity: number
        }
        Insert: {
          audience_size?: number
          computed_at?: string
          events_recent?: number
          post_id: string
          reach_tier?: number
          score?: number
          velocity?: number
        }
        Update: {
          audience_size?: number
          computed_at?: string
          events_recent?: number
          post_id?: string
          reach_tier?: number
          score?: number
          velocity?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          caption: string | null
          category: string | null
          created_at: string
          id: string
          image_path: string | null
          media_paths: string[]
          on_explore: boolean
          place: string | null
          promoted: boolean
          reach_tier: number
          tags: string[]
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          author_id: string
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          media_paths?: string[]
          on_explore?: boolean
          place?: string | null
          promoted?: boolean
          reach_tier?: number
          tags?: string[]
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          author_id?: string
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          media_paths?: string[]
          on_explore?: boolean
          place?: string | null
          promoted?: boolean
          reach_tier?: number
          tags?: string[]
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_path: string | null
          banner_path: string | null
          bio: string | null
          created_at: string
          disciplines: string[]
          display_name: string | null
          id: string
          links: Json
          location: string | null
          marketing_opt_in: boolean
          updated_at: string
          username: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string | null
          created_at?: string
          disciplines?: string[]
          display_name?: string | null
          id: string
          links?: Json
          location?: string | null
          marketing_opt_in?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string | null
          created_at?: string
          disciplines?: string[]
          display_name?: string | null
          id?: string
          links?: Json
          location?: string | null
          marketing_opt_in?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      salary_entries: {
        Row: {
          created_at: string
          currency: string
          field: string
          id: string
          location: string
          pay_per_month: number
          title: string
        }
        Insert: {
          created_at?: string
          currency?: string
          field: string
          id?: string
          location: string
          pay_per_month: number
          title: string
        }
        Update: {
          created_at?: string
          currency?: string
          field?: string
          id?: string
          location?: string
          pay_per_month?: number
          title?: string
        }
        Relationships: []
      }
      search_documents: {
        Row: {
          content: string
          embedding: string | null
          id: string
          image_url: string | null
          kind: string
          metadata: Json
          ref_id: string
          updated_at: string
        }
        Insert: {
          content: string
          embedding?: string | null
          id?: string
          image_url?: string | null
          kind: string
          metadata?: Json
          ref_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          embedding?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          metadata?: Json
          ref_id?: string
          updated_at?: string
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
      user_interests: {
        Row: {
          tag: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          tag: string
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          tag?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      accept_class_invite: { Args: { _token: string }; Returns: string }
      check_username_available: { Args: { _name: string }; Returns: boolean }
      create_class: {
        Args: {
          _allow_student_pins: boolean
          _brief: string
          _class_type: Database["public"]["Enums"]["class_kind"]
          _institution_id: string
          _name: string
          _ta_email: string
          _year: string
        }
        Returns: string
      }
      create_collaboration: {
        Args: { _brief: string; _member_ids: string[]; _title: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_dm_conversation: { Args: { _other: string }; Returns: string }
      get_auth_methods: { Args: { p_email: string }; Returns: Json }
      get_my_marketing_opt_in: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invite_to_collaboration: {
        Args: { _collab: string; _member_ids: string[] }
        Returns: undefined
      }
      is_active_collab_member: {
        Args: { _collab: string; _user: string }
        Returns: boolean
      }
      is_class_member: {
        Args: { _class: string; _user: string }
        Returns: boolean
      }
      is_class_professor: {
        Args: { _class: string; _user: string }
        Returns: boolean
      }
      is_class_staff: {
        Args: { _class: string; _user: string }
        Returns: boolean
      }
      is_collab_member: {
        Args: { _collab: string; _user: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
      like_to_connect: {
        Args: { _target: string }
        Returns: {
          mutual: boolean
          status: string
        }[]
      }
      list_my_classes: {
        Args: never
        Returns: {
          allow_student_pins: boolean
          brief: string
          class_type: Database["public"]["Enums"]["class_kind"]
          conversation_id: string
          created_at: string
          doc_count: number
          id: string
          member_count: number
          my_role: Database["public"]["Enums"]["class_role"]
          name: string
          professor_id: string
          updated_at: string
          year: string
        }[]
      }
      list_my_collaborations: {
        Args: never
        Returns: {
          brief: string
          conversation_id: string
          created_at: string
          id: string
          member_count: number
          my_status: Database["public"]["Enums"]["collab_member_status"]
          owner_id: string
          task_count: number
          task_done: number
          title: string
          updated_at: string
        }[]
      }
      list_my_conversations: {
        Args: never
        Returns: {
          conversation_id: string
          is_group: boolean
          last_message_at: string
          last_message_preview: string
          last_read_at: string
          other_user_id: string
        }[]
      }
      match_search_documents: {
        Args: {
          match_count?: number
          match_kind: string
          query_embedding: string
        }
        Returns: {
          content: string
          metadata: Json
          ref_id: string
          similarity: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      pass_on_maker: { Args: { _target: string }; Returns: undefined }
      profile_id_by_username: { Args: { _name: string }; Returns: string }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      refresh_post_metrics: { Args: never; Returns: undefined }
      respond_collab_invite: {
        Args: { _accept: boolean; _collab: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      suggest_usernames: {
        Args: { _base: string; _count?: number }
        Returns: string[]
      }
    }
    Enums: {
      account_type:
        | "designer"
        | "studio"
        | "client"
        | "institution"
        | "student"
        | "collector"
      app_role: "admin" | "moderator" | "user"
      class_doc_kind: "project" | "document" | "brief" | "reference"
      class_invite_status: "pending" | "accepted" | "cancelled" | "expired"
      class_kind: "studio" | "theoretical"
      class_member_status: "active" | "invited" | "left"
      class_role: "professor" | "ta" | "student"
      collab_member_status: "invited" | "active" | "declined" | "left"
      connection_status: "pending" | "accepted" | "declined" | "dismissed"
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
      account_type: [
        "designer",
        "studio",
        "client",
        "institution",
        "student",
        "collector",
      ],
      app_role: ["admin", "moderator", "user"],
      class_doc_kind: ["project", "document", "brief", "reference"],
      class_invite_status: ["pending", "accepted", "cancelled", "expired"],
      class_kind: ["studio", "theoretical"],
      class_member_status: ["active", "invited", "left"],
      class_role: ["professor", "ta", "student"],
      collab_member_status: ["invited", "active", "declined", "left"],
      connection_status: ["pending", "accepted", "declined", "dismissed"],
    },
  },
} as const
