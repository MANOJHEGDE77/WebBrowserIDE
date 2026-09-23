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
} from 'lucide-react';
import { HardwareDevice, ProblemMarker, CompilationResult } from '@/types/hardware';
import { HARDWARE_DEVICES } from '@/app/api/hardware/devices/route';

// Dynamically import Monaco Editor to ensure it only loads client-side
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex items-center gap-3">
        <Cpu className="w-5 h-5 text-sky-400 animate-spin" />
        <span className="text-sm font-mono">Loading Monaco Editor environment...</span>
      </div>
    </div>
  ),
});

type TabType = 'output' | 'problems' | 'serial';
type SideTab = 'files' | 'specs' | 'safety';

// Standard hardware project presets matching DigiComp products
const EXAMPLE_PRESETS: Array<{
  id: string;
  name: string;
  deviceId: string;
  description: string;
  files: Record<string, string>;
}> = [
  {
    id: 'blink',
    name: 'LED Blink & Heartbeat',
    deviceId: 'arduino-uno',
    description: 'Basic GPIO digital pin state machine for onboard testing.',
    files: {
      'main.cpp': `// DigiComp Hardware Lab - Basic Blink & Heartbeat
#include <Arduino.h>
#include "config.h"

int ledState = LOW;
unsigned long previousMillis = 0;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  Serial.println("=== DigiComp LED Blink Demo ===");
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= INTERVAL_MS) {
    previousMillis = currentMillis;
    ledState = (ledState == LOW) ? HIGH : LOW;
    digitalWrite(LED_PIN, ledState);

    Serial.print("LED State Changed: ");
    Serial.println(ledState ? "HIGH" : "LOW");
  }
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define LED_PIN 13
#define BAUD_RATE 9600
#define INTERVAL_MS 1000

#endif // CONFIG_H
`,
    },
  },
  {
    id: 'ultrasonic',
    name: 'HC-SR04 Ultrasonic Distance',
    deviceId: 'arduino-uno',
    description: 'Distance measurement demo matching DigiComp HC-SR04 Sensor (DC-HCSR04-01).',
    files: {
      'main.cpp': `// DigiComp Hardware Lab - HC-SR04 Ultrasonic Sensor Demo
// Matching DigiComp SKU: DC-HCSR04-01
#include <Arduino.h>
#include "config.h"

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(ALERT_LED_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);

  Serial.println("=== DigiComp HC-SR04 Ultrasonic Distance Sensor ===");
  Serial.println("Measuring range: 2cm to 400cm");
}

void loop() {
  // Trigger ultrasonic sonic burst (10us pulse)
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Measure echo pulse duration
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout

  // Speed of sound is 343 m/s => 0.0343 cm/us (round-trip, divide by 2)
  float distanceCm = (duration * 0.0343) / 2.0;

  Serial.print("Distance: ");
  Serial.print(distanceCm, 1);
  Serial.println(" cm");

  // Alert if an obstacle is closer than 15 cm
  if (distanceCm > 0 && distanceCm < OBSTACLE_THRESHOLD_CM) {
    digitalWrite(ALERT_LED_PIN, HIGH);
    Serial.println(">>> WARNING: Obstacle detected within threshold!");
  } else {
    digitalWrite(ALERT_LED_PIN, LOW);
  }

  delay(SAMPLE_DELAY_MS);
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define TRIG_PIN 9
#define ECHO_PIN 10
#define ALERT_LED_PIN 13
#define BAUD_RATE 9600
#define OBSTACLE_THRESHOLD_CM 15.0
#define SAMPLE_DELAY_MS 500

#endif // CONFIG_H
`,
    },
  },
  {
    id: 'ldr-sensor',
    name: 'LDR Light Sensor & Auto Switch',
    deviceId: 'arduino-nano',
    description: 'Automatic nightlight / threshold detector matching DigiComp LDR Sensor (DC-LDR-01).',
    files: {
      'main.cpp': `// DigiComp Hardware Lab - LDR Light Sensor Automation
// Matching DigiComp SKU: DC-LDR-01
#include <Arduino.h>
#include "config.h"

void setup() {
  pinMode(RELAY_CONTROL_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  Serial.println("=== DigiComp LDR Light Automation Controller ===");
}

void loop() {
  int rawLight = analogRead(LDR_PIN);
  float voltage = (rawLight * 5.0) / 1023.0;

  Serial.print("LDR Raw: ");
  Serial.print(rawLight);
  Serial.print(" | Sensor Voltage: ");
  Serial.print(voltage, 2);
  Serial.println(" V");

  // Activate relay when ambient darkness falls below threshold
  if (rawLight < DARKNESS_THRESHOLD) {
    digitalWrite(RELAY_CONTROL_PIN, HIGH);
    Serial.println("[Automation] Darkness detected -> Relay TRIGGERED (Light ON)");
  } else {
    digitalWrite(RELAY_CONTROL_PIN, LOW);
  }

  delay(600);
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define LDR_PIN A0
#define RELAY_CONTROL_PIN 13
#define BAUD_RATE 9600
#define DARKNESS_THRESHOLD 400

#endif // CONFIG_H
`,
    },
  },
  {
    id: 'esp32-telemetry',
    name: 'ESP32 Dual-Core Telemetry',
    deviceId: 'esp32-devkit',
    description: 'High-speed sensor telemetry on dual-core 240MHz ESP32 (DC-ESP32-01).',
    files: {
      'main.cpp': `// DigiComp Hardware Lab - ESP32 DevKit V1 Telemetry Engine
// Target: ESP32 Dual Core Xtensa 240MHz (SKU: DC-ESP32-01)
#include <Arduino.h>
#include "config.h"

unsigned long cycleCount = 0;

void setup() {
  pinMode(STATUS_LED_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  delay(500);

  Serial.println("================================================");
  Serial.println("  DigiComp ESP32 DevKit V1 High-Speed Telemetry ");
  Serial.println("================================================");
  Serial.println("CPU Architecture: Dual-Core Xtensa LX6 @ 240MHz");
  Serial.println("Flash Memory: 4MB SPI Flash | SRAM: 520KB");
  Serial.println("Communication: 802.11 b/g/n Wi-Fi + BLE 4.2");
}

void loop() {
  cycleCount++;

  digitalWrite(STATUS_LED_PIN, HIGH);
  Serial.print("[ESP32 Core 1] Heartbeat #");
  Serial.print(cycleCount);
  Serial.println(" -> Telemetry Signal: 3.3V ACTIVE");
  delay(CYCLE_MS / 2);

  digitalWrite(STATUS_LED_PIN, LOW);
  Serial.println("[ESP32 Core 1] Power Standby -> Telemetry Signal: LOW (0V)");
  delay(CYCLE_MS / 2);
}
`,
      'config.h': `#ifndef CONFIG_H
#define CONFIG_H

#define STATUS_LED_PIN 2
#define BAUD_RATE 115200
#define CYCLE_MS 800

#endif // CONFIG_H
`,
    },
  },
];

export default function HardwareLabPage() {
  // Device & Project State
  const [devices, setDevices] = useState<HardwareDevice[]>(HARDWARE_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('arduino-uno');
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
  const [selectedBaud, setSelectedBaud] = useState<number>(9600);
  const [serialLogs, setSerialLogs] = useState<Array<{ text: string; time: string; type: 'in' | 'out' | 'sys' }>>([]);
  const [serialInput, setSerialInput] = useState<string>('');
  const [autoScrollSerial, setAutoScrollSerial] = useState<boolean>(true);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(true);

  // Modals & Dialogs
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

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
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'type', foreground: '7dd3fc' },
        { token: 'identifier', foreground: 'f8fafc' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'delimiter', foreground: '94a3b8' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#f8fafc',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editor.lineHighlightBackground': '#1e293b66',
        'editor.selectionBackground': '#0369a14d',
        'editorCursor.foreground': '#38bdf8',
        'editorWhitespace.foreground': '#334155',
        'editorWidget.background': '#1e293b',
        'editorWidget.border': '#334155',
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
      // Provide simulated echo when testing without physical hardware plugged in
      setSerialLogs((prev) => [
        ...prev,
        { text: `> ${textToSend}`, time: new Date().toLocaleTimeString(), type: 'out' },
        {
          text: `[Simulated / No Device] Echo: "${textToSend}" received by ${selectedDevice.name}`,
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
              : 'bg-slate-900/95 text-sky-200 border-slate-700/60 shadow-slate-950/50'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-sky-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-sky-400" />
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
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-sky-300">
                  Ctrl + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Run Simulation</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-sky-300">
                  Ctrl + Shift + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Save Workspace</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-sky-300">
                  Ctrl + S
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Format Code</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-sky-300">
                  Shift + Alt + F
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                <span className="text-slate-300">Toggle Command Palette</span>
                <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-sky-300">
                  F1
                </kbd>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP DEDICATED IDE NAVIGATION BAR */}
      <header className="h-12 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 flex items-center justify-between gap-3 shrink-0 z-20 shadow-lg">
        {/* Left: Store Return Link + Hardware Lab Brand + Target Board Selector + Presets */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Back to DigiComp Store */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all group shrink-0 shadow-xs"
            title="Return to DigiComp Store"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-sky-400" />
            <span className="font-bold text-white tracking-tight">DigiComp</span>
            <span className="text-[10px] text-sky-400 font-mono hidden sm:inline">Store</span>
          </Link>

          <div className="h-5 w-px bg-slate-800 shrink-0" />

          {/* Hardware Lab Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-xs">
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Hardware Lab</span>
                <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[9px] rounded font-mono font-semibold border border-sky-500/30">
                  IDE v2.0
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 shrink-0 hidden md:block" />

          {/* Target Microcontroller Selector */}
          <div className="relative flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium hidden lg:inline">Board:</span>
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="appearance-none bg-slate-850 hover:bg-slate-800 text-sky-200 text-xs font-semibold pl-2.5 pr-8 py-1.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors shadow-xs"
                title="Select target microcontroller development board"
              >
                {devices.map((dev) => (
                  <option key={dev.id} value={dev.id} className="bg-slate-900 text-white py-1">
                    {dev.name} ({dev.operatingVoltage})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Example Project Presets */}
          <div className="hidden xl:flex items-center gap-1.5">
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadPreset(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="appearance-none bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-medium pl-2.5 pr-7 py-1.5 rounded border border-slate-700/80 focus:outline-none cursor-pointer transition-colors"
                title="Load standard hardware project presets"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Load Preset...
                </option>
                {EXAMPLE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id} className="bg-slate-900 text-white py-1">
                    {preset.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Center: File Breadcrumb & Connection Status */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-400">
            <span className="text-slate-500">{selectedDevice.id}</span>
            <span className="text-slate-600">/</span>
            <span className="text-sky-300 font-semibold">{activeFileName}</span>
            {isModified && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse ml-1" title="Unsaved changes" />}
          </div>

          {/* Hardware Connection Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
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
            <span className="capitalize">{connectionStatus}</span>
            {connectionStatus === 'connected' && connectedPortName && (
              <span className="font-mono text-[10px] text-slate-400">({connectedPortName})</span>
            )}
          </div>
        </div>

        {/* Right: Actions (Run, Compile, Save, Connect Hardware, Shortcuts) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Run / Simulate Button */}
          <button
            onClick={() => handleCompile('run')}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 group cursor-pointer"
            title="Verify sketch and run test simulation (Ctrl+Shift+Enter)"
          >
            {isCompiling ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
            )}
            <span>Run</span>
          </button>

          {/* Compile Button */}
          <button
            onClick={() => handleCompile('compile')}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:scale-98 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-sky-950/40 group cursor-pointer"
            title="Compile firmware sketch & check memory (Ctrl+Enter)"
          >
            <Hammer className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Compile</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Save workspace (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Save</span>
          </button>

          {/* Connect Device via Web Serial */}
          <button
            onClick={handleConnectDevice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
              connectionStatus === 'connected'
                ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-700 shadow-rose-950/40'
                : 'bg-slate-800 hover:bg-slate-750 text-sky-400 border-sky-500/40 shadow-sky-950/20'
            }`}
            title={
              connectionStatus === 'connected'
                ? 'Disconnect USB hardware port'
                : 'Connect to physical Arduino / ESP32 board over Web Serial USB'
            }
          >
            <Usb className="w-3.5 h-3.5" />
            <span>{connectionStatus === 'connected' ? 'Disconnect' : 'Connect Device'}</span>
          </button>

          {/* Shortcuts Help Icon */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors hidden sm:block cursor-pointer"
            title="Keyboard shortcuts (F1)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </header>

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
              <div className="flex items-center border-b border-slate-800 bg-slate-950/60 text-xs">
                <button
                  onClick={() => setLeftTab('files')}
                  className={`flex-1 py-2 px-2 flex items-center justify-center gap-1 font-medium border-b-2 transition-colors ${
                    leftTab === 'files'
                      ? 'border-sky-500 text-sky-400 bg-slate-900/80'
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
                      ? 'border-sky-500 text-sky-400 bg-slate-900/80'
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
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
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
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
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
                            className="px-2 py-0.5 text-[11px] bg-sky-600 hover:bg-sky-500 text-white rounded font-medium"
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
                                ? 'bg-sky-950/70 text-sky-300 font-medium border border-sky-800/60 shadow-xs'
                                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {fileName.endsWith('.h') ? (
                                <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : fileName.endsWith('.md') ? (
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : (
                                <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
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
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 group font-medium"
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
                        <span className="text-sky-300 font-bold">{selectedDevice.mcu}</span>
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
                          className="w-full pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:outline-none focus:border-sky-500"
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
                                ? 'bg-sky-600 text-white font-semibold'
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
                                <span className="font-mono font-bold text-sky-400 shrink-0">{p.pin}</span>
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
                                    : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
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
                            {selectedDevice.id === 'esp32-devkit' ? '12 - 20 mA' : '40 mA (20mA rec.)'}
                          </span>
                        </div>
                        <div className="p-1.5 rounded bg-slate-800/60 border border-slate-700/40">
                          <span className="text-slate-400 block text-[9px]">CHIP TOTAL VCC</span>
                          <span className="font-mono text-white font-bold">
                            {selectedDevice.id === 'esp32-devkit' ? '100 mA' : '200 mA'}
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
                        <span className="text-[10px] font-mono text-sky-400">
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
                      {selectedDevice.id === 'esp32-devkit' ? (
                        <div className="space-y-1.5 text-[10px] text-slate-300">
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">Input-Only Pins (GPI):</span>
                            GPIO 34, 35, 36 (VP), and 39 (VN) have no output drivers or internal pullups. Only use them as inputs (e.g. analogRead).
                          </div>
                          <div className="p-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-300 font-bold block">Strapping Boot Pins:</span>
                            Avoid pulling GPIO 0, 2, 12, or 15 HIGH/LOW at boot time, as they control SPI flash voltage and bootloader mode.
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
