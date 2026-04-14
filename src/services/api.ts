/**
 * API SERVICE - WEDDING PAGE
 * Robust persistence layer simulating a real backend.
 */

export interface Guest {
  id: string;
  name: string;
  group: string;
  confirmed: boolean;
  totalGuests: number;
}

const INITIAL_GUESTS: Guest[] = [
  { id: '1', name: 'Luan Nascimento', group: 'Família Nascimento', confirmed: false, totalGuests: 2 },
  { id: '2', name: 'Laís Silva', group: 'Família Silva', confirmed: false, totalGuests: 4 },
  { id: '3', name: 'João Silva', group: 'Família Silva', confirmed: false, totalGuests: 4 },
  { id: '4', name: 'Maria silva', group: 'Família Silva', confirmed: false, totalGuests: 4 },
  { id: '5', name: 'Roberto Silva', group: 'Família Silva', confirmed: false, totalGuests: 4 },
  { id: '6', name: 'Ana Nascimento', group: 'Família Nascimento', confirmed: false, totalGuests: 2 },
];

class WeddingAPI {
  private STORAGE_KEY = 'wedding_guests_v2';

  constructor() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(INITIAL_GUESTS));
    }
  }

  private async getGuests(): Promise<Guest[]> {
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  private async saveGuests(guests: Guest[]): Promise<void> {
    await new Promise(r => setTimeout(r, 1000)); // Simulate server processing
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(guests));
  }

  async searchGuest(name: string): Promise<Guest | null> {
    const guests = await this.getGuests();
    const found = guests.find(g => g.name.toLowerCase().includes(name.toLowerCase()));
    return found || null;
  }

  async getGroup(groupName: string): Promise<Guest[]> {
    const guests = await this.getGuests();
    return guests.filter(g => g.group === groupName);
  }

  async confirmRSVP(ids: string[]): Promise<void> {
    const guests = await this.getGuests();
    const updated = guests.map(g => ({
      ...g,
      confirmed: ids.includes(g.id) ? true : g.confirmed
    }));
    await this.saveGuests(updated);
  }

  async getAdminStats() {
    const guests = await this.getGuests();
    const confirmedCount = guests.filter(g => g.confirmed).length;
    return {
      total: guests.length,
      confirmed: confirmedCount,
      pending: guests.length - confirmedCount,
    };
  }

  async getAllGuestsForAdmin(): Promise<Guest[]> {
    return await this.getGuests();
  }
}

export const api = new WeddingAPI();
