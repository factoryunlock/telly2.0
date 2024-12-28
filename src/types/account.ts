export interface Account {
  id: string;
  username?: string;
  phoneNumber: string;
  nickname?: string;
  healthScore: number;
  proxy?: string;
  accountAge: Date;
  status: 'Warming Up' | 'Open' | 'Limited' | 'In Use';
  apiId?: string;
  apiHash?: string;
  warmupStartTime?: Date;
  warmupDurationHours: number;
  apiConnected: boolean;
}

export interface AccountFormData {
  phoneNumber: string;
  username?: string;
  accountAge: Date;
  proxy?: string;
  apiId?: string;
  apiHash?: string;
}