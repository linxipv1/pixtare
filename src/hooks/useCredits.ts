import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserCredits {
  id: string;
  email: string;
  credits_balance: number;
  credits_expire_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserCredits = async () => {
    if (!user?.id) {
      console.log('❌ No user ID found');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching credits for user:', user.email, 'ID:', user.id);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user credits:', error);
        throw error;
      }

      // If user doesn't exist in public.users, they need to be created by trigger
      if (!data) {
        console.log('⏳ User not found in public.users, waiting for trigger...');
        // Wait a bit and retry once
        setTimeout(() => {
          fetchUserCredits();
        }, 1000);
        return;
      }

      // Check if credits have expired
      if (data.credits_expire_at) {
        const expireDate = new Date(data.credits_expire_at);
        const now = new Date();

        if (now > expireDate) {
          console.log('⏰ Credits expired, resetting to 0');

          // Reset expired credits to 0
          const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update({
              credits_balance: 0,
              credits_expire_at: null,
              plan_code: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .maybeSingle();

          if (updateError) {
            console.error('❌ Error resetting expired credits:', updateError);
          } else {
            setUserCredits(updatedData);
            toast('Kredileriniz sona erdi. Yeni paket alarak devam edebilirsiniz.', {
              icon: '⏰',
            });
            setLoading(false);
            return;
          }
        }
      }

      console.log('✅ User credits fetched successfully:', data);
      setUserCredits(data);
    } catch (error) {
      console.error('💥 Credits fetch error:', error);
      toast.error('Kredi bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    // User creation is now handled by database trigger
    // This function is no longer needed but kept for compatibility
    console.log('ℹ️ User creation is handled automatically by database trigger');
    await fetchUserCredits();
  };

  const deductCredits = async (amount: number, description: string) => {
    if (!user?.id || !userCredits) {
      console.error('❌ Missing user or credits data');
      toast.error('Kullanıcı bilgisi bulunamadı');
      return false;
    }

    console.log('💳 Starting credit deduction:', {
      userEmail: user.email,
      currentBalance: userCredits.credits_balance,
      amountToDeduct: amount,
      description
    });

    // Check if user has enough credits
    if (userCredits.credits_balance < amount) {
      console.error('❌ Insufficient credits:', userCredits.credits_balance, '<', amount);
      toast.error(`Yetersiz kredi! Mevcut: ${userCredits.credits_balance}, Gerekli: ${amount}`);
      return false;
    }

    try {
      const newBalance = userCredits.credits_balance - amount;

      console.log('📝 Updating user credits...');
      const { data, error } = await supabase
        .from('users')
        .update({
          credits_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Credit update error:', error);
        throw error;
      }
      
      console.log('✅ Credits updated successfully:', data);

      // Update local state
      setUserCredits(data);
      
      console.log('🎉 Credit deduction completed successfully');
      toast.success(`${amount} kredi kullanıldı. Kalan: ${newBalance}`);
      return true;

    } catch (error) {
      console.error('💥 Credit deduction failed:', error);
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('permission')) {
          toast.error('Kredi işlemi için yetki yok');
        } else {
          toast.error(`Kredi hatası: ${errorMessage}`);
        }
      } else {
        toast.error('Kredi düşürme işlemi başarısız');
      }
      
      return false;
    }
  };

  const addCredits = async (amount: number, description: string) => {
    if (!user?.id || !userCredits) {
      console.error('❌ Missing user or credits data');
      return false;
    }

    try {
      console.log('💰 Adding credits:', amount);

      const newBalance = userCredits.credits_balance + amount;

      const { data, error } = await supabase
        .from('users')
        .update({
          credits_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      // Update local state
      setUserCredits(data);
      
      console.log('✅ Credits added successfully');
      toast.success(`${amount} kredi eklendi! Toplam: ${newBalance}`);
      return true;

    } catch (error) {
      console.error('💥 Credit addition failed:', error);
      toast.error('Kredi ekleme işlemi başarısız');
      return false;
    }
  };

  // Fetch credits when user changes
  useEffect(() => {
    fetchUserCredits();
  }, [user]);

  // Return wallet-compatible interface for backward compatibility
  const wallet = userCredits ? {
    id: userCredits.id,
    balance: userCredits.credits_balance,
    package_type: 'trial',
    updated_at: userCredits.updated_at
  } : null;

  return {
    userCredits,
    wallet, // For backward compatibility
    loading,
    deductCredits,
    addCredits,
    refetch: fetchUserCredits,
  };
};