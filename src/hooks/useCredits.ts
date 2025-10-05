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
    if (!user?.email) {
      console.log('❌ No user email found');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching credits for user:', user.email);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('❌ Error fetching user credits:', error);

        // If user doesn't exist, create them with 10 free credits
        if (error.code === 'PGRST116') {
          console.log('📝 Creating new user with 10 free credits...');
          await createUser();
          return;
        }

        throw error;
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
            .eq('email', user.email)
            .select()
            .single();

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
    if (!user?.email) return;

    try {
      console.log('🆕 Creating user:', user.email);

      // Calculate expiry date for trial credits (7 days from now)
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

      const { data, error } = await supabase
        .from('users')
        .insert({
          email: user.email,
          credits_balance: 10,
          credits_expire_at: trialExpiry.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        throw error;
      }

      console.log('✅ User created successfully:', data);
      setUserCredits(data);
      toast.success('Hoş geldiniz! 10 ücretsiz kredi hesabınıza tanımlandı! (7 gün geçerli)');
    } catch (error) {
      console.error('💥 User creation error:', error);
      toast.error('Kullanıcı oluşturulamadı');
    }
  };

  const deductCredits = async (amount: number, description: string) => {
    if (!user?.email || !userCredits) {
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
        .eq('email', user.email)
        .select()
        .single();

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
    if (!user?.email || !userCredits) {
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
        .eq('email', user.email)
        .select()
        .single();

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