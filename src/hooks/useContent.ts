import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SiteContent {
  section: string;
  key: string;
  value: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  before_image_url: string;
  after_image_url: string;
  display_order: number;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  image_url: string | null;
  rating: number;
  text: string;
  display_order: number;
}

interface SiteStat {
  id: string;
  label: string;
  number: string;
  icon: string;
  icon_color: string;
  display_order: number;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  icon_color: string;
  display_order: number;
}

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('section, key, value');

        if (error) throw error;

        const contentMap: Record<string, string> = {};
        data?.forEach((item: SiteContent) => {
          contentMap[`${item.section}.${item.key}`] = item.value;
        });

        setContent(contentMap);
      } catch (error) {
        console.error('Error loading site content:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  const getContent = (section: string, key: string, fallback = '') => {
    return content[`${section}.${key}`] || fallback;
  };

  return { content, getContent, loading };
}

export function usePortfolioItems() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('Error loading portfolio items:', error);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  return { items, loading };
}

export function useTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setItems(data || []);
      } catch (error) {
        console.error('Error loading testimonials:', error);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  return { items, loading };
}

export function useSiteStats() {
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data, error } = await supabase
          .from('site_stats')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setStats(data || []);
      } catch (error) {
        console.error('Error loading site stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return { stats, loading };
}

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatures() {
      try {
        const { data, error } = await supabase
          .from('features')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setFeatures(data || []);
      } catch (error) {
        console.error('Error loading features:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFeatures();
  }, []);

  return { features, loading };
}

interface DashboardStats {
  imagesThisMonth: number;
  imagesLastMonth: number;
  totalVideos: number;
  videosLastMonth: number;
  totalSavings: number;
  savingsLastMonth: number;
}

export function useDashboardStats(userId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats>({
    imagesThisMonth: 0,
    imagesLastMonth: 0,
    totalVideos: 0,
    videosLastMonth: 0,
    totalSavings: 0,
    savingsLastMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function loadStats() {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const { data: imageStats, error: imageError } = await supabase
          .from('generations')
          .select('created_at, type, credits_used')
          .eq('user_id', userId)
          .eq('type', 'image')
          .eq('status', 'completed')
          .gte('created_at', startOfLastMonth.toISOString());

        if (imageError) throw imageError;

        const { data: videoStats, error: videoError } = await supabase
          .from('generations')
          .select('created_at, type, credits_used')
          .eq('user_id', userId)
          .eq('type', 'video')
          .eq('status', 'completed');

        if (videoError) throw videoError;

        const imagesThisMonth = (imageStats?.filter(
          g => new Date(g.created_at) >= startOfMonth
        ).length || 0) * 4;

        const imagesLastMonth = (imageStats?.filter(
          g => new Date(g.created_at) >= startOfLastMonth && new Date(g.created_at) <= endOfLastMonth
        ).length || 0) * 4;

        const totalVideos = videoStats?.length || 0;

        const videosLastMonth = videoStats?.filter(
          g => new Date(g.created_at) >= startOfLastMonth && new Date(g.created_at) <= endOfLastMonth
        ).length || 0;

        const allGenerations = [...(imageStats || []), ...(videoStats || [])];
        const creditsThisMonth = allGenerations
          .filter(g => new Date(g.created_at) >= startOfMonth)
          .reduce((sum, g) => sum + (g.credits_used || 0), 0);

        const creditsLastMonth = allGenerations
          .filter(g => new Date(g.created_at) >= startOfLastMonth && new Date(g.created_at) <= endOfLastMonth)
          .reduce((sum, g) => sum + (g.credits_used || 0), 0);

        const totalSavings = creditsThisMonth * 10;
        const savingsLastMonth = creditsLastMonth * 10;

        setStats({
          imagesThisMonth,
          imagesLastMonth,
          totalVideos,
          videosLastMonth,
          totalSavings,
          savingsLastMonth
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [userId]);

  return { stats, loading };
}
