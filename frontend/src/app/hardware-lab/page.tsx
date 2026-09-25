'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Play,
  Hammer,
  Save,
  Usb,
  Cpu,
  FolderTree,
  FileCode,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Terminal as TerminalIcon,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Sliders,
  Send,
  Sparkles,
  Download,
  Search,
  Code2,
  BookOpen,
  Keyboard,
  RotateCcw,
  Zap,
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowLeft,
  Radio,
} from 'lucide-react';
import { HardwareDevice, ProblemMarker, CompilationResult } from '@/types/hardware';
import { HARDWARE_DEVICES } from '@/app/api/hardware/devices/route';

// Dynamically import Monaco Editor to ensure it only loads client-side
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0B0F17] text-slate-400">
      <div className="flex items-center gap-3">
        <Cpu className="w-5 h-5 text-[#FF6D33] animate-spin" />
        <span className="text-sm font-mono text-slate-300">Loading DigiComp Hardware Lab Monaco Editor...</span>
      </div>
    </div>
  ),
});

type TabType = 'output' | 'problems' | 'serial';
type SideTab = 'files' | 'specs' | 'safety';

// Standard hardware project presets matching official Digicomp products
const EXAMPLE_PRESETS: Array<{
  id: string;
  name: string;
  deviceId: string;
  description: string;
  files: Record<string, string>;
}> = [
  {
    id: 'esp32s3-radiant-glow',
    name: '✨ ESP32-S3 Light Glow & Breathing Pulse',
    deviceId: 'esp32-s3',
    description: 'Smooth sinusoidal breathing glow & high-radiance light for ESP32-S3 (GPIO 48 & GPIO 2).',
    files: {
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
    id: 'esp32s3-rgb-neopixel',
    name: 'ESP32-S3 Neopixel RGB LED',
    deviceId: 'esp32-s3',
    description: 'Onboard WS2812 Neopixel pulse demo on GPIO 48 matching docs.digicomp.app.',
    files: {
      'main.cpp': `// Digicomp Technologies - ESP32-S3 WS2812 Neopixel RGB LED
// Target: Digicomp ESP32-S3 Dev Board (SKU: DC-ESP32S3-01)
// Documentation: https://docs.digicomp.app/boards/esp32-s3/neopixel
#include <Arduino.h>
#include "config.h"

int hue = 0;

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(NEOPIXEL_PIN, OUTPUT);
  delay(500);

  Serial.println("==================================================");
  Serial.println("  ⚡ DIGICOMP ESP32-S3 NEOPIXEL RGB CONTROLLER    ");
  Serial.println("==================================================");
  Serial.println("MCU: Xtensa LX7 Dual-Core 240MHz | 8MB PSRAM");
  Serial.println("RGB LED GPIO: 48 | Color Sequence: Saffron -> Cyan -> Magenta");
}

void loop() {
  // Saffron Pulse
  Serial.println("[ESP32-S3] Status RGB: #FF6D33 Saffron Pulse");
  digitalWrite(NEOPIXEL_PIN, HIGH);
  delay(PULSE_DELAY_MS);

  digitalWrite(NEOPIXEL_PIN, LOW);
  delay(PULSE_DELAY_MS);
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define NEOPIXEL_PIN 48
#define BAUD_RATE 115200
#define PULSE_DELAY_MS 600

#endif // CONFIG_H
`,
    },
  },
  {
    id: 'esp32s3-ldr-servo',
    name: 'ESP32-S3 LDR Light & PWM',
    deviceId: 'esp32-s3',
    description: 'Light sensor ADC + 500Hz LED PWM + 50Hz Servo from digicomp-app/temp.',
    files: {
      'main.cpp': `// Digicomp Technologies - LDR Sensor + Dynamic PWM LED
// Source: digicomp-app/temp/main.py (ESP32-S3 MicroPython / C++ port)
#include <Arduino.h>
#include "config.h"

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(PWM_LED_PIN, OUTPUT);
  pinMode(LDR_ADC_PIN, INPUT);

  Serial.println("==================================================");
  Serial.println("  Digicomp ESP32-S3 Light Sensor & PWM System     ");
  Serial.println("==================================================");
}

void loop() {
  int rawLdr = analogRead(LDR_ADC_PIN); // 0 (Bright) to 4095 (Dark)
  float darknessRatio = (float)rawLdr / 4095.0f;
  int pwmDuty = (int)(darknessRatio * 255);

  analogWrite(PWM_LED_PIN, pwmDuty);

  Serial.print("[LDR Telemetry] Raw ADC: ");
  Serial.print(rawLdr);
  Serial.print(" | Darkness: ");
  Serial.print(darknessRatio * 100.0f, 1);
  Serial.print("% | PWM Duty: ");
  Serial.println(pwmDuty);

  delay(400);
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define LDR_ADC_PIN 4      // ADC1_CH3 on Digicomp ESP32-S3
#define PWM_LED_PIN 2      // Onboard status LED
#define SERVO_PIN   6      // 50Hz Servo PWM
#define BAUD_RATE   115200

#endif // CONFIG_H
`,
    },
  },
  {
    id: 'bms16s-balancer',
    name: 'Digicomp 16S Smart BMS Monitor',
    deviceId: 'digicomp-bms16s',
    description: 'Battery pack active cell balancing and telemetry from digicomp_bms.h.',
    files: {
      'main.cpp': `// Digicomp Technologies - 16S Battery Management System (BMS)
// Production Firmware Interface: digicomp_bms.h
#include <Arduino.h>
#include "config.h"

float cellVoltages[16];

void setup() {
  Serial.begin(BAUD_RATE);
  Serial.println("==================================================");
  Serial.println("  ⚡ DIGICOMP 16S SMART BMS TELEMETRY ENGINE       ");
  Serial.println("==================================================");
  Serial.println("Scalable Range: 1S to 16S Li-Ion / LiFePO4");
  Serial.println("Active Cell Balancer: ONLINE");
  Serial.println("CAN Bus & Bluetooth BLE: BROADCASTING");
}

void loop() {
  float packVoltage = 0.0f;
  for (int i = 0; i < 16; i++) {
    cellVoltages[i] = 3.65f + ((float)(random(-15, 15)) / 1000.0f);
    packVoltage += cellVoltages[i];
  }

  Serial.print("[BMS 16S] Pack: ");
  Serial.print(packVoltage, 2);
  Serial.print(" V | Cell 1: ");
  Serial.print(cellVoltages[0], 3);
  Serial.print(" V | Cell 16: ");
  Serial.print(cellVoltages[15], 3);
  Serial.println(" V | Balancing: ACTIVE (Delta < 15mV)");

  delay(1000);
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define CELL_COUNT 16
#define OVP_THRESHOLD 4.25f
#define UVP_THRESHOLD 2.80f
#define BAUD_RATE 115200

#endif // CONFIG_H
`,
    },
  },
  {
    id: 'rp2350-heartbeat',
    name: 'RP2350 Dual-Core Heartbeat',
    deviceId: 'rp2350',
    description: 'ARM Cortex-M33 + Hazard3 RISC-V dual architecture pulse.',
    files: {
      'main.cpp': `// Digicomp RP2350 Dual-Core Telemetry
#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  pinMode(25, OUTPUT);
  Serial.println("Digicomp RP2350: Dual-Core 150MHz Engine Ready.");
}

void loop() {
  digitalWrite(25, HIGH);
  Serial.println("[RP2350 Core 0] Status: ACTIVE | Saffron Pulse");
  delay(500);
  digitalWrite(25, LOW);
  delay(500);
}
`,
      'config.h': `#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN 25\n#endif\n`,
    },
  },
  {
    id: 'arduino-uno-blink',
    name: 'Arduino Uno R3 Basic Blink',
    deviceId: 'arduino-uno',
    description: 'Classic ATmega328P 16MHz blink demo.',
    files: {
      'main.cpp': `// Digicomp Hardware Lab - Arduino Uno R3 Basic Blink\n#include <Arduino.h>\nvoid setup() { pinMode(13, OUTPUT); Serial.begin(9600); }\nvoid loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }\n`,
      'config.h': `#ifndef CONFIG_H\n#define CONFIG_H\n#define LED_PIN 13\n#endif\n`,
    },
  },
];

export default function HardwareLabPage() {
  // Device & Project State
  const [devices, setDevices] = useState<HardwareDevice[]>(HARDWARE_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('esp32-s3');
  const [files, setFiles] = useState<Record<string, string>>(HARDWARE_DEVICES[0].defaultFiles);
  const [activeFileName, setActiveFileName] = useState<string>('main.cpp');
  const [isModified, setIsModified] = useState<boolean>(false);
  const [newFilePrompt, setNewFilePrompt] = useState<boolean>(false);
  const [newFileNameInput, setNewFileNameInput] = useState<string>('');

  // UI Panels State
  const [leftTab, setLeftTab] = useState<SideTab>('files');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [pinSearchQuery, setPinSearchQuery] = useState<string>('');
  const [pinTypeFilter, setPinTypeFilter] = useState<string>('all');
  const [bottomTab, setBottomTab] = useState<TabType>('output');
  const [isBottomOpen, setIsBottomOpen] = useState<boolean>(true);
  const [bottomHeight, setBottomHeight] = useState<number>(240);
  const [checkedSafetyRules, setCheckedSafetyRules] = useState<Record<string, boolean>>({
    voltage: false,
    resistors: false,
    motor: false,
    power: false,
    shortCircuit: false,
  });

  // Editor cursor position tracker
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  // Compilation & Execution State
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [problems, setProblems] = useState<ProblemMarker[]>([]);
  const [outputLogs, setOutputLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] DigiComp Hardware Code Lab initialized.`,
    `[${new Date().toLocaleTimeString()}] Select code or template and click 'Compile' or 'Run'.`,
  ]);

  // Web Serial & Hardware State
  const [serialSupported, setSerialSupported] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [connectedPortName, setConnectedPortName] = useState<string>('');
  const [selectedBaud, setSelectedBaud] = useState<number>(HARDWARE_DEVICES[0]?.defaultBaud || 115200);
  const [serialLogs, setSerialLogs] = useState<Array<{ text: string; time: string; type: 'in' | 'out' | 'sys' }>>([]);
  const [serialInput, setSerialInput] = useState<string>('');
  const [autoScrollSerial, setAutoScrollSerial] = useState<boolean>(true);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(true);

  // Modals & Dialogs
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Hardware Auto-Detection Engine State
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectedChipInfo, setDetectedChipInfo] = useState<any>(null);
  const [lastDetectedSignature, setLastDetectedSignature] = useState<string>('');

  // References
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);
  const serialOutputEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  // Show Toast helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 3500);
  }, []);

  // Hardware Auto-Detection Handler
  const checkHardwareAutoDetect = useCallback(
    async (isManualTrigger = false, simulateId?: string) => {
      try {
        setIsDetecting(true);
        const query = simulateId ? `?simulate=${simulateId}` : '';
        const res = await fetch(`/api/hardware/detect${query}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.detected && data.primary_device) {
          const dev = data.primary_device;
          const chip = dev.chip;
          const sig = `${dev.port}_${chip?.chip_id || dev.vid || 'chip'}`;

          // Avoid resetting if already on this port/chip signature unless manually requested
          if (sig !== lastDetectedSignature || isManualTrigger) {
            setLastDetectedSignature(sig);
            setDetectedChipInfo(dev);

            // Match catalog device
            const matchedDev =
              devices.find((d) => d.id === chip?.chip_id) ||
              devices.find((d) => chip?.chip_name && d.name.toLowerCase().includes(chip.chip_name.toLowerCase())) ||
              devices.find((d) => d.id === 'esp32-s3') ||
              devices[0];

            if (matchedDev && matchedDev.id !== selectedDeviceId) {
              setSelectedDeviceId(matchedDev.id);
              setSelectedBaud(matchedDev.defaultBaud);
              setFiles(matchedDev.defaultFiles);
              setActiveFileName('main.cpp');
              setIsModified(false);
              setProblems([]);
              setCompilationResult(null);
            }

            setConnectionStatus('connected');
            const portName = `${dev.port} (${chip?.chip_name || 'USB Chip'})`;
            setConnectedPortName(portName);

            showToast(`⚡ Auto-detected ${chip?.chip_name || 'Hardware'} on ${dev.port}`, 'success');

            setOutputLogs((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] ⚡ HARDWARE AUTO-DETECTED: ${chip?.board_name || dev.description}`,
              `[${new Date().toLocaleTimeString()}] Port: ${dev.port} | Silicon: ${chip?.chip_name || 'Generic'} | Logic: ${chip?.operating_voltage || '3.3V'}`,
              `[${new Date().toLocaleTimeString()}] Board profile loaded: ${matchedDev?.name}. Ready to build & program!`,
            ]);

            setSerialLogs((prev) => [
              ...prev,
              {
                text: `--- Auto-detected hardware device: ${chip?.board_name || 'Board'} on ${dev.port} ---`,
                time: new Date().toLocaleTimeString(),
                type: 'sys',
              },
            ]);
          }
        } else {
          // If a physical board was previously auto-detected and is now no longer present:
          if (lastDetectedSignature && !lastDetectedSignature.includes('Virtual') && !serialPortRef.current) {
            setLastDetectedSignature('');
            setDetectedChipInfo(null);
            setConnectionStatus('disconnected');
            setConnectedPortName('');
            setOutputLogs((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] 🔌 Hardware disconnected: USB device was unplugged.`,
            ]);
            setSerialLogs((prev) => [
              ...prev,
              { text: '--- Hardware device disconnected from USB port ---', time: new Date().toLocaleTimeString(), type: 'sys' },
            ]);
            showToast('USB hardware device disconnected', 'info');
          } else if (isManualTrigger) {
            showToast('Scan complete: No USB microcontroller detected. Plug in your board via USB.', 'info');
          }
        }
      } catch (err) {
        if (isManualTrigger) {
          showToast('Detector scanner: Ensure backend is running.', 'error');
        }
      } finally {
        setIsDetecting(false);
      }
    },
    [devices, selectedDeviceId, lastDetectedSignature, showToast]
  );

  // Background Auto-Detection: Polls hardware detector every 3.5 seconds
  useEffect(() => {
    checkHardwareAutoDetect(false);
    const interval = setInterval(() => {
      checkHardwareAutoDetect(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [checkHardwareAutoDetect]);

  // Native Web Serial Plug/Unplug Event Listeners
  useEffect(() => {
    if (typeof window === 'undefined' || !('serial' in navigator)) return;

    const nav = navigator as any;
    const handleConnectEvent = () => {
      showToast('USB hardware device plugged in. Auto-detecting...', 'info');
      checkHardwareAutoDetect(true);
    };

    const handleDisconnectEvent = () => {
      showToast('USB hardware device disconnected.', 'info');
      setConnectionStatus('disconnected');
      setConnectedPortName('');
      setDetectedChipInfo(null);
      setLastDetectedSignature('');
      setSerialLogs((prev) => [
        ...prev,
        { text: '--- Hardware device disconnected from USB port ---', time: new Date().toLocaleTimeString(), type: 'sys' },
      ]);
    };

    nav.serial.addEventListener('connect', handleConnectEvent);
    nav.serial.addEventListener('disconnect', handleDisconnectEvent);

    return () => {
      nav.serial.removeEventListener('connect', handleConnectEvent);
      nav.serial.removeEventListener('disconnect', handleDisconnectEvent);
    };
  }, [checkHardwareAutoDetect, showToast]);

  // Check Web Serial support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serial' in navigator) {
      setSerialSupported(true);
    }
  }, []);

  // Load devices on mount
  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('/api/hardware/devices');
        if (res.ok) {
          const data = await res.json();
          if (data.devices && Array.isArray(data.devices)) {
            setDevices(data.devices);
          }
        }
      } catch (err) {
        console.warn('Using local hardware devices fallback:', err);
      }
    }
    fetchDevices();
  }, []);

  // Auto-scroll serial monitor
  useEffect(() => {
    if (autoScrollSerial && serialOutputEndRef.current) {
      serialOutputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLogs, autoScrollSerial]);

  // Handle device change
  const handleDeviceChange = (newDeviceId: string) => {
    if (newDeviceId === selectedDeviceId) return;

    const newDev = devices.find((d) => d.id === newDeviceId);
    if (!newDev) return;

    setSelectedDeviceId(newDeviceId);
    setSelectedBaud(newDev.defaultBaud);
    setFiles(newDev.defaultFiles);
    setActiveFileName('main.cpp');
    setIsModified(false);
    setProblems([]);
    setCompilationResult(null);

    setOutputLogs([
      `[${new Date().toLocaleTimeString()}] Target switched to ${newDev.name} (${newDev.sku})`,
      `[${new Date().toLocaleTimeString()}] Clock: ${newDev.clockSpeed} | Flash: ${(newDev.flashMemory / 1024).toFixed(0)} KB | SRAM: ${(newDev.sram / 1024).toFixed(0)} KB`,
      `[${new Date().toLocaleTimeString()}] Loaded default hardware template. Press 'Compile' or Ctrl+Enter to build.`,
    ]);

    showToast(`Switched target to ${newDev.name}`, 'info');
  };

  // Load project preset example
  const handleLoadPreset = (presetId: string) => {
    if (presetId.startsWith('simulate-')) {
      const chipId = presetId.replace('simulate-', '');
      checkHardwareAutoDetect(true, chipId);
      return;
    }

    const preset = EXAMPLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (preset.deviceId !== selectedDeviceId) {
      setSelectedDeviceId(preset.deviceId);
      const dev = devices.find((d) => d.id === preset.deviceId);
      if (dev) setSelectedBaud(dev.defaultBaud);
    }

    setFiles(preset.files);
    setActiveFileName('main.cpp');
    setIsModified(false);
    setProblems([]);
    setCompilationResult(null);

    setOutputLogs([
      `[${new Date().toLocaleTimeString()}] Loaded example preset: '${preset.name}'`,
      `[${new Date().toLocaleTimeString()}] ${preset.description}`,
      `[${new Date().toLocaleTimeString()}] Press 'Compile' or 'Run' to verify on target hardware.`,
    ]);
    showToast(`Loaded '${preset.name}'`, 'success');
  };

  // Reset current files to device defaults
  const handleResetWorkspace = () => {
    setFiles(selectedDevice.defaultFiles);
    setActiveFileName('main.cpp');
    setIsModified(false);
    setProblems([]);
    showToast('Reset workspace to default template', 'info');
  };

  // Monaco Editor Mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define DigiComp Dark Theme
    monaco.editor.defineTheme('digicomp-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FF7E47', fontStyle: 'bold' },
        { token: 'type', foreground: '60a5fa' },
        { token: 'identifier', foreground: 'f8fafc' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'delimiter', foreground: '94a3b8' },
      ],
      colors: {
        'editor.background': '#0b0f17',
        'editor.foreground': '#f8fafc',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#FF6D33',
        'editor.lineHighlightBackground': '#161b2288',
        'editor.selectionBackground': '#FF6D3333',
        'editorCursor.foreground': '#FF6D33',
        'editorWhitespace.foreground': '#334155',
        'editorWidget.background': '#161b22',
        'editorWidget.border': '#30363d',
      },
    });

    monaco.editor.setTheme('digicomp-dark');

    // Track cursor movement for status bar
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });

    // Register Ctrl+S save hotkey
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Register Ctrl+Enter compile hotkey
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleCompile('compile');
    });

    // Register Ctrl+Shift+Enter run hotkey
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      handleCompile('run');
    });

    // F1 Help Modal
    editor.addCommand(monaco.KeyCode.F1, () => {
      setShowShortcutsModal((prev) => !prev);
    });
  };

  // Sync Problems to Monaco Markers
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;

    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const currentFileProblems = problems.filter((p) => p.file === activeFileName);

    const markers = currentFileProblems.map((p) => ({
      severity: p.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
      startLineNumber: p.line,
      startColumn: p.column,
      endLineNumber: p.line,
      endColumn: p.column + 10,
      message: p.message,
    }));

    monaco.editor.setModelMarkers(model, 'digicomp-compiler', markers);
  }, [problems, activeFileName]);

  // Save handler
  const handleSave = () => {
    setIsModified(false);
    showToast(`Saved workspace: ${activeFileName}`, 'success');
  };

  // Format document
  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      showToast('Document formatted', 'info');
    }
  };

  // Compilation & Run Execution
  const handleCompile = async (action: 'compile' | 'run' = 'compile') => {
    setIsCompiling(true);
    setBottomTab('output');
    setIsBottomOpen(true);

    const startMsg = action === 'run'
      ? `[${new Date().toLocaleTimeString()}] Building and launching verification simulation on ${selectedDevice.name}...`
      : `[${new Date().toLocaleTimeString()}] Compiling sketch for ${selectedDevice.name} (${selectedDevice.mcu})...`;

    setOutputLogs((prev) => [...prev, '', startMsg]);

    try {
      const res = await fetch('/api/hardware/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDeviceId,
          files,
          action,
        }),
      });

      const data: CompilationResult = await res.json();
      setCompilationResult(data);
      setProblems(data.problems || []);

      if (data.success) {
        setOutputLogs((prev) => [
          ...prev,
          data.stdout,
          `[${new Date().toLocaleTimeString()}] Status: ${data.message} (${data.buildTimeMs} ms)`,
        ]);
        showToast(action === 'run' ? 'Simulation finished successfully' : 'Compilation successful', 'success');

        // If action is 'run', also extract serial simulation output and pipe to Serial Monitor
        if (action === 'run' && data.stdout.includes('--- Simulation Execution Output')) {
          const simOutput = data.stdout.split('--- Simulation Execution Output (3 cycles) ---\n')[1];
          if (simOutput) {
            const rawLines = simOutput.split('\n');
            const newSerialLogs = rawLines
              .map((l) => l.trim())
              .filter((l) => l.length > 0)
              .map((l) => ({
                text: l,
                time: new Date().toLocaleTimeString(),
                type: 'in' as const,
              }));

            setSerialLogs((prev) => [
              ...prev,
              { text: `--- [SIMULATION] Launched firmware on ${selectedDevice.name} ---`, time: new Date().toLocaleTimeString(), type: 'sys' },
              ...newSerialLogs,
              { text: `--- [SIMULATION] Execution cycle completed ---`, time: new Date().toLocaleTimeString(), type: 'sys' },
            ]);
            setBottomTab('serial');
          }
        }
      } else {
        setOutputLogs((prev) => [
          ...prev,
          data.stderr || data.stdout,
          `[${new Date().toLocaleTimeString()}] Build failed: ${data.message}`,
        ]);
        setBottomTab('problems');
        showToast(data.message, 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during compilation';
      setOutputLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Server error: ${msg}`,
      ]);
      showToast(msg, 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  // Jump to error line
  const handleJumpToProblem = (p: ProblemMarker) => {
    if (p.file && files[p.file] && p.file !== activeFileName) {
      setActiveFileName(p.file);
    }
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(p.line);
        editorRef.current.setPosition({ lineNumber: p.line, column: p.column });
        editorRef.current.focus();
      }
    }, 50);
  };

  // File management
  const handleCreateFile = () => {
    const rawName = newFileNameInput.trim();
    if (!rawName) return;

    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '');
    if (!safeName) return;

    if (files[safeName]) {
      showToast(`File ${safeName} already exists`, 'error');
      return;
    }

    const defaultContent = safeName.endsWith('.h')
      ? `#ifndef ${safeName.replace('.', '_').toUpperCase()}\n#define ${safeName.replace('.', '_').toUpperCase()}\n\n// Add hardware header declarations\n\n#endif // ${safeName.replace('.', '_').toUpperCase()}\n`
      : `// ${safeName}\n\n`;

    setFiles((prev) => ({ ...prev, [safeName]: defaultContent }));
    setActiveFileName(safeName);
    setNewFileNameInput('');
    setNewFilePrompt(false);
    showToast(`Created ${safeName}`, 'success');
  };

  const handleDeleteFile = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileName === 'main.cpp') {
      showToast('Cannot delete main entry file main.cpp', 'error');
      return;
    }

    const updated = { ...files };
    delete updated[fileName];
    setFiles(updated);

    if (activeFileName === fileName) {
      setActiveFileName('main.cpp');
    }
    showToast(`Deleted ${fileName}`, 'info');
  };

  // Real Web Serial Connection
  const handleConnectDevice = async () => {
    if (connectionStatus === 'connected') {
      // Disconnect
      try {
        if (serialReaderRef.current) {
          await serialReaderRef.current.cancel();
        }
        if (serialPortRef.current) {
          await serialPortRef.current.close();
        }
      } catch (err) {
        console.warn('Error during disconnect:', err);
      } finally {
        serialPortRef.current = null;
        serialReaderRef.current = null;
        setConnectionStatus('disconnected');
        setConnectedPortName('');
        setSerialLogs((prev) => [
          ...prev,
          { text: '--- Hardware device disconnected ---', time: new Date().toLocaleTimeString(), type: 'sys' },
        ]);
        showToast('Device disconnected', 'info');
      }
      return;
    }

    if (!serialSupported) {
      showToast('Web Serial API requires Google Chrome, Microsoft Edge, or Opera.', 'error');
      return;
    }

    setConnectionStatus('connecting');
    try {
      // Request serial port from the user via native browser dialog
      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: selectedBaud });

      serialPortRef.current = port;
      setConnectionStatus('connected');

      const info = port.getInfo ? port.getInfo() : {};
      const portIdentifier = info.usbVendorId
        ? `USB Board (VID: 0x${info.usbVendorId.toString(16)})`
        : 'USB Serial Port';
      setConnectedPortName(portIdentifier);

      setBottomTab('serial');
      setIsBottomOpen(true);

      setSerialLogs((prev) => [
        ...prev,
        {
          text: `--- Connected to ${portIdentifier} @ ${selectedBaud} baud ---`,
          time: new Date().toLocaleTimeString(),
          type: 'sys',
        },
      ]);
      showToast(`Connected to ${selectedDevice.name}`, 'success');

      // Start asynchronous reading loop
      readSerialStream(port);
    } catch (err: unknown) {
      console.warn('Web Serial connection rejected or failed:', err);
      setConnectionStatus('disconnected');
      setConnectedPortName('');
      const errMessage = err instanceof Error ? err.message : 'No device selected';
      if (!errMessage.toLowerCase().includes('cancel') && !errMessage.toLowerCase().includes('no port selected')) {
        showToast(`Connection failed: ${errMessage}`, 'error');
      } else {
        showToast('Device connection cancelled', 'info');
      }
    }
  };

  const readSerialStream = async (port: any) => {
    try {
      while (port.readable && connectionStatus !== 'disconnected') {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        serialReaderRef.current = reader;

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              const lines = value.split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  setSerialLogs((prev) => [
                    ...prev.slice(-499), // retain last 500 lines
                    { text: line.replace(/\r/g, ''), time: new Date().toLocaleTimeString(), type: 'in' },
                  ]);
                }
              }
            }
          }
        } catch (error) {
          console.warn('Serial reader error:', error);
        } finally {
          reader.releaseLock();
          await readableStreamClosed.catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Serial pipe error:', err);
    }
  };

  // Send Serial command
  const handleSendSerial = async (customCommand?: string) => {
    const textToSend = (customCommand || serialInput).trim();
    if (!textToSend) return;

    if (connectionStatus !== 'connected' || !serialPortRef.current?.writable) {
      const lower = textToSend.toLowerCase();
      let response = `[${selectedDevice.name}] Received: "${textToSend}" (ACK)`;
      if (lower === 'ping') {
        response = `[${selectedDevice.name}] PONG! Core 0 & Core 1 active @ ${selectedDevice.clockSpeed}`;
      } else if (lower === 'status') {
        response = `[${selectedDevice.name}] Status: ACTIVE | MCU: ${selectedDevice.mcu} | Logic: ${selectedDevice.operatingVoltage} | Baud: ${selectedBaud}`;
      } else if (lower === 'help') {
        response = `[${selectedDevice.name}] Commands: PING, STATUS, HELP, RESET, READ_ADC, PIN_MAP`;
      } else if (lower === 'reset') {
        response = `[${selectedDevice.name}] System soft-reset triggered. Bootloader v2.4 ready.`;
      } else if (lower === 'read_adc' || lower === 'adc') {
        response = `[${selectedDevice.name}] ADC Channel 0: 2480 (${((2480 / 4095.0) * 3.3).toFixed(2)}V)`;
      } else if (lower === 'pin_map') {
        response = `[${selectedDevice.name}] Pins: ${selectedDevice.pinout.slice(0, 6).map((p) => p.pin).join(', ')}...`;
      }

      setSerialLogs((prev) => [
        ...prev,
        { text: `> ${textToSend}`, time: new Date().toLocaleTimeString(), type: 'out' },
        {
          text: response,
          time: new Date().toLocaleTimeString(),
          type: 'in',
        },
      ]);
      if (!customCommand) setSerialInput('');
      return;
    }

    try {
      const writer = serialPortRef.current.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(textToSend + '\n'));
      writer.releaseLock();

      setSerialLogs((prev) => [
        ...prev,
        { text: `> ${textToSend}`, time: new Date().toLocaleTimeString(), type: 'out' },
      ]);
      if (!customCommand) setSerialInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to write to serial port';
      showToast(msg, 'error');
    }
  };

  // Export serial log to text file
  const handleDownloadSerialLog = () => {
    if (serialLogs.length === 0) {
      showToast('No serial logs to download', 'info');
      return;
    }
    const logContent = serialLogs
      .map((l) => `[${l.time}] [${l.type.toUpperCase()}] ${l.text}`)
      .join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digicomp-serial-${selectedDevice.id}-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded serial logs', 'success');
  };

  const getLanguage = (fileName: string): string => {
    if (fileName.endsWith('.cpp') || fileName.endsWith('.ino') || fileName.endsWith('.h')) return 'cpp';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;

  // Filtered pinout list
  const filteredPins = selectedDevice.pinout.filter((p) => {
    const matchesSearch =
      !pinSearchQuery ||
      p.pin.toLowerCase().includes(pinSearchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(pinSearchQuery.toLowerCase());
    const matchesType = pinTypeFilter === 'all' || p.type === pinTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-10 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold backdrop-blur-md transition-all border animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60 shadow-emerald-950/50'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-700/60 shadow-rose-950/50'
              : 'bg-slate-900/95 text-slate-200 border-[#FF6D33]/40 shadow-slate-950/50'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-[#FF6D33]" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#FF6D33]" />
                <h3 className="text-sm font-bold text-white">Hardware Lab Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Compile Firmware</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-[#FF6D33]">
                  Ctrl + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Run Simulation</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-[#FF6D33]">
                  Ctrl + Shift + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Save Workspace</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-[#FF6D33]">
                  Ctrl + S
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Format Code</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-[#FF6D33]">
                  Shift + Alt + F
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Toggle Command Palette</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-[#FF6D33]">
                  F1
                </kbd>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-gradient-to-r from-[#FF6D33] to-[#E3470E] hover:from-[#ff7e47] hover:to-[#eb531b] text-white rounded text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIER 1: SYSTEM TITLEBAR & CONNECTION (Height 40px, z-20) */}
      <header className="h-10 bg-[#0A0D14] border-b border-[#1E2530] px-3 flex items-center justify-between gap-3 shrink-0 z-20 select-none shadow-xs">
        {/* Left: Store Return Link + Hardware Lab Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-[#FF6D33]/15 text-slate-300 hover:text-white border border-slate-700/80 hover:border-[#FF6D33]/40 text-xs font-medium transition-all group shrink-0"
            title="Return to DigiComp Store"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#FF6D33]" />
            <img src="/images/digicomp/logo.svg" alt="DigiComp" className="w-4 h-4 object-contain" />
            <span className="font-bold text-white tracking-tight">DigiComp</span>
            <span className="text-[10px] text-[#FF6D33] font-mono">Store</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          {/* Hardware Lab Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Cpu className="w-4 h-4 text-[#FF6D33]" />
            <span className="text-xs font-bold text-white tracking-tight">Hardware Lab</span>
            <span className="px-1.5 py-0.2 bg-[#FF6D33]/15 text-[#FF6D33] text-[9px] rounded font-mono font-semibold border border-[#FF6D33]/30">
              v2.0
            </span>
          </div>
        </div>

        {/* Center: File Breadcrumb & Hardware Connection Status (Separated, Center-Aligned, Clean) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* File Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0D1117] border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500 font-semibold">{selectedDevice.id}</span>
            <span className="text-slate-600">/</span>
            <span className="text-[#FF6D33] font-semibold">{activeFileName}</span>
            {isModified && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6D33] animate-pulse ml-0.5" title="Unsaved changes" />}
          </div>

          {/* Connection Status Pill with Port & Silicon details */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-950/40'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span className="font-semibold capitalize">{connectionStatus}</span>
            {connectionStatus === 'connected' && connectedPortName && (
              <span className="font-mono text-[10px] text-slate-300">({connectedPortName})</span>
            )}
          </div>

          {detectedChipInfo?.chip && (
            <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF6D33]/15 text-[#FF6D33] text-[10px] font-mono font-bold border border-[#FF6D33]/30">
              <Zap className="w-3 h-3 text-[#FF6D33]" />
              <span>{detectedChipInfo.chip.chip_name}</span>
            </div>
          )}
        </div>

        {/* Right: Hardware Port Connectors + Docs + Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Auto-Detect Scanner Button */}
          <button
            onClick={() => checkHardwareAutoDetect(true)}
            disabled={isDetecting}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              detectedChipInfo
                ? 'bg-[#FF6D33]/20 text-[#FF6D33] border-[#FF6D33]'
                : 'bg-slate-800/90 hover:bg-[#FF6D33]/15 text-slate-300 hover:text-[#FF6D33] border-slate-700 hover:border-[#FF6D33]/40'
            }`}
            title="Scan USB bus and auto-detect microcontrollers"
          >
            <Radio className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-[#FF6D33]' : 'text-[#FF6D33]'}`} />
            <span>{isDetecting ? 'Scanning...' : detectedChipInfo ? 'Chip Detected' : 'Auto-Detect'}</span>
          </button>

          {/* Web Serial Connect / Disconnect */}
          <button
            onClick={handleConnectDevice}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              connectionStatus === 'connected'
                ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-700 shadow-xs'
                : 'bg-slate-800/90 hover:bg-[#FF6D33]/15 text-[#FF6D33] border-[#FF6D33]/40'
            }`}
            title="Connect / Disconnect USB Web Serial port"
          >
            <Usb className="w-3.5 h-3.5" />
            <span>{connectionStatus === 'connected' ? 'Disconnect' : 'Connect Device'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          {/* Docs */}
          <a
            href="https://docs.digicomp.app"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-[#FF6D33] border border-slate-700 text-xs font-medium transition-colors"
            title="Open DigiComp Official Documentation"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FF6D33]" />
            <span className="hidden sm:inline">Docs</span>
          </a>

          {/* Shortcuts Modal Trigger */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Keyboard Shortcuts (F1)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TIER 2: PRIMARY ACTION RIBBON & TOOLBAR (Height 44px, z-10) */}
      <div className="h-11 bg-[#0D1117] border-b border-[#21262D] px-3 flex items-center justify-between gap-3 shrink-0 z-10 select-none shadow-xs">
        {/* Left: Actions (Run, Compile, Save) + Selectors (Board, Presets) */}
        <div className="flex items-center gap-2 min-w-0">
          {/* RUN BUTTON: Prominent Emerald Gradient */}
          <button
            onClick={() => handleCompile('run')}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-950/50 group cursor-pointer shrink-0"
            title="Build firmware & stream simulation to Serial Monitor (Ctrl+Shift+Enter)"
          >
            {isCompiling ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
            )}
            <span>Run</span>
          </button>

          {/* COMPILE BUTTON: DigiComp Saffron Gradient */}
          <button
            onClick={() => handleCompile('compile')}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-[#FF6D33] to-[#E3470E] hover:from-[#ff7e47] hover:to-[#eb531b] active:scale-98 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm shadow-orange-950/50 group cursor-pointer shrink-0"
            title="Compile sketch and check Flash/SRAM allocation (Ctrl+Enter)"
          >
            <Hammer className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>Compile</span>
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
            title="Save workspace (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>Save</span>
          </button>

          <div className="h-5 w-px bg-slate-800 shrink-0 mx-1" />

          {/* Target Board Selector with Fixed/Max Width (Never overflows!) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">Board:</span>
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="appearance-none bg-slate-850 hover:bg-slate-800 text-white text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-md border border-slate-700 hover:border-[#FF6D33]/60 focus:outline-none focus:ring-1 focus:ring-[#FF6D33] cursor-pointer transition-colors w-[200px] sm:w-[230px] lg:w-[260px] truncate shadow-xs"
                title="Select target microcontroller development board"
              >
                {devices.map((dev) => (
                  <option key={dev.id} value={dev.id} className="bg-slate-900 text-white py-1">
                    {dev.name} ({dev.operatingVoltage})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Presets & Templates Selector with Fixed Width (Never overflows!) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-slate-400 font-semibold hidden lg:inline">Template:</span>
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadPreset(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="appearance-none bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-medium pl-2.5 pr-7 py-1.5 rounded-md border border-slate-700 hover:border-[#FF6D33]/60 focus:outline-none cursor-pointer transition-colors w-[180px] sm:w-[210px] lg:w-[240px] truncate shadow-xs"
                title="Load standard firmware presets or test chip auto-detection"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Select Code Template...
                </option>
                <optgroup label="Official Digicomp Presets" className="bg-slate-900 text-slate-400 font-semibold">
                  {EXAMPLE_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id} className="bg-slate-900 text-white py-1">
                      {preset.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="⚡ Test Chip Auto-Detection" className="bg-slate-900 text-[#FF6D33] font-semibold">
                  <option value="simulate-esp32-s3" className="bg-slate-900 text-white">
                    ⚡ Auto-Detect: Digicomp ESP32-S3 (COM3)
                  </option>
                  <option value="simulate-rp2350" className="bg-slate-900 text-white">
                    🔷 Auto-Detect: Digicomp RP2350 (COM4)
                  </option>
                  <option value="simulate-ch32v006" className="bg-slate-900 text-white">
                    ⚡ Auto-Detect: Digicomp CH32V006 (COM5)
                  </option>
                  <option value="simulate-arduino-uno" className="bg-slate-900 text-white">
                    🟩 Auto-Detect: Arduino Uno R3 (COM1)
                  </option>
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Technical Spec Badges & Utilities */}
        <div className="hidden xl:flex items-center gap-2.5 text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A0D14] border border-slate-800 text-[11px]">
            <span className="text-slate-500">MCU:</span>
            <span className="text-[#FF6D33] font-semibold">{selectedDevice.mcu}</span>
            <span className="text-slate-600">@</span>
            <span className="text-slate-300">{selectedDevice.clockSpeed}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#0A0D14] border border-slate-800 text-[11px]">
            <span className="text-slate-500">Rail:</span>
            <span className="text-emerald-400 font-semibold">{selectedDevice.operatingVoltage}</span>
          </div>

          <button
            onClick={handleFormatCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-sans transition-colors cursor-pointer"
            title="Auto-format active code (Shift+Alt+F)"
          >
            <Code2 className="w-3.5 h-3.5 text-[#FF6D33]" />
            <span>Format</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE MAIN BODY: Split Pane (Left Sidebar + Center Editor) */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT PANEL: Project Files & Hardware Specs */}
        <aside
          className={`bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-200 ease-in-out z-10 ${
            isSidebarOpen ? 'w-64' : 'w-10'
          }`}
        >
          {isSidebarOpen ? (
            <>
              {/* Sidebar Tabs */}
              <div className="flex items-center border-b border-slate-800 bg-[#0B0F17]/80 text-xs">
                <button
                  onClick={() => setLeftTab('files')}
                  className={`flex-1 py-2 px-2 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                    leftTab === 'files'
                      ? 'border-[#FF6D33] text-[#FF6D33] bg-[#FF6D33]/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Files</span>
                </button>
                <button
                  onClick={() => setLeftTab('specs')}
                  className={`flex-1 py-2 px-2 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                    leftTab === 'specs'
                      ? 'border-[#FF6D33] text-[#FF6D33] bg-[#FF6D33]/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Pinout</span>
                </button>
                <button
                  onClick={() => setLeftTab('safety')}
                  className={`flex-1 py-2 px-2 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                    leftTab === 'safety'
                      ? 'border-amber-500 text-amber-400 bg-slate-900/80'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                  title="Hardware Protection & Electrical Safety Guide"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Safety</span>
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300"
                  title="Collapse sidebar (Ctrl+B)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto min-h-0 text-xs p-2">
                {leftTab === 'files' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Project Files</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleResetWorkspace}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Reset files to board defaults"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setNewFilePrompt(true)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-[#FF6D33] transition-colors"
                          title="Add new source/header file"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline New File Form */}
                    {newFilePrompt && (
                      <div className="p-2 bg-slate-800/90 rounded border border-slate-700 space-y-2 mb-2 animate-fade-in">
                        <input
                          type="text"
                          placeholder="filename.h / .cpp"
                          value={newFileNameInput}
                          onChange={(e) => setNewFileNameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateFile();
                            if (e.key === 'Escape') setNewFilePrompt(false);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-[#FF6D33] font-mono"
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setNewFilePrompt(false)}
                            className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateFile}
                            className="px-2 py-0.5 text-[11px] bg-gradient-to-r from-[#FF6D33] to-[#E3470E] hover:from-[#ff7e47] hover:to-[#eb531b] text-white rounded font-medium"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Files List */}
                    <div className="space-y-0.5">
                      {Object.keys(files).map((fileName) => {
                        const isActive = activeFileName === fileName;
                        const isMain = fileName === 'main.cpp';

                        return (
                          <div
                            key={fileName}
                            onClick={() => setActiveFileName(fileName)}
                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-[#FF6D33]/15 text-[#FF6D33] font-medium border border-[#FF6D33]/30 shadow-xs'
                                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {fileName.endsWith('.h') ? (
                                <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : fileName.endsWith('.md') ? (
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : (
                                <FileCode className="w-3.5 h-3.5 text-[#FF6D33] shrink-0" />
                              )}
                              <span className="truncate font-mono text-[11px]">{fileName}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {problems.some((p) => p.file === fileName && p.severity === 'error') && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Contains error" />
                              )}
                              {!isMain && (
                                <button
                                  onClick={(e) => handleDeleteFile(fileName, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                                  title={`Delete ${fileName}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 px-2 space-y-1">
                      <div className="text-[10px] text-slate-500 font-mono">
                        Hardware Catalog Item: <span className="text-slate-300 font-bold">{selectedDevice.sku}</span>
                      </div>
                      <Link
                        href={`/products?search=${encodeURIComponent(selectedDevice.name)}`}
                        className="text-[11px] text-[#FF6D33] hover:text-[#ff8229] flex items-center gap-1 group font-medium"
                      >
                        <span>View {selectedDevice.name} in store</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Target Pinout & Hardware Inspector Tab */}
                {leftTab === 'specs' && (
                  <div className="space-y-3 p-1">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{selectedDevice.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({selectedDevice.sku})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{selectedDevice.description}</p>
                    </div>

                    {/* Hardware specs grid */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 p-2 rounded border border-slate-800 font-mono">
                      <div>
                        <span className="text-slate-500 block">MCU:</span>
                        <span className="text-[#FF6D33] font-bold">{selectedDevice.mcu}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Clock:</span>
                        <span className="text-white">{selectedDevice.clockSpeed}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Flash:</span>
                        <span className="text-white">{(selectedDevice.flashMemory / 1024).toFixed(0)} KB</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Logic Level:</span>
                        <span className="text-amber-400">{selectedDevice.operatingVoltage}</span>
                      </div>
                    </div>

                    {/* Pinout filter & search */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Pin Map</div>
                        <span className="text-[10px] text-slate-500">{filteredPins.length} pins</span>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search pins (e.g. PWM, A0, I2C)..."
                          value={pinSearchQuery}
                          onChange={(e) => setPinSearchQuery(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none focus:border-[#FF6D33]"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1.5" />
                      </div>

                      {/* Pin Type Filters */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                        {['all', 'digital', 'analog', 'comm', 'power'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setPinTypeFilter(type)}
                            className={`px-2 py-0.5 rounded capitalize transition-colors ${
                              pinTypeFilter === type
                                ? 'bg-[#FF6D33] text-white font-semibold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      {/* Pin items list */}
                      <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                        {filteredPins.length === 0 ? (
                          <div className="text-center py-4 text-slate-500 text-[11px]">No pins match search</div>
                        ) : (
                          filteredPins.map((p, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-950 border border-slate-850 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono font-bold text-[#FF6D33] shrink-0">{p.pin}</span>
                                <span className="text-slate-400 text-[10px] truncate" title={p.description}>
                                   {p.description}
                                </span>
                              </div>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase shrink-0 ${
                                  p.type === 'analog'
                                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                    : p.type === 'power'
                                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                    : p.type === 'comm'
                                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                    : 'bg-[#FF6D33]/15 text-[#FF6D33] border border-[#FF6D33]/30'
                                }`}
                              >
                                {p.type}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Hardware Safety & Protection Guide */}
                {leftTab === 'safety' && (
                  <div className="space-y-4 animate-fade-in pb-4">
                    {/* Header Banner */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30">
                      <div className="flex items-center gap-2 mb-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-semibold text-xs text-amber-200 uppercase tracking-wider">
                          Hardware Safety Guard
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Electrical protection engine & pre-flight checklists to protect your physical microcontrollers and sensors from permanent damage.
                      </p>
                    </div>

                    {/* Board Electrical Spec Guardrail */}
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-300">Target Logic Voltage</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            selectedDevice.operatingVoltage === '3.3V'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {selectedDevice.operatingVoltage} Level
                        </span>
                      </div>

                      {selectedDevice.operatingVoltage === '3.3V' ? (
                        <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-200 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            CRITICAL: NOT 5V TOLERANT
                          </div>
                          <p className="text-[10px] text-rose-300/90 leading-normal">
                            ESP32 GPIO inputs cannot tolerate &gt;3.6V. Connecting 5V sensors (e.g. 5V Ultrasonic Echo, 5V Arduino outputs) will permanently fry the internal silicon clamping diodes. Always use a 3.3V/5V logic level shifter or resistor voltage divider.
                          </p>
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 text-[10px] text-slate-300">
                          Operates at 5V TTL logic. Safe with standard 5V DigiComp sensors. When interfacing with 3.3V I2C/SPI modules (like ESP32 or SD cards), use level conversion.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                        <div className="p-1.5 rounded bg-slate-800/60 border border-slate-700/40">
                          <span className="text-slate-400 block text-[9px]">MAX PIN CURRENT</span>
                          <span className="font-mono text-white font-bold">
                            {selectedDevice.id.startsWith('esp32') ? '12 - 20 mA' : selectedDevice.id === 'rp2350' || selectedDevice.id === 'ch32v006' ? '8 - 12 mA' : '40 mA (20mA rec.)'}
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-800/60 border border-slate-700/40">
                          <span className="text-slate-400 block text-[9px]">CHIP TOTAL VCC</span>
                          <span className="font-mono text-white font-bold">
                            {selectedDevice.id.startsWith('esp32') ? '100 mA' : selectedDevice.id === 'rp2350' ? '50 mA' : '200 mA'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Static Analysis Violations */}
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-300">Code Static Safety Audit</span>
                        {problems.some((p) => p.message.includes('[HARDWARE')) ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Violations Found
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Code Safe
                          </span>
                        )}
                      </div>

                      {problems.filter((p) => p.message.includes('[HARDWARE')).length > 0 ? (
                        <div className="space-y-1.5">
                          {problems
                            .filter((p) => p.message.includes('[HARDWARE'))
                            .map((p, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded bg-rose-950/30 border border-rose-800/50 text-[10px] text-rose-200 space-y-1"
                              >
                                <div className="font-mono text-rose-400 font-bold flex items-center justify-between">
                                  <span>{p.file}:{p.line}</span>
                                  <span className="text-[9px] uppercase px-1 py-0.2 bg-rose-900/60 rounded">Hazard</span>
                                </div>
                                <p className="leading-snug">{p.message}</p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 leading-normal">
                          No electrical hazards, bus conflicts, or overcurrent conditions detected in the currently loaded code.
                        </p>
                      )}

                      <button
                        onClick={() => handleCompile('compile')}
                        disabled={isCompiling}
                        className="w-full mt-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <RefreshCw className={`w-3 h-3 ${isCompiling ? 'animate-spin' : ''}`} />
                        <span>Re-scan Code For Electrical Hazards</span>
                      </button>
                    </div>

                    {/* Interactive Pre-Flight Checklist */}
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-300">Pre-Power Hardware Checklist</span>
                        <span className="text-[10px] font-mono text-[#FF6D33]">
                          {Object.values(checkedSafetyRules).filter(Boolean).length}/5 Verified
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Check each physical circuit safety rule before plugging your board into USB:
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {[
                          {
                            id: 'voltage',
                            title: 'Logic Level Matched',
                            desc: selectedDevice.operatingVoltage === '3.3V'
                              ? 'Verified no 5V inputs connected to ESP32 without level shifter.'
                              : 'Verified input signals do not exceed 5V TTL level.',
                          },
                          {
                            id: 'resistors',
                            title: 'Current-Limiting Resistors',
                            desc: 'All discrete LEDs have 220Ω - 330Ω resistors in series with GPIO.',
                          },
                          {
                            id: 'motor',
                            title: 'Motor Driver Isolation',
                            desc: 'Motors, solenoids & pumps use L298N/A4988/relay, NOT direct GPIO.',
                          },
                          {
                            id: 'power',
                            title: 'External Power & Common GND',
                            desc: 'High-current loads have separate 5V supply sharing a common GND.',
                          },
                          {
                            id: 'shortCircuit',
                            title: 'No VCC-to-GND Short Circuit',
                            desc: 'Multimeter continuity check passed between power rails before plugging in.',
                          },
                        ].map((rule) => {
                          const isChecked = Boolean(checkedSafetyRules[rule.id]);
                          return (
                            <div
                              key={rule.id}
                              onClick={() =>
                                setCheckedSafetyRules((prev) => ({ ...prev, [rule.id]: !prev[rule.id] }))
                              }
                              className={`p-2 rounded border cursor-pointer transition-colors flex items-start gap-2.5 ${
                                isChecked
                                  ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200'
                                  : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/70'
                              }`}
                            >
                              <div className="mt-0.5">
                                {isChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-[11px] font-semibold ${isChecked ? 'text-emerald-300' : 'text-slate-200'}`}>
                                  {rule.title}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-normal">{rule.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pinout Cautions for Target */}
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-300">Target Specific Precautions</span>
                      {selectedDevice.id.startsWith('esp32') ? (
                        <div className="space-y-1.5 text-[10px] text-slate-300">
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">3.3V Logic Level Protection:</span>
                            Never connect signals exceeding 3.6V to GPIO pins without a logic level shifter or voltage divider.
                          </div>
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">Strapping Boot Pins:</span>
                            Avoid pulling GPIO 0, 2, 45, or 46 at boot time to prevent bootloader mode conflicts.
                          </div>
                        </div>
                      ) : selectedDevice.id === 'rp2350' || selectedDevice.id === 'ch32v006' ? (
                        <div className="space-y-1.5 text-[10px] text-slate-300">
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">3.3V Logic Level Protection:</span>
                            Operates strictly at 3.3V. Current limit is 8 - 12 mA per pin.
                          </div>
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">Boot Mode & USB:</span>
                            Hold BOOT button while plugging in USB to enter USB Mass Storage flash bootloader.
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-[10px] text-slate-300">
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">Pins 0 (RX) & 1 (TX):</span>
                            Directly connected to the USB-UART chip. Do not use for sensors/LEDs while using Serial Monitor.
                          </div>
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">Vin Pin Powering:</span>
                            Accepts 7V to 12V DC input. Do NOT feed unregulated voltage to 5V pin.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Collapsed Sidebar Strip */
            <div className="flex flex-col items-center py-2 space-y-4 text-slate-400">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Expand file tree (Ctrl+B)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(true);
                  setLeftTab('files');
                }}
                className="p-2 hover:text-sky-400 hover:bg-slate-800 rounded"
                title="Files"
              >
                <FolderTree className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(true);
                  setLeftTab('specs');
                }}
                className="p-2 hover:text-sky-400 hover:bg-slate-800 rounded"
                title="Hardware Pinout"
              >
                <Sliders className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(true);
                  setLeftTab('safety');
                }}
                className="p-2 hover:text-amber-400 hover:bg-slate-800 rounded"
                title="Hardware Safety Guard"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>

        {/* CENTER PANEL: Code Editor & Bottom Drawer */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* File Tabs Strip */}
          <div className="h-9 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center space-x-1 overflow-x-auto min-w-0 h-full">
              {Object.keys(files).map((fileName) => {
                const isActive = activeFileName === fileName;
                return (
                  <button
                    key={fileName}
                    onClick={() => setActiveFileName(fileName)}
                    className={`flex items-center gap-2 px-3 h-full text-xs font-mono transition-all border-b-2 border-r border-slate-800/80 cursor-pointer ${
                      isActive
                        ? 'bg-slate-950 text-sky-300 border-b-sky-500 font-semibold shadow-xs'
                        : 'bg-slate-900/60 text-slate-400 border-b-transparent hover:bg-slate-850/80 hover:text-slate-200'
                    }`}
                  >
                    {fileName.endsWith('.h') ? (
                      <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : fileName.endsWith('.md') ? (
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    )}
                    <span>{fileName}</span>
                    {isActive && isModified && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" title="Unsaved changes" />
                    )}
                    {problems.some((p) => p.file === fileName && p.severity === 'error') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Contains error" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Utilities on Editor Strip */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono px-2 shrink-0">
              <button
                onClick={handleFormatCode}
                className="p-1 hover:text-sky-300 hover:bg-slate-800 rounded transition-colors hidden sm:flex items-center gap-1"
                title="Auto-format active code"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Format</span>
              </button>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="hidden md:inline">{getLanguage(activeFileName).toUpperCase()}</span>
            </div>
          </div>

          {/* MONACO CODE EDITOR CANVAS */}
          <div className="flex-1 min-h-0 bg-slate-950 relative">
            <MonacoEditor
              height="100%"
              language={getLanguage(activeFileName)}
              value={files[activeFileName] || ''}
              onChange={(value) => {
                setFiles((prev) => ({ ...prev, [activeFileName]: value || '' }));
                setIsModified(true);
              }}
              onMount={handleEditorDidMount}
              options={{
                theme: 'digicomp-dark',
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                lineNumbers: 'on',
                tabSize: 2,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                wordWrap: 'off',
                formatOnPaste: true,
                suggestOnTriggerCharacters: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* BOTTOM PANEL: OUTPUT / PROBLEMS / SERIAL MONITOR */}
          <div
            className={`border-t border-slate-800 bg-slate-900 flex flex-col shrink-0 transition-all duration-150 ${
              isBottomOpen ? '' : 'h-8'
            }`}
            style={isBottomOpen ? { height: `${bottomHeight}px` } : {}}
          >
            {/* Bottom Drawer Tabs Bar */}
            <div className="h-8 bg-slate-950/80 border-b border-slate-800 px-3 flex items-center justify-between text-xs shrink-0 select-none">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setIsBottomOpen(true);
                    setBottomTab('output');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    bottomTab === 'output' && isBottomOpen
                      ? 'bg-slate-800 text-sky-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>Output</span>
                </button>

                <button
                  onClick={() => {
                    setIsBottomOpen(true);
                    setBottomTab('problems');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    bottomTab === 'problems' && isBottomOpen
                      ? 'bg-slate-800 text-sky-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Problems</span>
                  {(errorCount > 0 || warningCount > 0) && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        errorCount > 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {errorCount > 0 ? `${errorCount}E` : `${warningCount}W`}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsBottomOpen(true);
                    setBottomTab('serial');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    bottomTab === 'serial' && isBottomOpen
                      ? 'bg-slate-800 text-sky-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Usb className="w-3.5 h-3.5" />
                  <span>Serial Monitor</span>
                  {connectionStatus === 'connected' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Bottom Drawer Controls */}
              <div className="flex items-center gap-2">
                {isBottomOpen ? (
                  <>
                    <button
                      onClick={() => setBottomHeight((h) => (h < 350 ? 440 : 220))}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Resize panel height"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setIsBottomOpen(false)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Collapse bottom drawer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsBottomOpen(true)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Expand bottom drawer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Drawer Content Area */}
            {isBottomOpen && (
              <div className="flex-1 overflow-y-auto bg-slate-950 font-mono text-xs p-3">
                {/* 1. OUTPUT TAB */}
                {bottomTab === 'output' && (
                  <div className="space-y-3">
                    {/* Memory Breakdown Cards if compilation succeeded */}
                    {compilationResult?.memoryUsage && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2 font-sans">
                        <div className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">Program Storage (Flash)</span>
                            <span className="text-sky-400 font-mono">{compilationResult.memoryUsage.flashPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, compilationResult.memoryUsage.flashPercent)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {compilationResult.memoryUsage.flashUsed.toLocaleString()} /{' '}
                            {compilationResult.memoryUsage.flashTotal.toLocaleString()} bytes
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">Dynamic Memory (SRAM)</span>
                            <span className="text-emerald-400 font-mono">{compilationResult.memoryUsage.sramPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, compilationResult.memoryUsage.sramPercent)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {compilationResult.memoryUsage.sramUsed.toLocaleString()} /{' '}
                            {compilationResult.memoryUsage.sramTotal.toLocaleString()} bytes
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Output logs stream */}
                    <div className="space-y-1 leading-relaxed text-slate-300 whitespace-pre-wrap">
                      {outputLogs.map((log, index) => (
                        <div
                          key={index}
                          className={
                            log.includes('failed') || log.includes('error:')
                              ? 'text-rose-400'
                              : log.includes('successful') || log.includes('Sketch uses')
                              ? 'text-emerald-300'
                              : 'text-slate-300'
                          }
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. PROBLEMS TAB */}
                {bottomTab === 'problems' && (
                  <div>
                    {problems.length === 0 ? (
                      <div className="flex items-center gap-2 text-slate-500 py-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>No problems have been detected in the workspace.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-slate-400 pb-1 font-sans flex items-center justify-between">
                          <span>
                            {errorCount} Error(s), {warningCount} Warning(s)
                          </span>
                          <span className="text-[10px] text-slate-500">Click any issue to jump to editor line</span>
                        </div>
                        {problems.map((p, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleJumpToProblem(p)}
                            className="flex items-start gap-2.5 p-2 rounded bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-800 transition-colors group"
                          >
                            {p.severity === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-slate-200 group-hover:text-sky-300 font-mono text-xs">
                                {p.message}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {p.file} [{p.line}:{p.column}]
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SERIAL MONITOR TAB */}
                {bottomTab === 'serial' && (
                  <div className="flex flex-col h-full space-y-2">
                    {/* Serial Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 font-sans text-xs shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-xs">Baud:</span>
                          <select
                            value={selectedBaud}
                            onChange={(e) => setSelectedBaud(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5 font-mono text-xs focus:outline-none"
                          >
                            {selectedDevice.supportedBauds.map((b) => (
                              <option key={b} value={b}>
                                {b} baud
                              </option>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoScrollSerial}
                            onChange={(e) => setAutoScrollSerial(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
                          />
                          <span>Autoscroll</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showTimestamps}
                            onChange={(e) => setShowTimestamps(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
                          />
                          <span>Timestamps</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadSerialLog}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1"
                          title="Export serial logs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export Log</span>
                        </button>
                        <button
                          onClick={() => setSerialLogs([])}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Quick Command Pills */}
                    <div className="flex items-center gap-1.5 py-0.5 overflow-x-auto text-[10px] font-mono shrink-0">
                      <span className="text-slate-500 text-[10px] font-sans">Quick send:</span>
                      {['PING', 'STATUS', 'HELP', 'RESET'].map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => handleSendSerial(cmd)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 hover:text-white transition-colors"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>

                    {/* Serial Feed */}
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                      {serialLogs.length === 0 ? (
                        <div className="text-slate-500 italic py-2">
                          {connectionStatus === 'connected'
                            ? `Port open @ ${selectedBaud} baud. Waiting for incoming telemetry...`
                            : `Serial monitor idle. Click 'Connect Device' to stream live telemetry from ${selectedDevice.name}, or click 'Run' to test in simulation.`}
                        </div>
                      ) : (
                        serialLogs.map((log, index) => (
                          <div key={index} className="flex gap-2 leading-relaxed">
                            {showTimestamps && (
                              <span className="text-slate-600 select-none text-[10px]">[{log.time}]</span>
                            )}
                            <span
                              className={
                                log.type === 'sys'
                                  ? 'text-sky-400 font-bold'
                                  : log.type === 'out'
                                  ? 'text-amber-300'
                                  : 'text-emerald-300'
                              }
                            >
                              {log.text}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={serialOutputEndRef} />
                    </div>

                    {/* Serial Input Sender */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendSerial();
                      }}
                      className="flex gap-2 pt-2 border-t border-slate-800 shrink-0 font-sans"
                    >
                      <input
                        type="text"
                        placeholder="Type hardware command..."
                        value={serialInput}
                        onChange={(e) => setSerialInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM STATUS BAR (VS Code Style) */}
          <footer className="h-6 bg-slate-900 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0 select-none z-10">
            {/* Left Status Bar Items */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sky-400 font-medium font-sans">
                <Zap className="w-3 h-3 text-sky-400" />
                <span>{selectedDevice.name}</span>
                <span className="text-slate-500">({selectedDevice.mcu})</span>
              </span>

              {compilationResult?.memoryUsage && (
                <span className="hidden md:inline-flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-3">
                  <span>Flash: {compilationResult.memoryUsage.flashPercent}%</span>
                  <span>SRAM: {compilationResult.memoryUsage.sramPercent}%</span>
                </span>
              )}
            </div>

            {/* Right Status Bar Items */}
            <div className="flex items-center gap-3">
              <span>
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
              <span className="hidden sm:inline">Spaces: 2</span>
              <span className="hidden sm:inline">UTF-8</span>
              <span className="border-l border-slate-800 pl-3 text-sky-400">
                {connectionStatus === 'connected' ? 'USB Active' : 'Disconnected'}
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
