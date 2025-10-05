import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Save, Image, Star, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
  description: string | null;
}

interface ContentStats {
  portfolioItems: number;
  testimonials: number;
  siteStats: number;
  features: number;
}

export const AdminContent = () => {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    portfolioItems: 0,
    testimonials: 0,
    siteStats: 0,
    features: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingContent, setEditingContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load site content
      const { data: contentData, error: contentError } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true });

      if (contentError) throw contentError;

      setContent(contentData || []);

      // Initialize editing state
      const initialEditing: { [key: string]: string } = {};
      contentData?.forEach((item) => {
        initialEditing[item.id] = item.value;
      });
      setEditingContent(initialEditing);

      // Load stats
      const [portfolio, testimonials, siteStats, features] = await Promise.all([
        supabase.from('portfolio_items').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        supabase.from('site_stats').select('id', { count: 'exact', head: true }),
        supabase.from('features').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        portfolioItems: portfolio.count || 0,
        testimonials: testimonials.count || 0,
        siteStats: siteStats.count || 0,
        features: features.count || 0,
      });
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('İçerik yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  function handleContentChange(contentId: string, value: string) {
    setEditingContent((prev) => ({
      ...prev,
      [contentId]: value,
    }));
    setHasChanges(true);
  }

  async function handleSave() {
    try {
      setLoading(true);

      const promises = content.map(async (item) => {
        const newValue = editingContent[item.id];
        if (newValue !== item.value) {
          await supabase
            .from('site_content')
            .update({ value: newValue, updated_at: new Date().toISOString() })
            .eq('id', item.id);
        }
      });

      await Promise.all(promises);

      toast.success('İçerik başarıyla kaydedildi!');
      setHasChanges(false);
      loadData();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('İçerik kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    if (window.confirm('Tüm değişiklikler kaybolacak. Devam etmek istiyor musunuz?')) {
      const resetEditing: { [key: string]: string } = {};
      content.forEach((item) => {
        resetEditing[item.id] = item.value;
      });
      setEditingContent(resetEditing);
      setHasChanges(false);
      toast.success('İçerik sıfırlandı');
    }
  }

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as { [key: string]: SiteContent[] });

  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      hero: 'Ana Sayfa Hero Bölümü',
      portfolio: 'Referans Çalışmaları Bölümü',
      testimonials: 'Müşteri Yorumları Bölümü',
      features: 'Özellikler Bölümü',
      stats: 'İstatistikler Bölümü',
      cta: 'Call-to-Action Bölümü',
    };
    return titles[section] || section.charAt(0).toUpperCase() + section.slice(1);
  };

  const getSectionDescription = (section: string) => {
    const descriptions: { [key: string]: string } = {
      hero: 'Ana sayfanın ilk görünen bölümü - başlık, alt başlık ve CTA butonları',
      portfolio: 'Referans çalışmaları bölüm başlıkları (içerikler "Referanslar" sayfasından)',
      testimonials: 'Müşteri yorumları bölüm başlıkları (içerikler "Yorumlar" sayfasından)',
      features: 'Özellik kartları metinleri',
      stats: 'İstatistik sayıları ve başlıkları',
      cta: 'Sayfanın alt kısmındaki harekete geçirici bölüm',
    };
    return descriptions[section] || '';
  };

  if (loading && content.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site İçerik Yönetimi</h1>
          <p className="text-gray-600 mt-2">Ana sayfadaki metinleri ve içerikleri yönetin</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/portfolio">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <Image className="h-8 w-8 text-blue-600" />
                <Badge variant="secondary">{stats.portfolioItems}</Badge>
              </div>
              <h3 className="font-semibold text-gray-900">Referans Çalışmaları</h3>
              <p className="text-sm text-gray-600 mt-1">Before/After görselleri</p>
              <div className="flex items-center text-blue-600 text-sm mt-2">
                Yönet <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Card>
          </Link>

          <Link to="/admin/testimonials">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-8 w-8 text-purple-600" />
                <Badge variant="secondary">{stats.testimonials}</Badge>
              </div>
              <h3 className="font-semibold text-gray-900">Müşteri Yorumları</h3>
              <p className="text-sm text-gray-600 mt-1">Testimonial'lar</p>
              <div className="flex items-center text-purple-600 text-sm mt-2">
                Yönet <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Card>
          </Link>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <Badge variant="secondary">{stats.siteStats}</Badge>
            </div>
            <h3 className="font-semibold text-gray-900">İstatistikler</h3>
            <p className="text-sm text-gray-600 mt-1">Sayılar ve metrikler</p>
            <div className="flex items-center text-gray-400 text-sm mt-2">
              Yakında...
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-8 w-8 text-orange-600" />
              <Badge variant="secondary">{stats.features}</Badge>
            </div>
            <h3 className="font-semibold text-gray-900">Özellikler</h3>
            <p className="text-sm text-gray-600 mt-1">Özellik kartları</p>
            <div className="flex items-center text-gray-400 text-sm mt-2">
              Yakında...
            </div>
          </Card>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
          <div>
            {hasChanges && (
              <Badge variant="warning" className="animate-pulse">
                Kaydedilmemiş değişiklikler var
              </Badge>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges || loading}>
              Sıfırla
            </Button>
            <Button onClick={handleSave} isLoading={loading} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Tüm Değişiklikleri Kaydet
            </Button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {Object.entries(groupedContent).map(([section, items]) => (
            <Card key={section} className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {getSectionTitle(section)}
                  </h2>
                  <p className="text-sm text-gray-600">{getSectionDescription(section)}</p>

                  {section === 'portfolio' && (
                    <div className="mt-2">
                      <Link to="/admin/portfolio">
                        <Button size="sm" variant="outline">
                          <Image className="h-4 w-4 mr-2" />
                          Referans Görselleri Yönet
                        </Button>
                      </Link>
                    </div>
                  )}

                  {section === 'testimonials' && (
                    <div className="mt-2">
                      <Link to="/admin/testimonials">
                        <Button size="sm" variant="outline">
                          <Star className="h-4 w-4 mr-2" />
                          Yorumları Yönet
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-4">
                {items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {item.description || item.key}
                    </label>

                    {item.key.includes('subtitle') ||
                    item.key.includes('description') ||
                    item.value.length > 80 ? (
                      <textarea
                        value={editingContent[item.id] || ''}
                        onChange={(e) => handleContentChange(item.id, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder={item.description || ''}
                      />
                    ) : (
                      <input
                        type="text"
                        value={editingContent[item.id] || ''}
                        onChange={(e) => handleContentChange(item.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={item.description || ''}
                      />
                    )}

                    {item.key.includes('button') || item.key.includes('cta') ? (
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          {editingContent[item.id] || 'Buton metni'}
                        </Button>
                        <span className="text-xs text-gray-500 ml-2">Buton önizlemesi</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {content.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz içerik yok</h3>
            <p className="text-gray-600 mb-4">
              Migration dosyasını çalıştırarak varsayılan içerikleri oluşturun
            </p>
            <Button onClick={loadData}>Yenile</Button>
          </Card>
        )}

        {/* Save Reminder Float */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="p-4 bg-orange-50 border-orange-200 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-orange-800">
                  Kaydedilmemiş değişiklikler
                </span>
                <Button size="sm" onClick={handleSave} isLoading={loading}>
                  Kaydet
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
