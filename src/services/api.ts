import { createClient } from '@supabase/supabase-js';

/* ── Supabase Configuration ── */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const WEDDING_ID = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ── Confirmation ── */
export interface Child {
  name: string;
  age: string;
}

export interface Confirmation {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  children: Child[];
  createdAt?: string;
}

/* ── Gift ── */
export interface Gift {
  id: string;
  title: string;
  subtitle?: string;
  brand?: string;
  category: string;
  imageUrl: string;
  price: number;
  buyUrl: string;
  isFeatured?: boolean;
}

class WeddingAPI {
  /* ─────────── RSVP (Confirmations) ─────────── */

  async submitRSVP(data: Omit<Confirmation, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await supabase
      .from('confirmacoes')
      .insert([{
        wedding_id: WEDDING_ID,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        children: data.children
      }]);

    if (error) throw error;
  }

  async getConfirmations(): Promise<Confirmation[]> {
    const { data, error } = await supabase
      .from('confirmacoes')
      .select('*')
      .eq('wedding_id', WEDDING_ID)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(c => ({
      id: c.id,
      fullName: c.full_name,
      phone: c.phone,
      email: c.email,
      children: c.children || [],
      createdAt: c.created_at
    }));
  }

  async removeConfirmation(id: string): Promise<void> {
    const { error } = await supabase
      .from('confirmacoes')
      .delete()
      .eq('id', id)
      .eq('wedding_id', WEDDING_ID);

    if (error) throw error;
  }

  async getAdminStats() {
    const { data, error } = await supabase
      .from('confirmacoes')
      .select('id, children')
      .eq('wedding_id', WEDDING_ID);

    if (error || !data) return { totalGuests: 0, totalConfirmations: 0 };

    const totalConfirmations = data.length;
    let totalGuests = totalConfirmations;
    
    data.forEach(c => {
      if (Array.isArray(c.children)) {
        totalGuests += c.children.length;
      }
    });

    return {
      totalConfirmations,
      totalGuests
    };
  }

  /* ─────────── GIFS ─────────── */

  async getGifts(): Promise<Gift[]> {
    const { data, error } = await supabase
      .from('lista_presentes')
      .select('*')
      .eq('wedding_id', WEDDING_ID)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(g => ({
      id: g.id,
      title: g.title,
      subtitle: g.subtitle,
      brand: g.brand,
      category: g.category || 'Outros',
      imageUrl: g.image_url,
      price: Number(g.price),
      buyUrl: g.buy_url,
      isFeatured: g.is_featured
    }));
  }

  async addGift(gift: Omit<Gift, 'id'>): Promise<Gift> {
    const { data, error } = await supabase
      .from('lista_presentes')
      .insert([{
        wedding_id: WEDDING_ID,
        title: gift.title,
        subtitle: gift.subtitle,
        brand: gift.brand,
        category: gift.category,
        image_url: gift.imageUrl,
        price: gift.price,
        buy_url: gift.buyUrl,
        is_featured: gift.isFeatured
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle,
      brand: data.brand,
      category: data.category,
      imageUrl: data.image_url,
      price: Number(data.price),
      buyUrl: data.buy_url,
      isFeatured: data.is_featured
    };
  }

  async updateGift(id: string, data: Partial<Omit<Gift, 'id'>>): Promise<void> {
    const updatePayload: any = {};
    if (data.title) updatePayload.title = data.title;
    if (data.subtitle) updatePayload.subtitle = data.subtitle;
    if (data.brand) updatePayload.brand = data.brand;
    if (data.category) updatePayload.category = data.category;
    if (data.imageUrl) updatePayload.image_url = data.imageUrl;
    if (data.price) updatePayload.price = data.price;
    if (data.buyUrl) updatePayload.buy_url = data.buyUrl;
    if (data.isFeatured !== undefined) updatePayload.is_featured = data.isFeatured;

    const { error } = await supabase
      .from('lista_presentes')
      .update(updatePayload)
      .eq('id', id)
      .eq('wedding_id', WEDDING_ID);

    if (error) throw error;
  }

  async removeGift(id: string): Promise<void> {
    const { error } = await supabase
      .from('lista_presentes')
      .delete()
      .eq('id', id)
      .eq('wedding_id', WEDDING_ID);

    if (error) throw error;
  }

  /* ─────────── PIX ─────────── */

  async getPixData() {
    const { data, error } = await supabase
      .from('chaves_pix')
      .select('*')
      .eq('wedding_id', WEDDING_ID)
      .limit(1)
      .single();

    if (error || !data) return { key: '21966785809', type: 'email', holder: '' };

    return {
      key: data.key_value,
      type: data.key_type,
      holder: data.holder_name
    };
  }

  async updatePixData(key: string, type: string, holder: string): Promise<void> {
    const { data } = await supabase
      .from('chaves_pix')
      .select('id')
      .eq('wedding_id', WEDDING_ID)
      .limit(1)
      .single();

    if (data) {
      await supabase.from('chaves_pix').update({
        key_value: key,
        key_type: type,
        holder_name: holder
      }).eq('id', data.id).eq('wedding_id', WEDDING_ID);
    } else {
      await supabase.from('chaves_pix').insert([{
        wedding_id: WEDDING_ID,
        key_value: key,
        key_type: type,
        holder_name: holder
      }]);
    }
  }
}

export const api = new WeddingAPI();
