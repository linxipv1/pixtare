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
