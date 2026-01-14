import type { SupportedLocale } from "@/regions/types";

type LocaleKey = "en" | "ru" | "ky";

const resolveLocale = (locale?: string): LocaleKey => {
  if (!locale) {
    return "en";
  }

  if (locale.startsWith("ru")) {
    return "ru";
  }

  if (locale.startsWith("ky")) {
    return "ky";
  }

  return "en";
};

type TranslationMap = Record<string, Partial<Record<LocaleKey, string>>>;

const categoryTranslations: TranslationMap = {
  "Диагностика компьютера": {
    en: "Computer diagnostics",
  },
  "Разборка и сборка ПК": {
    en: "PC disassembly and assembly",
  },
  "Компьютер не включается": {
    en: "Computer won't turn on",
  },
  "Работы с BIOS": {
    en: "BIOS services",
  },
  "Настройка и профилактика ПК": {
    en: "PC setup and maintenance",
  },
  "Проблемы с приводами и накопителями": {
    en: "Drives and storage issues",
  },
  "Проблемы с портами и периферией": {
    en: "Ports and peripherals issues",
  },
  "Графика и видеокарты": {
    en: "Graphics and GPUs",
  },
  "Блоки питания": {
    en: "Power supplies",
  },
  Мониторы: {
    en: "Monitors",
  },
  "Диагностика ноутбука": {
    en: "Laptop diagnostics",
  },
  "Разборка и сборка ноутбука": {
    en: "Laptop disassembly and assembly",
  },
  "Проблемы питания ноутбука": {
    en: "Laptop power issues",
  },
  "Перегрев ноутбука": {
    en: "Laptop overheating",
  },
  "Порты и периферия ноутбука": {
    en: "Laptop ports and peripherals",
  },
  "Программные работы ноутбука": {
    en: "Laptop software tasks",
  },
  "Ноутбук не загружается": {
    en: "Laptop won't boot",
  },
  "Упавшие и залитые ноутбуки": {
    en: "Liquid or drop damage laptops",
  },
  "Работы с BIOS ноутбука": {
    en: "Laptop BIOS services",
  },
  "Проблемы с дисплеем ноутбука": {
    en: "Laptop display issues",
  },
  "Приводы и накопители ноутбука": {
    en: "Laptop drives and storage",
  },
  "Ремонт видеокарт": {
    en: "GPU repair",
  },
  "Логическое восстановление данных": {
    en: "Logical data recovery",
  },
};

const serviceTranslations: TranslationMap = {
  Диагностика: {
    en: "Diagnostics",
  },
  "Срочная диагностика": {
    en: "Express diagnostics",
  },
  "Неполная разборка персонального компьютера": {
    en: "Partial desktop disassembly",
  },
  "Полная разборка персонального компьютера": {
    en: "Full desktop disassembly",
  },
  "Замена корпуса": {
    en: "Case replacement",
  },
  "Ремонт блока питания": {
    en: "Power supply repair",
  },
  "Ремонт монитора": {
    en: "Monitor repair",
  },
  "Ремонт или замена кнопки включения": {
    en: "Power button repair or replacement",
  },
  "Замена блока питания": {
    en: "Power supply replacement",
  },
  "Ремонт материнской платы": {
    en: "Motherboard repair",
  },
  "Замена материнской платы": {
    en: "Motherboard replacement",
  },
  "Замена оперативной памяти": {
    en: "RAM replacement",
  },
  "Замена центрального процессора": {
    en: "CPU replacement",
  },
  "Прошивка BIOS (без выпаивания микросхемы)": {
    en: "BIOS flashing (no chip desoldering)",
  },
  "Прошивка BIOS (с выпаиванием микросхемы)": {
    en: "BIOS flashing (with chip desoldering)",
  },
  "Снятие пароля BIOS": {
    en: "Remove BIOS password",
  },
  "Установка и настройка драйверов (весь набор)": {
    en: "Install and configure drivers",
  },
  "Чистка системы охлаждения/системного блока": {
    en: "Cooling system cleaning",
  },
  "Замена кулера": {
    en: "Fan replacement",
  },
  "Замена кулера (чистка, смазка, замена термопасты без учета стоимости кулера)":
    {
      en: "Fan replacement (cleaning, lubrication, thermal paste without fan cost)",
    },
  "Поиск и удаление вирусов": {
    en: "Virus removal",
  },
  "Настройка/восстановление системы Windows": {
    en: "Windows setup or recovery",
  },
  "Модернизация компьютера": {
    en: "Computer upgrade",
  },
  "Не читает CD/DVD диски. Замена привода": {
    en: "CD/DVD not reading – drive replacement",
  },
  "Неисправен жёсткий диск. Замена жёсткого диска": {
    en: "Faulty HDD – drive replacement",
  },
  "Восстановление информации": {
    en: "Data recovery",
  },
  "Ремонт/замена порта (LAN, USB, PS/2)": {
    en: "Port repair or replacement (LAN, USB, PS/2)",
  },
  "Замена порта (HDMI, VGA)": {
    en: "HDMI/VGA port replacement",
  },
  "Не работает клавиатура, USB порты, Audio, Internet": {
    en: "Keyboard, USB, audio or network not working",
  },
  "Замена видеокарты": {
    en: "GPU replacement",
  },
  "Ремонт БП мощностью 550-750W": {
    en: "PSU repair 550–750 W",
  },
  "Ремонт БП мощностью 750-1000W": {
    en: "PSU repair 750–1000 W",
  },
  "Ремонт БП мощностью свыше 1000W": {
    en: "PSU repair over 1000 W",
  },
  "Ремонт платы инвертора": {
    en: "Inverter board repair",
  },
  'Замена ламп подсветки от 17" до 21"': {
    en: 'Backlight lamp replacement 17"–21"',
  },
  'Замена ламп подсветки от 22" до 24"': {
    en: 'Backlight lamp replacement 22"–24"',
  },
  'Замена ламп подсветки от 27" и выше': {
    en: 'Backlight lamp replacement 27" and up',
  },
  "Прошивка монитора": {
    en: "Monitor firmware flashing",
  },
  "Ремонт БП внутреннего": {
    en: "Internal power supply repair",
  },
  "Ремонт центральной платы": {
    en: "Main board repair",
  },
  "Ремонт внешнего БП": {
    en: "External power supply repair",
  },
  "Разборка-сборка дисплея": {
    en: "Display disassembly/assembly",
  },
  "Разборка-сборка системной части": {
    en: "Base assembly disassembly/assembly",
  },
  "Разборка-сборка всего ноутбука": {
    en: "Full laptop disassembly/assembly",
  },
  "Разборка-сборка ноутбука": {
    en: "Laptop disassembly and assembly",
  },
  "Разборка-сборка неполная": {
    en: "Partial disassembly",
  },
  "Замена кронштейнов": {
    en: "Hinge replacement",
  },
  "Замена корпусных элементов": {
    en: "Housing parts replacement",
  },
  "Не держит заряд, замена аккумулятора": {
    en: "Battery not holding charge – replacement",
  },
  "Проблемы питания ноутбука": {
    en: "Laptop power issues",
  },
  "Ремонт/замена разъема питания": {
    en: "DC jack repair or replacement",
  },
  "Чистка системы охлаждения": {
    en: "Cooling system cleaning",
  },
  "Замена USB разъема": {
    en: "USB port replacement",
  },
  "Ремонт/замена TouchPad": {
    en: "Touchpad repair or replacement",
  },
  "Замена клавиатуры": {
    en: "Keyboard replacement",
  },
  "Удаление баннера с рабочего стола": {
    en: "Remove desktop lock banner",
  },
  "Ремонт после попадания жидкости, ноутбук включается": {
    en: "Liquid damage repair – laptop powers on",
  },
  "Ремонт после попадания жидкости, ноутбук не включается": {
    en: "Liquid damage repair – laptop won't power on",
  },
  "Прошивка BIOS с выпаиванием микросхемы": {
    en: "BIOS flashing with chip desoldering",
  },
  "Нет изображения, артефакты — замена видеочипа": {
    en: "No image/artifacts – GPU chip replacement",
  },
  "Нет подсветки матрицы, замена инвертора/лампы": {
    en: "No backlight – inverter/lamp replacement",
  },
  "Замена матрицы (уточняется у консультанта)": {
    en: "Display panel replacement (verify with consultant)",
  },
  "Прошивка BIOS видеокарты": {
    en: "GPU BIOS flashing",
  },
  "Проблемы с питанием": {
    en: "Power issues",
  },
  "Профилактика видеокарты": {
    en: "GPU maintenance",
  },
  "Реболлинг (замена чипа)": {
    en: "BGA reballing (chip replacement)",
  },
  "Жёсткий диск, SSD, до 249 ГБ": {
    en: "HDD/SSD up to 249 GB",
  },
  "Жёсткий диск, SSD, 250-499 ГБ": {
    en: "HDD/SSD 250–499 GB",
  },
  "Жёсткий диск, SSD, 500-999 ГБ": {
    en: "HDD/SSD 500–999 GB",
  },
  "Жёсткий диск, SSD, 1000-1999 ГБ": {
    en: "HDD/SSD 1000–1999 GB",
  },
  "Жёсткий диск, SSD, 2000-4000 ГБ": {
    en: "HDD/SSD 2000–4000 GB",
  },
};

const descriptionTranslations: TranslationMap = {
  "Базовая диагностика неисправностей ПК": {
    en: "Baseline diagnostics for computer issues",
  },
  "Приоритетная диагностика в течение рабочего дня": {
    en: "Priority diagnostics completed within one business day",
  },
  "Диагностика и ремонт интерфейсных портов и контроллеров": {
    en: "Diagnostics and repair of interface ports and controllers",
  },
};

const translateFromMap = (
  source: TranslationMap,
  value: string | undefined,
  locale: SupportedLocale,
) => {
  if (!value) {
    return undefined;
  }

  const lang = resolveLocale(locale);
  const entry = source[value];

  if (!entry) {
    return value;
  }

  if (entry[lang]) {
    return entry[lang];
  }

  if (lang === "en") {
    return entry.en ?? entry.ru ?? value;
  }

  if (lang === "ru") {
    return entry.ru ?? value;
  }

  if (lang === "ky") {
    return entry.ky ?? entry.ru ?? value;
  }

  return entry.en ?? entry.ru ?? value;
};

export const getRepairCategoryLabel = (
  value: string,
  locale: SupportedLocale,
) => translateFromMap(categoryTranslations, value, locale);

export const getRepairServiceLabel = (value: string, locale: SupportedLocale) =>
  translateFromMap(serviceTranslations, value, locale);

export const getRepairServiceDescription = (
  value: string | undefined,
  locale: SupportedLocale,
) => translateFromMap(descriptionTranslations, value, locale);
