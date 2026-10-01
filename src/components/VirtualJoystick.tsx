import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const VirtualJoystick: React.FC<{ character: string }> = ({ character }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    (window as any).sonicVirtualJoystick = {
      left: false, right: false, down: false, up: false, jump: false, jumpJustDown: false, actionJustDown: false
    };
    
    // Check if it's a touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsMobile(true);
    }
  }, []);

  const handleTouch = (key: string, state: boolean) => (e: React.SyntheticEvent) => {
    e.preventDefault(); // Prevent default mobile behaviors like scrolling/zooming
    const vJoy = (window as any).sonicVirtualJoystick;
    if (vJoy) {
      if (key === 'jump' && state && !vJoy.jump) vJoy.jumpJustDown = true;
      if (key === 'action' && state) vJoy.actionJustDown = true;
      vJoy[key] = state;
    }
  };

  if (!isMobile) return null;

  const btnStyle = {
    width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', border: '2px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', userSelect: 'none' as const, touchAction: 'none' as const, backdropFilter: 'blur(4px)'
  };

  return (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 1000, pointerEvents: 'none' }}>
      {/* D-PAD */}
      <div style={{ position: 'relative', width: '150px', height: '150px', pointerEvents: 'auto' }}>
        <div 
          style={{ ...btnStyle, position: 'absolute', top: 0, left: '45px' }}
          onTouchStart={handleTouch('up', true)} onTouchEnd={handleTouch('up', false)}
        >▲</div>
        <div 
          style={{ ...btnStyle, position: 'absolute', bottom: 0, left: '45px' }}
          onTouchStart={handleTouch('down', true)} onTouchEnd={handleTouch('down', false)}
        >▼</div>
        <div 
          style={{ ...btnStyle, position: 'absolute', top: '45px', left: 0 }}
          onTouchStart={handleTouch('left', true)} onTouchEnd={handleTouch('left', false)}
        >◀</div>
        <div 
          style={{ ...btnStyle, position: 'absolute', top: '45px', right: 0 }}
          onTouchStart={handleTouch('right', true)} onTouchEnd={handleTouch('right', false)}
        >▶</div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', pointerEvents: 'auto', paddingBottom: '20px' }}>
        <div 
          style={{ ...btnStyle, width: '70px', height: '70px', background: character === 'sonic' ? 'rgba(0, 100, 255, 0.4)' : 'rgba(255, 0, 0, 0.4)' }}
          onTouchStart={handleTouch('action', true)} onTouchEnd={handleTouch('action', false)}
        >
          {character === 'sonic' ? 'DASH' : 'ATK'}
        </div>
        <div 
          style={{ ...btnStyle, width: '80px', height: '80px', background: 'rgba(255, 200, 0, 0.4)' }}
          onTouchStart={handleTouch('jump', true)} onTouchEnd={handleTouch('jump', false)}
        >
          JUMP
        </div>
      </div>
    </div>
  );
};
