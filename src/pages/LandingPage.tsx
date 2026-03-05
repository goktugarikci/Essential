// src/pages/LandingPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Dil Seçici State'leri
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklanınca dil menüsünü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const currentLang = i18n.language?.substring(0, 2).toUpperCase() || 'TR';

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white font-sans overflow-x-hidden relative">
      
      {/* Arka Plan Efektleri */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      </div>

      {/* ========================================================= */}
      {/* DİL SEÇİCİ - SOL ALT SABİT (FİXED) */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 left-6 z-50" ref={langMenuRef}>
        
        {/* Yukarı Doğru Açılan Dil Menüsü */}
        {isLangMenuOpen && (
          <div className="absolute bottom-14 left-0 w-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button onClick={() => changeLanguage('tr')} className={`text-sm px-4 py-2 text-left hover:bg-white/20 transition ${currentLang === 'TR' ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>Türkçe</button>
            <button onClick={() => changeLanguage('en')} className={`text-sm px-4 py-2 text-left hover:bg-white/20 transition ${currentLang === 'EN' ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>English</button>
            <button onClick={() => changeLanguage('de')} className={`text-sm px-4 py-2 text-left hover:bg-white/20 transition ${currentLang === 'DE' ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>Deutsch</button>
          </div>
        )}
        
        {/* Dil Açma Butonu */}
        <button 
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
          className="px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full text-sm font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2 shadow-lg"
        >
          {/* Çeviri/Dünya İkonu */}
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {currentLang}
        </button>
      </div>

      {/* Üst Navigasyon Menüsü */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto mt-6 md:mt-0">
        <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-wider">
          ESSENTIAL
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-6 py-2 rounded-full border border-blue-500/30 hover:bg-blue-500/10 transition hidden md:block font-medium">
            {t('login')}
          </button>
          <button onClick={() => navigate('/register')} className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 font-bold">
            {t('start_free')}
          </button>
        </div>
      </nav>

      {/* Hero (Ana Görsel) Alanı */}
      <section className="relative z-10 pt-20 pb-32 px-8 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: t('hero_title') }}></h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">{t('hero_desc')}</p>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition shadow-xl shadow-blue-600/30">
            {t('start_free')}
          </button>
          <button onClick={() => navigate('/pricing')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition">
            {t('upgrade_enterprise')}
          </button>
        </div>
      </section>

      {/* Özellikler Alanı */}
      <section className="relative z-10 py-24 px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">{t('features_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { title: t('feat_1_title'), desc: t('feat_1_desc'), icon: "💬" },
              { title: t('feat_2_title'), desc: t('feat_2_desc'), icon: "📹" },
              { title: t('feat_3_title'), desc: t('feat_3_desc'), icon: "🏢" },
              { title: t('feat_4_title'), desc: t('feat_4_desc'), icon: "📋" },
              { title: t('feat_5_title'), desc: t('feat_5_desc'), icon: "🔔" }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{f.icon}</div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiyatlandırma Alanı */}
      <section className="relative z-10 py-32 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">{t('pricing_title')}</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition">
              <h3 className="text-2xl font-bold mb-2">{t('free_plan')}</h3>
              <div className="text-4xl font-bold mb-6">0$ <span className="text-lg text-gray-500">{t('month')}</span></div>
              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl border border-white/20 hover:bg-white/20 transition font-bold">{t('free_btn')}</button>
            </div>
            <div className="p-10 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-600/30 text-left relative overflow-hidden transform hover:-translate-y-2 transition duration-300">
              <div className="absolute top-0 right-0 p-4 bg-white/20 text-xs font-bold uppercase tracking-widest">{t('most_popular')}</div>
              <h3 className="text-2xl font-bold mb-2">{t('ent_plan')}</h3>
              <div className="text-4xl font-bold mb-6">10$ <span className="text-lg text-blue-200">{t('month')}</span></div>
              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-100 transition shadow-lg">{t('ent_btn')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Aksiyon Çağrısı */}
      <section className="relative z-10 py-32 text-center bg-gradient-to-b from-transparent to-blue-900/20">
        <h2 className="text-4xl font-bold mb-8">{t('footer_title')}</h2>
        <button onClick={() => navigate('/register')} className="px-10 py-5 bg-blue-600 rounded-2xl font-bold text-xl hover:scale-105 transition shadow-2xl shadow-blue-500/40">
          {t('footer_btn')}
        </button>
      </section>

    </div>
  );
};

export default LandingPage;