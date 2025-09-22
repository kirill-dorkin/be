// Оптимизированные иконки с использованием lucide-react вместо react-icons
// Это значительно уменьшает размер бандла

import {
  Wrench,
  Laptop,
  CheckCircle,
  DollarSign,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ListTodo,
  Users,
  Trash2,
  Eye,
  Star,
  ImagePlus,
  Edit,
  Instagram,
  Phone,
  TrendingUp,
  Clock,
  Award,
  ShoppingCart,
  AlertTriangle,
  Check,
} from 'lucide-react';

// Маппинг старых иконок на новые
export const Icons = {
  // Features
  tools: Wrench,
  laptop: Laptop,
  checkCircle: CheckCircle,
  money: DollarSign,
  
  // Navigation
  logout: LogOut,
  menu: Menu,
  close: X,
  dashboard: LayoutDashboard,
  tasks: ListTodo,
  users: Users,
  
  // Actions
  delete: Trash2,
  view: Eye,
  edit: Edit,
  imageAdd: ImagePlus,
  
  // Social
  star: Star,
  instagram: Instagram,
  phone: Phone,
  
  // Dashboard stats
  trending: TrendingUp,
  clock: Clock,
  award: Award,
  cart: ShoppingCart,
  warning: AlertTriangle,
  check: Check,
} as const;

export type IconName = keyof typeof Icons;

// Компонент для единообразного использования иконок
interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const IconComponent = Icons[name];
  return <IconComponent size={size} className={className} />;
};

export default Icons;