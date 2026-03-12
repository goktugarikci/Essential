// src/components/modals/SearchModal.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchInput: string;
  setSearchInput: (val: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, searchInput, setSearchInput }) => {
  const { t } = useTranslation();

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
            placeholder={t('dash_search_placeholder', {defaultValue: 'Kişi, eski mesaj veya sunucu ara...'})}
            className="flex-1 bg-transparent text-theme-text focus:outline-none text-lg placeholder-theme-muted/50"
            autoFocus
          />
          <button 
            onClick={onClose} 
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
              <p className="text-sm mt-1 opacity-70">Sohbetler arasında kaybolmana gerek yok, sadece yazmaya başla.</p>
            </div>
          ) : (
            <div className="text-center text-theme-muted mt-16">
              <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="animate-pulse">"<strong className="text-theme-text">{searchInput}</strong>" aranıyor...</p>
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