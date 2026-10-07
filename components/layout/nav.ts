import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  UtensilsCrossed,
  LineChart,
  MoonStar,
  HeartPulse,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar (others live under "More"). */
  primary?: boolean;
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', short: 'Today', icon: LayoutDashboard, primary: true },
  { href: '/training', label: 'Training', short: 'Train', icon: Dumbbell, primary: true },
  { href: '/meal-plans', label: 'Meal plans', short: 'Meals', icon: UtensilsCrossed, primary: true },
  { href: '/progress', label: 'Progress', short: 'Progress', icon: LineChart, primary: true },
  { href: '/nutrition', label: 'Nutrition', short: 'Nutrition', icon: Salad },
  { href: '/recovery', label: 'Recovery', short: 'Recovery', icon: MoonStar },
  { href: '/health', label: 'Health', short: 'Health', icon: HeartPulse },
  { href: '/settings', label: 'Settings', short: 'Settings', icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
