# Sonic Game Project Guidelines

## Overview
This is a React and Vite-based web game project. Our main focus is not only gameplay but **high-end, immersive web experiences**. 

## Web Development Preferences
When the user asks to build or enhance the UI/UX, follow these rules:

1. **Prioritize 3D and Immersion**: We have powerful tools installed like `three`, `@react-three/fiber`, `gsap`, and `framer-motion`. Always suggest using them to add "wow" factor to the application, such as 3D menus, scroll animations, or floating interactive elements.
2. **Use React Three Fiber**: Whenever rendering 3D, always use React Three Fiber (`<Canvas>`) over vanilla Three.js for better integration with React state.
3. **Animations**: Use `gsap` for complex timeline animations or scroll-triggered effects, and `framer-motion` for simple UI state transitions (like modals appearing or buttons hovering).
4. **Code Quality**: Keep components decoupled. Put 3D logic in separate component files inside a `components/3d/` folder to keep standard React files clean.

## Important Note
For complex 3D integration, rely on the `immersive-web-dev` skill.
