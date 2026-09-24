import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export const VirtualJoystick: React.FC<{ character: string }> = ({ character }) => {
  useEffect(() => {
    (window as any).sonicVirtualJoystick = {
      left: false, right: false, down: false, up: false, jump: false, jumpJustDown: false, actionJustDown: false
    };
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

  const btnStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(5px)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    color: '#fff',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    touchAction: 'none' as const,
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
      {/* D-PAD (Left side) */}
      <div style={{ position: 'absolute', bottom: '40px', left: '40px', display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
        <motion.div
          style={btnStyle}
          whileTap={{ scale: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          onTouchStart={handleTouch('left', true)}
          onTouchEnd={handleTouch('left', false)}
          onMouseDown={handleTouch('left', true)}
          onMouseUp={handleTouch('left', false)}
          onMouseLeave={handleTouch('left', false)}
        >
          ◀
        </motion.div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <motion.div
            style={btnStyle}
            whileTap={{ scale: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            onTouchStart={handleTouch('up', true)}
            onTouchEnd={handleTouch('up', false)}
            onMouseDown={handleTouch('up', true)}
            onMouseUp={handleTouch('up', false)}
            onMouseLeave={handleTouch('up', false)}
          >
            ▲
          </motion.div>
          
          <motion.div
            style={btnStyle}
            whileTap={{ scale: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            onTouchStart={handleTouch('down', true)}
            onTouchEnd={handleTouch('down', false)}
            onMouseDown={handleTouch('down', true)}
            onMouseUp={handleTouch('down', false)}
            onMouseLeave={handleTouch('down', false)}
          >
            ▼
          </motion.div>
        </div>

        <motion.div
          style={btnStyle}
          whileTap={{ scale: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          onTouchStart={handleTouch('right', true)}
          onTouchEnd={handleTouch('right', false)}
          onMouseDown={handleTouch('right', true)}
          onMouseUp={handleTouch('right', false)}
          onMouseLeave={handleTouch('right', false)}
        >
          ▶
        </motion.div>
      </div>

      {/* Action Buttons (Right side) */}
      <div style={{ position: 'absolute', bottom: '50px', right: '50px', display: 'flex', gap: '20px', pointerEvents: 'auto' }}>
        <motion.div
          style={{ ...btnStyle, width: '70px', height: '70px', backgroundColor: 'rgba(255, 0, 0, 0.3)', borderColor: 'rgba(255, 100, 100, 0.6)' }}
          whileTap={{ scale: 0.9, backgroundColor: 'rgba(255, 50, 50, 0.6)' }}
          onTouchStart={handleTouch('action', true)}
          onTouchEnd={handleTouch('action', false)}
          onMouseDown={handleTouch('action', true)}
          onMouseUp={handleTouch('action', false)}
          onMouseLeave={handleTouch('action', false)}
        >
          {character === 'shadow' ? 'C' : 'D'}
        </motion.div>

        <motion.div
          style={{ ...btnStyle, width: '80px', height: '80px', backgroundColor: 'rgba(0, 150, 255, 0.3)', borderColor: 'rgba(100, 200, 255, 0.6)' }}
          whileTap={{ scale: 0.9, backgroundColor: 'rgba(50, 180, 255, 0.6)' }}
          onTouchStart={handleTouch('jump', true)}
          onTouchEnd={handleTouch('jump', false)}
          onMouseDown={handleTouch('jump', true)}
          onMouseUp={handleTouch('jump', false)}
          onMouseLeave={handleTouch('jump', false)}
        >
          A
        </motion.div>
      </div>
    </div>
  );
};
