import { LayoutDashboard, Dumbbell, Salad, UtensilsCrossed, MoonStar, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Today', short: 'Today', icon: LayoutDashboard },
  { href: '/training', label: 'Training', short: 'Train', icon: Dumbbell },
  { href: '/meal-plans', label: 'Meal plans', short: 'Meals', icon: UtensilsCrossed },
  { href: '/nutrition', label: 'Nutrition', short: 'Nutrition', icon: Salad },
  { href: '/recovery', label: 'Recovery', short: 'Recovery', icon: MoonStar },
];

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
