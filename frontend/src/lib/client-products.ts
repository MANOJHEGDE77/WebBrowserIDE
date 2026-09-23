import { Product } from '@/types/product';

export const STATIC_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'DC-ESP32-01',
    name: 'ESP32 DevKit V1',
    slug: 'esp32devkit',
    category: 'Microcontrollers',
    subcategory: 'Microcontrollers',
    description: 'WiFi + Bluetooth development board for IoT and robotics projects.',
    price: 450,
    stock: 24,
    stock_quantity: 24,
    in_stock: true,
    image: '/images/products/esp32.svg',
    image_url: '/images/products/esp32.svg',
    productUrl: '/products/1',
    product_url: '/products/1',
    specifications: { Voltage: '3.3V', Connectivity: 'WiFi + Bluetooth', Pins: '30 GPIO', USB: 'Micro-USB' },
    tags: ['esp32', 'wifi', 'bluetooth', 'iot', 'microcontroller'],
    keywords: 'esp32 wifi bluetooth iot microcontroller',
  },
  {
    id: 2,
    sku: 'DC-UNO-01',
    name: 'Arduino Uno R3',
    slug: 'arduinouno',
    category: 'Microcontrollers',
    subcategory: 'Microcontrollers',
    description: 'Beginner-friendly Arduino board for robotics and automation.',
    price: 550,
    stock: 18,
    stock_quantity: 18,
    in_stock: true,
    image: '/images/products/arduino-uno.svg',
    image_url: '/images/products/arduino-uno.svg',
    productUrl: '/products/2',
    product_url: '/products/2',
    specifications: { Voltage: '5V', MCU: 'ATmega328P', 'Digital IO': '14', 'Analog In': '6' },
    tags: ['arduino', 'uno', 'microcontroller', 'robotics'],
    keywords: 'arduino uno microcontroller robotics',
  },
  {
    id: 3,
    sku: 'DC-NANO-01',
    name: 'Arduino Nano',
    slug: 'arduinonano',
    category: 'Microcontrollers',
    subcategory: 'Microcontrollers',
    description: 'Compact Arduino board for small embedded projects.',
    price: 400,
    stock: 16,
    stock_quantity: 16,
    in_stock: true,
    image: '/images/products/arduino-nano.svg',
    image_url: '/images/products/arduino-nano.svg',
    productUrl: '/products/3',
    product_url: '/products/3',
    specifications: { Voltage: '5V', MCU: 'ATmega328P', Compact: 'Yes' },
    tags: ['arduino', 'nano', 'microcontroller', 'compact'],
    keywords: 'arduino nano microcontroller compact',
  },
  {
    id: 4,
    sku: 'DC-HCSR04-01',
    name: 'HC-SR04 Ultrasonic Sensor',
    slug: 'hcsr04',
    category: 'Sensors',
    subcategory: 'Sensors',
    description: 'Distance sensor commonly used in obstacle avoidance and level measurement.',
    price: 120,
    stock: 40,
    stock_quantity: 40,
    in_stock: true,
    image: '/images/products/hc-sr04.svg',
    image_url: '/images/products/hc-sr04.svg',
    productUrl: '/products/4',
    product_url: '/products/4',
    specifications: { Range: '2cm - 400cm', Voltage: '5V', Angle: '15 degrees' },
    tags: ['ultrasonic', 'distance', 'sensor', 'obstacle'],
    keywords: 'ultrasonic distance sensor obstacle hc-sr04',
  },
  {
    id: 5,
    sku: 'DC-LDR-01',
    name: 'LDR Light Sensor Module',
    slug: 'ldrsensor',
    category: 'Sensors',
    subcategory: 'Sensors',
    description: 'Simple light intensity sensor module for automation projects.',
    price: 80,
    stock: 35,
    stock_quantity: 35,
    in_stock: true,
    image: '/images/products/ldr.svg',
    image_url: '/images/products/ldr.svg',
    productUrl: '/products/5',
    product_url: '/products/5',
    specifications: { Output: 'Analog + Digital', Voltage: '3.3V - 5V' },
    tags: ['ldr', 'light', 'sensor', 'automation'],
    keywords: 'ldr light sensor automation',
  },
  {
    id: 6,
    sku: 'DC-DHT22-01',
    name: 'DHT22 Temperature Humidity Sensor',
    slug: 'dht22',
    category: 'Sensors',
    subcategory: 'Sensors',
    description: 'Digital temperature and humidity sensor for weather stations and IoT.',
    price: 220,
    stock: 22,
    stock_quantity: 22,
    in_stock: true,
    image: '/images/products/dht22.svg',
    image_url: '/images/products/dht22.svg',
    productUrl: '/products/6',
    product_url: '/products/6',
    specifications: { TempRange: '-40 to 80C', HumidityRange: '0-100% RH', Accuracy: '+-0.5C' },
    tags: ['dht22', 'temperature', 'humidity', 'weather', 'sensor'],
    keywords: 'dht22 temperature humidity weather sensor',
  },
  {
    id: 7,
    sku: 'DC-SM01-01',
    name: 'Capacitive Soil Moisture Sensor',
    slug: 'soilmoisture',
    category: 'Sensors',
    subcategory: 'Sensors',
    description: 'Corrosion-resistant soil moisture sensor for smart irrigation projects.',
    price: 160,
    stock: 27,
    stock_quantity: 27,
    in_stock: true,
    image: '/images/products/soil-moisture.svg',
    image_url: '/images/products/soil-moisture.svg',
    productUrl: '/products/7',
    product_url: '/products/7',
    specifications: { Voltage: '3.3V - 5.5V', Type: 'Capacitive Analog' },
    tags: ['soil', 'moisture', 'irrigation', 'sensor', 'garden'],
    keywords: 'soil moisture irrigation sensor garden',
  },
  {
    id: 8,
    sku: 'DC-L298N-01',
    name: 'L298N Motor Driver',
    slug: 'l298n',
    category: 'Motor Drivers',
    subcategory: 'Motor Drivers',
    description: 'Dual H-bridge motor driver for small DC motor robotics projects.',
    price: 150,
    stock: 30,
    stock_quantity: 30,
    in_stock: true,
    image: '/images/products/l298n.svg',
    image_url: '/images/products/l298n.svg',
    productUrl: '/products/8',
    product_url: '/products/8',
    specifications: { Supply: 'Up to 35V', Channels: 'Dual H-bridge', PeakCurrent: '2A per channel' },
    tags: ['l298n', 'motor', 'driver', 'dc', 'motor-driver'],
    keywords: 'l298n motor driver dc motor-driver',
  },
  {
    id: 9,
    sku: 'DC-A4988-01',
    name: 'A4988 Stepper Motor Driver',
    slug: 'a4988',
    category: 'Motor Drivers',
    subcategory: 'Motor Drivers',
    description: 'Stepper driver for CNC, linear motion and precision robotics projects.',
    price: 180,
    stock: 20,
    stock_quantity: 20,
    in_stock: true,
    image: '/images/products/a4988.svg',
    image_url: '/images/products/a4988.svg',
    productUrl: '/products/9',
    product_url: '/products/9',
    specifications: { Voltage: '8V - 35V', Microsteps: '1/16 step', Current: '2A with heatsink' },
    tags: ['a4988', 'stepper', 'driver', 'cnc', 'motor'],
    keywords: 'a4988 stepper driver cnc motor',
  },
  {
    id: 10,
    sku: 'DC-MOTOR-01',
    name: 'DC Geared Motor 12V',
    slug: 'dcgearedmotor',
    category: 'Motors',
    subcategory: 'Motors',
    description: '12V geared DC motor for robot wheels, automation and small machines.',
    price: 180,
    stock: 45,
    stock_quantity: 45,
    in_stock: true,
    image: '/images/products/dc-motor.svg',
    image_url: '/images/products/dc-motor.svg',
    productUrl: '/products/10',
    product_url: '/products/10',
    specifications: { Voltage: '12V DC', Speed: '200 RPM', Torque: 'High torque geared' },
    tags: ['dc', 'motor', '12v', 'robot', 'gear'],
    keywords: 'dc motor 12v robot gear',
  },
  {
    id: 11,
    sku: 'DC-NEMA17-01',
    name: 'NEMA17 Stepper Motor',
    slug: 'nema17',
    category: 'Motors',
    subcategory: 'Motors',
    description: 'Standard NEMA17 stepper motor for CNC, 3D printers and motion control.',
    price: 320,
    stock: 15,
    stock_quantity: 15,
    in_stock: true,
    image: '/images/products/nema17.svg',
    image_url: '/images/products/nema17.svg',
    productUrl: '/products/11',
    product_url: '/products/11',
    specifications: { StepAngle: '1.8 degrees', HoldingTorque: '40Ncm', Phase: '2 Phase' },
    tags: ['nema17', 'stepper', 'cnc', '3d-printer', 'motor'],
    keywords: 'nema17 stepper cnc 3d-printer motor',
  },
  {
    id: 12,
    sku: 'DC-CHASSIS-01',
    name: '2WD Robot Chassis',
    slug: '2wdchassis',
    category: 'Robotics',
    subcategory: 'Robotics',
    description: 'Acrylic two-wheel robot chassis kit for beginner robotics builds.',
    price: 250,
    stock: 12,
    stock_quantity: 12,
    in_stock: true,
    image: '/images/products/chassis-2wd.svg',
    image_url: '/images/products/chassis-2wd.svg',
    productUrl: '/products/12',
    product_url: '/products/12',
    specifications: { Material: 'Laser-cut Acrylic', Drive: '2WD with castor wheel', Motors: 'Includes 2 BO motors' },
    tags: ['chassis', 'robot', '2wd', 'robotics'],
    keywords: 'chassis robot 2wd robotics',
  },
  {
    id: 13,
    sku: 'DC-CHASSIS4-01',
    name: '4WD Robot Chassis',
    slug: '4wdchassis',
    category: 'Robotics',
    subcategory: 'Robotics',
    description: 'Four-wheel robot chassis for larger obstacle avoidance and line follower builds.',
    price: 420,
    stock: 8,
    stock_quantity: 8,
    in_stock: true,
    image: '/images/products/chassis-4wd.svg',
    image_url: '/images/products/chassis-4wd.svg',
    productUrl: '/products/13',
    product_url: '/products/13',
    specifications: { Material: 'Acrylic Dual Layer', Drive: '4WD 4 Motors', Motors: '4 TT Geared Motors' },
    tags: ['chassis', 'robot', '4wd', 'robotics'],
    keywords: 'chassis robot 4wd robotics',
  },
  {
    id: 14,
    sku: 'DC-RELAY-01',
    name: '5V 1-Channel Relay Module',
    slug: 'relay1ch',
    category: 'Automation',
    subcategory: 'Automation',
    description: 'Relay module for switching pumps, lamps, fans and other loads.',
    price: 90,
    stock: 25,
    stock_quantity: 25,
    in_stock: true,
    image: '/images/products/relay.svg',
    image_url: '/images/products/relay.svg',
    productUrl: '/products/14',
    product_url: '/products/14',
    specifications: { TriggerVoltage: '5V DC', MaxLoad: '250V AC / 10A, 30V DC / 10A' },
    tags: ['relay', 'automation', 'pump', '5v'],
    keywords: 'relay automation pump 5v',
  },
  {
    id: 15,
    sku: 'DC-PUMP-01',
    name: '12V Mini Water Pump',
    slug: 'waterpump',
    category: 'Automation',
    subcategory: 'Automation',
    description: 'Compact water pump for smart irrigation and liquid transfer demos.',
    price: 350,
    stock: 10,
    stock_quantity: 10,
    in_stock: true,
    image: '/images/products/water-pump.svg',
    image_url: '/images/products/water-pump.svg',
    productUrl: '/products/15',
    product_url: '/products/15',
    specifications: { Voltage: '12V DC', FlowRate: '1.5-2 L/min', Submersible: 'Yes' },
    tags: ['pump', 'water', 'irrigation', '12v'],
    keywords: 'pump water irrigation 12v',
  },
  {
    id: 16,
    sku: 'DC-BATT-01',
    name: '12V Rechargeable Battery Pack',
    slug: 'batterypack',
    category: 'Power',
    subcategory: 'Power',
    description: 'Rechargeable battery pack for robot and automation projects.',
    price: 300,
    stock: 20,
    stock_quantity: 20,
    in_stock: true,
    image: '/images/products/battery.svg',
    image_url: '/images/products/battery.svg',
    productUrl: '/products/16',
    product_url: '/products/16',
    specifications: { Voltage: '12V', Capacity: '2200mAh Li-ion', Protection: 'BMS integrated' },
    tags: ['battery', '12v', 'power', 'robot'],
    keywords: 'battery 12v power robot',
  },
  {
    id: 17,
    sku: 'DC-BUCK-01',
    name: 'LM2596 Buck Converter',
    slug: 'lm2596',
    category: 'Power',
    subcategory: 'Power',
    description: 'Adjustable DC-DC buck converter for powering electronics from higher-voltage sources.',
    price: 100,
    stock: 32,
    stock_quantity: 32,
    in_stock: true,
    image: '/images/products/buck-converter.svg',
    image_url: '/images/products/buck-converter.svg',
    productUrl: '/products/17',
    product_url: '/products/17',
    specifications: { Input: '4V - 35V', Output: '1.23V - 30V adjustable', MaxCurrent: '3A' },
    tags: ['lm2596', 'buck', 'converter', 'power', 'voltage'],
    keywords: 'lm2596 buck converter power voltage',
  },
  {
    id: 18,
    sku: 'DC-SERVO-01',
    name: 'SG90 Micro Servo',
    slug: 'sg90',
    category: 'Motors',
    subcategory: 'Motors',
    description: 'Small 180-degree servo for robot arms, mechanisms and sensor positioning.',
    price: 110,
    stock: 28,
    stock_quantity: 28,
    in_stock: true,
    image: '/images/products/sg90-servo.svg',
    image_url: '/images/products/sg90-servo.svg',
    productUrl: '/products/18',
    product_url: '/products/18',
    specifications: { OperatingVoltage: '4.8V - 6V', Rotation: '180 degrees', Weight: '9g' },
    tags: ['servo', 'sg90', 'robot', 'servo-motor'],
    keywords: 'servo sg90 robot servo-motor',
  },
  {
    id: 19,
    sku: 'DC-OLED-01',
    name: '0.96 inch OLED Display',
    slug: 'oled',
    category: 'Displays',
    subcategory: 'Displays',
    description: 'I2C OLED screen for showing sensor values and project status.',
    price: 160,
    stock: 14,
    stock_quantity: 14,
    in_stock: true,
    image: '/images/products/oled.svg',
    image_url: '/images/products/oled.svg',
    productUrl: '/products/19',
    product_url: '/products/19',
    specifications: { Resolution: '128x64 pixels', Interface: 'I2C (0x3C)', Driver: 'SSD1306' },
    tags: ['oled', 'display', 'i2c', 'screen', 'arduino'],
    keywords: 'oled display i2c screen arduino',
  },
  {
    id: 20,
    sku: 'DC-WIRE-01',
    name: 'Jumper Wire Kit',
    slug: 'jumperwires',
    category: 'Accessories',
    subcategory: 'Accessories',
    description: 'Male-male, male-female and female-female jumper wires for prototyping.',
    price: 90,
    stock: 50,
    stock_quantity: 50,
    in_stock: true,
    image: '/images/products/jumper-wires.svg',
    image_url: '/images/products/jumper-wires.svg',
    productUrl: '/products/20',
    product_url: '/products/20',
    specifications: { Quantity: '120 pcs total (40 M-M, 40 M-F, 40 F-F)', Length: '20cm' },
    tags: ['jumper', 'wires', 'prototype', 'arduino', 'esp32'],
    keywords: 'jumper wires prototype arduino esp32',
  },
];

export function get_all_products_sync(): Product[] {
  return STATIC_PRODUCTS;
}

export function get_product_by_id_sync(id: number | string): Product | null {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const p = STATIC_PRODUCTS.find((item) => item.id === numId || item.sku.toLowerCase() === String(id).toLowerCase());
  return p || null;
}

export function search_products_sync(query: string, limit: number = 20): Product[] {
  const genericTerms = new Set(['product', 'products', 'item', 'items', 'component', 'components', 'all', 'everything', 'anything']);
  const cleanQ = (query || '').toLowerCase().trim();

  if (!cleanQ || genericTerms.has(cleanQ)) {
    return STATIC_PRODUCTS.slice(0, limit);
  }

  const matches = STATIC_PRODUCTS.filter((p) => {
    return (
      p.name.toLowerCase().includes(cleanQ) ||
      p.sku.toLowerCase().includes(cleanQ) ||
      p.category.toLowerCase().includes(cleanQ) ||
      p.description.toLowerCase().includes(cleanQ) ||
      p.tags.some((t) => t.toLowerCase().includes(cleanQ)) ||
      (p.keywords && p.keywords.toLowerCase().includes(cleanQ))
    );
  });

  return matches.slice(0, limit);
}

export function search_products_by_category_sync(category: string): Product[] {
  if (!category || category.toLowerCase() === 'all') {
    return STATIC_PRODUCTS;
  }
  return STATIC_PRODUCTS.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export function search_products_by_price_sync(minPrice?: number, maxPrice?: number): Product[] {
  return STATIC_PRODUCTS.filter((p) => {
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    return true;
  });
}

export function search_products_in_stock_sync(): Product[] {
  return STATIC_PRODUCTS.filter((p) => p.in_stock && p.stock > 0);
}

export function search_products_with_filters_sync(options: {
  category?: string;
  subcategory?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'id' | 'price-asc' | 'price-desc' | 'name' | 'stock' | string;
  limit?: number;
}): Product[] {
  let list = [...STATIC_PRODUCTS];

  if (options.category && options.category.toLowerCase() !== 'all') {
    list = list.filter((p) => p.category.toLowerCase() === options.category!.toLowerCase());
  }

  if (options.minPrice !== undefined) {
    list = list.filter((p) => p.price >= options.minPrice!);
  }

  if (options.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= options.maxPrice!);
  }

  if (options.inStockOnly) {
    list = list.filter((p) => p.in_stock && p.stock > 0);
  }

  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase().trim();
    const genericTerms = new Set(['product', 'products', 'item', 'items', 'component', 'components', 'all', 'everything', 'anything']);
    if (!genericTerms.has(q)) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
  }

  if (options.sortBy === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (options.sortBy === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (options.sortBy === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (options.sortBy === 'stock') {
    list.sort((a, b) => b.stock - a.stock);
  } else {
    list.sort((a, b) => a.id - b.id);
  }

  if (options.limit && options.limit > 0) {
    list = list.slice(0, options.limit);
  }

  return list;
}
