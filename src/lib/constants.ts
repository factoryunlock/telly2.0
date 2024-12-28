export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: 'BarChart3' },
  { name: 'Accounts', href: '/accounts', icon: 'Users' },
  { name: 'Messages', href: '/messages', icon: 'MessageSquare' },
  { name: 'Warmup', href: '/warmup', icon: 'Zap' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
] as const;

export const ACCOUNT_STATUS = {
  WARMING_UP: 'Warming Up',
  OPEN: 'Open',
  LIMITED: 'Limited',
} as const;