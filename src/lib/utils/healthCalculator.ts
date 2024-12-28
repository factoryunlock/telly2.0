import { differenceInDays } from 'date-fns';

// Account age tiers for daily message limits
const getBaseMessageLimit = (accountAge: Date): number => {
  const days = differenceInDays(new Date(), accountAge);
  
  if (days > 360) return 25;  // 1 year+
  if (days > 270) return 25;  // 9-12 months
  if (days > 180) return 20;  // 6-9 months
  if (days > 90) return 15;   // 3-6 months
  if (days > 60) return 10;   // 2-3 months
  if (days > 30) return 5;    // 1-2 months
  return 3;                   // 0-30 days
};

// Warmup bonus based on hours
const getWarmupBonus = (warmupDurationHours: number): number => {
  if (warmupDurationHours >= 720) return 12;  // 30 days
  if (warmupDurationHours >= 336) return 9;   // 14 days
  if (warmupDurationHours >= 168) return 6;   // 7 days
  if (warmupDurationHours >= 72) return 3;    // 3 days
  return 0;
};

// Calculate messages per day capacity
export const calculateMessagesPerDay = (account: {
  accountAge: Date;
  warmupDurationHours: number;
}): number => {
  const baseLimit = getBaseMessageLimit(account.accountAge);
  const warmupBonus = getWarmupBonus(account.warmupDurationHours);
  
  return baseLimit + warmupBonus;
};

// Calculate account health (0-100%)
export const calculateAccountHealth = (account: {
  accountAge: Date;
  warmupDurationHours: number;
}): number => {
  const messagesPerDay = calculateMessagesPerDay(account);
  const maxPossibleMessages = 37; // Max possible (25 base + 12 warmup)
  
  // Calculate health as percentage of maximum possible messages
  return Math.round((messagesPerDay / maxPossibleMessages) * 100);
};

// Determine if account should be limited
export const isAccountLimited = (account: {
  accountAge: Date;
  warmupDurationHours: number;
}): boolean => {
  const days = differenceInDays(new Date(), account.accountAge);
  return days < 7 && account.warmupDurationHours < 24;
};