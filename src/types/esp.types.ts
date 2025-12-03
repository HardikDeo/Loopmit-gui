// Relay Control Types --------------------------------------------------------
export type RelayKey = 'A' | 'B' | 'C' | 'D';
export type RelayCommand = RelayKey | Lowercase<RelayKey>;

export interface RelayState {
  A: boolean;
  B: boolean;
  C: boolean;
  D: boolean;
}

export interface SerialCommand {
  command: RelayCommand;
  relay?: RelayKey;
  state?: 'ON' | 'OFF';
}

export interface SerialResponse {
  success: boolean;
  message: string;
  relayStates?: RelayState;
}

export type RelayNumber = RelayKey;

// Sensor Data Types
export interface VoltageData {
  inverter: number;
  lvs: number;
  contacter: number;
}

export interface TemperatureData {
  motor: number;
  object: number;
  ambient: number;
  battery: number;
}

export interface AccelerationData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

export interface SpeedData {
  value: number;
  unit: string;
}

export interface LidarData {
  distance: number;
  quality: number;
}

// Complete ESP Data Structure
export interface ESPData {
  timestamp?: string;
  
  // Voltage readings
  VB1?: number;  // LVS Voltage
  VB2?: number;  // Inverter Voltage
  VB3?: number;  // Contacter Voltage
  
  // Temperature readings
  dsTemperature?: number;   // Motor temperature
  objectTemp?: number;      // Object temperature
  ambientTemp?: number;     // Ambient temperature
  mlxTemperature?: number;  // Battery temperature
  
  // Acceleration data [x, y, z]
  accel?: number[];
  
  // Orientation data [roll, pitch, yaw]
  orientation?: number[];
  
  // Lidar data
  lidarDistance?: number;
  lidarQuality?: number;
  
  // Relay states
  relayStates?: RelayState;
}