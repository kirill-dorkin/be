import { useState } from "react";

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
  ChevronDown,
  Bell,
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
  "Оповещение": Bell,

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
  "Notification": Bell,
  "Notifications": Bell,
  "Alert": Bell,
  "Alerting": Bell,

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
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  const toggleCategory = (categoryId: string, hasChildren: boolean) => {
    if (!hasChildren) return;
    setOpenCategoryId(openCategoryId === categoryId ? null : categoryId);
  };

  return (
    <ul className="grid gap-1 py-4">
      {menu.items.map((item, index) => {
        const Icon = getIconForLabel(item.label);
        const hasChildren = !!item.children?.length;
        const isOpen = openCategoryId === item.id;

        return (
          <li
            key={item.id}
            className="group animate-menu-item-enter"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleCategory(item.id, hasChildren)}
                className="flex w-full items-center gap-3 rounded-lg p-3 font-medium text-stone-800 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                {Icon && (
                  <Icon className="h-5 w-5 flex-shrink-0 text-stone-600 dark:text-stone-400" />
                )}
                <span className="flex-1 text-left text-[15px] leading-tight">{item.label}</span>
                <ChevronDown
                  className="h-4 w-4 flex-shrink-0 text-stone-500 dark:text-stone-400"
                  style={{
                    transform: isOpen ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                    transition: 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </button>
            ) : (
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
            )}
            {hasChildren && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <ul
                  className="overflow-hidden"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
                    transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div className="mt-1 space-y-0.5 pl-6 pb-1">
                    {item.children?.map((child, childIndex) => {
                      const ChildIcon = getIconForLabel(child.label);

                      return (
                        <li
                          key={child.id}
                          style={{
                            opacity: isOpen ? 1 : 0,
                            transform: isOpen ? 'translateX(0)' : 'translateX(-12px)',
                            transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${childIndex * 40 + 100}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${childIndex * 40 + 100}ms`,
                          }}
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
                  </div>
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
