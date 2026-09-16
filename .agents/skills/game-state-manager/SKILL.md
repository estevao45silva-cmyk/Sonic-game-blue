---
name: game-state-manager
description: Guidelines for syncing global state between React and game engines (Phaser/Three.js).
---

# Game State Management Guide

## Decoupling Logic

1. **State Ownership:**
   Keep the source of truth for the game state (e.g., player position, physics) inside the Game Engine (Phaser/Three.js). React should only know about state that needs to be rendered on the UI (e.g., Score, Lives, Rings).

2. **Syncing State (Engine -> React):**
   When an event happens in the engine, dispatch an event. Use a custom hook in React to listen to this event and update the UI state.
   
   *Engine side:*
   ```typescript
   window.dispatchEvent(new CustomEvent('ring-collected', { detail: { total: rings } }));
   ```
   
   *React side:*
   ```typescript
   useEffect(() => {
     const handleRing = (e: CustomEvent) => setRings(e.detail.total);
     window.addEventListener('ring-collected', handleRing as EventListener);
     return () => window.removeEventListener('ring-collected', handleRing as EventListener);
   }, []);
   ```

3. **Global Stores:**
   For complex applications, consider using `zustand` instead of React Context to prevent unnecessary re-renders of the entire application. Zustand allows components to subscribe only to the specific state they need.
