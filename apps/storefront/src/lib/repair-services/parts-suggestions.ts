const SERVICE_SUGGESTION_QUERIES: Record<string, string[]> = {
  // Desktop
  "zamena-kulera-pk": ["кулер пк", "case fan 120mm", "thermal paste"],
  "chistka-sistemy-ohlazhdeniya-pk": ["термопаста", "кулер пк", "сжатый воздух"],
  "zamena-bloka-pitaniya": ["блок питания ATX 500W", "psu 650w"],
  "remont-knopki-vklyucheniya": ["кнопка питания ПК", "power switch"],
  "zamena-operativnoy-pamyati": ["DDR4 8GB", "DDR5 16GB"],
  "zamena-cpu": ["процессор intel", "процессор amd"],
  "zamena-hdd-desktop": ["SSD 1TB", "HDD 2TB"],
  "zamena-privoda-desktop": ["DVD привод sata"],
  "zamena-korpusa": ["корпус ATX", "корпус microATX"],
  "modernizaciya-kompyutera": ["ssd", "ram", "gpu"],
  "poisk-udalenie-virusov": ["антивирус", "windows pro ключ"],
  "remont-porta-land-usb-ps2": ["usb разъем", "lan port"],
  "zamena-porta-hdmi-vga": ["порт hdmi", "порт vga"],
  "zamena-videokarty": ["видеокарта", "gpu"],
  "zamena-materinskoy-platy": ["материнская плата ATX", "материнская плата mATX"],

  // Laptop
  "zamena-kulera-noutbuk": ["кулер ноутбука", "thermal paste"],
  "chistka-ohlazhdeniya-noutbuk": ["термопаста", "сжатый воздух"],
  "zamena-privoda-noutbuk": ["slim dvd привод"],
  "zamena-hdd-noutbuk": ["SSD 512GB", "2.5 hdd"],
  "zamena-klaviatury": ["клавиатура ноутбук", "keyboard replacement"],
  "zamena-usb-noutbuk": ["usb разъем ноутбук"],
  "zamena-razema-pitaniya-noutbuk": ["dc jack ноутбук"],
  "zamena-materinskoy-platy-noutbuk": ["материнская плата ноутбук"],
  "zamena-matricy": ["матрица ноутбука", "lcd panel 15.6"],
  "remont-videochipa": ["видеочип", "gpu mobile"],
  "zamena-invertora-noutbuk": ["инвертор подсветки", "led backlight"],
  "remont-posle-zhidkosti-vklyuchaetsya": ["клавиатура", "touchpad"],
  "remont-posle-zhidkosti-ne-vklyuchaetsya": ["плата питания", "материнская плата ноутбук"],
  "problemy-pitaniya-noutbuka": ["зарядное устройство", "аккумулятор ноутбук"],

  // GPU
  "proshivka-bios-videokarty": ["видеокарта", "gpu bios"],
  "problemy-s-pitaniem-gpu": ["кабель pci-e", "блок питания 750w"],
  "profilaktika-videokarty": ["термопрокладки", "термопаста"],
  "reballing-gpu": ["видеочип", "термопрокладки"],

  // Data recovery
  "vosstanovlenie-dannyh-do-249": ["ssd 240", "hdd 500"],
  "vosstanovlenie-dannyh-250-499": ["ssd 500", "hdd 1tb"],
  "vosstanovlenie-dannyh-500-999": ["ssd 1tb"],
  "vosstanovlenie-dannyh-1000-1999": ["ssd 2tb", "hdd 2tb"],
  "vosstanovlenie-dannyh-2000-4000": ["ssd 4tb", "hdd 4tb"],
};

export const getSuggestionQueriesForService = (slug: string): string[] =>
  SERVICE_SUGGESTION_QUERIES[slug] ?? [];
