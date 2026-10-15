import React, { useState } from 'react';
import { X, Play, BookOpen, Zap, ExternalLink } from 'lucide-react';
import bannerImg from '../assets/images/racer_speed_banner_1792077200631.jpg';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  onOpenOriginal: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  onStart,
  onOpenOriginal,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Banner image with resilient fallback */}
        <div className="relative h-40 w-full overflow-hidden bg-neutral-950 flex-shrink-0">
          {!imageFailed ? (
            <img
              src={bannerImg}
              alt="Traffic Racer Night Raceway"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold font-outfit">
                  Driver Instructions
                </span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-neutral-300 hover:text-white hover:bg-black/90 transition cursor-pointer"
            aria-label="Close rules"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-5">
            <h2 className="text-2xl font-black text-white font-outfit tracking-wide drop-shadow-md">
              TRAFFIC RACER
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span>Driver Manual</span>
              <span aria-hidden="true">·</span>
              <span>Rules of the Road</span>
              <span aria-hidden="true">·</span>
              <span>Arcade Edition</span>
            </div>
          </div>
        </div>

        {/* Rules Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-sm text-neutral-300">
          <div className="p-3.5 bg-neutral-800/70 rounded-2xl border border-neutral-700/50">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-1.5 font-outfit text-base">
              <Zap className="w-4 h-4 text-amber-400" />
              Mission Objective
            </h3>
            <p className="text-neutral-300 leading-relaxed text-xs sm:text-sm">
              Weave through relentless multi-lane oncoming highway traffic. Survive as long as you can without scraping or colliding with opposing vehicles to log high scores!
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                01
              </span>
              <div>
                <strong className="text-white block text-xs sm:text-sm">Steering & Maneuvering</strong>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Press <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">↑ ↓ ← →</kbd> or <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">W A S D</kbd> to steer, accelerate forward, or brake. On mobile, use the on-screen tactile D-pad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                02
              </span>
              <div>
                <strong className="text-white block text-xs sm:text-sm">Randomized Traffic Lanes</strong>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Three distinct opposing vehicles descend upon you with varying entry lanes and offsets. Anticipate lane gaps to overtake safely.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">
                03
              </span>
              <div>
                <strong className="text-white block text-xs sm:text-sm">Dynamic Acceleration</strong>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Every 300 game cycles, traffic speed and highway lines accelerate, requiring lightning-fast reflexes and lane judgment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
                04
              </span>
              <div>
                <strong className="text-white block text-xs sm:text-sm">Persistent High Scores</strong>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Your record is automatically saved in your browser&apos;s local storage. Hit <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-200">Enter</kbd> to instantly retry after a collision.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800">
            <span>© Ansari Raza · All Rights Reserved</span>
            <button
              type="button"
              onClick={onOpenOriginal}
              className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 transition cursor-pointer"
            >
              <span>View Raw Repo Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-neutral-950/60 border-t border-neutral-800 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-neutral-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="font-outfit text-base">Start Race</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-2xl transition cursor-pointer text-sm"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
