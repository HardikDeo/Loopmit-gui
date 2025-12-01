// src/types/esp.types.ts

export interface ESPData {
    device?: number;
    status?: string;
    battery?: number;
    mlxTemperature?: number;
    dsTemperature?: number;
    objectTemp?: number;
    ambientTemp?: number;
    accel?: number[];
    VB1?: number; // LVS Voltage
    VB2?: number; // Inverter Voltage
    VB3?: number; // Contacter Voltage
    orientation?: number[];
    timestamp?: string;
  }
  
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
  
  export interface ESPStatus {
    isConnected: boolean;
    lastSeen: Date;
    deviceId: number;
    batteryLevel?: number;
  }
  
  export interface RelayState {
    A: boolean; // Pod Start
    B: boolean; // Brake Release
    C: boolean; // Launchpad
    D: boolean; // Inverter
  }
  
  export interface WebSocketState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    lastMessage: Date | null;
  }
  
  export type RelayCommand = 'A' | 'a' | 'B' | 'b' | 'C' | 'c' | 'D' | 'd';
  
  export interface ButtonState {
    active: boolean;
    loading: boolean;
    disabled: boolean;
  }