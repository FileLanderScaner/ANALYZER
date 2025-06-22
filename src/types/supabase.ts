// Tipo mínimo para que compile. Completa según tu esquema real de Supabase si lo necesitas.
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          subscription_status?: string;
          current_period_end?: string;
          paypal_order_id?: string;
          updated_at?: string;
        };
        Insert: Partial<{
          id: string;
          subscription_status: string;
          current_period_end: string;
          paypal_order_id: string;
          updated_at: string;
        }>;
        Update: Partial<{
          id: string;
          subscription_status: string;
          current_period_end: string;
          paypal_order_id: string;
          updated_at: string;
        }>;
      };
    };
  };
};
