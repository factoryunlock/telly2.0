export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          username: string;
          nickname: string | null;
          health_score: number;
          proxy: string | null;
          phone_number: string | null;
          account_age: string;
          status: 'Warming Up' | 'Open' | 'Limited';
          api_id: string | null;
          api_hash: string | null;
          warmup_start_time: string | null;
          warmup_duration_hours: number;
          api_connected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          nickname?: string | null;
          health_score?: number;
          proxy?: string | null;
          phone_number?: string | null;
          account_age: string;
          status: 'Warming Up' | 'Open' | 'Limited';
          api_id?: string | null;
          api_hash?: string | null;
          warmup_start_time?: string | null;
          warmup_duration_hours?: number;
          api_connected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          nickname?: string | null;
          health_score?: number;
          proxy?: string | null;
          phone_number?: string | null;
          account_age?: string;
          status?: 'Warming Up' | 'Open' | 'Limited';
          api_id?: string | null;
          api_hash?: string | null;
          warmup_start_time?: string | null;
          warmup_duration_hours?: number;
          api_connected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_accounts: {
        Row: {
          user_id: string;
          account_id: string;
        };
        Insert: {
          user_id: string;
          account_id: string;
        };
        Update: {
          user_id?: string;
          account_id?: string;
        };
      };
    };
  };
}