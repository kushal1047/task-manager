import React, { useState, useEffect } from "react";
import soundManager from "../utils/sound";

export default function SoundSettings({ isOpen, onClose }) {
  const [enabled, setEnabled] = useState(soundManager.isEnabled());
  const [volume, setVolume] = useState(soundManager.getVolume());

  useEffect(() => {
    setEnabled(soundManager.isEnabled());
    setVolume(soundManager.getVolume());
  }, [isOpen]);

  const handleToggleSound = () => {
    soundManager.toggleSound();
    setEnabled(soundManager.isEnabled());
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    soundManager.setVolume(newVolume);
    setVolume(newVolume);
  };

  const handleTestSound = async () => {
    await soundManager.playCheckSound();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sound Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Enable Sound Effects
            </label>
            <button
              onClick={handleToggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-indigo-600" : "bg-gray-200"
              }`}
              aria-label={enabled ? "Disable sound" : "Enable sound"}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${
                  volume * 100
                }%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>

          {/* Test Sound Button */}
          <div className="pt-2">
            <button
              onClick={handleTestSound}
              disabled={!enabled}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                enabled
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Test Sound
            </button>
          </div>

          {/* Sound Types Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Task completion: Higher pitch ascending tone</p>
            <p>• Task unchecking: Lower pitch descending tone</p>
            <p>• Subtask completion: Higher pitched quick tone</p>
            <p>• Subtask unchecking: Lower pitched quick tone</p>
          </div>
        </div>
      </div>
    </div>
  );
}
