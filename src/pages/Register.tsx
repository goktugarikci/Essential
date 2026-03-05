// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../api/auth'; // C++ Backend'e bağlanacak API fonksiyonumuz

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // API İstek Durumları İçin State'ler
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Her yeni denemede eski hatayı temizle
    setLoading(true); // Yükleniyor durumunu aktif et

    try {
      // C++ backend'e post isteği atılır
      await registerUser(name, email, password);
      console.log("Kayıt başarılı!");
      
      // Başarılıysa giriş (login) sayfasına yönlendir
      navigate('/login'); 
    } catch (err: any) {
      console.error("Kayıt hatası:", err);
      // Backend'den dönen hata mesajını (veya varsayılan mesajı) state'e kaydet
      setError(err.response?.data?.message || "Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false); // İşlem bitince butonun kilidini aç
    }
  };

  const handleGoogleAuth = () => {
    // TODO: Tauri / C++ üzerinden Google OAuth 2.0 penceresi açılacak
    console.log("Google ile kayıt tetiklendi");
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dil Seçici */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button onClick={() => i18n.changeLanguage('tr')} className={`text-sm font-bold transition ${i18n.language?.includes('tr') ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>TR</button>
        <button onClick={() => i18n.changeLanguage('en')} className={`text-sm font-bold transition ${i18n.language?.includes('en') ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>EN</button>
        <button onClick={() => i18n.changeLanguage('de')} className={`text-sm font-bold transition ${i18n.language?.includes('de') ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>DE</button>
      </div>

      {/* Ana Sayfaya Dönüş Butonu */}
      <div className="absolute top-6 left-6 z-50">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold">
          <span>←</span> ESSENTIAL
        </button>
      </div>

      {/* Arka Plan Parlama Efektleri (Glow) */}
      <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Cam Efektli (Glassmorphism) Kayıt Formu */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">{t('reg_title')}</h2>
          <p className="text-gray-400 text-sm">{t('reg_desc')}</p>
        </div>

        {/* Hata Mesajı Gösterimi */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm mb-2">{t('reg_name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
              placeholder="Ahmet Yılmaz"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">{t('reg_email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
              placeholder="ornek@sirket.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">{t('reg_pass')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/30 mt-4 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? "İşleniyor..." : t('reg_btn')}
          </button>
        </form>

        {/* Veya Şununla Devam Et Ayırıcısı */}
        <div className="mt-6 flex items-center justify-center">
          <div className="w-full border-t border-white/10"></div>
          <span className="px-3 text-xs text-gray-500 whitespace-nowrap">{t('or_continue')}</span>
          <div className="w-full border-t border-white/10"></div>
        </div>

        {/* Google Butonu */}
        <button 
          onClick={handleGoogleAuth}
          type="button"
          className="mt-6 w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 transition text-sm font-bold text-gray-300 hover:text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t('google_btn')}
        </button>

        <div className="mt-8 text-center text-sm text-gray-400">
          {t('reg_have_account')}{" "}
          <button onClick={() => navigate('/login')} className="text-blue-400 font-bold hover:text-blue-300 transition">
            {t('reg_login_link')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;