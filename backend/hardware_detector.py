"""
Digicomp Technologies - Hardware Device & Chip Detector Module
Auto-detects connected microcontrollers, development boards, and embedded silicon chips.
Supports: ESP32-S3, RP2350, CH32V006, RP2040, ATmega328P, STM32, FPGA, and USB-UART bridges.
"""

from __future__ import annotations
import re
import time
import logging
import threading
from typing import Dict, List, Optional, Any

try:
    import serial
    import serial.tools.list_ports
    HAS_PYSERIAL = True
except ImportError:
    HAS_PYSERIAL = False

logger = logging.getLogger("digicomp.hardware")

# ==============================================================================
# KNOWN CHIP DEFINITIONS & HARDWARE SPECIFICATIONS
# ==============================================================================

KNOWN_CHIPS: Dict[str, Dict[str, Any]] = {
    "esp32-s3": {
        "chip_id": "esp32-s3",
        "chip_name": "ESP32-S3",
        "family": "Espressif Xtensa LX7",
        "board_name": "Digicomp ESP32-S3 Dev Board",
        "sku": "DC-ESP32S3-01",
        "manufacturer": "Espressif / Digicomp Technologies",
        "architecture": "Xtensa 32-bit Dual-Core LX7",
        "clock_speed": "240 MHz",
        "flash_bytes": 16777216,   # 16 MB Flash
        "sram_bytes": 8388608,     # 8 MB PSRAM + 512 KB SRAM
        "operating_voltage": "3.3V",
        "recommended_baud": 115200,
        "supported_bauds": [9600, 57600, 115200, 230400, 460800, 921600],
        "icon": "⚡",
        "features": [
            "Dual-core 240MHz Xtensa LX7",
            "Wi-Fi 4 (802.11 b/g/n) 150 Mbps",
            "Bluetooth 5.0 LE + Mesh",
            "Native USB-C OTG + USB-JTAG Debug",
            "Vector Instructions for Edge AI / Neural Networks",
            "Onboard WS2812 Neopixel (GPIO48)",
            "Dual Type-C Connectors"
        ],
        "safety_notes": "CRITICAL: 3.3V logic level only. GPIO pins are NOT 5V tolerant (>3.6V will permanently damage silicon diodes). Always use logic level shifters for 5V sensors.",
        "pinout": [
            {"pin": "GPIO48", "type": "digital", "description": "Onboard WS2812 Neopixel RGB LED"},
            {"pin": "GPIO21", "type": "comm", "description": "I2C SDA (Wire Data)"},
            {"pin": "GPIO22", "type": "comm", "description": "I2C SCL (Wire Clock)"},
            {"pin": "GPIO4", "type": "analog", "description": "ADC1_CH3 / LDR Analog Input"},
            {"pin": "GPIO5", "type": "digital", "description": "PWM Timer / Servo Control"},
            {"pin": "GPIO43", "type": "comm", "description": "U0TXD (Hardware UART0 TX)"},
            {"pin": "GPIO44", "type": "comm", "description": "U0RXD (Hardware UART0 RX)"},
            {"pin": "GPIO19", "type": "comm", "description": "USB D- (Native USB-C OTG)"},
            {"pin": "GPIO20", "type": "comm", "description": "USB D+ (Native USB-C OTG)"},
            {"pin": "3V3", "type": "power", "description": "Regulated 3.3V System Rail"},
            {"pin": "5V", "type": "power", "description": "USB VBUS 5.0V Input/Output"},
            {"pin": "GND", "type": "power", "description": "Common Ground Plane"}
        ],
        "default_files": {
            "main.cpp": (
                "// Digicomp Technologies - ESP32-S3 Radiant Light Glow System\n"
                "// Target: Digicomp ESP32-S3 Flagship Dev Board (SKU: DC-ESP32S3-01)\n"
                "// 1. Smooth Sinusoidal Breathing Light Glow (PWM Analog Fading)\n"
                "// 2. High-Radiance Solid Glow Mode\n"
                "// 3. Serial Monitor Interactive Brightness & Mode Control\n"
                "#include <Arduino.h>\n"
                "#include \"config.h\"\n\n"
                "float glowAngle = 0.0;\n"
                "unsigned long lastGlowUpdate = 0;\n"
                "int currentBrightness = 0;\n"
                "String currentMode = \"BREATHE\";\n\n"
                "void setup() {\n"
                "  Serial.begin(BAUD_RATE);\n"
                "  pinMode(LED_GLOW_PIN, OUTPUT);\n"
                "  pinMode(ONBOARD_STATUS_PIN, OUTPUT);\n"
                "  digitalWrite(LED_GLOW_PIN, HIGH);\n"
                "  digitalWrite(ONBOARD_STATUS_PIN, HIGH);\n"
                "  delay(300);\n"
                "  Serial.println(\"==================================================\");\n"
                "  Serial.println(\"  ✨ DIGICOMP ESP32-S3 RADIANT LIGHT GLOW SYSTEM  \");\n"
                "  Serial.println(\"==================================================\");\n"
                "  Serial.println(\"Target: ESP32-S3 Dual-Core Xtensa LX7 @ 240MHz\");\n"
                "  Serial.println(\"Glow Pin: GPIO 48 (WS2812/Status) + GPIO 2 (PWM Light)\");\n"
                "  Serial.println(\"Mode: Smooth Breathing Light Glow Active (50 FPS)\");\n"
                "  Serial.println(\"Serial Commands: 'ON', 'OFF', 'BREATHE', 'BRIGHT 200'\");\n"
                "  Serial.println(\"==================================================\");\n"
                "}\n\n"
                "void loop() {\n"
                "  unsigned long now = millis();\n"
                "  if (Serial.available() > 0) {\n"
                "    String cmd = Serial.readStringUntil('\\n');\n"
                "    cmd.trim();\n"
                "    cmd.toUpperCase();\n"
                "    if (cmd == \"ON\" || cmd == \"GLOW\") {\n"
                "      currentMode = \"SOLID_ON\";\n"
                "      analogWrite(LED_GLOW_PIN, 255);\n"
                "      digitalWrite(ONBOARD_STATUS_PIN, HIGH);\n"
                "      Serial.println(\"[GLOW ENGINE] Light set to: CONSTANT HIGH GLOW (100% Brightness)\");\n"
                "    } else if (cmd == \"OFF\") {\n"
                "      currentMode = \"OFF\";\n"
                "      analogWrite(LED_GLOW_PIN, 0);\n"
                "      digitalWrite(ONBOARD_STATUS_PIN, LOW);\n"
                "      Serial.println(\"[GLOW ENGINE] Light set to: OFF\");\n"
                "    } else if (cmd == \"BREATHE\") {\n"
                "      currentMode = \"BREATHE\";\n"
                "      Serial.println(\"[GLOW ENGINE] Light set to: SMOOTH BREATHING GLOW\");\n"
                "    } else if (cmd.startsWith(\"BRIGHT \")) {\n"
                "      int val = cmd.substring(7).toInt();\n"
                "      val = constrain(val, 0, 255);\n"
                "      currentMode = \"SOLID_CUSTOM\";\n"
                "      analogWrite(LED_GLOW_PIN, val);\n"
                "      Serial.print(\"[GLOW ENGINE] Custom Brightness Level set to: \");\n"
                "      Serial.println(val);\n"
                "    }\n"
                "  }\n\n"
                "  if (currentMode == \"BREATHE\") {\n"
                "    if (now - lastGlowUpdate >= GLOW_INTERVAL_MS) {\n"
                "      lastGlowUpdate = now;\n"
                "      float factor = (sin(glowAngle) + 1.0) / 2.0;\n"
                "      currentBrightness = (int)(pow(factor, 2.0) * 255.0);\n"
                "      if (currentBrightness < 5) currentBrightness = 5;\n"
                "      analogWrite(LED_GLOW_PIN, currentBrightness);\n"
                "      digitalWrite(ONBOARD_STATUS_PIN, factor > 0.4 ? HIGH : LOW);\n"
                "      glowAngle += GLOW_SPEED_STEP;\n"
                "      if (glowAngle >= 2.0 * PI) {\n"
                "        glowAngle -= 2.0 * PI;\n"
                "        Serial.print(\"[GLOW TELEMETRY] Breathing Pulse Complete | Peak: \");\n"
                "        Serial.print(currentBrightness);\n"
                "        Serial.println(\" / 255\");\n"
                "      }\n"
                "    }\n"
                "  } else if (currentMode == \"SOLID_ON\") {\n"
                "    analogWrite(LED_GLOW_PIN, 255);\n"
                "    digitalWrite(ONBOARD_STATUS_PIN, HIGH);\n"
                "  }\n"
                "  delay(5);\n"
                "}\n"
            ),
            "config.h": (
                "#ifndef CONFIG_H\n"
                "#define CONFIG_H\n\n"
                "#define BAUD_RATE 115200\n"
                "#define LED_GLOW_PIN 48       // Onboard WS2812 Neopixel / Status GPIO\n"
                "#define ONBOARD_STATUS_PIN 2  // Aux / Status GPIO\n"
                "#define GLOW_INTERVAL_MS 20   // 50 FPS smooth refresh\n"
                "#define GLOW_SPEED_STEP 0.045 // Speed of breathing pulse\n\n"
                "#endif // CONFIG_H\n"
            ),
            "readme.md": (
                "# Digicomp ESP32-S3 Radiant Light Glow System\n\n"
                "- **MCU**: Xtensa 32-bit Dual-Core LX7 @ 240 MHz\n"
                "- **Features**: Smooth sinusoidal PWM breathing glow & high-radiance constant illumination on GPIO 48 / GPIO 2.\n"
                "- **Commands**: Type 'ON', 'OFF', 'BREATHE', or 'BRIGHT 200' in Serial Monitor.\n"
            )
        }
    },
    "rp2350": {
        "chip_id": "rp2350",
        "chip_name": "RP2350",
        "family": "Raspberry Pi Dual-Arch Silicon",
        "board_name": "Digicomp RP2350 Dual-Architecture Board",
        "sku": "DC-RP2350-01",
        "manufacturer": "Raspberry Pi / Digicomp Technologies",
        "architecture": "Dual ARM Cortex-M33 / Hazard3 RISC-V @ 150MHz",
        "clock_speed": "150 MHz",
        "flash_bytes": 16777216,   # 16 MB QSPI Flash
        "sram_bytes": 532480,      # 520 KB SRAM in 10 banks
        "operating_voltage": "3.3V",
        "recommended_baud": 115200,
        "supported_bauds": [9600, 57600, 115200, 230400, 460800, 921600],
        "icon": "🔷",
        "features": [
            "Dual Cortex-M33 or Dual Hazard3 RISC-V cores",
            "12 PIO state machines (Programmable I/O)",
            "Arm TrustZone secure boot & SHA-256 accelerator",
            "High-speed native USB 1.1 Device/Host",
            "Hardware floating point unit (FPU)"
        ],
        "safety_notes": "3.3V CMOS logic. Maximum pin sink/source current is 12mA. Use external buffers for inductive loads.",
        "pinout": [
            {"pin": "GPIO0", "type": "comm", "description": "UART0 TX / I2C0 SDA"},
            {"pin": "GPIO1", "type": "comm", "description": "UART0 RX / I2C0 SCL"},
            {"pin": "GPIO16", "type": "comm", "description": "SPI0 RX"},
            {"pin": "GPIO25", "type": "digital", "description": "Onboard Green User LED"},
            {"pin": "GPIO26", "type": "analog", "description": "ADC0 (12-bit Analog Input)"},
            {"pin": "3V3", "type": "power", "description": "3.3V Power Rail"},
            {"pin": "GND", "type": "power", "description": "Ground"}
        ],
        "default_files": {
            "main.cpp": (
                "// Digicomp RP2350 Dual-Architecture Firmware\n"
                "#include <Arduino.h>\n"
                "#include \"config.h\"\n\n"
                "void setup() {\n"
                "  Serial.begin(115200);\n"
                "  pinMode(LED_PIN, OUTPUT);\n"
                "  delay(500);\n"
                "  Serial.println(\"⚡ Digicomp RP2350 Initialized. Dual ARM Cortex-M33 / Hazard3 active.\");\n"
                "}\n\n"
                "void loop() {\n"
                "  digitalWrite(LED_PIN, HIGH);\n"
                "  delay(250);\n"
                "  digitalWrite(LED_PIN, LOW);\n"
                "  delay(250);\n"
                "  Serial.println(\"[RP2350] Core 0 Heartbeat | 150MHz PLL locked\");\n"
                "}\n"
            ),
            "config.h": "#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN 25\n#endif\n",
            "readme.md": "# Digicomp RP2350\nDual ARM Cortex-M33 / Hazard3 RISC-V @ 150MHz with 16MB Flash.\n"
        }
    },
    "ch32v006": {
        "chip_id": "ch32v006",
        "chip_name": "CH32V006",
        "family": "WCH QingKe RISC-V",
        "board_name": "Digicomp CH32V006 Ultra-Low Power RISC-V",
        "sku": "DC-CH32V-01",
        "manufacturer": "WCH / Digicomp Technologies",
        "architecture": "QingKe 32-bit RISC-V2A",
        "clock_speed": "48 MHz",
        "flash_bytes": 63488,      # 62 KB Flash
        "sram_bytes": 8192,        # 8 KB SRAM
        "operating_voltage": "3.3V / 5.0V",
        "recommended_baud": 115200,
        "supported_bauds": [9600, 38400, 115200, 460800],
        "icon": "⚡",
        "features": [
            "Ultra low-cost 32-bit RISC-V microcontroller",
            "Single-wire debug interface (SDI)",
            "Wide operating voltage (2.4V to 5.5V)",
            "DMA controller, 10-bit ADC, timers, UART, I2C, SPI"
        ],
        "safety_notes": "Supports up to 5.5V operating voltage. Ensure correct rail voltage when using 3.3V external peripheral chips.",
        "pinout": [
            {"pin": "PD1", "type": "comm", "description": "SDI Debug Data / SWIO"},
            {"pin": "PD5", "type": "comm", "description": "USART1 TX"},
            {"pin": "PD6", "type": "comm", "description": "USART1 RX"},
            {"pin": "PC1", "type": "digital", "description": "Onboard User Status LED"},
            {"pin": "VCC", "type": "power", "description": "3.3V / 5V System Power Input"},
            {"pin": "GND", "type": "power", "description": "Ground"}
        ],
        "default_files": {
            "main.cpp": (
                "// Digicomp CH32V006 RISC-V Firmware\n"
                "#include <Arduino.h>\n"
                "void setup() {\n"
                "  Serial.begin(115200);\n"
                "  pinMode(1, OUTPUT); // PC1 User LED\n"
                "  Serial.println(\"⚡ Digicomp CH32V006 QingKe RISC-V active @ 48MHz\");\n"
                "}\n"
                "void loop() {\n"
                "  digitalWrite(1, HIGH);\n"
                "  delay(500);\n"
                "  digitalWrite(1, LOW);\n"
                "  delay(500);\n"
                "}\n"
            ),
            "config.h": "#ifndef CONFIG_H\n#define CONFIG_H\n#define STATUS_PIN 1\n#endif\n",
            "readme.md": "# Digicomp CH32V006 RISC-V\n32-bit RISC-V2A @ 48MHz ultra-low power microcontroller.\n"
        }
    },
    "esp32-devkit": {
        "chip_id": "esp32-devkit",
        "chip_name": "ESP32 Classic (ESP-WROOM-32)",
        "family": "Espressif Xtensa LX6",
        "board_name": "Digicomp ESP32 DevKit V1",
        "sku": "DC-ESP32-01",
        "manufacturer": "Espressif / Digicomp Technologies",
        "architecture": "Xtensa 32-bit Dual-Core LX6",
        "clock_speed": "240 MHz",
        "flash_bytes": 4194304,    # 4 MB Flash
        "sram_bytes": 524288,      # 520 KB SRAM
        "operating_voltage": "3.3V",
        "recommended_baud": 115200,
        "supported_bauds": [9600, 57600, 115200, 230400, 921600],
        "icon": "🔧",
        "features": [
            "Dual-core 240MHz Xtensa LX6",
            "Wi-Fi 802.11 b/g/n + Bluetooth 4.2 BR/EDR and BLE",
            "Capacitive touch, Hall sensor, low-power DACs"
        ],
        "safety_notes": "3.3V logic level. GPIO 34, 35, 36, 39 are input only (no internal pullups or output drivers).",
        "pinout": [
            {"pin": "GPIO2", "type": "digital", "description": "Onboard Blue LED"},
            {"pin": "GPIO21", "type": "comm", "description": "I2C SDA"},
            {"pin": "GPIO22", "type": "comm", "description": "I2C SCL"},
            {"pin": "GPIO34", "type": "analog", "description": "Input Only ADC1_CH6"},
            {"pin": "3V3", "type": "power", "description": "3.3V Power Out"},
            {"pin": "GND", "type": "power", "description": "Common Ground"}
        ],
        "default_files": {
            "main.cpp": "// Digicomp ESP32 DevKit V1\n#include <Arduino.h>\nvoid setup() { Serial.begin(115200); pinMode(2, OUTPUT); }\nvoid loop() { digitalWrite(2, HIGH); delay(500); digitalWrite(2, LOW); delay(500); }\n",
            "config.h": "#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN 2\n#endif\n",
            "readme.md": "# ESP32 DevKit V1\nDual-Core Xtensa LX6 with Wi-Fi & BLE.\n"
        }
    },
    "rp2040": {
        "chip_id": "rp2040",
        "chip_name": "RP2040",
        "family": "Raspberry Pi RP2040",
        "board_name": "Raspberry Pi Pico / Digicomp RP2040",
        "sku": "DC-RP2040-01",
        "manufacturer": "Raspberry Pi Foundation",
        "architecture": "Dual ARM Cortex-M0+ @ 133MHz",
        "clock_speed": "133 MHz",
        "flash_bytes": 2097152,    # 2 MB Flash
        "sram_bytes": 264192,      # 264 KB SRAM
        "operating_voltage": "3.3V",
        "recommended_baud": 115200,
        "supported_bauds": [9600, 57600, 115200, 230400, 921600],
        "icon": "🍓",
        "features": ["Dual Cortex-M0+ 133MHz", "8 PIO state machines", "Native USB 1.1 controller"],
        "safety_notes": "3.3V CMOS logic. Never connect 5V signals to Pico GPIOs.",
        "pinout": [
            {"pin": "GP25", "type": "digital", "description": "Onboard Green LED"},
            {"pin": "GP0", "type": "comm", "description": "UART0 TX"},
            {"pin": "GP1", "type": "comm", "description": "UART0 RX"},
            {"pin": "3V3", "type": "power", "description": "3.3V Out"},
            {"pin": "GND", "type": "power", "description": "Ground"}
        ],
        "default_files": {
            "main.cpp": "// Raspberry Pi Pico RP2040\n#include <Arduino.h>\nvoid setup() { pinMode(25, OUTPUT); Serial.begin(115200); }\nvoid loop() { digitalWrite(25, HIGH); delay(500); digitalWrite(25, LOW); delay(500); }\n",
            "config.h": "#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN 25\n#endif\n",
            "readme.md": "# Raspberry Pi Pico RP2040\nDual ARM Cortex-M0+ @ 133MHz.\n"
        }
    },
    "arduino-uno": {
        "chip_id": "arduino-uno",
        "chip_name": "ATmega328P",
        "family": "Microchip AVR 8-bit",
        "board_name": "Arduino Uno R3",
        "sku": "DC-UNO-01",
        "manufacturer": "Arduino SA / Digicomp Technologies",
        "architecture": "8-bit AVR RISC",
        "clock_speed": "16 MHz",
        "flash_bytes": 32256,      # 32 KB Flash (0.5KB for bootloader)
        "sram_bytes": 2048,        # 2 KB SRAM
        "operating_voltage": "5V",
        "recommended_baud": 9600,
        "supported_bauds": [9600, 19200, 38400, 57600, 115200],
        "icon": "🟩",
        "features": ["ATmega328P 16MHz", "14 digital I/O (6 PWM)", "6 10-bit analog inputs", "Optiboot bootloader"],
        "safety_notes": "Operates at 5V TTL logic. Safe with standard 5V sensors. Do not connect directly to 3.3V ESP32/RP2040 without level shifters.",
        "pinout": [
            {"pin": "D13", "type": "digital", "description": "Onboard Status LED"},
            {"pin": "D0", "type": "comm", "description": "RX (USB Serial Receive)"},
            {"pin": "D1", "type": "comm", "description": "TX (USB Serial Transmit)"},
            {"pin": "A0", "type": "analog", "description": "Analog Input 0 (0-5V)"},
            {"pin": "A4", "type": "comm", "description": "I2C SDA"},
            {"pin": "A5", "type": "comm", "description": "I2C SCL"},
            {"pin": "5V", "type": "power", "description": "5.0V Regulated Rail"},
            {"pin": "GND", "type": "power", "description": "Ground"}
        ],
        "default_files": {
            "main.cpp": "// Arduino Uno R3 Blink\n#include <Arduino.h>\nvoid setup() { pinMode(13, OUTPUT); Serial.begin(9600); }\nvoid loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }\n",
            "config.h": "#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN 13\n#endif\n",
            "readme.md": "# Arduino Uno R3\nATmega328P 16MHz microcontroller.\n"
        }
    },
    "artix7-fpga": {
        "chip_id": "artix7-fpga",
        "chip_name": "Artix-7 XC7A35T",
        "family": "AMD / Xilinx 28nm FPGA",
        "board_name": "Digicomp Artix-7 FPGA Development Board",
        "sku": "DC-FPGA-01",
        "manufacturer": "AMD Xilinx / Digicomp Technologies",
        "architecture": "FPGA Configurable Logic Cells (33,280 Logic Cells)",
        "clock_speed": "100 MHz oscillator (up to 450 MHz PLL)",
        "flash_bytes": 33554432,   # 32 MB Quad-SPI Flash
        "sram_bytes": 2293760,     # 1,800 Kbits Block RAM + 256MB DDR3
        "operating_voltage": "3.3V / 1.8V / 1.2V core",
        "recommended_baud": 115200,
        "supported_bauds": [115200, 921600, 1500000, 3000000],
        "icon": "⚡",
        "features": [
            "33,280 Logic cells in 5,200 slices",
            "90 DSP slices for audio/signal processing",
            "Onboard FTDI FT2232H High-Speed USB JTAG + UART bridge",
            "256MB DDR3 RAM",
            "HDMI output port + PMOD connectors"
        ],
        "safety_notes": "All I/O banks operate at 3.3V LVCMOS by default. Avoid over-voltage on PMOD pins.",
        "pinout": [
            {"pin": "CLK100M", "type": "comm", "description": "100MHz Onboard Oscillator"},
            {"pin": "UART_TX", "type": "comm", "description": "FTDI Virtual COM Port TX"},
            {"pin": "UART_RX", "type": "comm", "description": "FTDI Virtual COM Port RX"},
            {"pin": "LED[0..3]", "type": "digital", "description": "User Status LEDs"},
            {"pin": "BTN[0..3]", "type": "digital", "description": "User Pushbuttons"}
        ],
        "default_files": {
            "main.cpp": "// Digicomp Artix-7 FPGA UART Demo\n#include <Arduino.h>\nvoid setup() { Serial.begin(115200); Serial.println(\"⚡ Artix-7 FPGA UART Bridge Ready\"); }\nvoid loop() { delay(1000); }\n",
            "config.h": "#ifndef CONFIG_H\n#define CONFIG_H\n#define CLOCK_HZ 100000000\n#endif\n",
            "readme.md": "# Digicomp Artix-7 FPGA\n33,280 Logic cells with DDR3 & FTDI FT2232H high-speed bridge.\n"
        }
    },
    "bms-16s": {
        "chip_id": "bms-16s",
        "chip_name": "Smart BMS 16S Controller",
        "family": "Digicomp Power Electronics",
        "board_name": "Digicomp Smart BMS 16S Controller",
        "sku": "DC-BMS16S-01",
        "manufacturer": "Digicomp Technologies",
        "architecture": "32-bit ARM Cortex-M4 + TI BQ76952 AFE",
        "clock_speed": "80 MHz",
        "flash_bytes": 524288,
        "sram_bytes": 131072,
        "operating_voltage": "3.3V Logic / 48V-60V Pack",
        "recommended_baud": 115200,
        "supported_bauds": [9600, 19200, 38400, 115200],
        "icon": "🔋",
        "features": [
            "16-cell series LiFePO4 / NMC balancing",
            "Optically isolated RS485 / CAN-Bus / UART telemetry",
            "Active cell balancing @ 1.2A",
            "High-side N-channel MOSFET charge/discharge switches"
        ],
        "safety_notes": "HIGH VOLTAGE WARNING: Battery pack terminals can exceed 60V DC. Maintain optical isolation when connecting to USB host PC.",
        "pinout": [
            {"pin": "RS485_A", "type": "comm", "description": "Isolated RS485 Differential A"},
            {"pin": "RS485_B", "type": "comm", "description": "Isolated RS485 Differential B"},
            {"pin": "UART_TX", "type": "comm", "description": "Isolated 3.3V UART Transmit"},
            {"pin": "UART_RX", "type": "comm", "description": "Isolated 3.3V UART Receive"},
            {"pin": "ALERT", "type": "digital", "description": "Hardware Over-current Alert Trigger"}
        ],
        "default_files": {
            "main.cpp": (
                "// Digicomp Smart BMS 16S Controller Telemetry\n"
                "#include <Arduino.h>\n"
                "void setup() {\n"
                "  Serial.begin(115200);\n"
                "  Serial.println(\"🔋 Digicomp Smart BMS 16S Active. Monitoring cell voltages...\");\n"
                "}\n"
                "void loop() {\n"
                "  Serial.println(\"[BMS] Pack: 52.8V | Current: 0.0A | Max Cell Diff: 8mV | Status: HEALTHY\");\n"
                "  delay(1000);\n"
                "}\n"
            ),
            "config.h": "#ifndef CONFIG_H\n#define CONFIG_H\n#define CELL_COUNT 16\n#endif\n",
            "readme.md": "# Digicomp Smart BMS 16S\nHigh voltage lithium battery management system with active balancing.\n"
        }
    }
}

# ==============================================================================
# USB VID / PID MAPPINGS (Comprehensive Hardware Signatures)
# ==============================================================================

USB_SIGNATURES: Dict[tuple[str, str], Dict[str, Any]] = {
    # --- Espressif Systems (VID: 0x303A) ---
    ("303a", "1001"): {
        "chip_id": "esp32-s3",
        "chip_hint": "ESP32-S3 / ESP32-C3 USB-JTAG/Serial Debug Unit",
        "driver": "USB-JTAG/Serial",
        "confidence": 0.95
    },
    ("303a", "1002"): {
        "chip_id": "esp32-s3",
        "chip_hint": "ESP32-S3 USB OTG CDC Serial Port",
        "driver": "USB CDC",
        "confidence": 0.98
    },
    ("303a", "0002"): {
        "chip_id": "esp32-devkit",
        "chip_hint": "ESP32-S2 USB CDC",
        "driver": "USB CDC",
        "confidence": 0.90
    },
    ("303a", "80c8"): {
        "chip_id": "esp32-s3",
        "chip_hint": "Digicomp ESP32-S3 Official Device",
        "driver": "Digicomp CDC",
        "confidence": 1.0
    },

    # --- Silicon Labs CP210x (VID: 0x10C4) ---
    ("10c4", "ea60"): {
        "chip_id": "esp32-s3",
        "chip_hint": "Silicon Labs CP2102/CP2104 USB-to-UART Bridge (ESP32-S3 / ESP32 Dev Board)",
        "driver": "CP210x VCP",
        "confidence": 0.85
    },
    ("10c4", "ea70"): {
        "chip_id": "esp32-s3",
        "chip_hint": "Silicon Labs CP2105 Dual Port USB-to-UART",
        "driver": "CP210x VCP",
        "confidence": 0.80
    },

    # --- WCH Qinheng CH340 / CH341 / CH343 / CH9102 (VID: 0x1A86) ---
    ("1a86", "7523"): {
        "chip_id": "esp32-s3",
        "chip_hint": "WCH CH340 USB-to-Serial (Digicomp ESP32 / Arduino Uno R3)",
        "driver": "CH340 VCP",
        "confidence": 0.80
    },
    ("1a86", "5523"): {
        "chip_id": "esp32-s3",
        "chip_hint": "WCH CH341 USB-to-Serial",
        "driver": "CH341 VCP",
        "confidence": 0.75
    },
    ("1a86", "55d4"): {
        "chip_id": "esp32-s3",
        "chip_hint": "WCH CH343 High Speed USB-to-UART (Modern ESP32-S3 boards)",
        "driver": "CH343 VCP",
        "confidence": 0.90
    },
    ("1a86", "55d3"): {
        "chip_id": "esp32-s3",
        "chip_hint": "WCH CH9102 USB-to-UART (ESP32-S3 / C3)",
        "driver": "CH9102 VCP",
        "confidence": 0.90
    },
    ("1a86", "8010"): {
        "chip_id": "ch32v006",
        "chip_hint": "WCH-Link / Digicomp CH32V006 RISC-V Debug Probe",
        "driver": "WCH-Link CDC",
        "confidence": 0.98
    },

    # --- Raspberry Pi Foundation (VID: 0x2E8A) ---
    ("2e8a", "0009"): {
        "chip_id": "rp2350",
        "chip_hint": "Digicomp RP2350 USB Serial CDC",
        "driver": "RP2350 CDC",
        "confidence": 1.0
    },
    ("2e8a", "000a"): {
        "chip_id": "rp2350",
        "chip_hint": "Raspberry Pi RP2350 Bootloader (Picoboot)",
        "driver": "Picoboot USB",
        "confidence": 1.0
    },
    ("2e8a", "0003"): {
        "chip_id": "rp2040",
        "chip_hint": "Raspberry Pi Pico RP2040 USB Serial CDC",
        "driver": "RP2040 CDC",
        "confidence": 0.95
    },
    ("2e8a", "0005"): {
        "chip_id": "rp2040",
        "chip_hint": "Raspberry Pi RP2040 Bootloader (Picoboot)",
        "driver": "Picoboot USB",
        "confidence": 0.95
    },

    # --- Arduino SA (VID: 0x2341) ---
    ("2341", "0043"): {
        "chip_id": "arduino-uno",
        "chip_hint": "Arduino Uno R3 (ATmega16U2)",
        "driver": "Arduino Uno",
        "confidence": 1.0
    },
    ("2341", "0001"): {
        "chip_id": "arduino-uno",
        "chip_hint": "Arduino Uno R3",
        "driver": "Arduino Uno",
        "confidence": 1.0
    },
    ("2341", "0042"): {
        "chip_id": "arduino-uno",
        "chip_hint": "Arduino Mega 2560 R3",
        "driver": "Arduino Mega",
        "confidence": 0.95
    },
    ("2341", "0036"): {
        "chip_id": "arduino-uno",
        "chip_hint": "Arduino Leonardo (ATmega32U4)",
        "driver": "Arduino Leonardo",
        "confidence": 0.95
    },

    # --- FTDI (VID: 0x0403) ---
    ("0403", "6001"): {
        "chip_id": "arduino-uno",
        "chip_hint": "FTDI FT232R USB UART (Arduino Nano / ESP32)",
        "driver": "FTDIBUS",
        "confidence": 0.75
    },
    ("0403", "6010"): {
        "chip_id": "artix7-fpga",
        "chip_hint": "FTDI FT2232 Dual Channel (Digicomp Artix-7 FPGA JTAG/UART)",
        "driver": "FTDI Dual VCP",
        "confidence": 0.95
    },
    ("0403", "6014"): {
        "chip_id": "artix7-fpga",
        "chip_hint": "FTDI FT232H High Speed USB",
        "driver": "FTDI VCP",
        "confidence": 0.90
    },

    # --- STMicroelectronics (VID: 0x0483) ---
    ("0483", "374b"): {
        "chip_id": "rp2350",
        "chip_hint": "ST-LINK/V2-1 Virtual COM Port",
        "driver": "STLink VCP",
        "confidence": 0.85
    },
    ("0483", "5740"): {
        "chip_id": "rp2350",
        "chip_hint": "STM32 Virtual COM Port (CDC)",
        "driver": "STM32 CDC",
        "confidence": 0.85
    }
}

# ==============================================================================
# HARDWARE DETECTOR CORE CLASS
# ==============================================================================

class HardwareDetector:
    """
    Subsystem responsible for discovering, identifying, and testing connected
    microcontroller boards, chips, and USB COM ports.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._last_detected_devices: List[Dict[str, Any]] = []
        self._event_history: List[Dict[str, Any]] = []
        self._monitored_ports: set[str] = set()
        self._is_monitoring = False
        self._monitor_thread: Optional[threading.Thread] = None

    def scan_ports(self, active_probe: bool = False, simulate: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Scan host OS for serial and USB ports. Matches each port against
        Digicomp's known chip signatures and optionally probes the device.
        If simulate is provided (e.g. 'esp32-s3', 'rp2350', or 'true'), returns
        a simulated device if no physical hardware is plugged in.
        """
        discovered = []

        if HAS_PYSERIAL:
            try:
                ports = list(serial.tools.list_ports.comports())
                for p in ports:
                    port_name = p.device
                    desc = p.description or ""
                    hwid = p.hwid or ""
                    vid = p.vid
                    pid = p.pid
                    mfg = p.manufacturer or ""
                    serial_num = p.serial_number or ""

                    # Format VID/PID as 4-char hex strings if available
                    vid_hex = f"{vid:04x}".lower() if vid is not None else None
                    pid_hex = f"{pid:04x}".lower() if pid is not None else None

                    # Attempt signature matching
                    chip_info, confidence, match_source = self._identify_chip(
                        vid_hex=vid_hex,
                        pid_hex=pid_hex,
                        description=desc,
                        hwid=hwid,
                        manufacturer=mfg
                    )

                    device_record: Dict[str, Any] = {
                        "port": port_name,
                        "description": desc,
                        "hardware_id": hwid,
                        "vid": vid_hex,
                        "pid": pid_hex,
                        "manufacturer": mfg,
                        "serial_number": serial_num,
                        "is_detected": chip_info is not None,
                        "is_simulated": False,
                        "confidence": confidence,
                        "match_source": match_source,
                        "chip": chip_info,
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                        "status": "ready"
                    }

                    if active_probe:
                        baud = chip_info.get("recommended_baud", 115200) if chip_info else 115200
                        probe_res = self.interrogate_port(port_name, baud=baud)
                        device_record["probe_result"] = probe_res
                        if probe_res.get("confirmed_chip"):
                            device_record["confirmed_chip"] = probe_res["confirmed_chip"]

                    discovered.append(device_record)

            except Exception as e:
                logger.error(f"Error enumerating COM ports: {e}")

        # If simulation mode requested (or no physical ports and developer simulation requested)
        if simulate:
            target_id = simulate if simulate in KNOWN_CHIPS else "esp32-s3"
            sim_dev = self.simulate_device(chip_id=target_id, port_name="COM3 (Virtual Lab)")
            discovered.insert(0, sim_dev)

        with self._lock:
            self._update_event_history(discovered)
            self._last_detected_devices = discovered

        return discovered

    def simulate_device(self, chip_id: str = "esp32-s3", port_name: str = "COM3") -> Dict[str, Any]:
        """
        Creates a mock connected device representation for hardware testing or virtual lab mode.
        """
        chip = KNOWN_CHIPS.get(chip_id, KNOWN_CHIPS["esp32-s3"])
        vid = "303a" if "esp32" in chip_id else "2e8a" if "rp" in chip_id else "1a86" if "ch32" in chip_id else "2341"
        pid = "1001" if "esp32-s3" in chip_id else "0009" if "rp2350" in chip_id else "8010" if "ch32" in chip_id else "0043"

        return {
            "port": port_name,
            "description": f"{chip['board_name']} ({port_name})",
            "hardware_id": f"USB VID:PID={vid.upper()}:{pid.upper()} SER=DC-IN-2026-ESP32",
            "vid": vid,
            "pid": pid,
            "manufacturer": chip["manufacturer"],
            "serial_number": "DC-LAB-DEMO-01",
            "is_detected": True,
            "is_simulated": True,
            "confidence": 1.0,
            "match_source": "hardware_simulation",
            "chip": dict(chip),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "status": "ready"
        }

    def _identify_chip(
        self,
        vid_hex: Optional[str],
        pid_hex: Optional[str],
        description: str,
        hwid: str,
        manufacturer: str
    ) -> tuple[Optional[Dict[str, Any]], float, str]:
        """
        Classifies connected hardware based on USB VID/PID, Windows description,
        and hardware identification strings.
        """
        desc_lower = description.lower()
        hwid_lower = hwid.lower()
        mfg_lower = manufacturer.lower()

        # 1. Exact VID:PID match
        if vid_hex and pid_hex:
            key = (vid_hex, pid_hex)
            if key in USB_SIGNATURES:
                sig = USB_SIGNATURES[key]
                chip_id = sig["chip_id"]
                chip = KNOWN_CHIPS.get(chip_id)
                if chip:
                    res = dict(chip)
                    res["usb_hint"] = sig["chip_hint"]
                    return res, sig["confidence"], "usb_vid_pid_signature"

        # 2. Extract VID/PID from HWID string if not parsed by driver
        vid_match = re.search(r'vid_([0-9a-f]{4})', hwid_lower)
        pid_match = re.search(r'pid_([0-9a-f]{4})', hwid_lower)
        if vid_match and pid_match:
            v = vid_match.group(1)
            p = pid_match.group(1)
            key = (v, p)
            if key in USB_SIGNATURES:
                sig = USB_SIGNATURES[key]
                chip_id = sig["chip_id"]
                chip = KNOWN_CHIPS.get(chip_id)
                if chip:
                    res = dict(chip)
                    res["usb_hint"] = sig["chip_hint"]
                    return res, sig["confidence"], "hwid_regex_match"

        # 3. String & Heuristic matching on Description / Manufacturer
        if "digicomp" in desc_lower or "digicomp" in mfg_lower:
            if "rp2350" in desc_lower:
                return KNOWN_CHIPS["rp2350"], 0.95, "description_brand"
            if "ch32v" in desc_lower or "risc-v" in desc_lower:
                return KNOWN_CHIPS["ch32v006"], 0.95, "description_brand"
            if "fpga" in desc_lower or "artix" in desc_lower:
                return KNOWN_CHIPS["artix7-fpga"], 0.95, "description_brand"
            if "bms" in desc_lower:
                return KNOWN_CHIPS["bms-16s"], 0.95, "description_brand"
            return KNOWN_CHIPS["esp32-s3"], 0.90, "description_brand"

        if "esp32-s3" in desc_lower or "esp32s3" in desc_lower:
            return KNOWN_CHIPS["esp32-s3"], 0.90, "description_keyword"
        if "esp32" in desc_lower or "espressif" in mfg_lower:
            return KNOWN_CHIPS["esp32-s3"], 0.80, "description_keyword"

        if "rp2350" in desc_lower:
            return KNOWN_CHIPS["rp2350"], 0.95, "description_keyword"
        if "rp2040" in desc_lower or "raspberry pi" in mfg_lower or "pico" in desc_lower:
            return KNOWN_CHIPS["rp2040"], 0.85, "description_keyword"

        if "wch-link" in desc_lower:
            return KNOWN_CHIPS["ch32v006"], 0.95, "description_keyword"
        if "ch340" in desc_lower or "ch341" in desc_lower or "ch343" in desc_lower or "ch9102" in desc_lower:
            return KNOWN_CHIPS["esp32-s3"], 0.70, "bridge_ch340"

        if "cp210" in desc_lower or "silicon labs" in mfg_lower:
            return KNOWN_CHIPS["esp32-s3"], 0.75, "bridge_cp210x"

        if "arduino uno" in desc_lower or "uno r3" in desc_lower or "arduino" in mfg_lower:
            return KNOWN_CHIPS["arduino-uno"], 0.85, "description_keyword"

        if "ft232" in desc_lower or "ftdi" in mfg_lower:
            return KNOWN_CHIPS["esp32-s3"], 0.65, "bridge_ftdi"

        if "usb serial" in desc_lower or "serial port" in desc_lower:
            return KNOWN_CHIPS["esp32-s3"], 0.50, "generic_usb_serial"

        return None, 0.0, "unknown"

    def interrogate_port(self, port_name: str, baud: int = 115200, timeout: float = 0.8) -> Dict[str, Any]:
        """
        Attempts a safe, low-level serial handshake to interrogate the connected chip.
        """
        if not HAS_PYSERIAL:
            return {"success": False, "error": "pyserial not available"}

        res: Dict[str, Any] = {
            "port": port_name,
            "baud": baud,
            "connected": False,
            "confirmed_chip": None,
            "mac_address": None,
            "boot_log": [],
            "error": None
        }

        try:
            ser = serial.Serial(
                port=port_name,
                baudrate=baud,
                timeout=timeout,
                write_timeout=timeout
            )
        except Exception as e:
            res["error"] = f"Could not open port {port_name}: {e}"
            return res

        res["connected"] = True

        try:
            time.sleep(0.15)
            if ser.in_waiting > 0:
                raw_bytes = ser.read(min(ser.in_waiting, 512))
                try:
                    text = raw_bytes.decode("utf-8", errors="ignore").strip()
                    if text:
                        res["boot_log"].append(text[:200])
                        if "rst:0x" in text or "boot:0x" in text or "esp32" in text.lower():
                            res["confirmed_chip"] = "ESP32-S3" if "s3" in text.lower() else "ESP32"
                        elif "rp2350" in text.lower():
                            res["confirmed_chip"] = "RP2350"
                        elif "rp2040" in text.lower():
                            res["confirmed_chip"] = "RP2040"
                except Exception:
                    pass

            # ESP Bootloader Handshake
            if not res["confirmed_chip"]:
                esp_sync_cmd = bytes([
                    0xC0, 0x00, 0x08, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x07, 0x07, 0x12, 0x20
                ] + [0x55] * 32 + [0xC0])

                ser.reset_input_buffer()
                ser.dtr = False
                ser.rts = True
                time.sleep(0.05)
                ser.dtr = True
                ser.rts = False
                time.sleep(0.05)
                ser.dtr = False

                ser.write(esp_sync_cmd)
                time.sleep(0.1)

                if ser.in_waiting > 0:
                    reply = ser.read(ser.in_waiting)
                    if len(reply) >= 4 and 0xC0 in reply:
                        res["confirmed_chip"] = "ESP32-S3"
                        res["protocol"] = "esptool_slip_sync"

            # Arduino Optiboot / STK500 Sync Probe
            if not res["confirmed_chip"]:
                ser.reset_input_buffer()
                ser.dtr = True
                time.sleep(0.05)
                ser.dtr = False
                time.sleep(0.1)

                ser.write(bytes([0x30, 0x20]))
                time.sleep(0.1)
                if ser.in_waiting >= 2:
                    stk_reply = ser.read(2)
                    if stk_reply == bytes([0x14, 0x10]):
                        res["confirmed_chip"] = "ATmega328P"
                        res["protocol"] = "stk500_v1"

            # REPL probe for MicroPython/CircuitPython
            if not res["confirmed_chip"]:
                ser.write(b"\r\n\x03\x03")
                time.sleep(0.05)
                ser.write(b"import sys; print('CHIP:' + sys.platform)\r\n")
                time.sleep(0.1)
                if ser.in_waiting > 0:
                    reply_text = ser.read(ser.in_waiting).decode("utf-8", errors="ignore")
                    if "CHIP:" in reply_text:
                        matched = reply_text.split("CHIP:")[1].split()[0]
                        res["confirmed_chip"] = matched
                        res["protocol"] = "micropython_repl"

        except Exception as e:
            res["error"] = str(e)
        finally:
            try:
                ser.close()
            except Exception:
                pass

        res["success"] = res["confirmed_chip"] is not None or len(res["boot_log"]) > 0
        return res

    def _update_event_history(self, current_devices: List[Dict[str, Any]]):
        """Maintains an audit trail of hot-plug connect/disconnect events."""
        current_port_set = {d["port"] for d in current_devices}

        # Newly connected
        for port in current_port_set - self._monitored_ports:
            dev = next((d for d in current_devices if d["port"] == port), None)
            chip_name = dev["chip"]["chip_name"] if dev and dev.get("chip") else "Unknown Device"
            self._event_history.append({
                "event": "device_connected",
                "port": port,
                "chip": chip_name,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "device": dev
            })
            logger.info(f"⚡ Hardware Connected: {port} -> {chip_name}")

        # Disconnected
        for port in self._monitored_ports - current_port_set:
            self._event_history.append({
                "event": "device_disconnected",
                "port": port,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            })
            logger.info(f"🔌 Hardware Disconnected: {port}")

        self._monitored_ports = current_port_set
        if len(self._event_history) > 50:
            self._event_history = self._event_history[-50:]

    def get_events(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self._event_history)

    def get_known_catalog(self) -> List[Dict[str, Any]]:
        """Returns the list of all supported Digicomp development boards and chips."""
        return [self.to_hardware_device_format(c) for c in KNOWN_CHIPS.values()]

    @staticmethod
    def to_hardware_device_format(chip: Dict[str, Any]) -> Dict[str, Any]:
        """Transforms internal chip dictionary to the standard frontend HardwareDevice interface."""
        return {
            "id": chip["chip_id"],
            "name": chip["board_name"],
            "sku": chip.get("sku", f"DC-{chip['chip_id'].upper()}"),
            "description": f"{chip['chip_name']} ({chip['architecture']} @ {chip['clock_speed']}). {chip['features'][0]}",
            "mcu": chip["chip_name"],
            "clockSpeed": chip["clock_speed"],
            "flashMemory": chip["flash_bytes"],
            "sram": chip["sram_bytes"],
            "operatingVoltage": chip["operating_voltage"],
            "defaultBaud": chip["recommended_baud"],
            "supportedBauds": chip["supported_bauds"],
            "icon": chip["icon"],
            "pinout": chip.get("pinout", []),
            "defaultFiles": chip.get("default_files", {}),
            "features": chip.get("features", []),
            "safetyNotes": chip.get("safety_notes", "")
        }


# Singleton detector instance
detector = HardwareDetector()
