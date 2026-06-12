// Ce fichier gère toutes les communications HTTP avec le backend FastAPI.
// Il utilise l'URL de l'API définie dans les variables d'environnement (.env du frontend)
// ou par défaut localhost:8000.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  // === PROJETS ===
  getProjects: async () => {
    const res = await fetch(`${API_URL}/projects/`);
    if (!res.ok) throw new Error('Erreur réseau /projects');
    return res.json();
  },

  // === EXPERIENCES ===
  getExperiences: async () => {
    const res = await fetch(`${API_URL}/experiences/`);
    if (!res.ok) throw new Error('Erreur réseau /experiences');
    return res.json();
  },

  // === SERVICES ===
  getServices: async () => {
    const res = await fetch(`${API_URL}/services/`);
    if (!res.ok) throw new Error('Erreur réseau /services');
    return res.json();
  },

  // === MESSAGES D'AMOUR (LoveChat / LoveClicker) ===
  getLoveMessages: async () => {
    const res = await fetch(`${API_URL}/messages/`);
    if (!res.ok) throw new Error('Erreur réseau /messages');
    return res.json();
  },
  postLoveMessage: async (data: any) => {
    const res = await fetch(`${API_URL}/messages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur réseau POST /messages');
    return res.json();
  },

  // === TEMOIGNAGES ===
  getTestimonials: async () => {
    const res = await fetch(`${API_URL}/testimonials/`);
    if (!res.ok) throw new Error('Erreur réseau /testimonials');
    return res.json();
  },
  postTestimonial: async (data: any) => {
    const res = await fetch(`${API_URL}/testimonials/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur réseau POST /testimonials');
    return res.json();
  },

  // === COMPETENCES ===
  getSkills: async () => {
    const res = await fetch(`${API_URL}/skills/`);
    if (!res.ok) throw new Error('Erreur réseau /skills');
    return res.json();
  },

  // === CERTIFICATIONS ===
  getCertifications: async () => {
    const res = await fetch(`${API_URL}/certifications/`);
    if (!res.ok) throw new Error('Erreur réseau /certifications');
    return res.json();
  },

  // === LOVE STORIES ===
  getLoveStories: async () => {
    const res = await fetch(`${API_URL}/stories/`);
    if (!res.ok) throw new Error('Erreur réseau /stories');
    return res.json();
  },

  // === CONTACT MESSAGES ===
  postContactMessage: async (data: any) => {
    const res = await fetch(`${API_URL}/contacts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur réseau POST /contacts');
    return res.json();
  },

  // === QUEEN REPLIES ===
  postQueenReply: async (data: any) => {
    const res = await fetch(`${API_URL}/queen/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur réseau POST /queen');
    return res.json();
  }
};
