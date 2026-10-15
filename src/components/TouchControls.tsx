import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { sound } from '../sound';

interface TouchControlsProps {
  onStartMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onStopMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onStartMove,
  onStopMove,
}) => {
  const handleTouch = (
    e: React.TouchEvent | React.MouseEvent,
    dir: 'up' | 'down' | 'left' | 'right',
    start: boolean
  ) => {
    e.preventDefault();
    if (start) {
      onStartMove(dir);
    } else {
      onStopMove(dir);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none touch-none py-1">
      {/* Up Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onTouchStart={(e) => handleTouch(e, 'up', true)}
          onTouchEnd={(e) => handleTouch(e, 'up', false)}
          onMouseDown={(e) => handleTouch(e, 'up', true)}
          onMouseUp={(e) => handleTouch(e, 'up', false)}
          onMouseLeave={(e) => handleTouch(e, 'up', false)}
          className="w-13 h-13 bg-neutral-800/90 hover:bg-neutral-700/90 active:bg-amber-500 active:text-neutral-950 active:scale-95 text-neutral-200 rounded-2xl flex items-center justify-center border border-neutral-700/80 shadow-md transition-all cursor-pointer"
          aria-label="Accelerate / Move Up"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>

      {/* Middle row: Left, Horn, Right */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onTouchStart={(e) => handleTouch(e, 'left', true)}
          onTouchEnd={(e) => handleTouch(e, 'left', false)}
          onMouseDown={(e) => handleTouch(e, 'left', true)}
          onMouseUp={(e) => handleTouch(e, 'left', false)}
          onMouseLeave={(e) => handleTouch(e, 'left', false)}
          className="w-13 h-13 bg-neutral-800/90 hover:bg-neutral-700/90 active:bg-amber-500 active:text-neutral-950 active:scale-95 text-neutral-200 rounded-2xl flex items-center justify-center border border-neutral-700/80 shadow-md transition-all cursor-pointer"
          aria-label="Steer Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => sound.playHonk()}
          className="w-13 h-13 bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500 active:text-black active:scale-95 text-amber-300 font-bold text-[10px] rounded-2xl flex flex-col items-center justify-center border border-amber-500/40 shadow-md transition-all cursor-pointer"
          aria-label="Car Horn"
        >
          <Volume2 className="w-4 h-4 mb-0.5" />
          <span>HORN</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => handleTouch(e, 'right', true)}
          onTouchEnd={(e) => handleTouch(e, 'right', false)}
          onMouseDown={(e) => handleTouch(e, 'right', true)}
          onMouseUp={(e) => handleTouch(e, 'right', false)}
          onMouseLeave={(e) => handleTouch(e, 'right', false)}
          className="w-13 h-13 bg-neutral-800/90 hover:bg-neutral-700/90 active:bg-amber-500 active:text-neutral-950 active:scale-95 text-neutral-200 rounded-2xl flex items-center justify-center border border-neutral-700/80 shadow-md transition-all cursor-pointer"
          aria-label="Steer Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Down Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onTouchStart={(e) => handleTouch(e, 'down', true)}
          onTouchEnd={(e) => handleTouch(e, 'down', false)}
          onMouseDown={(e) => handleTouch(e, 'down', true)}
          onMouseUp={(e) => handleTouch(e, 'down', false)}
          onMouseLeave={(e) => handleTouch(e, 'down', false)}
          className="w-13 h-13 bg-neutral-800/90 hover:bg-neutral-700/90 active:bg-amber-500 active:text-neutral-950 active:scale-95 text-neutral-200 rounded-2xl flex items-center justify-center border border-neutral-700/80 shadow-md transition-all cursor-pointer"
          aria-label="Brake / Move Down"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
