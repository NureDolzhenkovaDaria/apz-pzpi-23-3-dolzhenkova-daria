import React, { useState } from 'react';

interface ScreenProps {
  t: (key: any) => any;
  lang: 'uk' | 'en';
}

function MainScreen({ t, lang }: ScreenProps) {
  const [slogan, setSlogan] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');

  const getAd = async (emotion: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/get_ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: emotion, client_type: 'web' })
      });
      const data = await response.json();
      if (response.ok) {
        setSlogan(data.slogan);
        setPromoCode(data.promo_code); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert(lang === 'uk' ? "Помилка зв'язку з сервером" : "Server connection error");
    }
  };

  const emojiButtonStyle: React.CSSProperties = {
    flex: 1,
    fontSize: '70px',     
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  };

  return (
    <section style={{ backgroundColor: '#ffc9ea', borderRadius: '30px', padding: '40px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
      <div style={{ background: 'linear-gradient(to right, #b3ffdd, #b4b8ff)', borderRadius: '20px', padding: '25px', textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#5c0268' }}>{t('welcome_title')}</h2>
      </div>

      <div style={{ backgroundColor: '#e4ffff', borderRadius: '20px', padding: '25px', marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, color: '#350097' }}>{t('why_important')}</h3>
        <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#333' }}>{t('gdpr_text')}</p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '30px', padding: '50px 20px', textAlign: 'center', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '24px', color: '#5c0268', marginTop: 0, marginBottom: '30px' }}>{t('how_feel')}</h3>
        
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto 40px auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
            <button onClick={() => getAd('happy')} style={emojiButtonStyle} title="Веселий">😊</button>
            <button onClick={() => getAd('sad')} style={emojiButtonStyle} title="Сумний">😔</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
            <button onClick={() => getAd('tired')} style={emojiButtonStyle} title="Втомлений">🥱</button>
            <button onClick={() => getAd('angry')} style={emojiButtonStyle} title="Злий">😡</button>
          </div>
        </div>

        <div style={{ marginTop: '40px', padding: '30px', border: '2px dashed #e49bc0', borderRadius: '20px', minHeight: '120px', backgroundColor: '#fffdfd' }}>
          <h4 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#5c0268' }}>
            {slogan || t('select_emotion')}
          </h4>
          
          {promoCode && (
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(promoCode)}`} 
                alt="QR Code" 
                style={{ border: '4px solid #b3ffdd', borderRadius: '15px', padding: '10px', backgroundColor: '#fff' }}
              />
              <p style={{ fontSize: '16px', color: '#350097', fontWeight: 'bold', marginTop: '15px' }}>
                {t('source_external')}: <span style={{ color: '#5c0268' }}>{promoCode}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default MainScreen;