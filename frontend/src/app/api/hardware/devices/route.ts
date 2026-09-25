import { NextResponse } from 'next/server';
import { HardwareDevice } from '@/types/hardware';

export const HARDWARE_DEVICES: HardwareDevice[] = [
  {
    id: 'esp32-s3',
    name: 'Digicomp ESP32-S3 Dev Board',
    sku: 'DC-ESP32S3-01',
    description: 'Flagship Digicomp board with dual-core Xtensa LX7 @ 240MHz, 8MB PSRAM, 16MB Flash, Wi-Fi 4, BLE 5.0, and dual Type-C.',
    mcu: 'Xtensa LX7 Dual-Core',
    clockSpeed: '240 MHz',
    flashMemory: 16777216, // 16 MB Flash
    sram: 8388608,         // 8 MB PSRAM + 512 KB SRAM
    operatingVoltage: '3.3V',
    defaultBaud: 115200,
    supportedBauds: [9600, 57600, 115200, 230400, 460800, 921600],
    icon: '⚡',
    pinout: [
      { pin: 'GPIO48', type: 'digital', description: 'Onboard WS2812 Neopixel RGB LED' },
      { pin: 'GPIO21', type: 'comm',    description: 'I2C SDA (Wire Data)' },
      { pin: 'GPIO22', type: 'comm',    description: 'I2C SCL (Wire Clock)' },
      { pin: 'GPIO4',  type: 'analog',  description: 'ADC1_CH3 / LDR Analog Input' },
      { pin: 'GPIO5',  type: 'digital', description: 'PWM Timer / Servo Control' },
      { pin: 'GPIO43', type: 'comm',    description: 'U0TXD (Hardware UART0 TX)' },
      { pin: 'GPIO44', type: 'comm',    description: 'U0RXD (Hardware UART0 RX)' },
      { pin: 'GPIO19', type: 'comm',    description: 'USB D- (Native USB-C OTG)' },
      { pin: 'GPIO20', type: 'comm',    description: 'USB D+ (Native USB-C OTG)' },
      { pin: '3V3',    type: 'power',   description: 'Regulated 3.3V System Rail' },
      { pin: '5V',     type: 'power',   description: 'USB VBUS (5.0V Input/Output)' },
      { pin: 'GND',    type: 'power',   description: 'Common Ground Plane' },
    ],
    defaultFiles: {
      'main.cpp': `// Digicomp Technologies - ESP32-S3 Radiant Light Glow System
// Target: Digicomp ESP32-S3 Flagship Dev Board (SKU: DC-ESP32S3-01)
// 1. Smooth Sinusoidal Breathing Light Glow (PWM Analog Fading)
// 2. High-Radiance Solid Glow Mode
// 3. Serial Monitor Interactive Brightness & Mode Control
#include <Arduino.h>
#include "config.h"

// Breathing animation state variables
float glowAngle = 0.0;
unsigned long lastGlowUpdate = 0;
int currentBrightness = 0;
String currentMode = "BREATHE"; // "BREATHE", "SOLID_ON", "OFF"

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(LED_GLOW_PIN, OUTPUT);
  pinMode(ONBOARD_STATUS_PIN, OUTPUT);

  // Turn ON light glow immediately on boot
  digitalWrite(LED_GLOW_PIN, HIGH);
  digitalWrite(ONBOARD_STATUS_PIN, HIGH);
  delay(300);

  Serial.println("==================================================");
  Serial.println("  ✨ DIGICOMP ESP32-S3 RADIANT LIGHT GLOW SYSTEM  ");
  Serial.println("==================================================");
  Serial.println("Target: ESP32-S3 Dual-Core Xtensa LX7 @ 240MHz");
  Serial.println("Glow Pin: GPIO 48 (WS2812/Status) + GPIO 2 (PWM Light)");
  Serial.println("Mode: Smooth Breathing Light Glow Active (50 FPS)");
  Serial.println("Serial Commands: 'ON', 'OFF', 'BREATHE', 'BRIGHT 200'");
  Serial.println("==================================================");
}

void loop() {
  unsigned long now = millis();

  // 1. Process UART Serial commands from Web IDE
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    cmd.toUpperCase();

    if (cmd == "ON" || cmd == "GLOW") {
      currentMode = "SOLID_ON";
      analogWrite(LED_GLOW_PIN, 255);
      digitalWrite(ONBOARD_STATUS_PIN, HIGH);
      Serial.println("[GLOW ENGINE] Light set to: CONSTANT HIGH GLOW (100% Brightness)");
    } else if (cmd == "OFF") {
      currentMode = "OFF";
      analogWrite(LED_GLOW_PIN, 0);
      digitalWrite(ONBOARD_STATUS_PIN, LOW);
      Serial.println("[GLOW ENGINE] Light set to: OFF");
    } else if (cmd == "BREATHE") {
      currentMode = "BREATHE";
      Serial.println("[GLOW ENGINE] Light set to: SMOOTH BREATHING GLOW");
    } else if (cmd.startsWith("BRIGHT ")) {
      int val = cmd.substring(7).toInt();
      val = constrain(val, 0, 255);
      currentMode = "SOLID_CUSTOM";
      analogWrite(LED_GLOW_PIN, val);
      Serial.print("[GLOW ENGINE] Custom Brightness Level set to: ");
      Serial.println(val);
    }
  }

  // 2. Smooth Breathing Light Glow Animation
  if (currentMode == "BREATHE") {
    if (now - lastGlowUpdate >= GLOW_INTERVAL_MS) {
      lastGlowUpdate = now;

      // Smooth sinusoidal breathing curve mapped with gamma correction
      float factor = (sin(glowAngle) + 1.0) / 2.0; // 0.0 to 1.0
      currentBrightness = (int)(pow(factor, 2.0) * 255.0);
      if (currentBrightness < 5) currentBrightness = 5; // Keep warm ember glow

      analogWrite(LED_GLOW_PIN, currentBrightness);
      digitalWrite(ONBOARD_STATUS_PIN, factor > 0.4 ? HIGH : LOW);

      glowAngle += GLOW_SPEED_STEP;
      if (glowAngle >= 2.0 * PI) {
        glowAngle -= 2.0 * PI;
        Serial.print("[GLOW TELEMETRY] Breathing Pulse Cycle Complete | Peak Brightness: ");
        Serial.print(currentBrightness);
        Serial.println(" / 255");
      }
    }
  } else if (currentMode == "SOLID_ON") {
    analogWrite(LED_GLOW_PIN, 255);
    digitalWrite(ONBOARD_STATUS_PIN, HIGH);
  }

  delay(5);
}
`,
      'config.h': `// Digicomp ESP32-S3 Hardware Light Glow Configuration
#ifndef CONFIG_H
#define CONFIG_H

#define BAUD_RATE 115200

// Target Light Glow Pins:
// GPIO 48: ESP32-S3 Onboard High-Radiance RGB/Status LED
// GPIO 2:  Standard Status LED / PWM Channel
#define LED_GLOW_PIN 48
#define ONBOARD_STATUS_PIN 2

// Animation refresh timing
#define GLOW_INTERVAL_MS 20     // 50 FPS smooth refresh
#define GLOW_SPEED_STEP 0.045   // Speed of breathing pulse

#endif // CONFIG_H
`,
      'README.md': `# Digicomp ESP32-S3 Radiant Light Glow System

This sketch makes the onboard and external LEDs on your **Digicomp ESP32-S3 Dev Board** glow with a smooth breathing radiance or a bright solid illumination.

### Glow Modes:
1. **Smooth Breathing Glow (Default)**: Uses 50 FPS sinusoidal PWM modulation with human-eye gamma correction ($x^{2.0}$) to create a natural, pulsating warm light glow.
2. **Solid High-Radiance Glow**: Full 100% duty cycle illumination on **GPIO 48** and **GPIO 2**.

### Interactive Serial Commands:
- Type **\`ON\`** in the Serial Monitor to make light glow continuously at 100%.
- Type **\`BREATHE\`** to switch back to smooth pulsing breathing glow.
- Type **\`BRIGHT 180\`** to set a custom brightness from 0 to 255.
- Type **\`OFF\`** to turn the light off.

### External LED Wiring (Optional):
- **Anode (+ long leg)** -> **GPIO 48** or **GPIO 2** via 220Ω resistor.
- **Cathode (- short leg)** -> **GND**.
`,
    },
  },
  {
    id: 'rp2350',
    name: 'Digicomp RP2350 Dual-Core Board',
    sku: 'DC-RP2350-01',
    description: 'Next-gen board featuring Dual ARM Cortex-M33 + Dual Hazard3 RISC-V cores at 150MHz with 520KB SRAM.',
    mcu: 'Dual Cortex-M33 / RISC-V',
    clockSpeed: '150 MHz',
    flashMemory: 8388608,
    sram: 532480,
    operatingVoltage: '3.3V',
    defaultBaud: 115200,
    supportedBauds: [9600, 57600, 115200, 230400, 921600],
    icon: '🚀',
    pinout: [
      { pin: 'GPIO25', type: 'digital', description: 'Onboard User LED' },
      { pin: 'GPIO0',  type: 'comm',    description: 'UART0 TX / I2C0 SDA' },
      { pin: 'GPIO1',  type: 'comm',    description: 'UART0 RX / I2C0 SCL' },
      { pin: 'GPIO26', type: 'analog',  description: 'ADC0 (0-3.3V Analog Input)' },
      { pin: 'GPIO27', type: 'analog',  description: 'ADC1 (0-3.3V Analog Input)' },
      { pin: '3V3',    type: 'power',   description: '3.3V Regulated Output' },
      { pin: 'GND',    type: 'power',   description: 'Ground Rail' },
    ],
    defaultFiles: {
      'main.cpp': `// Digicomp RP2350 Dual-Core Prototyping Firmware
// Architecture: Dual ARM Cortex-M33 + Dual RISC-V @ 150MHz
#include <Arduino.h>
#include "config.h"

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(LED_PIN, OUTPUT);
  delay(500);

  Serial.println(">>> Digicomp RP2350 Dual Architecture Lab Active <<<");
  Serial.println("Cores: Dual Cortex-M33 / Hazard3 RISC-V @ 150MHz");
  Serial.println("SRAM: 520 KB | PIO State Machines: 12");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("[RP2350] LED HIGH - PIO Bus Active");
  delay(500);

  digitalWrite(LED_PIN, LOW);
  Serial.println("[RP2350] LED LOW");
  delay(500);
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define LED_PIN 25
#define BAUD_RATE 115200

#endif // CONFIG_H
`,
      'README.md': `# Digicomp RP2350 Dual-Core Board
Powered by the Raspberry Pi RP2350 microcontroller featuring switchable ARM Cortex-M33 and Hazard3 RISC-V cores.
`,
    },
  },
  {
    id: 'ch32v006',
    name: 'Digicomp CH32V006 RISC-V Board',
    sku: 'DC-CH32V-01',
    description: 'Ultra low-power 32-bit QingKe RISC-V core @ 48MHz with 32KB Flash and 1-wire debug.',
    mcu: 'QingKe 32-bit RISC-V',
    clockSpeed: '48 MHz',
    flashMemory: 32768,
    sram: 6144,
    operatingVoltage: '3.3V / 5V',
    defaultBaud: 115200,
    supportedBauds: [9600, 57600, 115200],
    icon: '🧪',
    pinout: [
      { pin: 'PD4', type: 'digital', description: 'Onboard Status LED / PWM' },
      { pin: 'PD6', type: 'comm',    description: 'UART1 RXD' },
      { pin: 'PD5', type: 'comm',    description: 'UART1 TXD' },
      { pin: 'PC4', type: 'analog',  description: 'ADC Channel 2' },
      { pin: 'PD1', type: 'comm',    description: 'SWDIO (1-Wire Serial Debug)' },
      { pin: 'VCC', type: 'power',   description: '3.3V or 5V Power Supply' },
      { pin: 'GND', type: 'power',   description: 'Ground' },
    ],
    defaultFiles: {
      'main.cpp': `// Digicomp CH32V006 RISC-V Prototyping Firmware
// Core: QingKe 32-bit RISC-V @ 48MHz
#include <Arduino.h>

#define LED_PIN PD4

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Digicomp CH32V006 RISC-V Board Initialized.");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(300);
  digitalWrite(LED_PIN, LOW);
  delay(300);
}
`,
      'config.h': `#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN PD4\n#endif\n`,
      'README.md': `# Digicomp CH32V006 RISC-V Board\nUltra-compact, low-cost RISC-V microcontroller board.\n`,
    },
  },
  {
    id: 'digicomp-bms16s',
    name: 'Digicomp 16S Smart BMS Module',
    sku: 'DC-BMS16S-01',
    description: 'Industrial 1S to 16S Battery Management System with active balancing and telemetry.',
    mcu: 'STM32 / BQ76952 AFE',
    clockSpeed: '64 MHz',
    flashMemory: 131072,
    sram: 32768,
    operatingVoltage: '3.3V (Logic) / 60V (Pack)',
    defaultBaud: 115200,
    supportedBauds: [9600, 115200],
    icon: '🔋',
    pinout: [
      { pin: 'CAN_H', type: 'comm',  description: 'CAN Bus High Differential' },
      { pin: 'CAN_L', type: 'comm',  description: 'CAN Bus Low Differential' },
      { pin: 'BLE_TX', type: 'comm', description: 'Bluetooth Telemetry TX' },
      { pin: 'BLE_RX', type: 'comm', description: 'Bluetooth Telemetry RX' },
      { pin: 'ALERT',  type: 'digital', description: 'Fault / OVP / OCP Interrupt' },
      { pin: 'GND',    type: 'power', description: 'Signal Ground' },
    ],
    defaultFiles: {
      'main.cpp': `// Digicomp 16S Smart BMS Firmware
#include <Arduino.h>
#include "config.h"

void setup() {
  Serial.begin(115200);
  Serial.println("=== Digicomp 16S Smart BMS Online ===");
  Serial.println("Active Cell Balancing: ENABLED");
  Serial.println("Over-voltage Threshold: 4.25V");
  Serial.println("Under-voltage Threshold: 2.80V");
}

void loop() {
  // Simulate cell pack monitoring
  float totalVoltage = 58.4f;
  float maxCell = 3.65f;
  float minCell = 3.64f;

  Serial.print("[BMS] Pack Voltage: ");
  Serial.print(totalVoltage);
  Serial.print("V | Delta: ");
  Serial.print((maxCell - minCell) * 1000.0f, 1);
  Serial.println(" mV | Status: HEALTHY");
  delay(1000);
}
`,
      'config.h': `#ifndef CONFIG_H\n#define CONFIG_H\n#define CELL_COUNT 16\n#endif\n`,
      'README.md': `# Digicomp 16S Smart BMS Module\nIndustrial Battery Management System for EV and Energy Storage applications.\n`,
    },
  },
  {
    id: 'arduino-uno',
    name: 'Arduino Uno R3',
    sku: 'DC-UNO-01',
    description: 'Standard ATmega328P development board with 14 digital I/O pins and 6 analog inputs.',
    mcu: 'ATmega328P',
    clockSpeed: '16 MHz',
    flashMemory: 32256,
    sram: 2048,
    operatingVoltage: '5V',
    defaultBaud: 9600,
    supportedBauds: [9600, 19200, 38400, 57600, 115200],
    icon: '🟩',
    pinout: [
      { pin: 'D13', type: 'digital', description: 'Built-in LED / SCK' },
      { pin: 'D12', type: 'digital', description: 'MISO (SPI)' },
      { pin: 'D11', type: 'digital', description: 'MOSI / PWM' },
      { pin: 'D10', type: 'digital', description: 'SS / PWM' },
      { pin: 'D9',  type: 'digital', description: 'PWM Timer1' },
      { pin: 'D3',  type: 'digital', description: 'External Interrupt 1 / PWM' },
      { pin: 'D2',  type: 'digital', description: 'External Interrupt 0' },
      { pin: 'A0',  type: 'analog',  description: 'Analog Input 0 (0-5V)' },
      { pin: 'A4',  type: 'comm',    description: 'SDA (I2C)' },
      { pin: 'A5',  type: 'comm',    description: 'SCL (I2C)' },
      { pin: '5V',  type: 'power',   description: 'Regulated 5V output' },
      { pin: 'GND', type: 'power',   description: 'Ground rail' },
    ],
    defaultFiles: {
      'main.cpp': `// Digicomp Hardware Lab - Arduino Uno R3
#include <Arduino.h>
#include "config.h"

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  Serial.println("=== Digicomp Hardware Lab: Arduino Uno R3 ===");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("[Uno] Pin 13 LED: HIGH");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("[Uno] Pin 13 LED: LOW");
  delay(1000);
}
`,
      'config.h': `#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN 13\n#define BAUD_RATE 9600\n#endif\n`,
      'README.md': `# Digicomp Hardware Lab - Arduino Uno R3\nClassic 8-bit microcontroller.\n`,
    },
  },
  {
    id: 'arduino-nano',
    name: 'Arduino Nano',
    sku: 'DC-NANO-01',
    description: 'Breadboard-friendly ATmega328P microcontroller with 8 analog inputs and mini/micro USB.',
    mcu: 'ATmega328P',
    clockSpeed: '16 MHz',
    flashMemory: 30720,
    sram: 2048,
    operatingVoltage: '5V',
    defaultBaud: 9600,
    supportedBauds: [9600, 19200, 38400, 57600, 115200],
    icon: '🟦',
    pinout: [
      { pin: 'D13', type: 'digital', description: 'Built-in LED' },
      { pin: 'A0',  type: 'analog',  description: 'Analog In 0' },
      { pin: '5V',  type: 'power',   description: '5V VCC' },
      { pin: 'GND', type: 'power',   description: 'Ground' },
    ],
    defaultFiles: {
      'main.cpp': `// Digicomp Hardware Lab - Arduino Nano\n#include <Arduino.h>\nvoid setup() { pinMode(13, OUTPUT); Serial.begin(9600); }\nvoid loop() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }\n`,
      'config.h': `#ifndef CONFIG_H\n#define CONFIG_H\n#endif\n`,
      'README.md': `# Digicomp Hardware Lab - Arduino Nano\n`,
    },
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    devices: HARDWARE_DEVICES,
  });
}
