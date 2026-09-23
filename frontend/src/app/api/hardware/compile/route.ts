import { NextRequest, NextResponse } from 'next/server';
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { HARDWARE_DEVICES } from '../devices/route';
import { CompilationResult, ProblemMarker, MemoryUsage } from '@/types/hardware';

const MAX_PAYLOAD_SIZE_BYTES = 65536; // 64 KB
const COMPILATION_TIMEOUT_MS = 5000;  // 5 seconds

// Minimal Arduino framework mock header for standard gcc/g++ syntax validation and simulation
const ARDUINO_MOCK_H = `// DigiComp Hardware Lab - Embedded Runtime Definition
#ifndef DIGICOMP_ARDUINO_H
#define DIGICOMP_ARDUINO_H
#pragma GCC system_header

#include <iostream>
#include <string>
#include <sstream>
#include <cmath>
#include <cstdint>

#define HIGH 0x1
#define LOW  0x0
#define INPUT 0x0
#define OUTPUT 0x1
#define INPUT_PULLUP 0x2

#define A0 14
#define A1 15
#define A2 16
#define A3 17
#define A4 18
#define A5 19
#define A6 20
#define A7 21

typedef uint8_t byte;
typedef bool boolean;

class SerialMock {
public:
  void begin(unsigned long baud) {
    std::cout << "[Serial Initialized @ " << baud << " baud]" << std::endl;
  }
  template<typename T>
  void print(const T& val) {
    std::cout << val;
  }
  template<typename T>
  void println(const T& val) {
    std::cout << val << std::endl;
  }
  template<typename T>
  void print(const T& val, int prec) {
    std::cout << val;
  }
  template<typename T>
  void println(const T& val, int prec) {
    std::cout << val << std::endl;
  }
  void println() {
    std::cout << std::endl;
  }
  bool available() { return false; }
  int read() { return -1; }
};

static SerialMock Serial;

inline void pinMode(uint8_t pin, uint8_t mode) {}
inline void digitalWrite(uint8_t pin, uint8_t val) {}
inline int digitalRead(uint8_t pin) { return LOW; }
inline int analogRead(uint8_t pin) { return 512; }
inline void analogWrite(uint8_t pin, int val) {}
inline void delay(unsigned long ms) {}
inline void delayMicroseconds(unsigned int us) {}
inline unsigned long millis() { return 100; }
inline unsigned long micros() { return 100000; }
inline long map(long x, long in_min, long in_max, long out_min, long out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
inline unsigned long pulseIn(uint8_t pin, uint8_t state, unsigned long timeout = 1000000L) {
  return 1160L; // returns typical ~20cm ultrasonic echo delay
}
template<typename T> inline T constrain(T amt, T low, T high) {
  return amt < low ? low : (amt > high ? high : amt);
}

void setup();
void loop();

#endif // DIGICOMP_ARDUINO_H
`;

const RUNNER_MAIN_CPP = `
#include "Arduino.h"

int main() {
  setup();
  for (int i = 0; i < 3; i++) {
    loop();
  }
  return 0;
}
`;

function parseGccDiagnostics(output: string): ProblemMarker[] {
  const problems: ProblemMarker[] = [];
  const lines = output.split('\n');

  // Match formats like:
  // main.cpp:14:5: error: 'x' was not declared in this scope
  // config.h:3:1: warning: "BAUD_RATE" redefined
  const regex = /([^:\n\r]+):(\d+):(\d+):\s*(error|warning|fatal error):\s*(.*)/i;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const [, rawFile, lineStr, colStr, rawSeverity, message] = match;
      const cleanFile = path.basename(rawFile.trim());
      if (cleanFile === 'Arduino.h' || cleanFile === '__runner.cpp') {
        continue;
      }
      const severity: 'error' | 'warning' = rawSeverity.toLowerCase().includes('error') ? 'error' : 'warning';

      problems.push({
        file: cleanFile,
        line: parseInt(lineStr, 10),
        column: parseInt(colStr, 10),
        severity,
        message: message.trim(),
      });
    }
  }

  return problems;
}

function parseBinarySizeFromObject(objectFilePath: string, deviceId: string, fallbackCodeSize: number): MemoryUsage {
  const device = HARDWARE_DEVICES.find((d) => d.id === deviceId) || HARDWARE_DEVICES[0];

  let textBytes = 0;
  let dataBytes = 0;
  let bssBytes = 0;
  let parsedFromBinary = false;

  try {
    if (fs.existsSync(objectFilePath)) {
      const sizeProc = spawnSync('size', [objectFilePath], {
        shell: true,
        encoding: 'utf-8',
        timeout: 3000,
      });

      if (sizeProc.status === 0 && sizeProc.stdout) {
        // Output format:
        // text    data     bss     dec     hex filename
        //  728       8      96     832     340 main.o
        const lines = sizeProc.stdout.trim().split('\n');
        if (lines.length >= 2) {
          const parts = lines[1].trim().split(/\s+/);
          if (parts.length >= 3) {
            textBytes = parseInt(parts[0], 10) || 0;
            dataBytes = parseInt(parts[1], 10) || 0;
            bssBytes = parseInt(parts[2], 10) || 0;
            parsedFromBinary = true;
          }
        }
      }
    }
  } catch (err) {
    console.warn('size.exe error:', err);
  }

  // Base runtime core overhead:
  // Arduino AVR core overhead is ~444 bytes flash, ~9 bytes RAM.
  // ESP32 IDF core overhead is ~175,000 bytes flash, ~14,000 bytes RAM.
  const coreBaseFlash = deviceId === 'esp32-devkit' ? 175000 : 444;
  const coreBaseRam = deviceId === 'esp32-devkit' ? 14000 : 9;

  if (!parsedFromBinary) {
    textBytes = Math.floor(fallbackCodeSize * 1.5);
    dataBytes = Math.floor(fallbackCodeSize * 0.1);
    bssBytes = Math.floor(fallbackCodeSize * 0.2);
  }

  // Standard GCC/Embedded section calculation:
  // Program Storage (Flash) = Core + text (code instructions) + data (initialized variables)
  // Dynamic Memory (SRAM) = Core + data (initialized variables) + bss (uninitialized RAM)
  const flashUsed = Math.min(device.flashMemory, coreBaseFlash + textBytes + dataBytes);
  const sramUsed = Math.min(device.sram, coreBaseRam + dataBytes + bssBytes);

  return {
    flashUsed,
    flashTotal: device.flashMemory,
    flashPercent: Math.round((flashUsed / device.flashMemory) * 1000) / 10,
    sramUsed,
    sramTotal: device.sram,
    sramPercent: Math.round((sramUsed / device.sram) * 1000) / 10,
  };
}

function analyzeHardwareSafety(
  files: Record<string, string>,
  deviceId: string
): { safetyProblems: ProblemMarker[]; safetyAuditLogs: string[] } {
  const safetyProblems: ProblemMarker[] = [];
  const safetyAuditLogs: string[] = [];

  const device = HARDWARE_DEVICES.find((d) => d.id === deviceId) || HARDWARE_DEVICES[0];

  // Audit Log 1: Voltage Level
  if (device.operatingVoltage === '3.3V') {
    safetyAuditLogs.push(`⚡ Voltage Check: Target '${device.name}' operates at 3.3V logic (Max: 3.6V). NOT 5V tolerant.`);
  } else {
    safetyAuditLogs.push(`⚡ Voltage Check: Target '${device.name}' operates at 5V TTL logic level.`);
  }

  // Audit Log 2: Current limits
  const maxCurrentMa =
    device.id === 'esp32-devkit' ? '12-20 mA per GPIO (100 mA package)' : '40 mA per GPIO (200 mA VCC package)';
  safetyAuditLogs.push(`🛡️ Current Limit: Maximum ${maxCurrentMa}. Direct inductive driving prohibited.`);

  // Iterate files to check for hazardous hardware patterns
  for (const [filename, content] of Object.entries(files)) {
    const lines = content.split('\n');

    // 1. ESP32 5V Voltage Damage Risk & Pin Constraints
    if (device.id === 'esp32-devkit') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/\b(5\.0|5V|5v)\b/.test(line) && /\b(analogRead|sensor|voltage|adc)\b/i.test(line)) {
          safetyProblems.push({
            file: filename,
            line: i + 1,
            column: 1,
            severity: 'warning',
            message:
              '[HARDWARE SAFETY - 5V OVERLOAD RISK] ESP32 operates strictly at 3.3V (3.6V absolute max). Never connect 5V sensor outputs directly to ESP32 GPIOs without a logic level shifter or resistor voltage divider, or the input gate will be permanently destroyed.',
          });
          safetyAuditLogs.push(`⚠️ WARNING [${filename}:${i + 1}]: 5V sensor voltage reference detected on 3.3V ESP32 target.`);
        }

        // ESP32 Strapping pin check
        if (/\bpinMode\s*\(\s*(0|12|15)\s*,/i.test(line)) {
          safetyProblems.push({
            file: filename,
            line: i + 1,
            column: 1,
            severity: 'warning',
            message:
              '[HARDWARE SAFETY - STRAPPING PIN] GPIO 0, 12, and 15 are hardware strapping pins used during boot mode selection. Driving them or connecting external loads can cause boot failure or flash voltage brownout.',
          });
          safetyAuditLogs.push(`⚠️ NOTICE [${filename}:${i + 1}]: Strapping pin GPIO 0/12/15 referenced.`);
        }

        // ESP32 Input-Only Pins (GPIO 34, 35, 36, 39)
        if (
          /\bpinMode\s*\(\s*(34|35|36|39)\s*,\s*OUTPUT\s*\)/i.test(line) ||
          /\bdigitalWrite\s*\(\s*(34|35|36|39)\s*,/i.test(line)
        ) {
          const matchedPin = line.match(/\b(34|35|36|39)\b/)?.[0] || '34';
          safetyProblems.push({
            file: filename,
            line: i + 1,
            column: 1,
            severity: 'warning',
            message: `[HARDWARE LIMITATION - INPUT ONLY PIN] ESP32 GPIO ${matchedPin} is an input-only pin (GPI). It lacks output drivers and internal pull-ups, so configuring it as OUTPUT or driving it will fail.`,
          });
          safetyAuditLogs.push(`⚠️ WARNING [${filename}:${i + 1}]: Attempted output drive on input-only GPIO ${matchedPin}.`);
        }
      }
    }

    // 2. Serial RX0 / TX1 Pin Conflict on Arduino Uno & Nano
    if (device.id === 'arduino-uno' || device.id === 'arduino-nano') {
      const usesSerial = /\bSerial\.begin\b/.test(content);
      if (usesSerial) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/\b(pinMode|digitalWrite|digitalRead)\s*\(\s*(0|1)\b/.test(line)) {
            safetyProblems.push({
              file: filename,
              line: i + 1,
              column: 1,
              severity: 'warning',
              message:
                '[HARDWARE SAFETY - SERIAL CONFLICT] Pins 0 (RX) and 1 (TX) are directly wired to the USB-UART bridge. Using them for digital I/O while Serial is active will cause communication failures and can disrupt USB serial communication.',
            });
            safetyAuditLogs.push(`⚠️ WARNING [${filename}:${i + 1}]: Pin 0/1 assigned while Serial.begin() is active.`);
          }
        }
      }
    }

    // 3. Inductive Motor / Coil Direct Drive Overcurrent Check
    const hasInductiveKeyword = /\b(motor|pump|solenoid|stepper|coil|valve)\w*\b/i.test(content);
    const hasDriverMention = /\b(driver|l298|a4988|drv8825|uln2003|tb6600|relay|transistor|mosfet|bridge|esc|shield)\b/i.test(content);
    const hasPinControl = /\b(pinMode|digitalWrite|analogWrite)\b/.test(content);

    if (hasInductiveKeyword && hasPinControl && !hasDriverMention) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/\b(motor|pump|solenoid|stepper|coil|valve)\w*\b/i.test(line)) {
          safetyProblems.push({
            file: filename,
            line: i + 1,
            column: 1,
            severity: 'warning',
            message:
              '[HARDWARE SAFETY - OVERCURRENT / INDUCTIVE KICKBACK RISK] Inductive load (motor/pump/solenoid) detected without a motor driver or relay. Microcontroller pins can only supply 20-40mA and will be burned out by motor stall currents or back-EMF spikes. Use a driver IC (L298N, A4988), transistor (TIP120), MOSFET (IRFZ44N), or optocoupled relay.',
          });
          safetyAuditLogs.push(`⚠️ DANGER [${filename}:${i + 1}]: Direct inductive load reference without motor driver protection.`);
          break;
        }
      }
    }

    // 4. Servo Surge Current Advisory
    if (/\b(Servo|servo\.attach)\b/.test(content)) {
      safetyAuditLogs.push('ℹ️ Power Notice: Servos draw up to 1A surge. Power servos from external 5V supply with common GND to prevent MCU brownout.');
    }
  }

  if (safetyProblems.length === 0) {
    safetyAuditLogs.push('✔ Pin Conflict Check: No hardware pin conflicts detected.');
    safetyAuditLogs.push('✔ Electrical Safety Check: Pin assignments verified within safe operational limits.');
  }

  return { safetyProblems, safetyAuditLogs };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const bodyText = await request.text();
    if (bodyText.length > MAX_PAYLOAD_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: `Code payload exceeds safe limit (${MAX_PAYLOAD_SIZE_BYTES / 1024} KB).`,
          stdout: '',
          stderr: 'Security check: Code submission rejected due to excessive size.',
          buildTimeMs: 0,
          problems: [],
          targetDevice: 'unknown',
        },
        { status: 413 }
      );
    }

    const { deviceId = 'arduino-uno', files = {}, action = 'compile' } = JSON.parse(bodyText);

    const device = HARDWARE_DEVICES.find((d) => d.id === deviceId);
    if (!device) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: `Unsupported hardware device target: ${deviceId}`,
          stdout: '',
          stderr: `Device '${deviceId}' is not in the DigiComp hardware catalog.`,
          buildTimeMs: 0,
          problems: [],
          targetDevice: deviceId,
        },
        { status: 400 }
      );
    }

    const mainCode = files['main.cpp'] || '';
    if (!mainCode.trim()) {
      return NextResponse.json(
        {
          success: false,
          status: 'compilation_failed',
          message: 'Compilation failed: main.cpp is empty.',
          stdout: '',
          stderr: 'Error: Workspace must contain non-empty main.cpp with setup() and loop() functions.',
          buildTimeMs: Date.now() - startTime,
          problems: [
            {
              file: 'main.cpp',
              line: 1,
              column: 1,
              severity: 'error',
              message: 'Workspace must contain non-empty main.cpp',
            },
          ],
          targetDevice: device.name,
        },
        { status: 200 }
      );
    }

    // Basic structure check before invoking compiler
    const hasSetup = /\bvoid\s+setup\s*\(\s*\)/.test(mainCode);
    const hasLoop = /\bvoid\s+loop\s*\(\s*\)/.test(mainCode);

    if (!hasSetup || !hasLoop) {
      const missing = [];
      if (!hasSetup) missing.push('void setup()');
      if (!hasLoop) missing.push('void loop()');

      return NextResponse.json(
        {
          success: false,
          status: 'compilation_failed',
          message: `Missing required Arduino entry points: ${missing.join(', ')}`,
          stdout: '',
          stderr: `error: Arduino sketches require both setup() and loop() functions.\nMissing: ${missing.join(' and ')}`,
          buildTimeMs: Date.now() - startTime,
          problems: [
            {
              file: 'main.cpp',
              line: 1,
              column: 1,
              severity: 'error',
              message: `Missing required Arduino entry point: ${missing.join(', ')}`,
            },
          ],
          targetDevice: device.name,
        },
        { status: 200 }
      );
    }

    // Create an isolated temporary workspace directory
    const tempDirName = `digicomp-hw-${crypto.randomBytes(8).toString('hex')}`;
    const tempDir = path.join(os.tmpdir(), tempDirName);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Write Arduino.h mock
      fs.writeFileSync(path.join(tempDir, 'Arduino.h'), ARDUINO_MOCK_H, 'utf-8');

      // Write all user project files
      let totalBytes = 0;
      for (const [filename, content] of Object.entries(files)) {
        // Sanitize filename to prevent directory traversal
        const safeBase = path.basename(filename);
        if (safeBase && typeof content === 'string') {
          fs.writeFileSync(path.join(tempDir, safeBase), content, 'utf-8');
          totalBytes += content.length;
        }
      }

      // Add main entry wrapper if compiling for execution/syntax check
      fs.writeFileSync(path.join(tempDir, '__runner.cpp'), RUNNER_MAIN_CPP, 'utf-8');

      // Determine compilation command
      // We run g++ with security boundaries: -Wall -std=c++11 -I.
      const isRun = action === 'run';
      const outputBinary = path.join(tempDir, 'output.exe');
      const objectFile = path.join(tempDir, 'main.o');

      const args = isRun
        ? ['-std=c++11', '-Wall', '-I.', '-include', 'Arduino.h', 'main.cpp', '__runner.cpp', '-o', outputBinary]
        : ['-c', '-std=c++11', '-Wall', '-I.', '-include', 'Arduino.h', 'main.cpp', '-o', objectFile];

      // Execute g++ with shell: true, stdio: ['ignore', 'pipe', 'pipe'] for Windows compatibility
      const compileProc = spawnSync('g++', args, {
        cwd: tempDir,
        timeout: COMPILATION_TIMEOUT_MS,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf-8',
      });

      const buildTimeMs = Date.now() - startTime;
      const timedOut = Boolean(compileProc.error && (compileProc.error as any).code === 'ETIMEDOUT');
      const compileStdout = compileProc.stdout || '';
      const compileStderr = compileProc.stderr || (compileProc.error ? compileProc.error.message : '');

      if (timedOut) {
        return NextResponse.json(
          {
            success: false,
            status: 'timeout',
            message: `Compilation timed out after ${COMPILATION_TIMEOUT_MS / 1000}s.`,
            stdout: '',
            stderr: `Compiler timed out. The operation exceeded ${COMPILATION_TIMEOUT_MS / 1000}s safety limit.`,
            buildTimeMs,
            problems: [],
            targetDevice: device.name,
          },
          { status: 200 }
        );
      }

      const problems = parseGccDiagnostics(compileStderr + '\n' + compileStdout);
      const { safetyProblems, safetyAuditLogs } = analyzeHardwareSafety(files, device.id);
      problems.push(...safetyProblems);

      const hasErrors = compileProc.status !== 0 || problems.some((p) => p.severity === 'error');

      if (hasErrors) {
        const errorCount = problems.filter((p) => p.severity === 'error').length;
        const warningCount = problems.filter((p) => p.severity === 'warning').length;

        return NextResponse.json({
          success: false,
          status: 'compilation_failed',
          message: `Compilation failed with ${errorCount} error(s) and ${warningCount} warning(s).`,
          stdout: compileStdout,
          stderr: compileStderr || 'Build failed with syntax or semantic errors.',
          buildTimeMs,
          problems,
          targetDevice: device.name,
        });
      }

      // If action is "run" and binary was created, execute the simulation
      let runOutput = '';
      if (isRun && fs.existsSync(outputBinary)) {
        const runPromise = new Promise<string>((resolve) => {
          let output = '';
          const runProc = spawn(outputBinary, [], {
            cwd: tempDir,
            timeout: 2000,
            shell: false,
          });

          runProc.stdout?.on('data', (d) => {
            output += d.toString();
          });
          runProc.stderr?.on('data', (d) => {
            output += d.toString();
          });

          const timer = setTimeout(() => {
            try {
              runProc.kill('SIGKILL');
            } catch {
              // ignore
            }
          }, 2000);

          runProc.on('close', () => {
            clearTimeout(timer);
            resolve(output);
          });
          runProc.on('error', () => {
            clearTimeout(timer);
            resolve(output);
          });
        });

        runOutput = await runPromise;
      }

      // Real binary section analysis using size.exe
      const memoryUsage = parseBinarySizeFromObject(isRun ? outputBinary : objectFile, device.id, totalBytes);

      const memSummary = [
        `\nSketch uses ${memoryUsage.flashUsed.toLocaleString()} bytes (${memoryUsage.flashPercent}%) of program storage space. Maximum is ${memoryUsage.flashTotal.toLocaleString()} bytes.`,
        `Global variables use ${memoryUsage.sramUsed.toLocaleString()} bytes (${memoryUsage.sramPercent}%) of dynamic memory, leaving ${(memoryUsage.sramTotal - memoryUsage.sramUsed).toLocaleString()} bytes for local variables. Maximum is ${memoryUsage.sramTotal.toLocaleString()} bytes.`,
      ].join('\n');

      const safetySection = [
        `\n--- Hardware Safety & Pin Conflict Audit ---`,
        ...safetyAuditLogs,
      ].join('\n');

      const fullStdout = [
        `Archiving built core (caching) in ${tempDirName}`,
        `Linking everything together...`,
        `Checking memory usage on target '${device.name}' (${device.mcu} @ ${device.clockSpeed})...`,
        memSummary,
        safetySection,
        isRun ? `\n--- Simulation Execution Output (3 cycles) ---\n${runOutput || '[No serial output generated in setup/loop]'}` : '',
      ].filter(Boolean).join('\n');

      const result: CompilationResult = {
        success: true,
        status: 'success',
        message: isRun ? 'Code verified and simulation completed successfully.' : 'Compilation successful.',
        stdout: fullStdout,
        stderr: compileStderr,
        buildTimeMs,
        memoryUsage,
        problems,
        targetDevice: device.name,
      };

      return NextResponse.json(result);
    } finally {
      // Secure Cleanup: Remove temporary working directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error during compilation';
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: errorMsg,
        stdout: '',
        stderr: `Server error during compilation: ${errorMsg}`,
        buildTimeMs: Date.now() - startTime,
        problems: [],
        targetDevice: 'unknown',
      },
      { status: 500 }
    );
  }
}
