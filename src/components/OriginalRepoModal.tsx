import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, FileCode, Play } from 'lucide-react';

interface OriginalRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalRepoModal: React.FC<OriginalRepoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('/original/index.html');
  const [iframeKey, setIframeKey] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-4xl h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                Original Folder Files Preview
              </h3>
              <p className="text-xs text-neutral-400">
                Running untouched TrafficRacerGame source from repository
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedFile('/original/index.html')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedFile === '/original/index.html'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                index.html
              </button>
              <button
                type="button"
                onClick={() => setSelectedFile('/original/traffic_racer_game.html')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedFile === '/original/traffic_racer_game.html'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                traffic_racer_game.html
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              title="Reload Frame"
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              href={selectedFile}
              target="_blank"
              rel="noreferrer"
              title="Open standalone in new tab"
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe */}
        <div className="flex-1 bg-black relative">
          <iframe
            key={iframeKey}
            src={selectedFile}
            title="Original Traffic Racer Game"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-neutral-950/80 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
          <span>
            Files loaded: <code className="text-emerald-400">{selectedFile}</code> (Original jQuery + CSS implementation)
          </span>
          <span className="hidden sm:inline">Use Arrow keys & Enter inside the frame to play</span>
        </div>
      </div>
    </div>
  );
};
