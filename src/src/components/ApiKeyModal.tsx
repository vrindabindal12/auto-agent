import React, { useState } from 'react';
import { writeFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = async () => {
    if (apiKey.trim()) {
      try {
        const appDirPath = await appDataDir();
        await writeFile({
          path: `${appDirPath}.env`,
          contents: `VITE_GROQ_API_KEY=${apiKey}`,
        });
        onSave(apiKey);
      } catch (error) {
        console.error('Failed to save .env file:', error);
        alert('Failed to save API key. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Enter Groq API Key</h2>
        <p className="text-gray-400 mb-4">Please provide your Groq API key to enable AI responses.</p>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key..."
          className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
        />
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-all duration-200"
        >
          Save API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;