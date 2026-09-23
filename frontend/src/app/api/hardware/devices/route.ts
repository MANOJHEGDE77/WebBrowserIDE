import { NextResponse } from 'next/server';
import { HardwareDevice } from '@/types/hardware';

export const HARDWARE_DEVICES: HardwareDevice[] = [
  {
    id: 'arduino-uno',
    name: 'Arduino Uno R3',
    sku: 'DC-UNO-01',
    description: 'Standard ATmega328P development board with 14 digital I/O pins and 6 analog inputs.',
    mcu: 'ATmega328P',
    clockSpeed: '16 MHz',
    flashMemory: 32256, // 32 KB (0.5 KB bootloader)
    sram: 2048,        // 2 KB
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
      'main.cpp': `// DigiComp Hardware Lab - Arduino Uno R3
// Target MCU: ATmega328P @ 16MHz (5V)
#include <Arduino.h>
#include "config.h"

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  Serial.println("=== DigiComp Hardware Lab ===");
  Serial.println("Target: Arduino Uno R3 (ATmega328P)");
  Serial.println("Status: Initialized and ready for test.");
}

void loop() {
  // Toggle onboard test LED
  digitalWrite(LED_PIN, HIGH);
  Serial.println("[Uno] Pin 13 LED: HIGH");
  delay(BLINK_INTERVAL_MS);

  digitalWrite(LED_PIN, LOW);
  Serial.println("[Uno] Pin 13 LED: LOW");
  delay(BLINK_INTERVAL_MS);
}
`,
      'config.h': `// Hardware Configuration for Arduino Uno
#ifndef CONFIG_H
#define CONFIG_H

#define LED_PIN 13
#define BAUD_RATE 9600
#define BLINK_INTERVAL_MS 1000

#endif // CONFIG_H
`,
      'README.md': `# DigiComp Hardware Lab - Arduino Uno R3

Welcome to the **DigiComp Hardware Lab** workspace for **Arduino Uno R3 (SKU: DC-UNO-01)**.

### Features
- **Monaco Editor**: Edit, syntax check, and test Arduino C++ sketches in real time.
- **Compiler Diagnostics**: Fast syntax verification and memory calculation (Flash / SRAM).
- **Web Serial Monitor**: Connect real Arduino Uno hardware over USB and stream live serial data.

### Quick Shortcuts
- **Ctrl + S**: Save workspace
- **Ctrl + Enter**: Trigger Compilation
`,
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
      { pin: 'D2',  type: 'digital', description: 'INT0' },
      { pin: 'A0',  type: 'analog',  description: 'Analog In 0' },
      { pin: 'A6',  type: 'analog',  description: 'Analog In 6 (Analog only)' },
      { pin: 'A7',  type: 'analog',  description: 'Analog In 7 (Analog only)' },
      { pin: 'TX1', type: 'comm',    description: 'UART Transmit' },
      { pin: 'RX0', type: 'comm',    description: 'UART Receive' },
      { pin: '5V',  type: 'power',   description: '5V VCC' },
      { pin: 'GND', type: 'power',   description: 'Ground' },
    ],
    defaultFiles: {
      'main.cpp': `// DigiComp Hardware Lab - Arduino Nano
// Target MCU: ATmega328P Compact Form Factor
#include <Arduino.h>
#include "config.h"

void setup() {
  pinMode(STATUS_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  Serial.println("DigiComp Hardware Lab: Arduino Nano Active");
}

void loop() {
  int sensorVal = analogRead(ANALOG_SENSOR_PIN);
  float voltage = (sensorVal * 5.0) / 1023.0;

  Serial.print("Raw: ");
  Serial.print(sensorVal);
  Serial.print(" | Voltage: ");
  Serial.print(voltage, 2);
  Serial.println(" V");

  digitalWrite(STATUS_PIN, sensorVal > 512 ? HIGH : LOW);
  delay(SAMPLE_RATE_MS);
}
`,
      'config.h': `// Hardware Configuration for Arduino Nano
#ifndef CONFIG_H
#define CONFIG_H

#define STATUS_PIN 13
#define ANALOG_SENSOR_PIN A0
#define BAUD_RATE 9600
#define SAMPLE_RATE_MS 500

#endif // CONFIG_H
`,
      'README.md': `# DigiComp Hardware Lab - Arduino Nano

Breadboard-friendly prototyping on the **Arduino Nano (SKU: DC-NANO-01)**.
Supports A0-A7 analog inputs, PWM channels, and compact sensor interfacing.
`,
    },
  },
  {
    id: 'esp32-devkit',
    name: 'ESP32 DevKit V1',
    sku: 'DC-ESP32-01',
    description: 'Dual-core 240MHz Xtensa LX6 with built-in 802.11 b/g/n Wi-Fi and Bluetooth v4.2 BR/EDR and BLE.',
    mcu: 'ESP32-D0WDQ6',
    clockSpeed: '240 MHz',
    flashMemory: 4194304, // 4 MB Flash
    sram: 524288,         // 520 KB SRAM
    operatingVoltage: '3.3V',
    defaultBaud: 115200,
    supportedBauds: [9600, 57600, 115200, 230400, 921600],
    icon: '🔧',
    pinout: [
      { pin: 'GPIO2',  type: 'digital', description: 'Onboard Blue LED / Boot Strapping' },
      { pin: 'GPIO4',  type: 'digital', description: 'Touch Sensor 0 / ADC2_CH0' },
      { pin: 'GPIO21', type: 'comm',    description: 'I2C SDA' },
      { pin: 'GPIO22', type: 'comm',    description: 'I2C SCL' },
      { pin: 'GPIO34', type: 'analog',  description: 'ADC1_CH6 (Input Only)' },
      { pin: 'GPIO35', type: 'analog',  description: 'ADC1_CH7 (Input Only)' },
      { pin: '3V3',    type: 'power',   description: 'Regulated 3.3V Output' },
      { pin: 'GND',    type: 'power',   description: 'Ground Rail' },
    ],
    defaultFiles: {
      'main.cpp': `// DigiComp Hardware Lab - ESP32 DevKit V1
// Dual Core Xtensa 240MHz | WiFi 802.11 b/g/n | BLE 4.2
#include <Arduino.h>
#include "config.h"

void setup() {
  pinMode(BLUE_LED_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  delay(500);

  Serial.println("\n========================================");
  Serial.println("  DigiComp ESP32 DevKit V1 Hardware Lab  ");
  Serial.println("========================================");
  Serial.println("Chip ID: ESP32-D0WDQ6 (Dual Core 240MHz)");
  Serial.println("Flash: 4MB SPI Flash | SRAM: 520KB");
  Serial.println("WiFi/BLE Subsystem: Ready");
}

void loop() {
  digitalWrite(BLUE_LED_PIN, HIGH);
  Serial.println("[ESP32] Core 1 Task: LED ON (3.3V Logic)");
  delay(CYCLE_DELAY_MS);

  digitalWrite(BLUE_LED_PIN, LOW);
  Serial.println("[ESP32] Core 1 Task: LED OFF (0V Logic)");
  delay(CYCLE_DELAY_MS);
}
`,
      'config.h': `// Hardware Configuration for ESP32 DevKit V1
#ifndef CONFIG_H
#define CONFIG_H

#define BLUE_LED_PIN 2
#define BAUD_RATE 115200
#define CYCLE_DELAY_MS 800

#endif // CONFIG_H
`,
      'README.md': `# DigiComp Hardware Lab - ESP32 DevKit V1

High performance IoT development board with dual 32-bit cores, integrated WiFi, and Bluetooth.
Note: ESP32 uses 3.3V GPIO logic. Do NOT connect 5V sensors directly to GPIO pins without level shifting.
`,
    },
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    devices: HARDWARE_DEVICES,
  });
}
