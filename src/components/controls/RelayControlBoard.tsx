'use client';

import React from 'react';
import { useESP } from '../../context/ESPContext';
import type { RelayCommand, RelayKey } from '../../types/esp.types';

// Minimal standalone control board so operators can embed it anywhere outside
// the main dashboard while still using the same relay orchestration logic.
const RELAY_LABELS: Record<RelayKey, string> = {
  A: 'LV Start',
  B: 'Pod Start',
  C: 'Launchpad',
  D: 'Inverter',
};

const RelayControlBoard: React.FC = () => {
  const { relayState, isConnected, isConnecting, error, connect, disconnect, sendRelayCommand } =
    useESP();

  // Every toggle simply flips the relay and sends the appropriate command.
  const handleToggle = (relay: RelayKey) => {
    const nextState = !relayState[relay];
    const command = (nextState ? relay : relay.toLowerCase()) as RelayCommand;
    sendRelayCommand(command);
  };

  // Helper to blast the full uppercase/lowercase sequence for mass actions.
  const sequenceAll = (state: 'on' | 'off') => {
    const commands: RelayCommand[] =
      state === 'on' ? ['A', 'B', 'C', 'D'] : ['a', 'b', 'c', 'd'];
    commands.forEach((cmd) => sendRelayCommand(cmd));
  };

  return (
    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">ESP32 Link</p>
          <p className="text-2xl font-bold text-gray-900">
            {isConnected ? 'Connected' : isConnecting ? 'Connecting…' : 'Disconnected'}
          </p>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <button
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
          className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(RELAY_LABELS) as RelayKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handleToggle(key)}
            disabled={!isConnected}
            className={`rounded-xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              relayState[key]
                ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide">
              {RELAY_LABELS[key]} ({key})
            </p>
            <p className="mt-2 text-xl font-bold">{relayState[key] ? 'ON' : 'OFF'}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          onClick={() => sequenceAll('on')}
          disabled={!isConnected}
          className="rounded-xl bg-emerald-500 px-4 py-3 text-lg font-semibold text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Turn All ON
        </button>
        <button
          onClick={() => sequenceAll('off')}
          disabled={!isConnected}
          className="rounded-xl bg-red-500 px-4 py-3 text-lg font-semibold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Turn All OFF
        </button>
      </div>
    </div>
  );
};

export default RelayControlBoard;