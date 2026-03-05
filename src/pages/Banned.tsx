// src/pages/Banned.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Banned: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    // Çıkış yaparken token'ı sil ve Login'e dön
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dil Seçici */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button onClick={() => i18n.changeLanguage('tr')} className={`text-sm font-bold transition ${i18n.language?.includes('tr') ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}>TR</button>
        <button onClick={() => i18n.changeLanguage('en')} className={`text-sm font-bold transition ${i18n.language?.includes('en') ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
        <button onClick={() => i18n.changeLanguage('de')} className={`text-sm font-bold transition ${i18n.language?.includes('de') ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}>DE</button>
      </div>

      {/* Arka Plan Kırmızı Parlama Efektleri (Tehlike/Ban Teması) */}
      <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-red-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Cam Efektli Uyarı Kutusu */}
      <div className="relative z-10 w-full max-w-lg bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-3xl p-10 shadow-2xl shadow-red-500/10 text-center">
        
        {/* Ban İkonu */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center border border-red-500/50">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        {/* Başlık ve Açıklama */}
        <h2 className="text-3xl font-extrabold text-white mb-4">{t('ban_title')}</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-8">
          {t('ban_desc')}
        </p>

        {/* İletişim Yönlendirmesi */}
        <div className="bg-red-950/30 border border-red-500/20 p-5 rounded-xl mb-8">
          <p className="text-gray-400 text-sm mb-2">{t('ban_contact_text')}</p>
          <a 
            href="mailto:destek@essential.com" 
            className="text-lg font-bold text-red-400 hover:text-red-300 transition underline decoration-red-500/50 underline-offset-4"
          >
            destek@essential.com
          </a>
        </div>

        {/* Çıkış Yap / Geri Dön Butonu */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl font-bold transition"
        >
          {t('ban_back_login')}
        </button>

      </div>
    </div>
  );
};

export default Banned;