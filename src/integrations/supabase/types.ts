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
      chaves_pix: {
        Row: {
          atualizado_em: string
          banco: string
          chave: string
          criado_em: string
          espaco_id: string
          id: string
          nome_recebedor: string
          tipo: Database["public"]["Enums"]["tipo_chave_pix"]
        }
        Insert: {
          atualizado_em?: string
          banco: string
          chave: string
          criado_em?: string
          espaco_id: string
          id?: string
          nome_recebedor: string
          tipo: Database["public"]["Enums"]["tipo_chave_pix"]
        }
        Update: {
          atualizado_em?: string
          banco?: string
          chave?: string
          criado_em?: string
          espaco_id?: string
          id?: string
          nome_recebedor?: string
          tipo?: Database["public"]["Enums"]["tipo_chave_pix"]
        }
        Relationships: [
          {
            foreignKeyName: "chaves_pix_espaco_id_fkey"
            columns: ["espaco_id"]
            isOneToOne: true
            referencedRelation: "espacos"
            referencedColumns: ["id"]
          },
        ]
      }
      espacos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          cor_primaria: string | null
          criado_em: string
          id: string
          logo_url: string | null
          nome: string
          slug: string | null
          telefone: string
          trial_ate: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          cor_primaria?: string | null
          criado_em?: string
          id?: string
          logo_url?: string | null
          nome: string
          slug?: string | null
          telefone: string
          trial_ate?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          cor_primaria?: string | null
          criado_em?: string
          id?: string
          logo_url?: string | null
          nome?: string
          slug?: string | null
          telefone?: string
          trial_ate?: string | null
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          atualizado_em: string
          conciliado: boolean
          confirmado_em: string | null
          confirmado_por: string | null
          criado_em: string
          espaco_id: string
          estornado_em: string | null
          estornado_por: string | null
          id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          motivo_estorno: string | null
          observacao: string | null
          pedido_id: string
          registrado_por: string | null
          status: Database["public"]["Enums"]["status_pagamento"]
          troco: number | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          conciliado?: boolean
          confirmado_em?: string | null
          confirmado_por?: string | null
          criado_em?: string
          espaco_id: string
          estornado_em?: string | null
          estornado_por?: string | null
          id?: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          motivo_estorno?: string | null
          observacao?: string | null
          pedido_id: string
          registrado_por?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          troco?: number | null
          valor: number
        }
        Update: {
          atualizado_em?: string
          conciliado?: boolean
          confirmado_em?: string | null
          confirmado_por?: string | null
          criado_em?: string
          espaco_id?: string
          estornado_em?: string | null
          estornado_por?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"]
          motivo_estorno?: string | null
          observacao?: string | null
          pedido_id?: string
          registrado_por?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          troco?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_espaco_id_fkey"
            columns: ["espaco_id"]
            isOneToOne: false
            referencedRelation: "espacos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          email: string
          espaco_id: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email: string
          espaco_id?: string | null
          id: string
          nome?: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string
          espaco_id?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_espaco_id_fkey"
            columns: ["espaco_id"]
            isOneToOne: false
            referencedRelation: "espacos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          criado_em: string
          espaco_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          criado_em?: string
          espaco_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          criado_em?: string
          espaco_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_espaco_id_fkey"
            columns: ["espaco_id"]
            isOneToOne: false
            referencedRelation: "espacos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_espaco_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      pertence_ao_espaco: {
        Args: { _espaco_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "caixa" | "entregador"
      metodo_pagamento: "pix" | "dinheiro" | "credito" | "debito"
      status_pagamento: "pendente" | "aprovado" | "estornado"
      tipo_chave_pix: "cpf" | "cnpj" | "telefone" | "email" | "aleatoria"
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
      app_role: ["superadmin", "admin", "caixa", "entregador"],
      metodo_pagamento: ["pix", "dinheiro", "credito", "debito"],
      status_pagamento: ["pendente", "aprovado", "estornado"],
      tipo_chave_pix: ["cpf", "cnpj", "telefone", "email", "aleatoria"],
    },
  },
} as const
