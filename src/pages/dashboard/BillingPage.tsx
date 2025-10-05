import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Download, Calendar, CreditCard, FileText, Bell, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  generation_id: string | null;
  created_at: string;
}

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const { wallet } = useCredits();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    thisMonth: 0,
    totalSpent: 0,
    totalTransactions: 0,
    creditsUsed: 0
  });

  useEffect(() => {
    if (user && wallet) {
      fetchTransactions();
    }
  }, [user, wallet]);

  const fetchTransactions = async () => {
    if (!user || !wallet) return;

    try {
      setLoading(true);
      
      // Fetch credit transactions
      const { data: transactionData, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error('İşlem geçmişi yüklenirken hata oluştu');
        return;
      }

      setTransactions(transactionData || []);
      
      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      let thisMonthSpent = 0;
      let totalSpent = 0;
      let creditsUsed = 0;
      
      transactionData?.forEach(transaction => {
        const transactionDate = new Date(transaction.created_at);
        
        if (transaction.type === 'purchase') {
          totalSpent += Math.abs(transaction.amount) * 1; // 1 TL per credit assumption
          
          if (transactionDate.getMonth() === thisMonth && transactionDate.getFullYear() === thisYear) {
            thisMonthSpent += Math.abs(transaction.amount) * 1;
          }
        } else if (transaction.type === 'usage') {
          creditsUsed += Math.abs(transaction.amount);
        }
      });
      
      setStats({
        thisMonth: thisMonthSpent,
        totalSpent,
        totalTransactions: transactionData?.length || 0,
        creditsUsed
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'usage':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'refund':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Kredi Satın Alımı';
      case 'usage':
        return 'Kredi Kullanımı';
      case 'refund':
        return 'İade';
      default:
        return 'Bilinmeyen';
    }
  };

  const generateMockInvoice = (transaction: CreditTransaction) => {
    const blob = new Blob([
      `Pixtrate - Fatura\n\n` +
      `Fatura No: INV-${transaction.id.substring(0, 8)}\n` +
      `Tarih: ${formatDate(transaction.created_at)}\n` +
      `Açıklama: ${transaction.description}\n` +
      `Tutar: ${Math.abs(transaction.amount)} kredi\n` +
      `Müşteri: ${user?.email}\n\n` +
      `Teşekkürler!`
    ], { type: 'text/plain' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fatura-${transaction.id.substring(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Fatura indirildi!');
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Ödemeler" 
        subtitle="Fatura geçmişinizi ve kredi işlemlerinizi görüntüleyin"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Ödemeler" 
      subtitle="Fatura geçmişinizi ve kredi işlemlerinizi görüntüleyin"
    >
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Bu Ay Harcanan</p>
                  <p className="text-2xl font-bold text-gray-900">₺{stats.thisMonth}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                  <p className="text-2xl font-bold text-gray-900">₺{stats.totalSpent}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Kullanılan Kredi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.creditsUsed}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Current Package Info */}
        {wallet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">💳 Mevcut Paket Bilgisi</p>
                  <p className="text-sm text-yellow-700">
                    {wallet.package_type === 'trial' ? 'Deneme Paketi' : wallet.package_type} - 
                    {' '}{wallet.balance} kredi kaldı
                    {wallet.balance < 10 && ' (Kredi azalıyor, yenileme zamanı!)'}
                  </p>
                </div>
                {wallet.balance < 10 && (
                  <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300">
                    Kredi Satın Al
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Credit Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                Kredi İşlemleri ({transactions.length})
              </h3>
              {transactions.length > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Tümünü İndir
                </Button>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Henüz işlem geçmişiniz yok
                </h4>
                <p className="text-gray-600 mb-6">
                  İlk fotoğraf veya video üretiminizden sonra işlemleriniz burada görünecek
                </p>
                <div className="flex justify-center space-x-4">
                  <Button as="a" href="/app/generate-image" variant="primary">
                    Fotoğraf Oluştur
                  </Button>
                  <Button as="a" href="/app/generate-video" variant="secondary">
                    Video Oluştur
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(transaction.created_at)}</span>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {getTransactionTypeText(transaction.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} kredi
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.type === 'purchase' ? `₺${Math.abs(transaction.amount)}` : ''}
                        </p>
                      </div>
                      
                      {transaction.type === 'purchase' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateMockInvoice(transaction)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ödeme Yöntemi</h3>
              <Button variant="outline" size="sm">
                Güncelle
              </Button>
            </div>
            
            {stats.totalSpent > 0 ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• •••• •••• 1234</p>
                  <p className="text-sm text-gray-600">Son kullanma: 12/26</p>
                </div>
                <Badge variant="success">Varsayılan</Badge>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Henüz ödeme yöntemi eklenmemiş</p>
                <p className="text-sm">İlk satın alımınızda ödeme yöntemi ekleyebilirsiniz</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};