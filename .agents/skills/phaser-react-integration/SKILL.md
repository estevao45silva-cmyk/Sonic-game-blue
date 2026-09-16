---
name: phaser-react-integration
description: Best practices for integrating Phaser 3/4 with React without memory leaks.
---

# Phaser + React Integration Guide

## Core Principles

1. **One Instance Rule:**
   Never instantiate more than one Phaser Game instance in the React tree at the same time. The `<div id="phaser-container">` should be mounted once per game session.

2. **Clean Up (CRITICAL):**
   When the React component unmounts, the Phaser game instance **MUST** be destroyed to prevent memory leaks and duplicate audio contexts.
   ```typescript
   useEffect(() => {
     const game = new Phaser.Game(config);
     return () => {
       game.destroy(true);
     };
   }, []);
   ```

3. **Event Emitter Bridge:**
   To communicate between React and Phaser, use a global Event Emitter or `CustomEvent` on the `window` ou `document`. 
   - React -> Phaser: `window.dispatchEvent(new CustomEvent('player-jump'))`
   - Phaser -> React: `window.dispatchEvent(new CustomEvent('score-update', { detail: { score: 100 } }))`

4. **Avoid React State in Update Loop:**
   Do not call React `setState` inside the Phaser `update()` loop directly, as it runs at 60fps and will crash React. Throttle state updates or update React only on specific events (e.g., enemy killed, ring collected).
