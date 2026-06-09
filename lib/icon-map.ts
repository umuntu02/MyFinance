import type { ElementType } from "react";
import {
  Briefcase, Code2, TrendingUp, TrendingDown, Gift, CircleDot,
  Home, Utensils, Car, Zap, Tv2, HeartPulse, ShoppingBag,
  ShieldCheck, Plane, Laptop, Target, DollarSign, BarChart3,
  Tag, Settings, LayoutDashboard, Wallet,
} from "lucide-react";

const ICON_MAP: Record<string, ElementType> = {
  "briefcase":     Briefcase,
  "code-2":        Code2,
  "trending-up":   TrendingUp,
  "trending-down": TrendingDown,
  "gift":          Gift,
  "circle-dot":    CircleDot,
  "home":          Home,
  "utensils":      Utensils,
  "car":           Car,
  "zap":           Zap,
  "tv-2":          Tv2,
  "heart-pulse":   HeartPulse,
  "shopping-bag":  ShoppingBag,
  "shield-check":  ShieldCheck,
  "plane":         Plane,
  "laptop":        Laptop,
  "target":        Target,
  "dollar-sign":   DollarSign,
  "bar-chart-3":   BarChart3,
  "tag":           Tag,
  "settings":      Settings,
  "layout-dashboard": LayoutDashboard,
  "wallet":        Wallet,
};

export function getIcon(name: string): ElementType {
  return ICON_MAP[name] ?? CircleDot;
}
