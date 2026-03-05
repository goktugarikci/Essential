import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { theme, changeTheme } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-theme-secondary w-full max-w-lg rounded-2xl border border-theme-border">
        <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-tertiary">
          <h2 className="text-xl font-bold text-theme-text">⚙️ {t('dash_settings_title')}</h2>
          <button onClick={onClose} className="text-theme-muted hover:text-white">✖</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center p-4 bg-theme-primary rounded-xl border border-theme-border">
            <div className="font-bold text-theme-text">{t('dash_settings_theme')}</div>
            <select value={theme} onChange={(e) => changeTheme(e.target.value as any)} className="bg-theme-secondary text-theme-text p-2 rounded-lg">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="dracula">Dracula</option>
              <option value="orange">Orange</option>
              <option value="lime">Lime</option>
              <option value="pink">Pink</option>
              <option value="purple">Purple</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};