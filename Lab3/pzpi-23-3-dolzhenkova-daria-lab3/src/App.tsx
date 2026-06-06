import React, { useState, useEffect } from 'react';
import MainScreen from './components/MainScreen';
import AdminScreen from './components/AdminScreen';
import ukTranslations from './locales/uk.json';
import enTranslations from './locales/en.json';

interface SystemUser {
  id: number;
  username: string;
  role: 'Admin' | 'Moderator' | 'Operator';
  isBlocked: boolean;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'admin'>('main');
  const [lang, setLang] = useState<'uk' | 'en'>('uk');  
  const [currentTime, setCurrentTime] = useState(new Date());

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
    { id: 1, username: 'admin1', role: 'Admin', isBlocked: false },
    { id: 2, username: 'operator2', role: 'Operator', isBlocked: false },
    { id: 3, username: 'moderator3', role: 'Moderator', isBlocked: false }
  ]);

  const [currentUserRole, setCurrentUserRole] = useState<'Admin' | 'Moderator' | 'Operator' | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const t = (path: string): string => {
    let translations = lang === 'uk' ? ukTranslations : enTranslations;
    if ((translations as any).default) translations = (translations as any).default;
    if (path.includes('.')) {
      const [mainKey, subKey] = path.split('.');
      const group = (translations as any)[mainKey];
      if (group && typeof group === 'object' && group[subKey]) return group[subKey];
    }
    return (translations as any)[path] || path;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const passwords: Record<string, string> = {
      'admin1': '1234',
      'operator2': '5555',
      'moderator3': '7777',
      'admin': 'admin2026'
    };


    const foundUser = systemUsers.find(u => u.username === username);
    const correctPassword = passwords[username];
    const userRole = username === 'admin' ? 'Admin' : foundUser?.role;

    if ((foundUser && password === correctPassword) || (username === 'admin' && password === 'admin2026')) {
      

      if (foundUser && foundUser.isBlocked) {
        alert(lang === 'uk' 
          ? "🛑 Цей акаунт заблоковано адміністратором! Вхід заборонено." 
          : "🛑 This account is blocked by admin! Access denied."
        );
        return;
      }

      setIsAuthenticated(true);
      setIsLoggingIn(false);
      setCurrentScreen('admin');
      

      if (userRole) setCurrentUserRole(userRole);
      
      alert(lang === 'uk' 
        ? `Вхід успішний! Вітаємо, ${username} (${userRole || 'Admin'})` 
        : `Login successful! Welcome, ${username} (${userRole || 'Admin'})`
      );

      setUsername('');
      setPassword('');
    } else {
      alert(t('wrong_credentials'));
    }
  };

  return (
    <div dir="ltr" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundImage: 'linear-gradient(to right, #f9ffbb, #ffaefc)', textAlign: 'center', textShadow: '5px 5px 5px rgba(32, 181, 250, 0.5)', margin: 0, padding: 0 }}>
        <h1 style={{ fontSize: currentScreen === 'main' ? '50px' : '40px', color: '#5c0268', padding: '20px', margin: 0, backgroundImage: 'linear-gradient(to right, #ffbbde, #aef8ff)' }}>
          {currentScreen === 'main' ? t('terminal_title') : t('admin_title')}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', alignItems: 'center' }}>
          <nav>
            {(isLoggingIn || currentScreen === 'admin') && (
              <button 
                onClick={() => { 
                  setIsLoggingIn(false);      
                  setIsAuthenticated(false);   
                  setCurrentScreen('main');    
                  setCurrentUserRole(null);
                  setUsername('');             
                  setPassword('');
                }} 
                style={{ background: 'none', border: 'none', color: '#5c0268', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '16px' }}
              >
                {t('back_to_terminal')}
              </button>
            )}
          </nav>
          <div style={{ fontSize: '14px', color: '#350097', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.6)', padding: '5px 15px', borderRadius: '10px' }}>
            📅 {new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { dateStyle: 'short' }).format(currentTime)} | ⏰ {new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { timeStyle: 'medium' }).format(currentTime)}
          </div>
          <div>
            <button onClick={() => setLang('uk')} style={{ fontWeight: lang === 'uk' ? 'bold' : 'normal', marginRight: '10px', cursor: 'pointer', padding: '5px 10px' }}>UA</button>
            <button onClick={() => setLang('en')} style={{ fontWeight: lang === 'en' ? 'bold' : 'normal', cursor: 'pointer', padding: '5px 10px' }}>EN</button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '30px 40px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
        {isLoggingIn && (
          <div style={{ backgroundColor: '#ffc9ea', borderRadius: '30px', padding: '30px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginTop: '50px' }}>
            <div style={{ background: 'linear-gradient(to right, #b3ffdd, #b4b8ff)', borderRadius: '20px', padding: '15px', textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#5c0268' }}>{t('admin_login_title')}</h3>
            </div>
            <form onSubmit={handleLoginSubmit}>
              <div style={{ backgroundColor: '#e4ffff', borderRadius: '15px', padding: '12px', marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#350097' }}>{t('login_label')}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ backgroundColor: '#e4ffff', borderRadius: '15px', padding: '12px', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#350097' }}>{t('password_label')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#5c0268', color: '#b3ffdd', padding: '12px', borderRadius: '15px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
                {t('login_btn')}
              </button>
            </form>
          </div>
        )}

        {!isLoggingIn && currentScreen === 'main' && <MainScreen t={t} lang={lang} key={lang} />}
        {!isLoggingIn && currentScreen === 'admin' && isAuthenticated && (          
          <AdminScreen 
            t={t} 
            lang={lang} 
            systemUsers={systemUsers} 
            setSystemUsers={setSystemUsers} 
            currentUserRole={currentUserRole} 
            key={lang} 
          />
        )}
      </main>

      <footer style={{ backgroundImage: 'linear-gradient(to right, #ffbbde, #aef8ff)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', marginTop: 'auto' }}>
        {currentScreen === 'main' && !isLoggingIn && (
          <button onClick={() => setIsLoggingIn(true)} style={{ background: 'none', border: 'none', color: '#5c0268', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '14px', opacity: 0.7 }}>
            ⚙️ Панель адміністратора
          </button>
        )}
        <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>&copy; 2026 EmoAD</p>
      </footer>
    </div>
  );
}

export default App;