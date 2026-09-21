import {
  AlertCircle, ArrowDownCircle, HandCoins, Lightbulb, PiggyBank, Repeat, Sparkles, TrendingUp, TriangleAlert, ArrowLeftRight, ArrowUpCircle, Banknote, CalendarDays, Camera, Check, CheckCircle2, ChevronRight, Copy, CreditCard,
  Download, ExternalLink, Eye, EyeOff, FileText, Globe, Hash, Home, ImagePlus, Info, Keyboard, LayoutGrid, Landmark, Lock, LockOpen, LogOut, Mail, MapPin,
  Phone, Plane, Plus, Printer, QrCode, Receipt, ScanBarcode, Send, Settings2, Share2, ShieldCheck, Smartphone, Trash2, User, UserPlus, Users, Wallet, Wifi, X, Zap,
  type LucideIcon,
} from "lucide-react";

const icons = {
  home: Home, swap: ArrowLeftRight, receipt: Receipt, users: Users, card: CreditCard, shield: ShieldCheck, eye: Eye, eyeOff: EyeOff, logout: LogOut,
  copy: Copy, download: Download, plus: Plus, trash: Trash2, phone: Smartphone, arrowUp: ArrowUpCircle, arrowDown: ArrowDownCircle, check: Check,
  checkCircle: CheckCircle2, grid: LayoutGrid, state: Landmark, qr: QrCode, zap: Zap, settings: Settings2, camera: Camera, lock: Lock, unlock: LockOpen,
  globe: Globe, wifi: Wifi, cash: Banknote, plane: Plane, file: FileText, share: Share2, send: Send, info: Info, call: Phone, mail: Mail, link: ExternalLink,
  pin: MapPin, chevron: ChevronRight, x: X, calendar: CalendarDays, barcode: ScanBarcode, keypad: Keyboard, hash: Hash, userPlus: UserPlus, printer: Printer,
  image: ImagePlus, alert: AlertCircle, wallet: Wallet, user: User,
  sparkles: Sparkles, piggy: PiggyBank, coins: HandCoins, trend: TrendingUp, bulb: Lightbulb, warn: TriangleAlert, repeat: Repeat,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

/** Decorative by default (aria-hidden); pair with a visible label or an aria-label on the control. */
export function Icon({ name, className = "size-5", strokeWidth = 1.8 }: { name: IconName; className?: string; strokeWidth?: number }) {
  const Cmp = icons[name];
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
