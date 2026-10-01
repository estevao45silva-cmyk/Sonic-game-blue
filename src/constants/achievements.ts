export const ACHIEVEMENTS = [
  { id: 'first_ring', name: 'Coletor Iniciante', description: 'Coletou sua primeira argola!', icon: '💍', condition: (profile: any) => profile.globalRings >= 1 },
  { id: 'rich', name: 'Rico', description: 'Acumulou 1.000 argolas', icon: '💰', condition: (profile: any) => profile.globalRings >= 1000 },
  { id: 'sonic_speed', name: 'Sonic Speed', description: 'Comprou o Tênis de Corrida', icon: '👟', condition: (profile: any) => profile.inventory?.speed === true },
  { id: 'invincible', name: 'Estrela Guia', description: 'Comprou a Estrela de Invencibilidade', icon: '⭐', condition: (profile: any) => profile.inventory?.invincible === true },
  { id: 'shield_master', name: 'Mestre do Escudo', description: 'Adquiriu o Escudo de Raio', icon: '🛡️', condition: (profile: any) => profile.inventory?.shield === true },
  { id: 'veteran', name: 'Veterano', description: 'Possui 10 ou mais vidas', icon: '❤️', condition: (profile: any) => profile.inventory?.lives >= 10 },
  // Easter Eggs
  { id: 'ee_sanic', name: 'Gotta Go Fast!', description: 'Invocou o espírito do SANIC', icon: '🌀', condition: (profile: any) => profile.easterEggs?.sanic === true },
  { id: 'ee_konami', name: 'Código Secreto', description: 'Realizou o código ancestral', icon: '🎮', condition: (profile: any) => profile.easterEggs?.konami === true },
  { id: 'ee_afk', name: 'I am Waiting...', description: 'Testou a paciência do ouriço', icon: '⏱️', condition: (profile: any) => profile.easterEggs?.afk === true }
];

export const TITLES = [
  { id: 'novice', name: 'Novato', condition: () => true },
  { id: 'runner', name: 'Corredor', condition: () => true },
  { id: 'hero', name: 'Herói', condition: () => true },
  { id: 'legend', name: 'Lenda Viva', condition: (profile: any) => profile.globalRings >= 1000 },
  { id: 'title_sanic', name: 'SANIC', condition: (profile: any) => profile.easterEggs?.sanic === true },
  { id: 'title_retro', name: 'Retro Gamer', condition: (profile: any) => profile.easterEggs?.konami === true },
  { id: 'title_patient', name: 'O Paciente', condition: (profile: any) => profile.easterEggs?.afk === true }
];

export const checkAchievements = (profile: any) => {
  const earned: string[] = profile.achievements || [];
  let changed = false;
  
  ACHIEVEMENTS.forEach(ach => {
    if (!earned.includes(ach.id) && ach.condition(profile)) {
      earned.push(ach.id);
      changed = true;
    }
  });

  return changed ? earned : null;
};
