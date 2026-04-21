/**
 * API SERVICE - WEDDING PAGE
 * Robust persistence layer simulating a real backend.
 */

/* ── Guest ── */
export type GuestCategory = 'padrinho' | 'familia_noiva' | 'familia_noivo' | 'convidado_noiva' | 'convidado_noivo' | 'outro';

export interface Guest {
  id: string;
  name: string;
  group: string;
  confirmed: boolean;
  totalGuests: number;
  category: GuestCategory;
}

/* ── Gift ── */
export interface Gift {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  buyUrl: string;
}

const INITIAL_GUESTS: Guest[] = [
  { id: '1', name: 'Luan Nascimento', group: 'Família Nascimento', confirmed: false, totalGuests: 2, category: 'familia_noivo' },
  { id: '2', name: 'Laís Silva', group: 'Família Silva', confirmed: false, totalGuests: 4, category: 'familia_noiva' },
  { id: '3', name: 'João Silva', group: 'Família Silva', confirmed: false, totalGuests: 4, category: 'padrinho' },
  { id: '4', name: 'Maria silva', group: 'Família Silva', confirmed: false, totalGuests: 4, category: 'padrinho' },
  { id: '5', name: 'Roberto Silva', group: 'Família Silva', confirmed: false, totalGuests: 4, category: 'familia_noiva' },
  { id: '6', name: 'Ana Nascimento', group: 'Família Nascimento', confirmed: false, totalGuests: 2, category: 'familia_noivo' },
];

class WeddingAPI {
  private GUESTS_KEY = 'wedding_guests_v3';
  private GIFTS_KEY  = 'wedding_gifts_v1';
  private PIX_STORAGE_KEY = 'wedding_pix_key';

  constructor() {
    if (!localStorage.getItem(this.GUESTS_KEY)) {
      localStorage.setItem(this.GUESTS_KEY, JSON.stringify(INITIAL_GUESTS));
    }
    if (!localStorage.getItem(this.GIFTS_KEY)) {
      localStorage.setItem(this.GIFTS_KEY, JSON.stringify([]));
    }
  }

  /* ─────────── GUESTS ─────────── */

  private async loadGuests(): Promise<Guest[]> {
    await new Promise(r => setTimeout(r, 80));
    return JSON.parse(localStorage.getItem(this.GUESTS_KEY) || '[]');
  }

  private async saveGuests(guests: Guest[]): Promise<void> {
    await new Promise(r => setTimeout(r, 80));
    localStorage.setItem(this.GUESTS_KEY, JSON.stringify(guests));
  }

  async searchGuest(name: string): Promise<Guest | null> {
    const guests = await this.loadGuests();
    return guests.find(g => g.name.toLowerCase().includes(name.toLowerCase())) || null;
  }

  async getGroup(groupName: string): Promise<Guest[]> {
    const guests = await this.loadGuests();
    return guests.filter(g => g.group === groupName);
  }

  async confirmRSVP(ids: string[]): Promise<void> {
    const guests = await this.loadGuests();
    const updated = guests.map(g => ({
      ...g,
      confirmed: ids.includes(g.id) ? true : g.confirmed,
    }));
    await this.saveGuests(updated);
  }

  async getAdminStats() {
    const guests = await this.loadGuests();
    const confirmedCount = guests.filter(g => g.confirmed).length;
    return {
      total: guests.length,
      confirmed: confirmedCount,
      pending: guests.length - confirmedCount,
    };
  }

  async getAllGuestsForAdmin(): Promise<Guest[]> {
    return await this.loadGuests();
  }

  async addGuest(guest: Omit<Guest, 'id'>): Promise<Guest> {
    const guests = await this.loadGuests();
    const newGuest: Guest = { ...guest, id: crypto.randomUUID() };
    await this.saveGuests([...guests, newGuest]);
    return newGuest;
  }

  async removeGuest(id: string): Promise<void> {
    const guests = await this.loadGuests();
    await this.saveGuests(guests.filter(g => g.id !== id));
  }

  /* ─────────── GIFTS ─────────── */

  async getGifts(): Promise<Gift[]> {
    return JSON.parse(localStorage.getItem(this.GIFTS_KEY) || '[]');
  }

  async addGift(gift: Omit<Gift, 'id'>): Promise<Gift> {
    const gifts = await this.getGifts();
    const newGift: Gift = { ...gift, id: crypto.randomUUID() };
    localStorage.setItem(this.GIFTS_KEY, JSON.stringify([...gifts, newGift]));
    return newGift;
  }

  async updateGift(id: string, data: Partial<Omit<Gift, 'id'>>): Promise<void> {
    const gifts = await this.getGifts();
    const updated = gifts.map(g => (g.id === id ? { ...g, ...data } : g));
    localStorage.setItem(this.GIFTS_KEY, JSON.stringify(updated));
  }

  async removeGift(id: string): Promise<void> {
    const gifts = await this.getGifts();
    localStorage.setItem(this.GIFTS_KEY, JSON.stringify(gifts.filter(g => g.id !== id)));
  }

  /* ─────────── PIX ─────────── */

  getPixKey(): string {
    return localStorage.getItem(this.PIX_STORAGE_KEY) || 'luanelais@gmail.com';
  }

  setPixKey(key: string): void {
    localStorage.setItem(this.PIX_STORAGE_KEY, key);
  }

  getPixType(): string {
    return localStorage.getItem(this.PIX_STORAGE_KEY + '_type') || 'email';
  }

  setPixType(type: string): void {
    localStorage.setItem(this.PIX_STORAGE_KEY + '_type', type);
  }
}

export const api = new WeddingAPI();
