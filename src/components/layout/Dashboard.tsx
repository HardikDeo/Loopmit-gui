// src/components/layout/Dashboard.tsx
'use client';

import React from 'react';
import VoltageDisplay from '../../components/sensors/VoltageDisplay';
import TemperatureDisplay from '../../components/sensors/TemperatureDisplay';
import { AccelerationDisplay, SpeedDisplay } from '../../components/sensors/AccelerationDisplay';
import {
  ConnectButton,
  PodStartButton,
  LVStartButton,
  LaunchpadButton,
  InverterButton,
  EmergencyBrakeButton,
  PodStopButton,
} from '../../components/controls/ConnectButton';
import { useESP } from '../../context/ESPContext';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { isConnected, error } = useESP();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ESP32 Pod Monitor</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time monitoring and control system</p>
            </div>
            <ConnectButton />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Connection Status Banner */}
          {!isConnected && !error && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <p className="text-yellow-700 font-medium">Not connected to ESP32</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Speed Display - Full Width */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SpeedDisplay />
            </div>
            <div>
              <AccelerationDisplay />
            </div>
          </div>

          {/* Voltage Display */}
          <VoltageDisplay />

          {/* Temperature Display */}
          <TemperatureDisplay />

          {/* Control Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Control Panel</h2>

            <div className="space-y-6">
              {/* Primary Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Primary Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <PodStartButton />
                  <LVStartButton />
                  <LaunchpadButton />
                  <InverterButton />
                </div>
              </div>

              {/* Emergency Controls */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-3">Emergency Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PodStopButton />
                  <EmergencyBrakeButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 text-sm">
            ESP32 Pod Monitoring System | Real-time WebSocket Connection
          </p>
        </div>
      </footer>
    </div>
  );
}