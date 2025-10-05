import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Minus, Search, User, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

interface UserCredit {
  id: string;
  email: string;
  full_name: string | null;
  credits_balance: number;
}

export const AdminCredits: React.FC = () => {
  const [users, setUsers] = useState<UserCredit[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch profiles and join with users table for credits
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (profilesError) throw profilesError;

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('email, credits_balance');

      if (usersError) throw usersError;

      // Create a map for faster lookup
      const creditsMap = new Map(
        usersData?.map(u => [u.email, u.credits_balance]) || []
      );

      const usersWithCredits = profiles?.map(profile => ({
        ...profile,
        credits_balance: creditsMap.get(profile.email) || 0
      })) || [];

      setUsers(usersWithCredits);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreditUpdate = async (userId: string, newBalance: number, description: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const oldBalance = user.credits_balance;
      const difference = newBalance - oldBalance;

      // Update user credits balance
      const { error: updateError } = await supabase
        .from('users')
        .update({
          credits_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email);

      if (updateError) throw updateError;

      // Record transaction in credit ledger
      const { error: ledgerError } = await supabase
        .from('credit_ledger')
        .insert({
          user_id: userId,
          delta: difference,
          reason: difference > 0 ? 'admin_credit' : 'admin_debit',
          ref: description,
        });

      if (ledgerError) throw ledgerError;

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === userId
          ? { ...u, credits_balance: newBalance }
          : u
      ));

      toast.success(`Kredi bakiyesi güncellendi: ${newBalance} kredi`);
      setEditingUser(null);
      setCreditAmount(0);
    } catch (error) {
      console.error('Error updating credits:', error);
      toast.error('Kredi güncellenirken hata oluştu');
    }
  };

  const startEditing = (user: UserCredit) => {
    setEditingUser(user.id);
    setCreditAmount(user.credits_balance || 0);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setCreditAmount(0);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kredi Yönetimi</h1>
          <p className="text-gray-600 mt-2">Kullanıcı kredilerini görüntüle ve düzenle</p>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </Card>

        {/* Credits Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mevcut Kredi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'İsim belirtilmemiş'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                          <span className="text-sm text-gray-600">kredi</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.credits_balance || 0} kredi
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">
                        {user.credits_balance > 0 ? 'Aktif' : 'Kredi Yok'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleCreditUpdate(user.id, creditAmount, 'manuel güncelleme')}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Kaydet
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            İptal
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(user)}
                          >
                            Düzenle
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentBalance = user.credits_balance || 0;
                              handleCreditUpdate(user.id, currentBalance + 10, '10 kredi ekleme');
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            +10
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentBalance = user.credits_balance || 0;
                              const newBalance = Math.max(0, currentBalance - 10);
                              handleCreditUpdate(user.id, newBalance, '10 kredi çıkarma');
                            }}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            -10
                          </Button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Kullanıcı bulunamadı
              </h3>
              <p className="text-gray-600">
                Arama kriterlerinize uygun kullanıcı bulunmuyor.
              </p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};