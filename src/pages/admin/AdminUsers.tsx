import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User, Mail, Calendar, CreditCard, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AdminLayout } from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  wallet?: {
    id: string;
    balance: number;
    package_type: string;
    updated_at: string;
  };
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  useEffect(() => {
    fetchUsers();
    setupRealTimeSubscriptions();
    
    // Fallback: reload data every 10 seconds if real-time fails
    const fallbackInterval = setInterval(() => {
      if (!isRealTimeConnected) {
        console.log('Real-time disconnected, fetching data...');
        fetchUsers();
      }
    }, 10000);

    return () => {
      clearInterval(fallbackInterval);
      // Clean up subscriptions
      supabase.removeAllChannels();
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const setupRealTimeSubscriptions = () => {
    console.log('Setting up real-time subscriptions...');
    
    // Subscribe to profiles changes
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          handleProfileChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('User credits change detected:', payload);
          handleUserCreditsChange(payload);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast.success('Real-time updates connected');
        } else if (status === 'CHANNEL_ERROR') {
          toast.error('Real-time connection failed');
          setIsRealTimeConnected(false);
        }
      });
  };

  const handleProfileChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setUsers(prevUsers => {
      switch (eventType) {
        case 'INSERT':
          // Add new user
          const newUser: UserData = {
            ...newRecord,
            wallet: null
          };
          toast.success(`New user registered: ${newRecord.email}`);
          return [newUser, ...prevUsers];
          
        case 'UPDATE':
          // Update existing user
          return prevUsers.map(user => 
            user.id === newRecord.id 
              ? { ...user, ...newRecord }
              : user
          );
          
        case 'DELETE':
          // Remove user
          toast.info(`User deleted: ${oldRecord.email}`);
          return prevUsers.filter(user => user.id !== oldRecord.id);
          
        default:
          return prevUsers;
      }
    });
  };

  const handleUserCreditsChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.email === newRecord?.email || user.email === oldRecord?.email) {
          switch (eventType) {
            case 'INSERT':
            case 'UPDATE':
              return {
                ...user,
                wallet: {
                  id: user.id,
                  balance: newRecord.credits_balance,
                  package_type: 'active',
                  updated_at: newRecord.updated_at
                }
              };

            case 'DELETE':
              return {
                ...user,
                wallet: undefined
              };

            default:
              return user;
          }
        }
        return user;
      });
    });
  };
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with their credit wallets
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user credits
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('email, credits_balance');

      if (usersError) throw usersError;

      // Create a map for faster lookup
      const creditsMap = new Map(
        usersData?.map(u => [u.email, u.credits_balance]) || []
      );

      // Combine data
      const usersWithWallets = profiles?.map(profile => ({
        ...profile,
        wallet: creditsMap.has(profile.email) ? {
          id: profile.id,
          balance: creditsMap.get(profile.email)!,
          package_type: 'active',
          updated_at: profile.updated_at
        } : undefined
      })) || [];

      setUsers(usersWithWallets);
      console.log(`Fetched ${usersWithWallets.length} users`);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      filtered = filtered.filter(user => {
        const lastActivity = new Date(user.updated_at);
        const isActive = lastActivity > thirtyDaysAgo;
        return statusFilter === 'active' ? isActive : !isActive;
      });
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (user: UserData) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const lastActivity = new Date(user.updated_at);
    const isActive = lastActivity > thirtyDaysAgo;

    return isActive ? (
      <Badge variant="success">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Pasif</Badge>
    );
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="text-gray-600 mt-2">Tüm kullanıcıları görüntüle ve yönet</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {isRealTimeConnected ? 'Real-time connected' : 'Real-time disconnected'}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredUsers.length} / {users.length} kullanıcı
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
                  placeholder="E-posta, isim veya şirket ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kredi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
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
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </div>
                          {user.company_name && (
                            <div className="text-xs text-gray-400">
                              {user.company_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-orange-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {user.wallet?.balance || 0} kredi
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.wallet?.package_type === 'trial' ? 'Deneme' : user.wallet?.package_type || 'Paket yok'}
                      </div>
                      {user.wallet?.updated_at && (
                        <div className="text-xs text-gray-400">
                          Son güncelleme: {formatDate(user.wallet.updated_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Düzenle
                        </Button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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