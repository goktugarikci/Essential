// src/components/modals/SettingsModal.tsx
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-theme-secondary w-full max-w-lg rounded-2xl shadow-2xl border border-theme-border overflow-hidden relative">
        
        <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-tertiary">
          <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
            <span>⚙️</span> {t('dash_settings_title', {defaultValue: 'Ayarlar'})}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-theme-primary hover:bg-red-500 text-theme-muted hover:text-white flex items-center justify-center transition-all">✖</button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Profil Ayarı */}
          <div className="flex justify-between items-center p-4 bg-theme-primary rounded-xl border border-theme-border">
            <div>
              <div className="font-bold text-theme-text mb-1">{t('dash_settings_profile', {defaultValue: 'Profil Görünümü'})}</div>
              <div className="text-xs text-theme-muted">{t('dash_settings_profile_desc', {defaultValue: 'İsmini, biyografini ve profil resmini güncelle.'})}</div>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition shadow-md shadow-blue-600/20">{t('dash_settings_edit', {defaultValue: 'Düzenle'})}</button>
          </div>

          {/* Tema Ayarı */}
          <div className="flex justify-between items-center p-4 bg-theme-primary rounded-xl border border-theme-border">
            <div>
              <div className="font-bold text-theme-text mb-1">{t('dash_settings_theme', {defaultValue: 'Görünüm ve Tema'})}</div>
              <div className="text-xs text-theme-muted">{t('dash_settings_theme_desc', {defaultValue: 'Uygulamanın renk paletini seçin.'})}</div>
            </div>
            <select 
              value={theme} 
              onChange={(e) => changeTheme(e.target.value as any)} 
              className="bg-theme-secondary text-theme-text text-sm p-2 rounded-lg border border-theme-border focus:outline-none cursor-pointer"
            >
              <option value="dark">{t('dash_theme_dark', {defaultValue: 'Karanlık'})}</option>
              <option value="light">{t('dash_theme_light', {defaultValue: 'Aydınlık'})}</option>
              <option value="dracula">{t('dash_theme_dracula', {defaultValue: 'Dracula'})}</option>
              <option value="orange">{t('dash_theme_orange', {defaultValue: 'Turuncu Mod'})}</option>
              <option value="lime">{t('dash_theme_lime', {defaultValue: 'Lime Mod'})}</option>
              <option value="pink">{t('dash_theme_pink', {defaultValue: 'Pembe Mod'})}</option>
              <option value="purple">{t('dash_theme_purple', {defaultValue: 'Mor Mod'})}</option>
            </select>
          </div>

          {/* Tehlikeli Bölge */}
          <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-xl border border-red-500/30">
            <div>
              <div className="font-bold text-red-500 mb-1">{t('dash_settings_danger', {defaultValue: 'Tehlikeli Bölge'})}</div>
              <div className="text-xs text-red-500/70">{t('dash_settings_danger_desc', {defaultValue: 'Hesabınızı kalıcı olarak silin.'})}</div>
            </div>
            <button className="px-4 py-2 bg-transparent border border-red-500 hover:bg-red-500 text-red-500 hover:text-white text-sm font-bold rounded-lg transition">{t('dash_settings_delete', {defaultValue: 'Hesabı Sil'})}</button>
          </div>
        </div>
      </div>
    </div>
  );
};