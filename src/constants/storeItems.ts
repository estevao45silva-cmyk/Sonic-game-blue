export interface StoreStyleItem {
  id: string;
  name: string;
  cost: number;
  desc: string;
  type: 'border' | 'neon' | 'name' | 'bg' | 'filter';
  cssValue: string; 
  iconText: string;
}

export const PROFILE_STYLE_ITEMS: StoreStyleItem[] = [
  // 10 Borders
  { id: 'style_border_gold', name: 'Borda Ouro Puro', cost: 200, desc: 'Clássica e brilhante borda dourada.', type: 'border', cssValue: '4px solid #FFD700', iconText: 'BRD' },
  { id: 'style_border_fire', name: 'Borda Vulcânica', cost: 300, desc: 'Borda com tons avermelhados de magma.', type: 'border', cssValue: '4px solid #FF4500', iconText: 'BRD' },
  { id: 'style_border_ocean', name: 'Borda Oceânica', cost: 300, desc: 'Borda azul profunda dos mares.', type: 'border', cssValue: '4px solid #006994', iconText: 'BRD' },
  { id: 'style_border_emerald', name: 'Borda Esmeralda', cost: 500, desc: 'Feita das lendárias Esmeraldas do Caos.', type: 'border', cssValue: '4px ridge #50C878', iconText: 'BRD' },
  { id: 'style_border_amethyst', name: 'Borda Ametista', cost: 400, desc: 'Cristal roxo místico.', type: 'border', cssValue: '4px groove #9966CC', iconText: 'BRD' },
  { id: 'style_border_ruby', name: 'Borda Rubi', cost: 400, desc: 'Cristal vermelho intenso.', type: 'border', cssValue: '4px double #E0115F', iconText: 'BRD' },
  { id: 'style_border_diamond', name: 'Borda Diamante', cost: 800, desc: 'A borda mais dura e brilhante.', type: 'border', cssValue: '4px solid #b9f2ff', iconText: 'BRD' },
  { id: 'style_border_obsidian', name: 'Borda Obsidiana', cost: 600, desc: 'Pedra vulcânica negra como a noite.', type: 'border', cssValue: '4px solid #1a1a1a', iconText: 'BRD' },
  { id: 'style_border_silver', name: 'Borda Prateada', cost: 250, desc: 'Borda de prata polida.', type: 'border', cssValue: '4px solid #C0C0C0', iconText: 'BRD' },
  { id: 'style_border_bronze', name: 'Borda Bronze', cost: 150, desc: 'Para guerreiros experientes.', type: 'border', cssValue: '4px solid #CD7F32', iconText: 'BRD' },
  { id: 'style_border_galaxy', name: 'Borda Galáctica', cost: 1500, desc: 'Borda estelar animada em gradiente.', type: 'border', cssValue: '4px dashed #FF00FF', iconText: 'BRD' },
  { id: 'style_border_hacker', name: 'Borda Glitch', cost: 1200, desc: 'Borda distorcida e digital.', type: 'border', cssValue: '4px dotted #00FF00', iconText: 'BRD' },

  // 10 Neons (box-shadows)
  { id: 'style_neon_cyan', name: 'Neon Cibernético', cost: 250, desc: 'Efeito neon azul claro tecnológico.', type: 'neon', cssValue: '0 0 30px #00FFFF, inset 0 0 30px #00FFFF', iconText: 'NEO' },
  { id: 'style_neon_purple', name: 'Neon Sombrio', cost: 250, desc: 'Efeito neon roxo misterioso.', type: 'neon', cssValue: '0 0 30px #8A2BE2, inset 0 0 30px #8A2BE2', iconText: 'NEO' },
  { id: 'style_neon_blood', name: 'Neon Carmesim', cost: 350, desc: 'Efeito neon vermelho sangue.', type: 'neon', cssValue: '0 0 30px #DC143C, inset 0 0 30px #DC143C', iconText: 'NEO' },
  { id: 'style_neon_toxic', name: 'Neon Radioativo', cost: 300, desc: 'Verde tóxico e perigoso.', type: 'neon', cssValue: '0 0 30px #39FF14, inset 0 0 30px #39FF14', iconText: 'NEO' },
  { id: 'style_neon_sun', name: 'Neon Solar', cost: 400, desc: 'Brilho intenso como o sol.', type: 'neon', cssValue: '0 0 40px #FFA500, inset 0 0 40px #FFA500', iconText: 'NEO' },
  { id: 'style_neon_void', name: 'Neon Vazio', cost: 500, desc: 'Uma aura negra que absorve a luz.', type: 'neon', cssValue: '0 0 40px #000000, inset 0 0 40px #000000', iconText: 'NEO' },
  { id: 'style_neon_pink', name: 'Neon Rosa Choque', cost: 200, desc: 'Aura rosa vibrante.', type: 'neon', cssValue: '0 0 30px #FF1493, inset 0 0 30px #FF1493', iconText: 'NEO' },
  { id: 'style_neon_white', name: 'Neon Divino', cost: 600, desc: 'Brilho branco celestial.', type: 'neon', cssValue: '0 0 40px #FFFFFF, inset 0 0 40px #FFFFFF', iconText: 'NEO' },
  { id: 'style_neon_ice', name: 'Neon Glacial', cost: 300, desc: 'Aura fria e congelante.', type: 'neon', cssValue: '0 0 30px #A5F2F3, inset 0 0 30px #A5F2F3', iconText: 'NEO' },
  { id: 'style_neon_chaos', name: 'Neon do Caos', cost: 1000, desc: 'Aura com várias cores vibrantes.', type: 'neon', cssValue: '0 0 20px #FF0000, 0 0 40px #00FF00, inset 0 0 30px #0000FF', iconText: 'NEO' },
  { id: 'style_neon_super', name: 'Neon Super Sonic', cost: 2000, desc: 'Aura dourada extremamente radiante.', type: 'neon', cssValue: '0 0 50px #FFD700, 0 0 100px #FFA500, inset 0 0 50px #FFF', iconText: 'NEO' },
  { id: 'style_neon_dark', name: 'Neon Dark Sonic', cost: 2000, desc: 'Aura negra absorvente.', type: 'neon', cssValue: '0 0 60px #111, inset 0 0 40px #000', iconText: 'NEO' },

  // 10 Name Colors
  { id: 'style_name_gold', name: 'Nome de Ouro', cost: 400, desc: 'Seu nome brilhará em ouro puro.', type: 'name', cssValue: '#FFD700', iconText: 'TXT' },
  { id: 'style_name_matrix', name: 'Nome Matriz', cost: 400, desc: 'Estilo hacker verde cibernético.', type: 'name', cssValue: '#00FF00', iconText: 'TXT' },
  { id: 'style_name_blood', name: 'Nome Sanguinário', cost: 350, desc: 'Vermelho escuro intimidador.', type: 'name', cssValue: '#8B0000', iconText: 'TXT' },
  { id: 'style_name_ghost', name: 'Nome Fantasma', cost: 300, desc: 'Branco translúcido assustador.', type: 'name', cssValue: 'rgba(255,255,255,0.7)', iconText: 'TXT' },
  { id: 'style_name_royal', name: 'Nome Realeza', cost: 500, desc: 'Roxo majestoso e elegante.', type: 'name', cssValue: '#4B0082', iconText: 'TXT' },
  { id: 'style_name_sky', name: 'Nome Celeste', cost: 200, desc: 'Azul como o céu aberto.', type: 'name', cssValue: '#87CEEB', iconText: 'TXT' },
  { id: 'style_name_rose', name: 'Nome Rosé', cost: 250, desc: 'Rosa suave e delicado.', type: 'name', cssValue: '#FFC0CB', iconText: 'TXT' },
  { id: 'style_name_abyss', name: 'Nome Abissal', cost: 600, desc: 'Preto profundo.', type: 'name', cssValue: '#111111', iconText: 'TXT' },
  { id: 'style_name_lava', name: 'Nome Magmático', cost: 450, desc: 'Laranja vibrante e quente.', type: 'name', cssValue: '#FF4500', iconText: 'TXT' },
  { id: 'style_name_sonic', name: 'Nome Ouriço', cost: 1000, desc: 'Azul lendário do próprio Sonic.', type: 'name', cssValue: '#0000CD', iconText: 'TXT' },
  { id: 'style_name_rainbow', name: 'Nome Arco-Íris', cost: 2500, desc: 'Cor que muda constantemente (simulado com prata super brilhante).', type: 'name', cssValue: '#FF00FF', iconText: 'TXT' },

  // 10 Backgrounds (linear-gradients for the profile card)
  { id: 'style_bg_dark', name: 'Fundo Escuridão', cost: 200, desc: 'Fundo totalmente escuro.', type: 'bg', cssValue: 'linear-gradient(135deg, #111 0%, #000 100%)', iconText: 'FND' },
  { id: 'style_bg_blood', name: 'Fundo Carmesim', cost: 300, desc: 'Vermelho escuro e sinistro.', type: 'bg', cssValue: 'linear-gradient(135deg, #4A0000 0%, #220000 100%)', iconText: 'FND' },
  { id: 'style_bg_forest', name: 'Fundo Floresta', cost: 300, desc: 'Verde profundo e natural.', type: 'bg', cssValue: 'linear-gradient(135deg, #003300 0%, #001100 100%)', iconText: 'FND' },
  { id: 'style_bg_ocean', name: 'Fundo Abissal', cost: 350, desc: 'Azul muito profundo.', type: 'bg', cssValue: 'linear-gradient(135deg, #000033 0%, #000011 100%)', iconText: 'FND' },
  { id: 'style_bg_sunset', name: 'Fundo Pôr do Sol', cost: 500, desc: 'Cores quentes do entardecer.', type: 'bg', cssValue: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)', iconText: 'FND' },
  { id: 'style_bg_cyber', name: 'Fundo Retrowave', cost: 600, desc: 'Estilo anos 80 vaporwave.', type: 'bg', cssValue: 'linear-gradient(135deg, #FF0099 0%, #493240 100%)', iconText: 'FND' },
  { id: 'style_bg_gold', name: 'Fundo Imperial', cost: 800, desc: 'Brilho dourado por todo o cartão.', type: 'bg', cssValue: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #B38728 100%)', iconText: 'FND' },
  { id: 'style_bg_toxic', name: 'Fundo Mutante', cost: 400, desc: 'Verde neon e preto.', type: 'bg', cssValue: 'linear-gradient(135deg, #000000 0%, #0f9b0f 100%)', iconText: 'FND' },
  { id: 'style_bg_space', name: 'Fundo Espacial', cost: 700, desc: 'Cores do cosmos.', type: 'bg', cssValue: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', iconText: 'FND' },
  { id: 'style_bg_crystal', name: 'Fundo Cristalino', cost: 500, desc: 'Azul claro e transparente.', type: 'bg', cssValue: 'linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)', iconText: 'FND' },
  { id: 'style_bg_emerald', name: 'Fundo Master Emerald', cost: 2000, desc: 'Energia pura esmeralda.', type: 'bg', cssValue: 'radial-gradient(circle, #00FF00 0%, #003300 100%)', iconText: 'FND' },

  // 10 Avatar Filters
  { id: 'style_filter_gray', name: 'Filtro Cinzas', cost: 100, desc: 'Deixa sua foto preto e branco.', type: 'filter', cssValue: 'grayscale(100%)', iconText: 'FLT' },
  { id: 'style_filter_sepia', name: 'Filtro Antigo', cost: 150, desc: 'Tom sépia vintage.', type: 'filter', cssValue: 'sepia(100%)', iconText: 'FLT' },
  { id: 'style_filter_invert', name: 'Filtro Negativo', cost: 200, desc: 'Inverte todas as cores da sua foto.', type: 'filter', cssValue: 'invert(100%)', iconText: 'FLT' },
  { id: 'style_filter_blur', name: 'Filtro Misterioso', cost: 250, desc: 'Sua identidade embaçada e oculta.', type: 'filter', cssValue: 'blur(3px)', iconText: 'FLT' },
  { id: 'style_filter_contrast', name: 'Filtro Extremo', cost: 300, desc: 'Alto contraste agressivo.', type: 'filter', cssValue: 'contrast(200%)', iconText: 'FLT' },
  { id: 'style_filter_bright', name: 'Filtro Iluminado', cost: 200, desc: 'Sua foto radiante e clara.', type: 'filter', cssValue: 'brightness(150%)', iconText: 'FLT' },
  { id: 'style_filter_hue', name: 'Filtro Psicodélico', cost: 400, desc: 'Altera as cores naturais.', type: 'filter', cssValue: 'hue-rotate(90deg)', iconText: 'FLT' },
  { id: 'style_filter_saturate', name: 'Filtro Vibrante', cost: 350, desc: 'Cores estouradas e vivas.', type: 'filter', cssValue: 'saturate(300%)', iconText: 'FLT' },
  { id: 'style_filter_opacity', name: 'Filtro Fantasma', cost: 400, desc: 'Sua foto quase invisível.', type: 'filter', cssValue: 'opacity(50%)', iconText: 'FLT' },
  { id: 'style_filter_combo', name: 'Filtro Corrompido', cost: 1000, desc: 'Invertido e saturado.', type: 'filter', cssValue: 'invert(100%) saturate(300%)', iconText: 'FLT' },
];
