import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Database, Mail, Shield, Globe, Bell, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminService, Setting } from '../../lib/admin';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AdminLayout } from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const { admin } = useAdmin();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editingSettings, setEditingSettings] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getSettings();
      setSettings(data);
      
      // Initialize editing state
      const initialEditing: { [key: string]: string } = {};
      data.forEach(setting => {
        initialEditing[setting.id] = setting.value;
      });
      setEditingSettings(initialEditing);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingId: string, value: string) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!admin) return;

    setSaving(true);
    try {
      // Save all changed settings
      const promises = settings.map(async (setting) => {
        const newValue = editingSettings[setting.id];
        if (newValue !== setting.value) {
          await AdminService.updateSetting(setting.id, newValue, admin.id);
        }
      });

      await Promise.all(promises);
      
      // Reload settings
      await loadSettings();
      
      toast.success('Ayarlar başarıyla kaydedildi!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting ? editingSettings[setting.id] || setting.value : '';
  };

  const getSettingId = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.id || '';
  };

  const getBooleanValue = (key: string) => {
    return getSettingValue(key) === 'true';
  };

  const setBooleanValue = (key: string, value: boolean) => {
    const settingId = getSettingId(key);
    if (settingId) {
      handleSettingChange(settingId, value.toString());
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Card className="p-8 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadSettings}>Tekrar Dene</Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (settings.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Card className="p-8 text-center max-w-md">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ayar Bulunamadı</h3>
            <p className="text-gray-600">Henüz sistem ayarı bulunmuyor.</p>
          </Card>
        </div>
      </AdminLayout>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistem Ayarları</h1>
            <p className="text-gray-600 mt-2">Site geneli ayarları ve konfigürasyonları</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <span className="text-sm text-orange-600 font-medium">
                Kaydedilmemiş değişiklikler var
              </span>
            )}
            <Button
              onClick={handleSave}
              isLoading={saving}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Ayarları Kaydet
            </Button>
          </div>
        </div>

        {/* Site Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Site Ayarları</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={getSettingValue('site_name')}
                  onChange={(e) => handleSettingChange(getSettingId('site_name'), e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Açıklaması
                </label>
                <textarea
                  value={getSettingValue('site_description')}
                  onChange={(e) => handleSettingChange(getSettingId('site_description'), e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destek E-postası
                </label>
                <input
                  type="email"
                  value={getSettingValue('support_email')}
                  onChange={(e) => handleSettingChange(getSettingId('support_email'), e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Credit Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Database className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Kredi Ayarları</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Kredi Limiti
                </label>
                <input
                  type="number"
                  value={getSettingValue('max_credits_per_user')}
                  onChange={(e) => handleSettingChange(getSettingId('max_credits_per_user'), e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varsayılan Deneme Kredisi
                </label>
                <input
                  type="number"
                  value={getSettingValue('default_trial_credits')}
                  onChange={(e) => handleSettingChange(getSettingId('default_trial_credits'), e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sistem Ayarları</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Bakım Modu</p>
                  <p className="text-sm text-gray-600">Site geçici olarak kapatılır</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getBooleanValue('maintenance_mode')}
                    onChange={(e) => setBooleanValue('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Yeni Kayıtlar</p>
                  <p className="text-sm text-gray-600">Kullanıcıların kayıt olmasına izin ver</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getBooleanValue('allow_registrations')}
                    onChange={(e) => setBooleanValue('allow_registrations', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                  <p className="text-sm text-gray-600">Sistem e-posta bildirimlerini gönder</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getBooleanValue('email_notifications')}
                    onChange={(e) => setBooleanValue('email_notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};