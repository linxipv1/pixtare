import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface WebhookLog {
  id: string;
  event_key: string;
  created_at: string;
}

interface CreditLog {
  id: string;
  user_id: string;
  delta: number;
  reason: string;
  ref: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  credits_balance: number;
  plan_code: string;
  credits_expire_at: string;
}

export default function AdminWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [credits, setCredits] = useState<CreditLog[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load processed webhooks
      const { data: webhookData } = await supabase
        .from('processed_webhooks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Load credit ledger
      const { data: creditData } = await supabase
        .from('credit_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setWebhooks(webhookData || []);
      setCredits(creditData || []);

      // Load users referenced in credit logs
      if (creditData && creditData.length > 0) {
        const userIds = [...new Set(creditData.map((c) => c.user_id))];
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds);

        if (userData) {
          const userMap: Record<string, User> = {};
          userData.forEach((u) => {
            userMap[u.id] = u;
          });
          setUsers(userMap);
        }
      }
    } catch (error) {
      console.error('Error loading webhook data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('tr-TR');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Webhook Logları</h1>
        <p className="text-gray-600 mt-2">Gumroad webhook işlemleri ve kredi hareketleri</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600">Toplam İşlem</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{webhooks.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600">Toplam Kredi Hareketi</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{credits.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600">Son İşlem</div>
          <div className="text-sm font-medium text-gray-900 mt-2">
            {webhooks[0] ? formatDate(webhooks[0].created_at) : 'Henüz yok'}
          </div>
        </Card>
      </div>

      {/* Recent Webhooks */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Son Webhook İşlemleri</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {webhooks.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                    Henüz işlem yok
                  </td>
                </tr>
              ) : (
                webhooks.map((webhook) => (
                  <tr key={webhook.id}>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {webhook.event_key}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(webhook.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Credit Movements */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Kredi Hareketleri</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sebep
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referans
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {credits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Henüz hareket yok
                  </td>
                </tr>
              ) : (
                credits.map((credit) => (
                  <tr key={credit.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {users[credit.user_id]?.email || credit.user_id}
                      </div>
                      {users[credit.user_id] && (
                        <div className="text-xs text-gray-500">
                          Plan: {users[credit.user_id].plan_code || 'none'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={credit.delta > 0 ? 'success' : 'error'}>
                        {credit.delta > 0 ? '+' : ''}
                        {credit.delta}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{credit.reason}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{credit.ref}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(credit.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-center">
        <button
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Yenile
        </button>
      </div>
    </div>
  );
}
