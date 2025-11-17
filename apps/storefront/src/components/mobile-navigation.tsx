import type { Menu } from "@nimara/domain/objects/Menu";
import {
  Wrench,
  Cpu,
  Plug,
  Headphones,
  Monitor,
  Speaker,
  Projector,
  CircuitBoard,
  Fan,
  Server,
  Zap,
  Box,
  HardDrive,
  Database,
  Mic,
  Mouse,
  Keyboard,
  Webcam,
  Printer,
  Laptop,
  Tablet,
  Smartphone,
  Gamepad2,
  Cable,
  Usb,
  Wifi,
  Bluetooth,
  Battery,
  MemoryStick,
  Network,
  ScanLine,
  Camera,
  Lock,
  Package,
  ShieldCheck,
  Home,
  BadgePercent,
  Watch,
  Utensils,
  Sparkles,
  Tag,
  Hammer,
  Code,
  Clapperboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { LocalizedLink } from "@/i18n/routing";
import type { Maybe } from "@/lib/types";

// Mapping of menu item labels to icons
const MENU_ICON_MAP: Record<string, LucideIcon> = {
  // Main categories (Russian)
  "Сервисный центр": Wrench,
  "Комплектующие": Cpu,
  "Периферия": Plug,
  "Ноутбуки": Laptop,
  "Планшеты": Tablet,
  "Смартфоны": Smartphone,
  "Игровое": Gamepad2,
  "Сеть": Network,
  "Мобильность": Smartphone,
  "Дом": Home,
  "Сервис": ShieldCheck,
  "Уценка": BadgePercent,

  // Main categories (English)
  "Service centre": Wrench,
  "Components": Cpu,
  "Peripherals": Plug,
  "Laptops": Laptop,
  "Tablets": Tablet,
  "Smartphones": Smartphone,
  "Gaming": Gamepad2,
  "Network": Network,
  "Mobility": Smartphone,
  "Home": Home,
  "Service": ShieldCheck,
  "Sale": BadgePercent,

  // Subcategories - Components (Russian)
  "Материнские платы": CircuitBoard,
  "Охлаждение": Fan,
  "Графика": Monitor,
  "Серверное": Server,
  "Процессоры": Cpu,
  "Питание": Zap,
  "Корпуса": Box,
  "Память": MemoryStick,
  "Накопители": Database,
  "Видеокарты": Monitor,
  "Блоки питания": Battery,
  "SSD": HardDrive,
  "HDD": Database,

  // Subcategories - Peripherals (Russian)
  "Наушники": Headphones,
  "Мониторы": Monitor,
  "Проекторы": Projector,
  "Акустика": Speaker,
  "Микрофоны": Mic,
  "Мыши": Mouse,
  "Клавиатуры": Keyboard,
  "Веб-камеры": Webcam,
  "Принтеры": Printer,
  "Печать": Printer,
  "Сканеры": ScanLine,
  "Хранение": Database,
  "Кабели": Cable,
  "Разное": Package,
  "USB устройства": Usb,
  "Wi-Fi оборудование": Wifi,
  "Bluetooth": Bluetooth,

  // Network categories (Russian)
  "UPS": Battery,
  "Оборудование": Server,
  "Кабельная": Cable,
  "Видеонаблюдение": Camera,
  "Доступ": Lock,

  // Mobility subcategories (Russian)
  "Аксессуары": Watch,
  "Питание мобильных": Battery,
  "Устройства": Smartphone,

  // Home subcategories (Russian)
  "Ремонт": Wrench,
  "Развлечения": Clapperboard,
  "Кухня": Utensils,
  "Уход": Sparkles,

  // Service subcategories (Russian)
  "Маркировка": Tag,
  "Инструменты": Hammer,
  "Программное обеспечение": Code,
  "Расходники": Package,
  "Запчасти": Settings,

  // Sale subcategories (Russian)
  "Комплектующие (уценка)": Cpu,
  "Сеть (уценка)": Network,
  "Периферия (уценка)": Plug,
  "Ноутбуки (уценка)": Laptop,
  "Аксессуары (уценка)": Watch,
  "Прочее (уценка)": Package,

  // Subcategories (English)
  "Motherboards": CircuitBoard,
  "Cooling": Fan,
  "Graphics": Monitor,
  "Server": Server,
  "Processors": Cpu,
  "Power": Zap,
  "Cases": Box,
  "Memory": MemoryStick,
  "Storage": Database,
  "Video Cards": Monitor,
  "Power Supplies": Battery,
  "Headphones": Headphones,
  "Monitors": Monitor,
  "Projectors": Projector,
  "Audio": Speaker,
  "Speakers": Speaker,
  "Microphones": Mic,
  "Mice": Mouse,
  "Keyboards": Keyboard,
  "Webcams": Webcam,
  "Printers": Printer,
  "Print": Printer,
  "Scanners": ScanLine,
  "Misc": Package,
  "Miscellaneous": Package,
  "Various": Package,
  "Cables": Cable,
  "USB Devices": Usb,
  "Wi-Fi": Wifi,

  // Network categories (English)
  "Equipment": Server,
  "Cabling": Cable,
  "Video Surveillance": Camera,
  "CCTV": Camera,
  "Access": Lock,
  "Access Control": Lock,

  // Mobility subcategories (English)
  "Accessories": Watch,
  "Mobile Power": Battery,
  "Devices": Smartphone,

  // Home subcategories (English)
  "Repair": Wrench,
  "Entertainment": Clapperboard,
  "Kitchen": Utensils,
  "Care": Sparkles,

  // Service subcategories (English)
  "Labeling": Tag,
  "Marking": Tag,
  "Tools": Hammer,
  "Software": Code,
  "Consumables": Package,
  "Parts": Settings,
  "Spare Parts": Settings,

  // Sale subcategories (English)
  "Components (sale)": Cpu,
  "Network (sale)": Network,
  "Peripherals (sale)": Plug,
  "Laptops (sale)": Laptop,
  "Accessories (sale)": Watch,
  "Other (sale)": Package,
  "Misc (sale)": Package,
};

const getIconForLabel = (label: string): LucideIcon | null => {
  return MENU_ICON_MAP[label] || null;
};

export const MobileNavigation = ({
  menu,
  onMenuItemClick,
}: {
  menu: Maybe<Menu>;
  onMenuItemClick: (isMenuItemClicked: boolean) => void;
}) => {
  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <ul className="grid gap-1 py-4">
      {menu.items.map((item, index) => {
        const Icon = getIconForLabel(item.label);

        return (
          <li
            key={item.id}
            className="group animate-menu-item-enter"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <LocalizedLink
              href={item.url}
              onClick={() => onMenuItemClick(true)}
              className="flex items-center gap-3 rounded-lg p-3 font-medium text-stone-800 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              {Icon && (
                <Icon className="h-5 w-5 flex-shrink-0 text-stone-600 dark:text-stone-400" />
              )}
              <span className="text-[15px] leading-tight">{item.label}</span>
            </LocalizedLink>
            {!!item.children?.length && (
              <ul className="mt-1 space-y-0.5 pl-6">
                {item.children.map((child, childIndex) => {
                  const ChildIcon = getIconForLabel(child.label);
                  const childDelay = index * 50 + (childIndex + 1) * 30;

                  return (
                    <li
                      key={child.id}
                      className="animate-menu-item-enter"
                      style={{ animationDelay: `${childDelay}ms` }}
                    >
                      <LocalizedLink
                        href={child.url}
                        onClick={() => onMenuItemClick(true)}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-stone-50 dark:text-slate-300 dark:hover:bg-stone-800/50"
                      >
                        {ChildIcon && (
                          <ChildIcon className="h-4 w-4 flex-shrink-0 text-stone-500 dark:text-stone-500" />
                        )}
                        <span>{child.label}</span>
                      </LocalizedLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};
