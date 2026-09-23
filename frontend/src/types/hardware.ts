export interface HardwarePin {
  pin: string;
  type: 'digital' | 'analog' | 'power' | 'comm';
  description: string;
}

export interface HardwareDevice {
  id: string;
  name: string;
  sku: string;
  description: string;
  mcu: string;
  clockSpeed: string;
  flashMemory: number;
  sram: number;
  operatingVoltage: string;
  defaultBaud: number;
  supportedBauds: number[];
  icon: string;
  pinout: HardwarePin[];
  defaultFiles: Record<string, string>;
}

export interface ProblemMarker {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface MemoryUsage {
  flashUsed: number;
  flashTotal: number;
  flashPercent: number;
  sramUsed: number;
  sramTotal: number;
  sramPercent: number;
}

export interface CompilationResult {
  success: boolean;
  status: 'success' | 'compilation_failed' | 'timeout' | 'error';
  message: string;
  stdout: string;
  stderr: string;
  buildTimeMs: number;
  memoryUsage?: MemoryUsage;
  problems: ProblemMarker[];
  targetDevice: string;
}

export interface ProjectFile {
  name: string;
  content: string;
  language: 'cpp' | 'json' | 'markdown' | 'plaintext';
  readOnly?: boolean;
}
