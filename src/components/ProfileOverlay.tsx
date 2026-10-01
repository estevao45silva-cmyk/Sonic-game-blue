import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProfile, updateUserProfile, auth } from '../services/firebase';
import { ACHIEVEMENTS, TITLES } from '../constants/achievements';
import { PROFILE_STYLE_ITEMS } from '../constants/storeItems';

interface ProfileOverlayProps {
  uid: string;
  onClose: () => void;
}

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ uid, onClose }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const isCurrentUser = auth.currentUser?.uid === uid;

  useEffect(() => {
    fetchProfile();
  }, [uid]);

  const fetchProfile = async () => {
    setLoading(true);
    const data = await getUserProfile(uid);
    setProfile(data);
    setNewName(data?.displayName || '');
    setLoading(false);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.length > 20) return;
    await updateUserProfile(uid, { displayName: newName });
    setProfile({ ...profile, displayName: newName });
    setIsEditingName(false);
  };

  const handleSelectTitle = async (titleId: string) => {
    if (!isCurrentUser) return;
    await updateUserProfile(uid, { selectedTitle: titleId });
    setProfile({ ...profile, selectedTitle: titleId });
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#FFD700', fontFamily: '"Press Start 2P", monospace' }}>Carregando...</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#222', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h2 style={{ color: '#FFF' }}>Perfil não encontrado</h2>
          <button onClick={onClose} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>Fechar</button>
        </div>
      </div>
    );
  }

  const earnedAchievements = profile.achievements || [];
  const selectedTitleInfo = TITLES.find(t => t.id === profile.selectedTitle) || TITLES[0];
  const unlockedStyles = profile.inventory?.unlockedStyles || [];
  const equippedStyles = profile.equippedStyles || {};

  const handleEquipStyle = async (type: 'border' | 'neon' | 'name' | 'bg' | 'filter', styleId: string | null) => {
    if (!isCurrentUser) return;
    const newEquipped = { ...equippedStyles, [type]: styleId };
    await updateUserProfile(uid, { equippedStyles: newEquipped });
    setProfile({ ...profile, equippedStyles: newEquipped });
  };

  const equippedBorder = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.border);
  const equippedNeon = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.neon);
  const equippedName = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.name);
  const equippedBg = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.bg);
  const equippedFilter = PROFILE_STYLE_ITEMS.find(i => i.id === equippedStyles.filter);

  const borderCss = equippedBorder?.cssValue || '4px solid #FFD700';
  const boxShadowCss = equippedNeon?.cssValue || '0 0 50px rgba(255,215,0,0.3)';
  const nameColorCss = equippedName?.cssValue || '#FFF';
  const nameShadowCss = equippedName ? `0 0 10px ${equippedName.cssValue}` : '2px 2px 0 #000';
  const bgCss = equippedBg?.cssValue || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
  const filterCss = equippedFilter?.cssValue || 'none';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Press Start 2P", "Inter", monospace',
        padding: '20px', boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '600px', maxHeight: '90vh',
          background: bgCss,
          borderRadius: '24px', border: borderCss,
          boxShadow: boxShadowCss,
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          color: '#FFF',
          transition: 'all 0.5s ease'
        }}
      >
        {/* Premium Header */}
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', padding: '30px 20px 20px', textAlign: 'center', position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', color: '#FFF', 
            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s'
          }}>✕</button>
          
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '15px' }}>
            <motion.img 
              initial={{ y: -10 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}
              src={profile.photoURL || ''} 
              alt="avatar" 
              style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                border: borderCss, 
                filter: filterCss, objectFit: 'cover',
                boxShadow: equippedNeon ? equippedNeon.cssValue : '0 10px 20px rgba(0,0,0,0.5)',
                position: 'relative', zIndex: 2
              }} 
              referrerPolicy="no-referrer" 
            />
            {profile.email === 'steven35silva@gmail.com' && (
              <div style={{
                position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: '2px solid #FFF',
                borderRadius: '20px', padding: '4px 10px', color: '#000', fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace', zIndex: 3, boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap'
              }}>
                👑 DONO
              </div>
            )}
          </div>
          
          {isEditingName && isCurrentUser ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                style={{ 
                  padding: '10px', fontFamily: '"Press Start 2P"', fontSize: '12px', width: '200px',
                  background: 'rgba(0,0,0,0.5)', border: '1px solid #FFD700', color: '#FFD700', borderRadius: '8px'
                }}
                maxLength={20}
              />
              <button onClick={handleSaveName} style={{ background: '#4CAF50', border: 'none', color: 'white', padding: '10px 15px', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' }}>Salvar</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '5px' }}>
              <h2 style={{ 
                margin: 0, fontSize: '28px', color: nameColorCss, textShadow: nameShadowCss, 
                transition: 'all 0.3s ease', letterSpacing: '1px'
              }}>
                {profile.displayName}
              </h2>
              {isCurrentUser && (
                <button onClick={() => setIsEditingName(true)} style={{ 
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', 
                  color: '#FFF', cursor: 'pointer', borderRadius: '15px', fontSize: '10px', padding: '4px 12px',
                  transition: 'background 0.2s'
                }}>
                  ✏️ Editar Nome
                </button>
              )}
            </div>
          )}
          
          <div style={{ 
            display: 'inline-block', marginTop: '12px', padding: '5px 15px', 
            background: 'rgba(0, 255, 255, 0.1)', border: '1px solid rgba(0, 255, 255, 0.3)', borderRadius: '20px',
            fontSize: '12px', color: '#00FFFF', textShadow: '0 0 5px #00FFFF', fontWeight: 'bold', fontFamily: 'sans-serif'
          }}>
            {selectedTitleInfo.name}
          </div>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }} className="profile-scroll">
          <style>{`
            .profile-scroll::-webkit-scrollbar { width: 8px; }
            .profile-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
            .profile-scroll::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.5); border-radius: 10px; }
            .profile-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,215,0,0.8); }
          `}</style>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '15px', marginBottom: '20px', backdropFilter: 'blur(5px)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>💍</div>
              <div style={{ fontSize: '16px', color: '#FFD700', textShadow: '0 0 10px #FFD700' }}>{profile.globalRings || 0}</div>
              <div style={{ fontSize: '10px' }}>Argolas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏆</div>
              <div style={{ fontSize: '16px', color: '#4CAF50', textShadow: '0 0 10px #4CAF50' }}>{earnedAchievements.length}</div>
              <div style={{ fontSize: '10px' }}>Conquistas</div>
            </div>
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '10px', marginBottom: '15px' }}>CONQUISTAS E MEDALHAS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
            {ACHIEVEMENTS.map(ach => {
              const earned = earnedAchievements.includes(ach.id);
              return (
                <div key={ach.id} style={{
                  background: earned ? 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,140,0,0.2))' : 'rgba(0,0,0,0.4)',
                  border: earned ? '2px solid #FFD700' : '2px solid #555',
                  borderRadius: '10px', padding: '10px', textAlign: 'center',
                  opacity: earned ? 1 : 0.5,
                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <div style={{ fontSize: '30px', marginBottom: '10px', filter: earned ? 'drop-shadow(0 0 10px #FFD700)' : 'grayscale(100%)' }}>
                    {ach.icon}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: earned ? '#FFF' : '#AAA', marginBottom: '5px', lineHeight: 1.2 }}>{ach.name}</div>
                  <div style={{ fontSize: '8px', color: '#888', fontFamily: 'sans-serif' }}>{ach.description}</div>
                </div>
              );
            })}
          </div>

          {isCurrentUser && (
            <>
              <h3 style={{ fontSize: '14px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '10px', marginTop: '30px', marginBottom: '15px' }}>TÍTULOS</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {TITLES.filter(t => !t.condition || t.condition(profile)).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTitle(t.id)}
                    style={{
                      padding: '8px 15px', borderRadius: '20px',
                      background: profile.selectedTitle === t.id ? '#FFD700' : 'rgba(255,255,255,0.1)',
                      color: profile.selectedTitle === t.id ? '#000' : '#FFF',
                      border: profile.selectedTitle === t.id ? '2px solid #FFF' : '1px solid #555',
                      cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '12px'
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {unlockedStyles.length > 0 && (
                <>
                  <h3 style={{ fontSize: '14px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '10px', marginTop: '30px', marginBottom: '15px' }}>ESTILOS EQUIPADOS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {['border', 'neon', 'name', 'bg', 'filter'].map(type => {
                      const typeStyles = unlockedStyles.filter((s: string) => s.startsWith(`style_${type}_`));
                      if (typeStyles.length === 0) return null;
                      
                      let typeName = '';
                      if (type === 'border') typeName = 'Borda Circular do Avatar';
                      if (type === 'neon') typeName = 'Efeito Neon / Brilho';
                      if (type === 'name') typeName = 'Cor Mágica do Nome';
                      if (type === 'bg') typeName = 'Fundo Dinâmico do Cartão';
                      if (type === 'filter') typeName = 'Filtro Especial do Avatar';

                      return (
                        <div key={type}>
                          <div style={{ fontSize: '12px', color: '#00FFFF', marginBottom: '8px', textShadow: '0 0 5px #00FFFF' }}>{typeName}:</div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={() => handleEquipStyle(type as any, null)} style={{ padding: '6px 12px', fontSize: '10px', borderRadius: '8px', border: !equippedStyles[type] ? '2px solid #00FF9D' : '1px solid rgba(255,255,255,0.2)', background: !equippedStyles[type] ? 'rgba(0,255,157,0.2)' : 'rgba(0,0,0,0.3)', color: '#FFF', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontWeight: 'bold' }}>Padrão</button>
                            {typeStyles.map((s: string) => {
                              const itemInfo = PROFILE_STYLE_ITEMS.find(i => i.id === s);
                              const isEquipped = equippedStyles[type] === s;
                              return (
                                <button key={s} onClick={() => handleEquipStyle(type as any, s)} style={{ padding: '6px 12px', fontSize: '10px', borderRadius: '8px', border: isEquipped ? '2px solid #00FF9D' : '1px solid rgba(255,255,255,0.2)', background: isEquipped ? 'rgba(0,255,157,0.2)' : 'rgba(0,0,0,0.3)', color: '#FFF', cursor: 'pointer', fontFamily: '"Inter", sans-serif', fontWeight: 'bold' }}>
                                  {itemInfo?.name || s.split('_').pop()?.toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

