import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  // DİKKAT: Artık Promise dönen bir fonksiyon bekliyor
  onAddFriend?: (nameOrEmail: string) => Promise<void>; 
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onAddFriend }) => {
  const { t } = useTranslation();
  const [friendInput, setFriendInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSendRequest = async () => {
    if (!friendInput.trim() || !onAddFriend) return;
    
    setStatus('loading');
    setMessage('');

    try {
      // API ve WebSocket işlerini Dashboard.tsx'e devrediyoruz
      await onAddFriend(friendInput.trim());
      
      setStatus('success');
      setMessage(t('dash_request_sent', { defaultValue: 'Arkadaşlık isteği başarıyla gönderildi!' }));
      setFriendInput('');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || t('dash_request_failed', { defaultValue: 'Kullanıcı bulunamadı veya istek zaten gönderilmiş.' }));
    }
  };

  const handleClose = () => {
    setFriendInput('');
    setStatus('idle');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-theme-secondary w-full max-w-md rounded-2xl shadow-2xl border border-theme-border overflow-hidden relative">
        <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-tertiary">
          <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
            <span>👤</span> {t('dash_add_friend', { defaultValue: 'Arkadaş Ekle' })}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-theme-primary hover:bg-red-500 text-theme-muted hover:text-white flex items-center justify-center transition-all">✖</button>
        </div>

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
            disabled={status === 'loading'}
          />

          {message && (
            <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={handleClose} className="px-4 py-2 bg-transparent hover:bg-theme-primary text-theme-muted hover:text-theme-text text-sm font-bold rounded-lg transition">
              {t('dash_cancel', { defaultValue: 'İptal' })}
            </button>
            <button 
              onClick={handleSendRequest}
              disabled={!friendInput.trim() || status === 'loading'}
              className="px-6 py-2 bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition shadow-md shadow-blue-600/20"
            >
              {status === 'loading' ? 'Gönderiliyor...' : t('dash_send_request', { defaultValue: 'İstek Gönder' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};