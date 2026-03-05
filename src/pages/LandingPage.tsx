// src/pages/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white font-sans overflow-x-hidden">
      {/* Dil Değiştirici */}
      <div className="absolute top-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 z-50 flex gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
        <button onClick={() => i18n.changeLanguage('tr')} className={`text-sm font-bold ${i18n.language.includes('tr') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>TR</button>
        <button onClick={() => i18n.changeLanguage('en')} className={`text-sm font-bold ${i18n.language.includes('en') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>EN</button>
        <button onClick={() => i18n.changeLanguage('de')} className={`text-sm font-bold transition ${i18n.language.includes('de') ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>DE</button>
      </div>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      </div>

      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto mt-12 md:mt-0">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ESSENTIAL
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-6 py-2 rounded-full border border-blue-500/30 hover:bg-blue-500/10 transition hidden md:block">
            {t('login')}
          </button>
          <button onClick={() => navigate('/register')} className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
            {t('start_free')}
          </button>
        </div>
      </nav>

      <section className="relative z-10 pt-20 pb-32 px-8 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: t('hero_title') }}></h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">{t('hero_desc')}</p>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition">{t('start_free')}</button>
          <button onClick={() => navigate('/pricing')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition">{t('upgrade_enterprise')}</button>
        </div>
      </section>

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

      <section className="relative z-10 py-32 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">{t('pricing_title')}</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 text-left">
              <h3 className="text-2xl font-bold mb-2">{t('free_plan')}</h3>
              <div className="text-4xl font-bold mb-6">0$ <span className="text-lg text-gray-500">{t('month')}</span></div>
              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl border border-white/20 hover:bg-white/10 transition">{t('free_btn')}</button>
            </div>
            <div className="p-10 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-600/20 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 bg-white/10 text-xs font-bold uppercase tracking-widest">{t('most_popular')}</div>
              <h3 className="text-2xl font-bold mb-2">{t('ent_plan')}</h3>
              <div className="text-4xl font-bold mb-6">10$ <span className="text-lg text-blue-200">{t('month')}</span></div>
              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-100 transition">{t('ent_btn')}</button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 text-center bg-gradient-to-b from-transparent to-blue-900/20">
        <h2 className="text-4xl font-bold mb-8">{t('footer_title')}</h2>
        <button onClick={() => navigate('/register')} className="px-10 py-5 bg-blue-600 rounded-2xl font-bold text-xl hover:scale-105 transition shadow-xl shadow-blue-500/40">
          {t('footer_btn')}
        </button>
      </section>
    </div>
  );
};

export default LandingPage;