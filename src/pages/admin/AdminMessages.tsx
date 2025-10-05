import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Calendar, Eye, EyeOff, Search, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminService, ContactMessage } from '../../lib/admin';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export const AdminMessages: React.FC = () => {
  const { admin } = useAdmin();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Mesajlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => 
        statusFilter === 'read' ? message.is_read : !message.is_read
      );
    }

    setFilteredMessages(filtered);
  };

  const markAsRead = async (messageId: string) => {
    if (!admin) return;

    try {
      await AdminService.markMessageAsRead(messageId, admin.id);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
      ));

      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, is_read: true, read_at: new Date().toISOString() } : null);
      }

      toast.success('Mesaj okundu olarak işaretlendi');
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Mesaj güncellenirken hata oluştu');
    }
  };

  const markAsUnread = async (messageId: string) => {
    try {
      // This would need a separate API method
      // For now, just update locally
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: false, read_at: null } : msg
      ));

      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, is_read: false, read_at: null } : null);
      }

      toast.success('Mesaj okunmadı olarak işaretlendi');
    } catch (error) {
      toast.error('Mesaj güncellenirken hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

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
            <Button onClick={loadMessages}>Tekrar Dene</Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">İletişim Mesajları</h1>
            <p className="text-gray-600 mt-2">Kullanıcılardan gelen mesajları yönet</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="error" className="text-sm">
              {unreadCount} okunmamış
            </Badge>
            <div className="text-sm text-gray-600">
              {filteredMessages.length} / {messages.length} mesaj
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="İsim, e-posta veya mesaj içeriği ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'read' | 'unread')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Mesajlar</option>
                <option value="unread">Okunmamış</option>
                <option value="read">Okunmuş</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages */}
          <div className="space-y-4">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    selectedMessage?.id === message.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  } ${!message.is_read ? 'border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${!message.is_read ? 'font-bold' : ''}`}>
                        {message.name}
                      </h3>
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{message.email}</span>
                  </div>
                  
                  {message.company && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Şirket:</strong> {message.company}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {message.message}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant={message.is_read ? 'success' : 'warning'}>
                      {message.is_read ? 'Okundu' : 'Okunmadı'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Detay
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredMessages.length === 0 && (
              <Card className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {messages.length === 0 ? 'Henüz mesaj yok' : 'Mesaj bulunamadı'}
                </h3>
                <p className="text-gray-600">
                  {messages.length === 0 
                    ? 'Henüz hiç iletişim mesajı gelmemiş.' 
                    : 'Arama kriterlerinize uygun mesaj bulunmuyor.'
                  }
                </p>
              </Card>
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:sticky lg:top-6">
            {selectedMessage ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Mesaj Detayı</h2>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.is_read ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsUnread(selectedMessage.id)}
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Okunmadı İşaretle
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(selectedMessage.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Okundu İşaretle
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">İsim</label>
                    <p className="text-gray-900">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">E-posta</label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>

                  {selectedMessage.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Şirket</label>
                      <p className="text-gray-900">{selectedMessage.company}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Tarih</label>
                    <p className="text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Mesaj</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      E-posta ile Yanıtla
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mesaj Seçin
                </h3>
                <p className="text-gray-600">
                  Detaylarını görmek için bir mesaj seçin.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};