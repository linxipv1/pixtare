import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  before_image_url: string;
  after_image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  before_image_url: string;
  after_image_url: string;
  display_order: number;
  is_active: boolean;
}

const categories = ['Mobilya', 'Takı', 'Aksesuar', 'Tekstil', 'Elektronik', 'Diğer'];

export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'Mobilya',
    before_image_url: '',
    after_image_url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
      toast.error('Referans çalışmaları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'Mobilya',
      before_image_url: '',
      after_image_url: '',
      display_order: items.length,
      is_active: true,
    });
    setShowModal(true);
  }

  function openEditModal(item: PortfolioItem) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      before_image_url: item.before_image_url,
      after_image_url: item.after_image_url,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setShowModal(true);
  }

  async function handleSave() {
    try {
      setLoading(true);

      if (editingItem) {
        const { error } = await supabase
          .from('portfolio_items')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Referans güncellendi');
      } else {
        const { error } = await supabase
          .from('portfolio_items')
          .insert([formData]);

        if (error) throw error;
        toast.success('Yeni referans eklendi');
      }

      setShowModal(false);
      loadItems();
    } catch (error) {
      console.error('Error saving portfolio item:', error);
      toast.error('Kaydetme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu referansı silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Referans silindi');
      loadItems();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Silme sırasında hata oluştu');
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Referans gizlendi' : 'Referans aktif edildi');
      loadItems();
    } catch (error) {
      console.error('Error toggling portfolio item:', error);
      toast.error('İşlem sırasında hata oluştu');
    }
  }

  if (loading && items.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Referans Çalışmaları</h1>
            <p className="text-gray-600 mt-2">Ana sayfadaki referans görselleri yönetin</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Referans Ekle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={item.is_active ? 'success' : 'secondary'}>
                    {item.is_active ? 'Aktif' : 'Gizli'}
                  </Badge>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Öncesi</p>
                    <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.before_image_url}
                        alt="Öncesi"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sonrası</p>
                    <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.after_image_url}
                        alt="Sonrası"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Sıra: {item.display_order}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                      {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <Card className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz referans yok</h3>
            <p className="text-gray-600 mb-4">İlk referansınızı ekleyin</p>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Referans Ekle
            </Button>
          </Card>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Referans Düzenle' : 'Yeni Referans Ekle'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Modern Koltuk Takımı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ev ortamından profesyonel stüdyo görünümüne dönüştürüldü"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncesi Görsel URL
                  </label>
                  <input
                    type="url"
                    value={formData.before_image_url}
                    onChange={(e) => setFormData({ ...formData, before_image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/before.jpg"
                  />
                  {formData.before_image_url && (
                    <img
                      src={formData.before_image_url}
                      alt="Önizleme"
                      className="mt-2 h-32 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sonrası Görsel URL
                  </label>
                  <input
                    type="url"
                    value={formData.after_image_url}
                    onChange={(e) => setFormData({ ...formData, after_image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/after.jpg"
                  />
                  {formData.after_image_url && (
                    <img
                      src={formData.after_image_url}
                      alt="Önizleme"
                      className="mt-2 h-32 object-cover rounded"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gösterim Sırası
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                    <label className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Aktif</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
