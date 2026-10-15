import React from 'react';

interface VehicleProps {
  id: string;
  x: number;
  y: number;
  color: string;
  isPlayer?: boolean;
  showHeadlights?: boolean;
  tilt?: number;
  crashed?: boolean;
}

export const Vehicle: React.FC<VehicleProps> = ({
  id,
  x,
  y,
  color,
  isPlayer = false,
  showHeadlights = true,
  tilt = 0,
  crashed = false,
}) => {
  return (
    <div
      id={id}
      className={`car ${crashed ? 'animate-bounce' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: color,
        transform: `rotate(${tilt}deg) ${crashed ? 'scale(1.15) rotate(15deg)' : 'scale(1)'}`,
        filter: crashed ? 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.9))' : undefined,
      }}
    >
      {/* Dynamic Headlight Projection Beam */}
      {showHeadlights && <div className="headlight-cone" />}

      {/* Rear Taillight Flare */}
      <div className="taillight-flare" />

      {/* Front Windshield (Aerodynamic Curved Glass) */}
      <div className="f_glass" />

      {/* Rear Windshield */}
      <div className="b_glass" />

      {/* Front Dual Xenon Headlights */}
      <div className="f_light_l" />
      <div className="f_light_r" />

      {/* Rear Brake Taillights */}
      <div className="b_light_l" />
      <div className="b_light_r" />

      {/* 4 Rubber Racing Tires with Grip Texture */}
      <div className="f_tyre_l" />
      <div className="f_tyre_r" />
      <div className="b_tyre_l" />
      <div className="b_tyre_r" />

      {/* Center Racing Stripe for Player Car */}
      {isPlayer ? (
        <>
          <div
            className="absolute inset-x-[17px] top-[15%] bottom-[15%] rounded-full opacity-60 pointer-events-none"
            style={{ backgroundColor: '#ffffff' }}
          />
          {/* Subtle Roof Decal */}
          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900/40 rounded-sm pointer-events-none" />
        </>
      ) : (
        /* Roof Hood Line for Opponents */
        <div className="absolute top-[36%] inset-x-2.5 h-3 bg-black/20 rounded-xs pointer-events-none" />
      )}
    </div>
  );
};
