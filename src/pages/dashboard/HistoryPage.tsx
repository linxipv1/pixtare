import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Camera, Video, Download, Eye, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

interface Generation {
  id: string;
  type: 'image' | 'video';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  credits_used: number;
  parameters: any;
  outputs: string[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGenerations();
    }
  }, [user]);

  const fetchGenerations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching generations:', error);
        toast.error('Geçmiş yüklenirken hata oluştu');
        return;
      }

      setGenerations(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = generations.filter(item => 
    filter === 'all' || item.type === filter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Tamamlandı</Badge>;
      case 'processing':
        return <Badge variant="warning">İşleniyor</Badge>;
      case 'failed':
        return <Badge variant="error">Başarısız</Badge>;
      case 'queued':
        return <Badge variant="secondary">Sırada</Badge>;
      default:
        return <Badge variant="secondary">Bilinmiyor</Badge>;
    }
  };

  const getTitle = (generation: Generation) => {
    if (generation.parameters?.prompt) {
      const prompt = generation.parameters.prompt;
      if (prompt.length > 50) {
        return prompt.substring(0, 50) + '...';
      }
      return prompt;
    }
    return generation.type === 'image' ? 'Fotoğraf Üretimi' : 'Video Üretimi';
  };

  const getThumbnail = (generation: Generation) => {
    // Eğer outputs varsa ilk output'u thumbnail olarak kullan
    if (generation.outputs && generation.outputs.length > 0) {
      return generation.outputs[0];
    }
    
    // Varsayılan thumbnail'lar
    if (generation.type === 'image') {
      return 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2';
    } else {
      return 'https://images.pexels.com/photos/1458562/pexels-photo-1458562.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2';
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('İndirme başlatıldı!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('İndirme sırasında bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Geçmiş" 
        subtitle="Daha önce oluşturduğunuz tüm görselleri ve videoları görüntüleyin"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Geçmiş" 
      subtitle="Daha önce oluşturduğunuz tüm görselleri ve videoları görüntüleyin"
    >
      <div className="space-y-6">
        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Filtrele:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === 'all' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setFilter('image')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === 'image' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Fotoğraflar
                  </button>
                  <button
                    onClick={() => setFilter('video')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === 'video' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Videolar
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredHistory.length} sonuç
              </div>
            </div>
          </Card>
        </motion.div>

        {/* History Items */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center">
                <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filter === 'all' ? 'Henüz içerik oluşturmadınız' : 
                   filter === 'image' ? 'Henüz fotoğraf oluşturmadınız' : 
                   'Henüz video oluşturmadınız'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all' ? 'İlk fotoğraf veya videonuzu oluşturmak için başlayın' :
                   filter === 'image' ? 'İlk fotoğrafınızı oluşturmak için başlayın' :
                   'İlk videonuzu oluşturmak için başlayın'}
                </p>
                <div className="flex justify-center space-x-4">
                  {(filter === 'all' || filter === 'image') && (
                    <Button as="a" href="/app/generate-image" variant="primary">
                      <Camera className="h-4 w-4 mr-2" />
                      Fotoğraf Oluştur
                    </Button>
                  )}
                  {(filter === 'all' || filter === 'video') && (
                    <Button as="a" href="/app/generate-video" variant="secondary">
                      <Video className="h-4 w-4 mr-2" />
                      Video Oluştur
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={getThumbnail(item)}
                          alt={getTitle(item)}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => window.open(getThumbnail(item), '_blank')}
                        />
                      </div>
                      <div className="absolute top-1 right-1">
                        {item.type === 'image' ? (
                          <Camera className="h-4 w-4 text-white bg-blue-500 rounded p-0.5" />
                        ) : (
                          <Video className="h-4 w-4 text-white bg-purple-500 rounded p-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {getTitle(item)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(item.created_at)}</span>
                            </div>
                            <span>•</span>
                            <span>{item.credits_used} kredi kullanıldı</span>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Actions */}
                        {item.status === 'completed' && item.outputs && item.outputs.length > 0 && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Görüntüle
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(
                                item.outputs![0], 
                                `${item.type}-${item.id}.${item.type === 'image' ? 'jpg' : 'mp4'}`
                              )}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              İndir
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Error Message */}
                      {item.status === 'failed' && item.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Hata:</strong> {item.error_message}
                          </p>
                        </div>
                      )}

                      {/* Outputs Preview */}
                      {item.status === 'completed' && item.outputs && item.outputs.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Oluşturulan İçerikler ({item.outputs.length})
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {item.outputs.slice(0, 4).map((output, outputIndex) => (
                              <div key={outputIndex} className="relative bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="aspect-square cursor-pointer" onClick={() => window.open(output, '_blank')}>
                                  {item.type === 'image' ? (
                                    <img
                                      src={output}
                                      alt={`Çıktı ${outputIndex + 1}`}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                      onError={(e) => {
                                        console.error('Image load error:', e);
                                        e.currentTarget.src = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2';
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="w-full h-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                                    >
                                      <Video className="h-6 w-6 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                                  {outputIndex + 1}
                                </div>
                              </div>
                            ))}
                            {item.outputs.length > 4 && (
                              <div className="bg-gray-100 rounded-lg flex items-center justify-center aspect-square">
                                <span className="text-xs text-gray-600">
                                  +{item.outputs.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {item.status === 'processing' && (
                        <div className="mt-4">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">İşleniyor...</span>
                          </div>
                        </div>
                      )}

                      {item.status === 'queued' && (
                        <div className="mt-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Sırada bekliyor...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;