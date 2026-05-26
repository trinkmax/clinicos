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
      ad_sources: {
        Row: {
          activo: boolean
          config: Json
          created_at: string
          id: string
          nombre: string
          plataforma: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          config?: Json
          created_at?: string
          id?: string
          nombre: string
          plataforma: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          config?: Json
          created_at?: string
          id?: string
          nombre?: string
          plataforma?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_sources_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          abono: boolean
          created_at: string
          created_by: string | null
          duracion_min: number
          episode_id: string | null
          estado: Database["public"]["Enums"]["appt_estado"]
          fecha: string
          hora: string
          id: string
          modalidad: Database["public"]["Enums"]["appt_modalidad"]
          nombre_contacto: string | null
          notas: string | null
          patient_id: string | null
          profesional_id: string | null
          telefono_contacto: string | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["appt_tipo"]
          updated_at: string
          virtual_flexible: boolean
        }
        Insert: {
          abono?: boolean
          created_at?: string
          created_by?: string | null
          duracion_min?: number
          episode_id?: string | null
          estado?: Database["public"]["Enums"]["appt_estado"]
          fecha: string
          hora: string
          id?: string
          modalidad?: Database["public"]["Enums"]["appt_modalidad"]
          nombre_contacto?: string | null
          notas?: string | null
          patient_id?: string | null
          profesional_id?: string | null
          telefono_contacto?: string | null
          tenant_id: string
          tipo?: Database["public"]["Enums"]["appt_tipo"]
          updated_at?: string
          virtual_flexible?: boolean
        }
        Update: {
          abono?: boolean
          created_at?: string
          created_by?: string | null
          duracion_min?: number
          episode_id?: string | null
          estado?: Database["public"]["Enums"]["appt_estado"]
          fecha?: string
          hora?: string
          id?: string
          modalidad?: Database["public"]["Enums"]["appt_modalidad"]
          nombre_contacto?: string | null
          notas?: string | null
          patient_id?: string | null
          profesional_id?: string | null
          telefono_contacto?: string | null
          tenant_id?: string
          tipo?: Database["public"]["Enums"]["appt_tipo"]
          updated_at?: string
          virtual_flexible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "appointments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      attribution: {
        Row: {
          contact_id: string | null
          costo: number
          created_at: string
          fuente: Database["public"]["Enums"]["contact_fuente"]
          id: string
          ingreso: number
          patient_id: string | null
          tenant_id: string
          utm: Json
        }
        Insert: {
          contact_id?: string | null
          costo?: number
          created_at?: string
          fuente: Database["public"]["Enums"]["contact_fuente"]
          id?: string
          ingreso?: number
          patient_id?: string | null
          tenant_id: string
          utm?: Json
        }
        Update: {
          contact_id?: string | null
          costo?: number
          created_at?: string
          fuente?: Database["public"]["Enums"]["contact_fuente"]
          id?: string
          ingreso?: number
          patient_id?: string | null
          tenant_id?: string
          utm?: Json
        }
        Relationships: [
          {
            foreignKeyName: "attribution_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribution_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribution_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_role: string | null
          actor_user_id: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_table: string
          id: number
          ip: unknown
          summary: string | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_table: string
          id?: never
          ip?: unknown
          summary?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_table?: string
          id?: never
          ip?: unknown
          summary?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          automation_id: string
          contact_id: string | null
          created_at: string
          estado: string
          id: string
          log: Json
          patient_id: string | null
          tenant_id: string
        }
        Insert: {
          automation_id: string
          contact_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          log?: Json
          patient_id?: string | null
          tenant_id: string
        }
        Update: {
          automation_id?: string
          contact_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          log?: Json
          patient_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          acciones: Json
          activo: boolean
          created_at: string
          created_by: string | null
          id: string
          nombre: string
          tenant_id: string
          trigger: Json
          updated_at: string
        }
        Insert: {
          acciones?: Json
          activo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nombre: string
          tenant_id: string
          trigger?: Json
          updated_at?: string
        }
        Update: {
          acciones?: Json
          activo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nombre?: string
          tenant_id?: string
          trigger?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_templates: {
        Row: {
          activo: boolean
          created_at: string
          dia_semana: number
          hora_fin: string
          hora_inicio: string
          id: string
          profesional_id: string | null
          slot_min: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          dia_semana: number
          hora_fin: string
          hora_inicio: string
          id?: string
          profesional_id?: string | null
          slot_min?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          dia_semana?: number
          hora_fin?: string
          hora_inicio?: string
          id?: string
          profesional_id?: string | null
          slot_min?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          canal: Database["public"]["Enums"]["channel_tipo"]
          created_at: string
          created_by: string | null
          estado: Database["public"]["Enums"]["campaign_estado"]
          id: string
          nombre: string
          scheduled_at: string | null
          segment_id: string | null
          stats: Json
          template_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          canal?: Database["public"]["Enums"]["channel_tipo"]
          created_at?: string
          created_by?: string | null
          estado?: Database["public"]["Enums"]["campaign_estado"]
          id?: string
          nombre: string
          scheduled_at?: string | null
          segment_id?: string | null
          stats?: Json
          template_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          canal?: Database["public"]["Enums"]["channel_tipo"]
          created_at?: string
          created_by?: string | null
          estado?: Database["public"]["Enums"]["campaign_estado"]
          id?: string
          nombre?: string
          scheduled_at?: string | null
          segment_id?: string | null
          stats?: Json
          template_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          config: Json
          created_at: string
          estado: Database["public"]["Enums"]["channel_estado"]
          id: string
          nombre: string
          session: Json
          tenant_id: string
          tipo: Database["public"]["Enums"]["channel_tipo"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          estado?: Database["public"]["Enums"]["channel_estado"]
          id?: string
          nombre: string
          session?: Json
          tenant_id: string
          tipo: Database["public"]["Enums"]["channel_tipo"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          estado?: Database["public"]["Enums"]["channel_estado"]
          id?: string
          nombre?: string
          session?: Json
          tenant_id?: string
          tipo?: Database["public"]["Enums"]["channel_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_episodes: {
        Row: {
          closed_at: string | null
          condiciones: Database["public"]["Enums"]["condicion"][]
          created_at: string
          id: string
          opened_at: string
          patient_id: string
          profesional_id: string | null
          status: Database["public"]["Enums"]["episode_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          condiciones?: Database["public"]["Enums"]["condicion"][]
          created_at?: string
          id?: string
          opened_at?: string
          patient_id: string
          profesional_id?: string | null
          status?: Database["public"]["Enums"]["episode_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          condiciones?: Database["public"]["Enums"]["condicion"][]
          created_at?: string
          id?: string
          opened_at?: string
          patient_id?: string
          profesional_id?: string | null
          status?: Database["public"]["Enums"]["episode_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_episodes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_episodes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_histories: {
        Row: {
          antecedentes: Json
          closed_at: string | null
          created_at: string
          created_by: string | null
          datos_personales: Json
          deseo_sexual: Json
          diagnostico: string | null
          disfuncion_erectil: Json
          document_id: string | null
          ecodoppler: Json
          episode_id: string | null
          estudios: Json
          examen_fisico: Json
          eyaculacion_precoz: Json
          fecha: string | null
          id: string
          motivo_consulta: Json
          patient_id: string
          plan: string | null
          profesional_id: string | null
          seguimiento: Json
          signed_at: string | null
          signed_by: string | null
          status: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          tratamiento: Json
          updated_at: string
        }
        Insert: {
          antecedentes?: Json
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          datos_personales?: Json
          deseo_sexual?: Json
          diagnostico?: string | null
          disfuncion_erectil?: Json
          document_id?: string | null
          ecodoppler?: Json
          episode_id?: string | null
          estudios?: Json
          examen_fisico?: Json
          eyaculacion_precoz?: Json
          fecha?: string | null
          id?: string
          motivo_consulta?: Json
          patient_id: string
          plan?: string | null
          profesional_id?: string | null
          seguimiento?: Json
          signed_at?: string | null
          signed_by?: string | null
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          tratamiento?: Json
          updated_at?: string
        }
        Update: {
          antecedentes?: Json
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          datos_personales?: Json
          deseo_sexual?: Json
          diagnostico?: string | null
          disfuncion_erectil?: Json
          document_id?: string | null
          ecodoppler?: Json
          episode_id?: string | null
          estudios?: Json
          examen_fisico?: Json
          eyaculacion_precoz?: Json
          fecha?: string | null
          id?: string
          motivo_consulta?: Json
          patient_id?: string
          plan?: string | null
          profesional_id?: string | null
          seguimiento?: Json
          signed_at?: string | null
          signed_by?: string | null
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id?: string
          tratamiento?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_histories_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_histories_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_histories_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_histories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          contenido: string
          created_at: string
          created_by: string | null
          episode_id: string | null
          fecha: string
          id: string
          patient_id: string
          profesional_id: string | null
          ref_id: string | null
          ref_table: string | null
          tenant_id: string
          tipo: string
        }
        Insert: {
          contenido: string
          created_at?: string
          created_by?: string | null
          episode_id?: string | null
          fecha?: string
          id?: string
          patient_id: string
          profesional_id?: string | null
          ref_id?: string | null
          ref_table?: string | null
          tenant_id: string
          tipo?: string
        }
        Update: {
          contenido?: string
          created_at?: string
          created_by?: string | null
          episode_id?: string | null
          fecha?: string
          id?: string
          patient_id?: string
          profesional_id?: string | null
          ref_id?: string | null
          ref_table?: string | null
          tenant_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          created_at: string
          created_by: string | null
          document_id: string | null
          episode_id: string | null
          id: string
          patient_id: string
          sha256: string | null
          signature_method: string
          signed_at: string | null
          signer_dni: string | null
          signer_name: string | null
          status: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          tipo: string
          trazabilidad: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          episode_id?: string | null
          id?: string
          patient_id: string
          sha256?: string | null
          signature_method?: string
          signed_at?: string | null
          signer_dni?: string | null
          signer_name?: string | null
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          tipo?: string
          trazabilidad?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          episode_id?: string | null
          id?: string
          patient_id?: string
          sha256?: string | null
          signature_method?: string
          signed_at?: string | null
          signer_dni?: string | null
          signer_name?: string | null
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id?: string
          tipo?: string
          trazabilidad?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          asignado_a: string | null
          created_at: string
          email: string | null
          etapa: Database["public"]["Enums"]["contact_etapa"]
          fuente: Database["public"]["Enums"]["contact_fuente"]
          id: string
          last_message_at: string | null
          nombre: string | null
          notas: string | null
          patient_id: string | null
          tags: string[]
          telefono: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          asignado_a?: string | null
          created_at?: string
          email?: string | null
          etapa?: Database["public"]["Enums"]["contact_etapa"]
          fuente?: Database["public"]["Enums"]["contact_fuente"]
          id?: string
          last_message_at?: string | null
          nombre?: string | null
          notas?: string | null
          patient_id?: string | null
          tags?: string[]
          telefono?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          asignado_a?: string | null
          created_at?: string
          email?: string | null
          etapa?: Database["public"]["Enums"]["contact_etapa"]
          fuente?: Database["public"]["Enums"]["contact_fuente"]
          id?: string
          last_message_at?: string | null
          nombre?: string | null
          notas?: string | null
          patient_id?: string | null
          tags?: string[]
          telefono?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          asignado_a: string | null
          channel_id: string | null
          contact_id: string
          created_at: string
          estado: Database["public"]["Enums"]["conv_estado"]
          id: string
          last_message_at: string | null
          tenant_id: string
          unread: number
          updated_at: string
        }
        Insert: {
          asignado_a?: string | null
          channel_id?: string | null
          contact_id: string
          created_at?: string
          estado?: Database["public"]["Enums"]["conv_estado"]
          id?: string
          last_message_at?: string | null
          tenant_id: string
          unread?: number
          updated_at?: string
        }
        Update: {
          asignado_a?: string | null
          channel_id?: string | null
          contact_id?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["conv_estado"]
          id?: string
          last_message_at?: string | null
          tenant_id?: string
          unread?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          cantidad: number
          created_at: string
          created_by: string | null
          detalle: string | null
          fecha: string
          id: string
          patient_id: string
          plan_id: string | null
          tenant_id: string
        }
        Insert: {
          cantidad?: number
          created_at?: string
          created_by?: string | null
          detalle?: string | null
          fecha?: string
          id?: string
          patient_id: string
          plan_id?: string | null
          tenant_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          created_by?: string | null
          detalle?: string | null
          fecha?: string
          id?: string
          patient_id?: string
          plan_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_extractions: {
        Row: {
          confidence: number | null
          created_at: string
          data: Json
          doc_type: Database["public"]["Enums"]["doc_type"]
          document_id: string
          error: string | null
          field_meta: Json
          id: string
          model: string | null
          prompt_version: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["doc_status"]
          tenant_id: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          data?: Json
          doc_type: Database["public"]["Enums"]["doc_type"]
          document_id: string
          error?: string | null
          field_meta?: Json
          id?: string
          model?: string | null
          prompt_version?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          tenant_id: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          data?: Json
          doc_type?: Database["public"]["Enums"]["doc_type"]
          document_id?: string
          error?: string | null
          field_meta?: Json
          id?: string
          model?: string | null
          prompt_version?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          tenant_id?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_extractions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          canal: string | null
          created_at: string
          done_at: string | null
          due_date: string
          episode_id: string | null
          estado: Database["public"]["Enums"]["followup_estado"]
          id: string
          patient_id: string
          plan_id: string | null
          resultado: string | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["followup_tipo"]
          updated_at: string
        }
        Insert: {
          canal?: string | null
          created_at?: string
          done_at?: string | null
          due_date: string
          episode_id?: string | null
          estado?: Database["public"]["Enums"]["followup_estado"]
          id?: string
          patient_id: string
          plan_id?: string | null
          resultado?: string | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["followup_tipo"]
          updated_at?: string
        }
        Update: {
          canal?: string | null
          created_at?: string
          done_at?: string | null
          due_date?: string
          episode_id?: string | null
          estado?: Database["public"]["Enums"]["followup_estado"]
          id?: string
          patient_id?: string
          plan_id?: string | null
          resultado?: string | null
          tenant_id?: string
          tipo?: Database["public"]["Enums"]["followup_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          condiciones: Json
          created_at: string
          created_by: string | null
          diagnostico: string | null
          document_id: string | null
          episode_id: string | null
          fecha: string | null
          id: string
          patient_id: string
          sintomas: Json
          status: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          tratamiento: string | null
          updated_at: string
        }
        Insert: {
          condiciones?: Json
          created_at?: string
          created_by?: string | null
          diagnostico?: string | null
          document_id?: string | null
          episode_id?: string | null
          fecha?: string | null
          id?: string
          patient_id: string
          sintomas?: Json
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          tratamiento?: string | null
          updated_at?: string
        }
        Update: {
          condiciones?: Json
          created_at?: string
          created_by?: string | null
          diagnostico?: string | null
          document_id?: string | null
          episode_id?: string | null
          fecha?: string | null
          id?: string
          patient_id?: string
          sintomas?: Json
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id?: string
          tratamiento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_forms_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_forms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          created_at: string
          id: string
          minimo: number
          nombre: string
          product_id: string | null
          stock: number
          tenant_id: string
          unidad: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          minimo?: number
          nombre: string
          product_id?: string | null
          stock?: number
          tenant_id: string
          unidad?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          minimo?: number
          nombre?: string
          product_id?: string | null
          stock?: number
          tenant_id?: string
          unidad?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maxsex_product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          orden: number
          product_id: string
          tenant_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          orden?: number
          product_id: string
          tenant_id: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          orden?: number
          product_id?: string
          tenant_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "maxsex_product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "maxsex_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maxsex_product_images_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maxsex_products: {
        Row: {
          activo: boolean
          advertencias: string | null
          audiencia: Database["public"]["Enums"]["maxsex_audiencia"]
          beneficios: string[]
          color_hex: string
          color_oklch: string
          composicion: string | null
          created_at: string
          created_by: string | null
          descripcion_corta: string
          descripcion_larga: string | null
          destacado: boolean
          external_id: string | null
          id: string
          imagen_principal_url: string | null
          indicacion_descripcion: string | null
          indicacion_titulo: string | null
          linea: Database["public"]["Enums"]["maxsex_linea"]
          modo_uso: string | null
          moneda: string
          nombre_completo: string | null
          nombre_corto: string
          orden: number
          precio: number
          precio_promo: number | null
          presentacion: string
          rnpa: string | null
          sku: string | null
          slug: string
          stock_actual: number
          stock_minimo: number
          synced_at: string | null
          tagline: string
          tenant_id: string
          unidades_por_envase: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          advertencias?: string | null
          audiencia?: Database["public"]["Enums"]["maxsex_audiencia"]
          beneficios?: string[]
          color_hex: string
          color_oklch: string
          composicion?: string | null
          created_at?: string
          created_by?: string | null
          descripcion_corta: string
          descripcion_larga?: string | null
          destacado?: boolean
          external_id?: string | null
          id?: string
          imagen_principal_url?: string | null
          indicacion_descripcion?: string | null
          indicacion_titulo?: string | null
          linea: Database["public"]["Enums"]["maxsex_linea"]
          modo_uso?: string | null
          moneda?: string
          nombre_completo?: string | null
          nombre_corto: string
          orden?: number
          precio?: number
          precio_promo?: number | null
          presentacion?: string
          rnpa?: string | null
          sku?: string | null
          slug: string
          stock_actual?: number
          stock_minimo?: number
          synced_at?: string | null
          tagline?: string
          tenant_id: string
          unidades_por_envase?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          advertencias?: string | null
          audiencia?: Database["public"]["Enums"]["maxsex_audiencia"]
          beneficios?: string[]
          color_hex?: string
          color_oklch?: string
          composicion?: string | null
          created_at?: string
          created_by?: string | null
          descripcion_corta?: string
          descripcion_larga?: string | null
          destacado?: boolean
          external_id?: string | null
          id?: string
          imagen_principal_url?: string | null
          indicacion_descripcion?: string | null
          indicacion_titulo?: string | null
          linea?: Database["public"]["Enums"]["maxsex_linea"]
          modo_uso?: string | null
          moneda?: string
          nombre_completo?: string | null
          nombre_corto?: string
          orden?: number
          precio?: number
          precio_promo?: number | null
          presentacion?: string
          rnpa?: string | null
          sku?: string | null
          slug?: string
          stock_actual?: number
          stock_minimo?: number
          synced_at?: string | null
          tagline?: string
          tenant_id?: string
          unidades_por_envase?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maxsex_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          activo: boolean
          categoria: string
          created_at: string
          created_by: string | null
          cuerpo: string
          id: string
          nombre: string
          tenant_id: string
          updated_at: string
          variables: Json
        }
        Insert: {
          activo?: boolean
          categoria?: string
          created_at?: string
          created_by?: string | null
          cuerpo: string
          id?: string
          nombre: string
          tenant_id: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          activo?: boolean
          categoria?: string
          created_at?: string
          created_by?: string | null
          cuerpo?: string
          id?: string
          nombre?: string
          tenant_id?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          contact_id: string
          contenido: string | null
          conversation_id: string
          created_at: string
          direccion: Database["public"]["Enums"]["msg_dir"]
          estado: Database["public"]["Enums"]["msg_estado"]
          id: string
          media_path: string | null
          provider_msg_id: string | null
          sent_by: string | null
          tenant_id: string
          tipo: string
        }
        Insert: {
          contact_id: string
          contenido?: string | null
          conversation_id: string
          created_at?: string
          direccion: Database["public"]["Enums"]["msg_dir"]
          estado?: Database["public"]["Enums"]["msg_estado"]
          id?: string
          media_path?: string | null
          provider_msg_id?: string | null
          sent_by?: string | null
          tenant_id: string
          tipo?: string
        }
        Update: {
          contact_id?: string
          contenido?: string | null
          conversation_id?: string
          created_at?: string
          direccion?: Database["public"]["Enums"]["msg_dir"]
          estado?: Database["public"]["Enums"]["msg_estado"]
          id?: string
          media_path?: string | null
          provider_msg_id?: string | null
          sent_by?: string | null
          tenant_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          bytes: number | null
          created_at: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          episode_id: string | null
          id: string
          mime: string
          page_count: number | null
          patient_id: string | null
          scan_session: string | null
          sha256: string
          status: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          bytes?: number | null
          created_at?: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          episode_id?: string | null
          id?: string
          mime?: string
          page_count?: number | null
          patient_id?: string | null
          scan_session?: string | null
          sha256: string
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          bytes?: number | null
          created_at?: string
          doc_type?: Database["public"]["Enums"]["doc_type"]
          episode_id?: string | null
          id?: string
          mime?: string
          page_count?: number | null
          patient_id?: string | null
          scan_session?: string | null
          sha256?: string
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          apellido: string
          created_at: string
          created_by: string | null
          dni: string | null
          domicilio: Json
          email: string | null
          estado_civil: string | null
          fecha_nacimiento: string | null
          id: string
          nombres: string
          notas: string | null
          ocupacion: string | null
          sexo: string
          status: Database["public"]["Enums"]["patient_status"]
          telefono: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          apellido: string
          created_at?: string
          created_by?: string | null
          dni?: string | null
          domicilio?: Json
          email?: string | null
          estado_civil?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombres: string
          notas?: string | null
          ocupacion?: string | null
          sexo?: string
          status?: Database["public"]["Enums"]["patient_status"]
          telefono?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          apellido?: string
          created_at?: string
          created_by?: string | null
          dni?: string | null
          domicilio?: Json
          email?: string | null
          estado_civil?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombres?: string
          notas?: string | null
          ocupacion?: string | null
          sexo?: string
          status?: Database["public"]["Enums"]["patient_status"]
          telefono?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          comprobante_doc_id: string | null
          created_at: string
          created_by: string | null
          fecha: string
          id: string
          importe: number
          medio: string | null
          notas: string | null
          patient_id: string
          plan_id: string
          tenant_id: string
        }
        Insert: {
          comprobante_doc_id?: string | null
          created_at?: string
          created_by?: string | null
          fecha?: string
          id?: string
          importe: number
          medio?: string | null
          notas?: string | null
          patient_id: string
          plan_id: string
          tenant_id: string
        }
        Update: {
          comprobante_doc_id?: string | null
          created_at?: string
          created_by?: string | null
          fecha?: string
          id?: string
          importe?: number
          medio?: string | null
          notas?: string | null
          patient_id?: string
          plan_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_comprobante_doc_id_fkey"
            columns: ["comprobante_doc_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          contenido: Json
          created_at: string
          created_by: string | null
          document_id: string | null
          entregada: boolean
          episode_id: string | null
          fecha: string | null
          id: string
          patient_id: string
          pdf_path: string | null
          profesional_id: string | null
          status: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          contenido?: Json
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          entregada?: boolean
          episode_id?: string | null
          fecha?: string | null
          id?: string
          patient_id: string
          pdf_path?: string | null
          profesional_id?: string | null
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          contenido?: Json
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          entregada?: boolean
          episode_id?: string | null
          fecha?: string | null
          id?: string
          patient_id?: string
          pdf_path?: string | null
          profesional_id?: string | null
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          activo: boolean
          aplicaciones: number
          codigo: string
          created_at: string
          id: string
          nombre: string
          precio: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          aplicaciones?: number
          codigo: string
          created_at?: string
          id?: string
          nombre: string
          precio?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          aplicaciones?: number
          codigo?: string
          created_at?: string
          id?: string
          nombre?: string
          precio?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_tests: {
        Row: {
          asesor_id: string | null
          created_at: string
          created_by: string | null
          document_id: string | null
          episode_id: string | null
          fecha: string | null
          id: string
          patient_id: string
          respuestas: Json
          status: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          asesor_id?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          episode_id?: string | null
          fecha?: string | null
          id?: string
          patient_id: string
          respuestas?: Json
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          asesor_id?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          episode_id?: string | null
          fecha?: string | null
          id?: string
          patient_id?: string
          respuestas?: Json
          status?: Database["public"]["Enums"]["clinical_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psych_tests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_tests_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_tests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string
          created_by: string | null
          definicion: Json
          descripcion: string | null
          id: string
          nombre: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          definicion?: Json
          descripcion?: string | null
          id?: string
          nombre: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          definicion?: Json
          descripcion?: string | null
          id?: string
          nombre?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          document_id: string | null
          entity_id: string
          entity_table: string
          geo: Json | null
          id: string
          ip: unknown
          method: string
          otp_ref: string | null
          payload_sha256: string
          signed_at: string
          signer_name: string | null
          signer_type: string
          signer_user_id: string | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          document_id?: string | null
          entity_id: string
          entity_table: string
          geo?: Json | null
          id?: string
          ip?: unknown
          method: string
          otp_ref?: string | null
          payload_sha256: string
          signed_at?: string
          signer_name?: string | null
          signer_type: string
          signer_user_id?: string | null
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          document_id?: string | null
          entity_id?: string
          entity_table?: string
          geo?: Json | null
          id?: string
          ip?: unknown
          method?: string
          otp_ref?: string | null
          payload_sha256?: string
          signed_at?: string
          signer_name?: string | null
          signer_type?: string
          signer_user_id?: string | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          cantidad: number
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          motivo: string | null
          ref_delivery_id: string | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["stock_mov"]
        }
        Insert: {
          cantidad: number
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          motivo?: string | null
          ref_delivery_id?: string | null
          tenant_id: string
          tipo: Database["public"]["Enums"]["stock_mov"]
        }
        Update: {
          cantidad?: number
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          motivo?: string | null
          ref_delivery_id?: string | null
          tenant_id?: string
          tipo?: Database["public"]["Enums"]["stock_mov"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_ref_delivery_id_fkey"
            columns: ["ref_delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          branding: Json
          created_at: string
          id: string
          legal_name: string | null
          locale: string
          name: string
          settings: Json
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          branding?: Json
          created_at?: string
          id?: string
          legal_name?: string | null
          locale?: string
          name: string
          settings?: Json
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          branding?: Json
          created_at?: string
          id?: string
          legal_name?: string | null
          locale?: string
          name?: string
          settings?: Json
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          cant_aplicaciones: number
          costo_total: number
          created_at: string
          created_by: string | null
          descripcion: string | null
          episode_id: string | null
          estado: Database["public"]["Enums"]["plan_estado"]
          fin: string | null
          id: string
          inicio: string | null
          notas: string | null
          patient_id: string
          product_id: string | null
          profesional_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cant_aplicaciones?: number
          costo_total?: number
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          episode_id?: string | null
          estado?: Database["public"]["Enums"]["plan_estado"]
          fin?: string | null
          id?: string
          inicio?: string | null
          notas?: string | null
          patient_id: string
          product_id?: string | null
          profesional_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cant_aplicaciones?: number
          costo_total?: number
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          episode_id?: string | null
          estado?: Database["public"]["Enums"]["plan_estado"]
          fin?: string | null
          id?: string
          inicio?: string | null
          notas?: string | null
          patient_id?: string
          product_id?: string | null
          profesional_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "clinical_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_followups_pendientes: {
        Row: {
          tenant_id: string | null
          tipo: Database["public"]["Enums"]["followup_tipo"] | null
          total: number | null
          vencidos: number | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_maxsex_overview: {
        Row: {
          lineas_activas: number | null
          productos_activos: number | null
          productos_bajo_stock: number | null
          productos_totales: number | null
          stock_total: number | null
          tenant_id: string | null
          valor_inventario: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maxsex_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_patient_funnel: {
        Row: {
          status: Database["public"]["Enums"]["patient_status"] | null
          tenant_id: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_revenue_by_product: {
        Row: {
          cobrado: number | null
          facturado: number | null
          planes: number | null
          producto: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      run_followup_automations: { Args: never; Returns: number }
    }
    Enums: {
      appt_estado:
        | "programado"
        | "confirmado"
        | "presente"
        | "atendido"
        | "ausente"
        | "cancelado"
      appt_modalidad: "presencial" | "videollamada"
      appt_tipo: "primera_vez" | "control" | "segunda_mas"
      campaign_estado:
        | "borrador"
        | "programada"
        | "enviando"
        | "enviada"
        | "pausada"
        | "cancelada"
      channel_estado: "conectado" | "desconectado" | "error" | "pendiente"
      channel_tipo:
        | "whatsapp_baileys"
        | "whatsapp_cloud"
        | "facebook"
        | "instagram"
        | "manual"
      clinical_status: "draft" | "signed" | "closed" | "amended"
      condicion:
        | "disfuncion_erectil"
        | "eyaculacion_precoz"
        | "deficit_testosterona"
        | "peyronie"
      contact_etapa:
        | "lead"
        | "contactado"
        | "consulta_agendada"
        | "paciente"
        | "en_tratamiento"
        | "seguimiento"
        | "alta"
        | "reactivacion"
        | "perdido"
      contact_fuente:
        | "facebook"
        | "whatsapp"
        | "google"
        | "referido"
        | "walk_in"
        | "otro"
      conv_estado: "abierta" | "pendiente" | "cerrada"
      doc_status:
        | "uploaded"
        | "extracting"
        | "extracted"
        | "in_review"
        | "validated"
        | "archived"
        | "failed"
      doc_type:
        | "ficha_ingreso"
        | "test_psicologico"
        | "historia_clinica"
        | "consentimiento"
        | "datos_comerciales"
        | "receta"
        | "comprobante_pago"
        | "estudio"
        | "otro"
      episode_status:
        | "intake"
        | "evaluacion"
        | "diagnostico"
        | "tratamiento"
        | "seguimiento"
        | "alta"
        | "baja"
      followup_estado: "pendiente" | "hecho" | "omitido" | "reprogramado"
      followup_tipo: "control_15" | "control_30" | "control_60" | "adherencia"
      maxsex_audiencia: "hombre" | "mujer" | "unisex"
      maxsex_linea:
        | "active"
        | "active_fem"
        | "action"
        | "action_plus"
        | "control"
      msg_dir: "in" | "out"
      msg_estado: "pendiente" | "enviado" | "entregado" | "leido" | "fallido"
      patient_status: "activo" | "en_tratamiento" | "alta" | "inactivo"
      plan_estado: "activo" | "completado" | "cancelado" | "en_mora"
      stock_mov: "entrada" | "salida" | "ajuste"
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
      appt_estado: [
        "programado",
        "confirmado",
        "presente",
        "atendido",
        "ausente",
        "cancelado",
      ],
      appt_modalidad: ["presencial", "videollamada"],
      appt_tipo: ["primera_vez", "control", "segunda_mas"],
      campaign_estado: [
        "borrador",
        "programada",
        "enviando",
        "enviada",
        "pausada",
        "cancelada",
      ],
      channel_estado: ["conectado", "desconectado", "error", "pendiente"],
      channel_tipo: [
        "whatsapp_baileys",
        "whatsapp_cloud",
        "facebook",
        "instagram",
        "manual",
      ],
      clinical_status: ["draft", "signed", "closed", "amended"],
      condicion: [
        "disfuncion_erectil",
        "eyaculacion_precoz",
        "deficit_testosterona",
        "peyronie",
      ],
      contact_etapa: [
        "lead",
        "contactado",
        "consulta_agendada",
        "paciente",
        "en_tratamiento",
        "seguimiento",
        "alta",
        "reactivacion",
        "perdido",
      ],
      contact_fuente: [
        "facebook",
        "whatsapp",
        "google",
        "referido",
        "walk_in",
        "otro",
      ],
      conv_estado: ["abierta", "pendiente", "cerrada"],
      doc_status: [
        "uploaded",
        "extracting",
        "extracted",
        "in_review",
        "validated",
        "archived",
        "failed",
      ],
      doc_type: [
        "ficha_ingreso",
        "test_psicologico",
        "historia_clinica",
        "consentimiento",
        "datos_comerciales",
        "receta",
        "comprobante_pago",
        "estudio",
        "otro",
      ],
      episode_status: [
        "intake",
        "evaluacion",
        "diagnostico",
        "tratamiento",
        "seguimiento",
        "alta",
        "baja",
      ],
      followup_estado: ["pendiente", "hecho", "omitido", "reprogramado"],
      followup_tipo: ["control_15", "control_30", "control_60", "adherencia"],
      maxsex_audiencia: ["hombre", "mujer", "unisex"],
      maxsex_linea: [
        "active",
        "active_fem",
        "action",
        "action_plus",
        "control",
      ],
      msg_dir: ["in", "out"],
      msg_estado: ["pendiente", "enviado", "entregado", "leido", "fallido"],
      patient_status: ["activo", "en_tratamiento", "alta", "inactivo"],
      plan_estado: ["activo", "completado", "cancelado", "en_mora"],
      stock_mov: ["entrada", "salida", "ajuste"],
    },
  },
} as const
