'use client';

import React, { useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Gauge,
  OctagonX,
  Thermometer,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useESP } from '../../context/ESPContext';
import { usePodHealth } from '../../hooks/usepodhealth';
import type { RelayCommand, RelayKey } from '../../types/esp.types';

// Helper props ensure every relay toggle passes the same data contract.
interface RelayToggleButtonProps {
  relay: RelayKey;
  label: string;
  description: string;
  isActive: boolean;
  disabled: boolean;
  colorClass: string;
  onToggle: (relay: RelayKey) => void;
}

// Helper component keeps the button markup readable while letting us inline it
// inside this single file (per user request) without duplicating styles.
function RelayToggleButton({
  relay,
  label,
  description,
  isActive,
  disabled,
  colorClass,
  onToggle,
}: RelayToggleButtonProps) {
  return (
    <button
      onClick={() => onToggle(relay)}
      disabled={disabled}
      className={`rounded-xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? `${colorClass} text-white shadow-lg`
          : 'bg-white text-gray-800 hover:border-gray-400'
      }`}
    >
      <p className="text-sm uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-xs opacity-70 mt-1">{description}</p>
      <p className="mt-3 text-lg font-bold">{isActive ? 'ON' : 'OFF'}</p>
    </button>
  );
}

// Small pill used for connection stats; extracted to keep JSX tidy.
function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 px-3 py-2 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  // Pull every bit of live data + control handlers from the ESP context so that
  // this one file orchestrates the full monitoring/control experience.
  const {
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
  } = useESP();

  // Reuse the existing deep-health algorithm so we do not duplicate complex math.
  const podHealth = usePodHealth({
    isConnected,
    voltageData,
    temperatureData,
    accelerationData,
    rawData,
  });

  // Human-readable timestamp for the latest packet so operators know freshness.
  const lastPacketText = (() => {
    if (!rawData?.timestamp) {
      return 'No data yet';
    }
    try {
      return new Date(rawData.timestamp).toLocaleTimeString();
    } catch {
      return 'Awaiting timestamp';
    }
  })();

  const connectionButtonLabel = isConnecting
    ? 'Connecting...'
    : isConnected
    ? 'Disconnect'
    : 'Connect';
  const connectionButtonClasses = isConnected
    ? 'bg-red-500 hover:bg-red-600'
    : 'bg-emerald-600 hover:bg-emerald-700';

  // All relays follow the same uppercase=ON / lowercase=OFF convention.
  const handleRelayToggle = (relay: RelayKey) => {
    const shouldEnable = !relayState[relay];
    const command = (shouldEnable ? relay : relay.toLowerCase()) as RelayCommand;
    sendRelayCommand(command);
  };

  // Describe each relay in one place to make the grid below declarative.
  const controlConfigs: Record<
    RelayKey,
    { label: string; description: string; color: string }
  > = {
    A: { label: 'LV Start', description: 'Low-voltage subsystem', color: 'bg-emerald-500' },
    B: { label: 'Pod Start', description: 'Main pod systems', color: 'bg-blue-500' },
    C: { label: 'Launchpad', description: 'Launch relays', color: 'bg-indigo-500' },
    D: { label: 'Inverter', description: 'Power inverter', color: 'bg-purple-500' },
  };

  const healthStatusColor = useMemo(() => {
    switch (podHealth.overallStatus) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, [podHealth.overallStatus]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sticky page header keeps the mission-critical connection controls visible */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ESP32 Pod Dashboard</h1>
            <p className="text-sm text-gray-500">
              Real-time telemetry & control over a persistent WebSocket
            </p>
          </div>
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${connectionButtonClasses}`}
          >
            {isConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            {connectionButtonLabel}
          </button>
        </div>
        {error && (
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}
        {!isConnected && !error && (
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Waiting for ESP32 connection...
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* High-level hero widgets (speed, pod health, connection metadata) */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <Gauge className="h-6 w-6" />
              <p className="text-sm uppercase tracking-wide opacity-80">Current Speed</p>
            </div>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-6xl font-extrabold">{speedData.value.toFixed(2)}</span>
              <span className="mb-3 text-2xl font-semibold">{speedData.unit}</span>
            </div>
            <div className="mt-6 h-3 w-full rounded-full bg-white/30">
              <div
                className="h-3 rounded-full bg-white transition-all"
                style={{ width: `${Math.min(speedData.value * 5, 100)}%` }}
              />
            </div>
          </div>

          

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-600">Connection Details</p>
            <div className="mt-4 space-y-3">
              <StatBadge label="Status" value={isConnected ? 'Online' : 'Offline'} />
              <StatBadge label="Last packet" value={lastPacketText} />
              <StatBadge
                label="IMU Magnitude"
                value={`${accelerationData.magnitude.toFixed(2)} m/s²`}
              />
            </div>
          </div>
        </section>

        {/* Sensor drill-down for electrical + thermal data */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Voltage Readings</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Inverter', value: voltageData.inverter },
                { label: 'LVS', value: voltageData.lvs },
                { label: 'Contacter', value: voltageData.contacter },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-gray-100 bg-slate-50 p-4 text-center"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {metric.value.toFixed(2)}V
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">Thermal System</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Motor', value: temperatureData.motor },
                { label: 'Object', value: temperatureData.object },
                { label: 'Ambient', value: temperatureData.ambient },
                { label: 'Battery', value: temperatureData.battery },
              ].map((metric) => {
                const isCritical = metric.value > 120;
                const isWarning = metric.value > 90 && !isCritical;
                const cardColor = isCritical
                  ? 'border-red-400 bg-red-50'
                  : isWarning
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-100 bg-slate-50';
                return (
                  <div
                    key={metric.label}
                    className={`rounded-xl border p-4 transition-all ${cardColor}`}
                  >
                    <p className="text-xs uppercase tracking-wide text-gray-600">{metric.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {metric.value.toFixed(1)}°C
                    </p>
                    {(isCritical || isWarning) && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {isCritical ? 'CRITICAL' : 'Warning'} temperature
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Health detail leverages the hook so that all logic lives here */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Health Metrics</h2>
            <p className="text-sm text-gray-500">
              Weighted overview of connection, power, thermal, motion, and stream quality
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {podHealth.metrics.map((metric) => (
              <div key={metric.name} className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">{metric.name}</p>
                  <span className="text-sm font-bold text-gray-500">
                    {metric.value.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                {metric.message && (
                  <p className="mt-2 text-xs text-gray-500">{metric.message}</p>
                )}
              </div>
            ))}
          </div>
          {(podHealth.criticalIssues.length > 0 || podHealth.warnings.length > 0) && (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {podHealth.criticalIssues.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <p className="mb-2 font-semibold">Critical Issues</p>
                  <ul className="list-disc pl-5">
                    {podHealth.criticalIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {podHealth.warnings.length > 0 && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                  <p className="mb-2 font-semibold">Warnings</p>
                  <ul className="list-disc pl-5">
                    {podHealth.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Relay + brake controls stream commands straight to the ESP32 */}
        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Control Panel</h2>
            <p className="text-sm text-gray-500">
              Commands are sent instantly over the open WebSocket link
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(controlConfigs) as RelayKey[]).map((key) => (
              <RelayToggleButton
                key={key}
                relay={key}
                label={controlConfigs[key].label}
                description={controlConfigs[key].description}
                isActive={relayState[key]}
                disabled={!isConnected}
                colorClass={controlConfigs[key].color}
                onToggle={handleRelayToggle}
              />
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => {
                (['a', 'b', 'c', 'd'] as RelayCommand[]).forEach((cmd) => sendRelayCommand(cmd));
              }}
              disabled={!isConnected}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 px-6 py-4 text-lg font-semibold text-orange-700 transition-all hover:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <OctagonX className="h-5 w-5" />
              Emergency Stop Sequence
            </button>

            <button
              onClick={activateEmergencyBrake}
              disabled={!isConnected}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-400 bg-red-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <OctagonX className="h-5 w-5" />
              Activate Mechanical Brake
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          ESP32 Pod Monitoring Suite — streaming via{' '}
          {process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080'}
        </div>
      </footer>
    </div>
  );
}