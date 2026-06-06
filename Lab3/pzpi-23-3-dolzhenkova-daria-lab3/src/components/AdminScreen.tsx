import React, { useState, useEffect } from 'react';

interface ScreenProps {
  t: (key: any) => any;
  lang: 'uk' | 'en';
  systemUsers: any[];
  setSystemUsers: React.Dispatch<React.SetStateAction<any[]>>;
  currentUserRole: 'Admin' | 'Moderator' | 'Operator' | null; 
}

function AdminScreen({ t, lang, systemUsers, setSystemUsers, currentUserRole }: ScreenProps) {
  const [emotion, setEmotion] = useState('happy');
  const [promoCode, setPromoCode] = useState('');
  const [slogan, setSlogan] = useState('');
  const [adsList, setAdsList] = useState<any[]>([]);

  const isUserAdmin = currentUserRole === 'Admin';

  const fetchAds = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/ads');
      const data = await response.json();
      
      const sortedData = data.sort((a: any, b: any) => {
        const currentLocale = lang === 'uk' ? 'uk' : 'en';
        return a.emotion.localeCompare(b.emotion, currentLocale);
      });

      setAdsList(sortedData);
    } catch (e) {
      console.log("Error loading ads");
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/add_ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion: emotion,
          slogan: slogan,
          promo_code: promoCode
        })
      });
      if (response.ok) {
        alert(lang === 'uk' ? "Рекламу успішно додано в базу!" : "Ad successfully added!");
        setSlogan('');
        setPromoCode('');
        fetchAds();
      } else {
        alert("Error saving ad");
      }
    } catch (error) {
      alert("Server error");
    }
  };

  const handleExport = () => {
    const backupStructure = {
      system_settings: {
        version: "1.0.4",
        default_layout: "LTR",
        export_date: new Date().toLocaleDateString()
      },
      advertisements: adsList
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupStructure, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "backup_system_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const dataToSort = parsed.advertisements ? parsed.advertisements : parsed;

          const currentLocale = lang === 'uk' ? 'uk' : 'en';
          const sorted = dataToSort.sort((a: any, b: any) => a.emotion.localeCompare(b.emotion, currentLocale));
          
          setAdsList(sorted);
          
          if (parsed.system_settings) {
            alert(lang === 'uk' 
              ? `Успішно імпортовано! Версія конфігу: ${parsed.system_settings.version}` 
              : `Imported successfully! Config version: ${parsed.system_settings.version}`);
          } else {
            alert(lang === 'uk' ? "Дані успішно імпортовано!" : "Data successfully imported!");
          }
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
    }
  };

  const toggleBlockUser = (id: number) => {
    if (!isUserAdmin) return; 
    setSystemUsers(systemUsers.map(user => 
      user.id === id ? { ...user, isBlocked: !user.isBlocked } : user
    ));
  };

  const changeUserRole = (id: number) => {
    if (!isUserAdmin) return;
    const roles: ('Admin' | 'Moderator' | 'Operator')[] = ['Admin', 'Moderator', 'Operator'];
    setSystemUsers(systemUsers.map(user => {
      if (user.id === id) {
        const nextIndex = (roles.indexOf(user.role) + 1) % roles.length;
        return { ...user, role: roles[nextIndex] };
      }
      return user
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '600px' }}>
      
      <section style={{ backgroundColor: '#ffc9ea', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'linear-gradient(to right, #b3ffdd, #b4b8ff)', borderRadius: '20px', padding: '25px' }}>
          <h2 style={{ color: '#5c0268', textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>{t('ad_management')}</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={handleExport} style={{ fontSize: '14px', padding: '10px', backgroundColor: '#29627e', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
              📥 {t('export_data')}
            </button>
            <label style={{ fontSize: '14px', padding: '10px', backgroundColor: '#350097', color: 'white', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', flex: 1, fontWeight: 'bold' }}>
              📤 {t('import_data')}
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ backgroundColor: '#e4ffff', borderRadius: '20px', padding: '15px', marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#350097' }}>{t('target_emotion')}</label>
              <select 
                value={emotion} 
                onChange={(e) => setEmotion(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '16px' }}
              >
                {['happy', 'sad', 'tired', 'angry'].map((emo) => (
                  <option key={emo} value={emo}>
                    {t(`emotions.${emo}`)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ backgroundColor: '#e4ffff', borderRadius: '20px', padding: '15px', marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#350097' }}>{t('ad_text')}</label>
              <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)} required placeholder="Введіть рекламний слоган..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div style={{ backgroundColor: '#e4ffff', borderRadius: '20px', padding: '15px', marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#350097' }}>{t('ad_url')}</label>
              <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} required placeholder="Промокод або URL для QR-коду" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ width: '100%', backgroundColor: '#5c0268', color: '#b3ffdd', padding: '15px', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
              {t('save_db')}
            </button>
          </form>
        </div>
      </section>

      <section style={{ backgroundColor: '#ffc9ea', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'linear-gradient(to right, #b4b8ff, #ffaefc)', borderRadius: '20px', padding: '25px' }}>
          <h2 style={{ color: '#5c0268', textAlign: 'center', marginTop: 0, marginBottom: '15px' }}>
            📋 {lang === 'uk' ? "Існуюча реклама в базі" : "Current Active Ads"}
          </h2>
          
          <div style={{ border: '1px solid #ccc', borderRadius: '15px', backgroundColor: '#ffffff', overflow: 'hidden', maxHeight: '250px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e4ffff', borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: '10px' }}>Emotion</th>
                  <th style={{ padding: '10px' }}>Slogan</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {adsList.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                      {lang === 'uk' ? "Реклама відсутня або сервер вимкнено" : "No ads found or server is offline"}
                    </td>
                  </tr>
                ) : (
                  adsList.map((ad: any, index: number) => (
                    <tr key={ad.id || index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#350097' }}>
                        {t(`emotions.${ad.emotion}`) || ad.emotion}
                      </td>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={ad.slogan}>
                        {ad.slogan}
                      </td>
                      <td style={{ padding: '10px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        
                        <button 
                          onClick={() => {
                            setEmotion(ad.emotion);
                            setSlogan(ad.slogan);
                            setPromoCode(ad.promo_code || ad.promoCode || '');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{ fontSize: '11px', padding: '5px 8px', backgroundColor: '#350097', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                          {lang === 'uk' ? 'Редагувати' : 'Edit'}
                        </button>

                        <button 
                          onClick={async () => {
                            if (window.confirm(lang === 'uk' ? "Видалити цю рекламу?" : "Delete this ad?")) {
                              try {
                                const response = await fetch(`http://127.0.0.1:5000/api/admin/delete_ad/${ad.id}`, { method: 'DELETE' });
                                if (response.ok) {
                                  alert(lang === 'uk' ? "Успішно видалено!" : "Deleted successfully!");
                                  fetchAds();
                                } else {
                                  alert("Error deleting ad");
                                }
                              } catch (e) {
                                alert("Server error");
                              }
                            }
                          }}
                          style={{ fontSize: '11px', padding: '5px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                          {lang === 'uk' ? 'Видалити' : 'Delete'}
                        </button>

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#ffc9ea', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'linear-gradient(to right, #fffdb3, #ffaefc)', borderRadius: '20px', padding: '25px' }}>
          <h2 style={{ color: '#5c0268', textAlign: 'center', marginTop: 0, marginBottom: '5px' }}>
            👥 {lang === 'uk' ? "Управління адміністраторами" : "User & Role Management"}
          </h2>
          <p style={{ textAlign: 'center', margin: '0 0 15px 0', fontSize: '13px', color: '#5c0268', fontWeight: 'bold' }}>
            {lang === 'uk' ? `Ваш рівень доступу: ${currentUserRole || 'Admin'}` : `Your role: ${currentUserRole || 'Admin'}`}
          </p>
          
          <div style={{ border: '1px solid #ccc', borderRadius: '15px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e4ffff', borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: '10px' }}>Username</th>
                  <th style={{ padding: '10px' }}>Role</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {systemUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee', opacity: user.isBlocked ? 0.5 : 1 }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                      {user.username} {user.isBlocked && "🛑"}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ backgroundColor: '#b4b8ff', padding: '3px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      
                      <button 
                        disabled={!isUserAdmin} 
                        onClick={() => changeUserRole(user.id)} 
                        style={{ fontSize: '11px', padding: '5px 8px', backgroundColor: isUserAdmin ? '#350097' : '#9ca3af', color: 'white', border: 'none', borderRadius: '5px', cursor: isUserAdmin ? 'pointer' : 'not-allowed', opacity: isUserAdmin ? 1 : 0.6 }}
                      >
                        {lang === 'uk' ? '🔄 Роль' : '🔄 Role'}
                      </button>
                      
                      <button 
                        disabled={!isUserAdmin} 
                        onClick={() => toggleBlockUser(user.id)} 
                        style={{ fontSize: '11px', padding: '5px 8px', backgroundColor: !isUserAdmin ? '#9ca3af' : (user.isBlocked ? '#22c55e' : '#ef4444'), color: 'white', border: 'none', borderRadius: '5px', cursor: isUserAdmin ? 'pointer' : 'not-allowed', opacity: isUserAdmin ? 1 : 0.6 }}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AdminScreen;