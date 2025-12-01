// src/context/ESPContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  ESPData,
  VoltageData,
  TemperatureData,
  AccelerationData,
  SpeedData,
  RelayState,
  RelayCommand,
} from '../types/esp.types';

interface ESPContextType {
  // Connection
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;

  // Data
  voltageData: VoltageData;
  temperatureData: TemperatureData;
  accelerationData: AccelerationData;
  speedData: SpeedData;
  rawData: ESPData | null;

  // Relay Control
  relayState: RelayState;
  sendRelayCommand: (relay: RelayCommand) => void;
  activateEmergencyBrake: () => void;

  // History
  dataHistory: ESPData[];
}

const ESPContext = createContext<ESPContextType | undefined>(undefined);

export function ESPProvider({ children }: { children: ReactNode }) {
  const [voltageData, setVoltageData] = useState<VoltageData>({
    inverter: 0,
    lvs: 0,
    contacter: 0,
  });

  const [temperatureData, setTemperatureData] = useState<TemperatureData>({
    motor: 0,
    object: 0,
    ambient: 0,
    battery: 0,
  });

  const [accelerationData, setAccelerationData] = useState<AccelerationData>({
    x: 0,
    y: 0,
    z: 0,
    magnitude: 0,
  });

  const [speedData, setSpeedData] = useState<SpeedData>({
    value: 0,
    unit: 'm/s',
  });

  const [relayState, setRelayState] = useState<RelayState>({
    A: false,
    B: false,
    C: false,
    D: false,
  });

  const [rawData, setRawData] = useState<ESPData | null>(null);
  const [dataHistory, setDataHistory] = useState<ESPData[]>([]);

  const handleMessage = useCallback((data: ESPData) => {
    setRawData(data);

    // Add to history (keep last 100 entries)
    setDataHistory((prev) => {
      const newHistory = [...prev, data];
      return newHistory.slice(-100);
    });

    // Update voltage data
    if (data.VB1 !== undefined || data.VB2 !== undefined || data.VB3 !== undefined) {
      setVoltageData({
        inverter: data.VB2 ?? 0,
        lvs: data.VB1 ?? 0,
        contacter: data.VB3 ?? 0,
      });
    }

    // Update temperature data
    if (
      data.dsTemperature !== undefined ||
      data.objectTemp !== undefined ||
      data.ambientTemp !== undefined ||
      data.mlxTemperature !== undefined
    ) {
      setTemperatureData({
        motor: data.dsTemperature ?? 0,
        object: data.objectTemp ?? 0,
        ambient: data.ambientTemp ?? 0,
        battery: data.mlxTemperature ?? 0,
      });
    }

    // Update acceleration data
    if (data.accel && Array.isArray(data.accel) && data.accel.length >= 3) {
      const [x, y, z] = data.accel;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      setAccelerationData({ x, y, z, magnitude });

      // Calculate speed from acceleration
      const speed = Math.abs(magnitude - 9.8); // Remove gravity
      setSpeedData({
        value: speed,
        unit: 'm/s',
      });
    }
  }, []);

  const { isConnected, isConnecting, error, sendMessage, connect, disconnect } =
    useWebSocket(handleMessage);

  const sendRelayCommand = useCallback(
    (relay: RelayCommand) => {
      sendMessage(`${relay}\n`);

      // Update local relay state
      const relayKey = relay.toUpperCase() as keyof RelayState;
      const isOn = relay === relay.toUpperCase();

      setRelayState((prev: RelayState) => ({
        ...prev,
        [relayKey]: isOn,
      }));
    },
    [sendMessage]
  );

  const activateEmergencyBrake = useCallback(() => {
    sendMessage('EMERGENCY_BRAKE\n');
    console.log('Emergency brake activated');
  }, [sendMessage]);

  const value: ESPContextType = {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    voltageData,
    temperatureData,
    accelerationData,
    speedData,
    rawData,
    relayState,
    sendRelayCommand,
    activateEmergencyBrake,
    dataHistory,
  };

  return <ESPContext.Provider value={value}>{children}</ESPContext.Provider>;
}

export function useESP() {
  const context = useContext(ESPContext);
  if (context === undefined) {
    throw new Error('useESP must be used within an ESPProvider');
  }
  return context;
}