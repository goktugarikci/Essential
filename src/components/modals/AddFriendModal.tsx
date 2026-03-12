// src/components/modals/AddFriendModal.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (nameOrEmail: string) => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onAddFriend }) => {
  const { t } = useTranslation();
  const [friendInput, setFriendInput] = useState('');

  if (!isOpen) return null;

  // İsteği Dashboard'a gönderen ve ardından input'u temizleyen yardımcı fonksiyon
  const handleSendRequest = () => {
    if (!friendInput.trim()) return;
    
    // Girdiğimiz ismi Dashboard'daki fonksiyona yolluyoruz
    onAddFriend(friendInput.trim()); 
    setFriendInput(''); // Başarılı gönderimden sonra input'u sıfırla
  };

  // Modalı iptal ederek kapatırken de input'u temizlemek için
  const handleClose = () => {
    setFriendInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-theme-secondary w-full max-w-md rounded-2xl shadow-2xl border border-theme-border overflow-hidden relative">
        
        {/* Üst Bar (Header) */}
        <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-tertiary">
          <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
            <span>👤</span> {t('dash_add_friend', { defaultValue: 'Arkadaş Ekle' })}
          </h2>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 rounded-full bg-theme-primary hover:bg-red-500 text-theme-muted hover:text-white flex items-center justify-center transition-all"
          >
            ✖
          </button>
        </div>

        {/* İçerik Alanı (Body) */}
        <div className="p-6">
          <p className="text-sm text-theme-muted mb-4">
            {t('dash_add_friend_desc', { defaultValue: 'Eklemek istediğin arkadaşının kullanıcı adını veya e-posta adresini gir.' })}
          </p>
          
          <input 
            type="text" 
            value={friendInput}
            onChange={(e) => setFriendInput(e.target.value)}
            placeholder={t('dash_add_friend_placeholder', { defaultValue: 'Kullanıcı adı veya e-posta...' })}
            className="w-full bg-theme-primary text-theme-text p-3 rounded-lg border border-theme-border focus:border-blue-500 focus:outline-none transition-colors"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
          />

          {/* Alt Aksiyon Butonları (Footer) */}
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={handleClose}
              className="px-4 py-2 bg-transparent hover:bg-theme-primary text-theme-muted hover:text-theme-text text-sm font-bold rounded-lg transition"
            >
              {t('dash_cancel', { defaultValue: 'İptal' })}
            </button>
            
            <button 
              onClick={handleSendRequest}
              disabled={!friendInput.trim()}
              className="px-6 py-2 bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition shadow-md shadow-blue-600/20"
            >
              {t('dash_send_request', { defaultValue: 'İstek Gönder' })}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};