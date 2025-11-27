import {
  BadgePercent,
  Battery,
  Bell,
  Bluetooth,
  Box,
  Cable,
  Camera,
  ChevronDown,
  CircuitBoard,
  Clapperboard,
  Code,
  Cpu,
  Database,
  Fan,
  Gamepad2,
  Hammer,
  HardDrive,
  Headphones,
  Home,
  Keyboard,
  Laptop,
  Lock,
  type LucideIcon,
  MemoryStick,
  Mic,
  Monitor,
  Mouse,
  Network,
  Package,
  Plug,
  Printer,
  Projector,
  ScanLine,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Speaker,
  Tablet,
  Tag,
  Usb,
  Utensils,
  Watch,
  Webcam,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type { Menu } from "@nimara/domain/objects/Menu";

import { LocalizedLink } from "@/i18n/routing";
import type { Maybe } from "@/lib/types";

// Mapping of menu item labels to icons
const MENU_ICON_MAP: Record<string, LucideIcon> = {
  // Main categories (Russian)
  "Сервисный центр": Wrench,
  "Сервис борбору": Wrench,
  "Комплектующие": Cpu,
  "Периферия": Plug,
  "Переферия": Plug,
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
  "Outlet": BadgePercent,

  // Main categories (Kyrgyz)
  "Компоненттер": Cpu,
  "Мобилдүүлүк": Smartphone,
  "Үй": Home,
  // Уценка намеренно без иконки для уникальности и избегания дублей

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
  "WiFi": Wifi,

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
  "Alarm": Bell,

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
  "Security Labels": Tag,
  "Tools": Hammer,
  "Software": Code,
  "Consumables": Package,
  "Supplies": Package,
  "Parts": Settings,
  "Spare Parts": Settings,
  "Куралдар": Hammer,
  "Программа": Code,
  "Сарпталуучулар": Package,
  "Запастык бөлүктөр": Settings,

  // Sale subcategories (English)
  "Components (sale)": Cpu,
  "Network (sale)": Network,
  "Peripherals (sale)": Plug,
  "Laptops (sale)": Laptop,
  "Accessories (sale)": Watch,
  "Other (sale)": Package,
  "Misc (sale)": Package,
  "Outlet Components": Cpu,
  "Components Outlet": Cpu,
  "Networking Outlet": Network,
  "Outlet Networking": Network,
  "Outlet Peripherals": Plug,
  "Outlet Laptops": Laptop,
  "Outlet Accessories": Watch,
  "Outlet Misc": Package,

  // Subcategories (Kyrgyz transliterations/labels)
  "Кулакчындар": Headphones,
  "Мониторлор": Monitor,
  "Проекторлор": Projector,
  "Үнду": Speaker,
  "Үндү": Speaker,
  "Унду": Speaker,
  "Клавиатуралар": Keyboard,
  "Чычкандар": Mouse,
  "Оюн": Gamepad2,
  "Басма": Printer,
  "Сканерлер": ScanLine,
  "Портативдүү сактоо": Database,
  "Портативдуу сактоо": Database,
  "Кабелдер": Cable,
  "Ар кандай": Package,
  "Ар кандай (уценка)": Package,
  "Ар кошумча": Package,
  // Mobility (Kyrgyz)
  "Мобилдүүлүк": Smartphone,
  "Аксессуарлар": Watch,
  "Ноутбуктар": Laptop,
  "Мобилдик кубат": Battery,
  "Аппараттар": Smartphone,
  // Home (Kyrgyz)
  "Үй": Home,
  "Ремонт": Wrench,
  "Көңүл ачуу": Home,
  "Кам көрүү": Home,
  "Ашкана": Utensils,
  "Көңүл ачуу": Clapperboard,
  "Кам көрүү": Sparkles,
  // Components (Kyrgyz)
  "Материндик платалар": CircuitBoard,
  "Муздатуу": Fan,
  "Графика": Monitor,
  "Сервер жабдыктары": Server,
  "Процессорлор": Cpu,
  "Энергия": Battery,
  "Корпустар": Box,
  "Эс тутум": MemoryStick,
  "Сактагычтар": Database,
};

// Mapping by slug/path to avoid missing icons on translated labels
const MENU_ICON_SLUG_MAP: Record<string, LucideIcon> = {
  "services": Wrench,
  "service": ShieldCheck,
  "service-centre": Wrench,
  "service-center": Wrench,
  "repair-services": Wrench,
  "repair": Wrench,
  "components": Cpu,
  "component": Cpu,
  "peripherals": Plug,
  "peripheral": Plug,
  "network": Network,
  "networking": Network,
  "mobility": Smartphone,
  "mobile": Smartphone,
  "home": Home,
  "outlet": BadgePercent,
  "sale": BadgePercent,
  "outlet-components": Cpu,
  "components-outlet": Cpu,
  "components-sale": Cpu,
  "networking-outlet": Network,
  "outlet-networking": Network,
  "network-sale": Network,
  "peripherals-outlet": Plug,
  "outlet-peripherals": Plug,
  "peripherals-sale": Plug,
  "laptops-outlet": Laptop,
  "outlet-laptops": Laptop,
  "laptops-sale": Laptop,
  "accessories-outlet": Watch,
  "outlet-accessories": Watch,
  "accessories-sale": Watch,
  "misc-outlet": Package,
  "outlet-misc": Package,
  "misc-sale": Package,
  "security-labels": Tag,
  "labels": Tag,
  "consumables": Package,
  "supplies": Package,
  "spare-parts": Settings,
  "parts": Settings,
  // Peripherals & subcategories
  "headphones": Headphones,
  "headsets": Headphones,
  "monitors": Monitor,
  "monitor": Monitor,
  "projectors": Projector,
  "projector": Projector,
  "audio": Speaker,
  "speakers": Speaker,
  "microphones": Mic,
  "microphone": Mic,
  "mice": Mouse,
  "mouse": Mouse,
  "keyboards": Keyboard,
  "keyboard": Keyboard,
  "webcams": Webcam,
  "webcam": Webcam,
  "printers": Printer,
  "printer": Printer,
  "print": Printer,
  "scanners": ScanLine,
  "scanner": ScanLine,
  "storage": Database,
  "ssd": HardDrive,
  "hdd": Database,
  "cables": Cable,
  "cable": Cable,
  "usb-devices": Usb,
  "usb": Usb,
  "accessories": Watch,
  "mobile-power": Battery,
  "devices": Smartphone,
  // Home subcategories
  "entertainment": Clapperboard,
  "care": Sparkles,
  "kitchen": Utensils,
  // Components subcategories
  "motherboards": CircuitBoard,
  "cpu": Cpu,
  "processors": Cpu,
  "processor": Cpu,
  "power-supplies": Battery,
  "psu": Battery,
  "cases": Box,
  "case": Box,
  "memory": MemoryStick,
  "ram": MemoryStick,
  "graphics": Monitor,
  "gpu": Monitor,
  "cooling": Fan,
  "storage": Database,
  "ssd": HardDrive,
  "hdd": Database,
  "energy": Battery,
  // Components subcategories
  // Networking subcategories
  "ups": Battery,
  "equipment": Server,
  "cabling": Cable,
  "video-surveillance": Camera,
  "cctv": Camera,
  "access": Lock,
  "access-control": Lock,
  "notification": Bell,
  "notifications": Bell,
  "alert": Bell,
  "alerting": Bell,
  "alarm": Bell,
};

const DEFAULT_ICON: LucideIcon = Package;

const normalizeLabelForMatch = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/\b(outlet|sale|уценка|распродажа)\b/gi, "")
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const KEYWORD_ICON_RULES: Array<{
  icon: LucideIcon;
  patterns: RegExp[];
}> = [
  { icon: Wrench, patterns: [/сервис/, /service/, /ремонт/, /repair/] },
  { icon: Cpu, patterns: [/комплект/, /component/] },
  { icon: Plug, patterns: [/перифер/, /peripheral/] },
  { icon: Laptop, patterns: [/ноут/, /laptop/, /notebook/] },
  { icon: Tablet, patterns: [/планшет/, /tablet/] },
  { icon: Smartphone, patterns: [/смартф/, /phone/, /mobile/, /мобиль/] },
  { icon: Gamepad2, patterns: [/игр/, /\bgam/, /console/] },
  { icon: Network, patterns: [/сеть/, /network/] },
  { icon: Home, patterns: [/дом/, /\bhome\b/] },
  { icon: ShieldCheck, patterns: [/security/, /защита/, /shield/] },
  { icon: Tag, patterns: [/маркир/, /label/] },
  { icon: Hammer, patterns: [/tool/, /инструм/, /курал/] },
  { icon: Code, patterns: [/софт/, /software/, /программ/] },
  { icon: Package, patterns: [/consum/, /расход/, /сарптал/] },
  { icon: Settings, patterns: [/запас/, /spare/, /parts?/, /бөлүк/] },
  { icon: BadgePercent, patterns: [/outlet/, /sale/, /уцен/, /распрод/] },
];

const extractSlug = (url?: string | null): string | null => {
  if (!url) return null;

  try {
    const parsed = new URL(url, "http://example.com");
    const category = parsed.searchParams.get("category");
    if (category) {
      return category.toLowerCase();
    }

    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      return pathSegments[pathSegments.length - 1].toLowerCase();
    }
  } catch {
    // ignore malformed urls
  }

  return null;
};

const getIconForItem = (
  label: string,
  url?: string | null,
  parentIcon?: LucideIcon | null,
): LucideIcon | null => {
  const slugKey = extractSlug(url);
  if (slugKey && MENU_ICON_SLUG_MAP[slugKey]) {
    return MENU_ICON_SLUG_MAP[slugKey];
  }

  const normalizedLabel = label.trim();
  const normalizedLower = normalizedLabel.toLowerCase();

  const exactMatch = MENU_ICON_MAP[normalizedLabel] || MENU_ICON_MAP[label];
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedBase = normalizeLabelForMatch(normalizedLabel);

  const foundInsensitive = Object.entries(MENU_ICON_MAP).find(
    ([key]) => key.toLowerCase() === normalizedLower || key.toLowerCase() === normalizedBase,
  );

  if (foundInsensitive) {
    return foundInsensitive[1];
  }

  // Heuristic keyword matching for other locales/translations
  const keywordSource = [normalizedBase, slugKey].filter(Boolean).join(" ");
  if (keywordSource) {
    const rule = KEYWORD_ICON_RULES.find(({ patterns }) =>
      patterns.some((regex) => regex.test(keywordSource)),
    );
    if (rule) {
      return rule.icon;
    }
  }

  if (parentIcon) {
    return parentIcon;
  }

  return DEFAULT_ICON;
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
    if (!hasChildren) {return;}
    setOpenCategoryId(openCategoryId === categoryId ? null : categoryId);
  };

  return (
    <ul className="grid gap-1 py-4">
      {menu.items.map((item, index) => {
        const Icon = getIconForItem(item.label, item.url);
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
                      const ChildIcon = getIconForItem(child.label, child.url, Icon);

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
