// src/components/modals/SearchModal.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient'; // 🟢 DÜZELTİLDİ: Doğru Import Yolu

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchInput: string;
  setSearchInput: (val: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, searchInput, setSearchInput }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce Mantığı: Kullanıcı yazmayı bıraktıktan 500ms sonra API'ye istek atar.
  useEffect(() => {
    if (!searchInput.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get(`/api/users/search?q=${searchInput.trim()}`);
        setResults(res.data || []);
      } catch (err) {
        console.error("Arama hatası:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleClose = () => {
    setSearchInput('');
    setResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-theme-secondary w-full max-w-2xl rounded-2xl shadow-2xl border border-theme-border overflow-hidden relative flex flex-col h-[50vh] min-h-[400px]">
        
        {/* Arama Input Alanı */}
        <div className="p-4 border-b border-theme-border flex items-center gap-4 bg-theme-tertiary">
          <span className="text-theme-muted text-2xl">🔍</span>
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('dash_search_placeholder', {defaultValue: 'Kişi, e-posta veya sunucu ara...'})}
            className="flex-1 bg-transparent text-theme-text focus:outline-none text-lg placeholder-theme-muted/50"
            autoFocus
          />
          <button 
            onClick={handleClose} 
            className="w-8 h-8 rounded-full bg-theme-primary hover:bg-red-500 text-theme-muted hover:text-white flex items-center justify-center transition-all shrink-0"
          >
            ✖
          </button>
        </div>

        {/* Arama Sonuçları */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {searchInput.trim() === '' ? (
            <div className="m-auto text-center text-theme-muted">
              <div className="text-5xl mb-4 opacity-50">🧭</div>
              <p className="font-medium text-theme-text">{t('dash_search_empty', {defaultValue: 'Ne aramak istiyorsun?'})}</p>
              <p className="text-sm mt-1 opacity-70">Ağındaki kişileri bulmak için yazmaya başla.</p>
            </div>
          ) : isSearching ? (
            <div className="text-center text-theme-muted mt-16">
              <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="animate-pulse">"<strong className="text-theme-text">{searchInput}</strong>" aranıyor...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-theme-muted uppercase mb-2">Bulunan Kişiler ({results.length})</h3>
              {results.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-theme-primary rounded-lg border border-theme-border hover:border-blue-500 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex justify-center items-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-theme-text font-bold text-sm">{user.name}</p>
                      <p className="text-theme-muted text-xs">{user.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${user.status === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    {user.status || 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
             <div className="m-auto text-center text-theme-muted">
               <p className="text-lg">Sonuç bulunamadı 😔</p>
             </div>
          )}
        </div>
        
        {/* Modal Alt Bilgisi */}
        <div className="p-3 bg-theme-primary border-t border-theme-border text-xs text-theme-muted flex justify-between items-center">
          <span>Arama modülünü kapatmak için <kbd className="bg-theme-tertiary px-1.5 py-0.5 rounded border border-theme-border font-mono text-[10px] ml-1">ESC</kbd> tuşuna basabilirsin.</span>
        </div>
      </div>
    </div>
  );
};