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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-theme-secondary w-full max-w-2xl rounded-2xl border border-theme-border flex flex-col h-[50vh]">
        <div className="p-4 border-b border-theme-border flex items-center gap-4 bg-theme-tertiary">
          <span className="text-theme-muted text-2xl">🔍</span>
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('dash_search_placeholder')}
            className="flex-1 bg-transparent text-theme-text focus:outline-none text-lg"
            autoFocus
          />
          <button onClick={onClose} className="text-theme-muted hover:text-white">✖</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Arama sonuçları buraya gelecek */}
        </div>
      </div>
    </div>
  );
};