---
name: modern-react-architecture
description: >-
  Use this skill when refactoring React code, adding state management, or structuring a modern web application to ensure maintainability and scalable code quality.
---

# Modern React Architecture Skill

When applying this skill, the agent will enforce strict modern React standards, prioritizing hooks, clean architecture, and optimal performance.

## Best Practices

1. **State Management:**
   - Avoid prop-drilling. If state needs to be accessed across multiple layers, suggest using **Zustand** or **Jotai**.
   - Keep React state separate from complex game state (e.g., Phaser). Only sync the absolute minimum necessary data to React (like Score or Lives) using event listeners.

2. **Component Structure:**
   - Keep components small and focused on a single responsibility.
   - Separate logic from UI: Use custom hooks (`usePlayerState`, `useGameAudio`) to handle effects and data fetching.

3. **Styling and Animations:**
   - Use **Framer Motion** for all complex UI transitions. Avoid raw CSS keyframes if the animation requires complex unmounting or spring physics.
   - For styling, rely on standard CSS or utility classes if requested, but maintain a cohesive design token system (variables for colors, spacing).

## Checkpoints
- Before creating a massive `App.tsx`, break it down into `Layout`, `GameContainer`, and `UIOverlay`.
