import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();




const app = express();
const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors());
  // Body parser limit configuration
  app.use(express.json({ limit: "20mb" }));

  // Supabase client initialization for server
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  let supabaseInstance: any = null;
  function getSupabase() {
    if (!supabaseInstance) {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Please set them in Vercel.");
      }
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseInstance;
  }

  let portfolioConfig: any = { githubReposCache: null, githubLastSync: null };
  const CONFIG_FILE = path.join(process.cwd(), "portfolio_config.json");




  // Portfolio general homepage config file persistence setup
  // Helper to lazily initialize the Gemini client only when needed.
  // This prevents the application from crashing on startup if GEMINI_API_KEY is not defined.
  const apiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required to execute AI services.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API Love Messages routes


  // Admin section endpoints



  // Get admin access configuration settings

  // Save admin access configuration settings

  // Mark / Tag a specific administrative access audit attempt as 'verified', 'suspicious', or 'none'

  // Regenerate/Reset administrative authorization token


  // --- CONTACT MESSAGES API ENDPOINTS ---
  // 1. Submit contact message (Public)

  // --- NEWSLETTER SUBSCRIPTION ENDPOINT ---

  // 2. Fetch contact messages (Admin, Protected)

  // 3. Mark contact message as read (Admin, Protected)

  // 4. Delete contact message (Admin, Protected)

  // --- GENERATED RESUMES API ENDPOINTS ---
  // 1. Submit/Sync generated resume (Public)

  // 2. Fetch all generated resumes (Admin, Protected)

  // 3. Delete a generated resume record (Admin, Protected)



  app.get("/api/github/repos", async (req, res) => {
    try {
      const syncEnabled = (portfolioConfig as any).githubSyncEnabled !== false;

      if (!syncEnabled) {
        return res.json({
          enabled: false,
          repos: []
        });
      }

      const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL
      const now = Date.now();
      const lastSync = (portfolioConfig as any).githubLastSync || 0;
      const forceRefresh = req.query.refresh === "true";

      if (
        (portfolioConfig as any).githubReposCache && 
        (portfolioConfig as any).githubReposCache.length > 0 && 
        (now - lastSync < CACHE_TTL) && 
        !forceRefresh
      ) {
        const excluded = (portfolioConfig as any).githubExcludedRepos || [];
        const filteredRepos = (portfolioConfig as any).githubReposCache.filter(
          (repo: any) => !excluded.includes(repo.name)
        );
        return res.json({
          enabled: true,
          repos: filteredRepos,
          cached: true,
          lastSync: lastSync
        });
      }

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-App-Reamj"
      };

      if ((portfolioConfig as any).githubToken) {
        headers["Authorization"] = `token ${(portfolioConfig as any).githubToken}`;
      }

      const username = (portfolioConfig as any).githubUsername || "delsDin";
      const collaborators = (portfolioConfig as any).githubCollaborators || [];
      const organizations = (portfolioConfig as any).githubOrganizations || [];

      console.log(`[GitHub API] Sync initiating for user: ${username}, collaborators: ${JSON.stringify(collaborators)}, orgs: ${JSON.stringify(organizations)}`);

      const allRepos: any[] = [];

      async function fetchReposForTarget(ownerName: string, ownerType: "user" | "collaborator" | "organization") {
        const cleanName = ownerName.trim();
        if (!cleanName) return [];

        const candidates = [cleanName];
        if (cleanName.includes(" ")) {
          candidates.push(cleanName.replace(/\s+/g, "-"));
          candidates.push(cleanName.replace(/\s+/g, ""));
        }

        for (const candidate of candidates) {
          const encoded = encodeURIComponent(candidate);
          let urls: { url: string; type: "user" | "collaborator" | "organization" }[] = [];
          
          if (ownerType === "organization") {
            urls = [
              { url: `https://api.github.com/orgs/${encoded}/repos?sort=updated&per_page=100`, type: "organization" },
              { url: `https://api.github.com/users/${encoded}/repos?sort=updated&per_page=100`, type: "collaborator" }
            ];
          } else {
            urls = [
              { url: `https://api.github.com/users/${encoded}/repos?sort=updated&per_page=100`, type: ownerType },
              { url: `https://api.github.com/orgs/${encoded}/repos?sort=updated&per_page=100`, type: "organization" }
            ];
          }

          for (const { url, type } of urls) {
            try {
              const response = await fetch(url, { headers });
              if (response.ok) {
                const repos = await response.json();
                if (Array.isArray(repos)) {
                  console.log(`[GitHub API Success] Synchronized repos for '${ownerName}' using candidate '${candidate}' as ${type}`);
                  return repos.map((repo: any) => ({
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    url: repo.html_url,
                    homepage: repo.homepage,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    watchers: repo.watchers_count,
                    language: repo.language,
                    topics: repo.topics || [],
                    updatedAt: repo.updated_at,
                    createdAt: repo.created_at,
                    pushedAt: repo.pushed_at,
                    size: repo.size,
                    license: repo.license ? repo.license.name : null,
                    private: repo.private,
                    owner: candidate,
                    ownerType: type,
                    ownerAvatar: repo.owner ? repo.owner.avatar_url : null
                  }));
                }
              } else {
                console.log(`[GitHub API Info] Target '${candidate}' in URL '${url}' returned status ${response.status}`);
              }
            } catch (err) {
              console.warn(`[GitHub API Exception] Error during fetch for target '${candidate}' in URL '${url}'`, err);
            }
          }
        }

        console.error(`[GitHub API Warning] Could not fetch valid repos for target: ${ownerName} (type: ${ownerType})`);
        return [];
      }

      // 1. Fetch main user
      if (username.trim()) {
        const userRepos = await fetchReposForTarget(username, "user");
        allRepos.push(...userRepos);
      }

      // 2. Fetch collaborators
      for (const collaborator of collaborators) {
        if (collaborator && collaborator.trim()) {
          let collabRepos = await fetchReposForTarget(collaborator, "collaborator");
          const onlyContributed = (portfolioConfig as any).githubOnlyContributedCollab !== false;
          if (onlyContributed && username.trim() && collabRepos.length > 0) {
            console.log(`[GitHub API] Filtering collaborator '${collaborator}' repos to only keep where '${username.trim()}' contributed...`);
            const primaryUserClean = username.trim();
            const checkPromises = collabRepos.map(async (repo: any) => {
              try {
                // If the collaborator repo name contains the primary user's clean name or is owned by collaborator
                const checkUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?author=${encodeURIComponent(primaryUserClean)}&per_page=1`;
                const checkRes = await fetch(checkUrl, { headers });
                if (checkRes.ok) {
                  const commits = await checkRes.json();
                  if (Array.isArray(commits) && commits.length > 0) {
                    return repo;
                  }
                  return null;
                }
                return repo; // Keep on non-200 to avoid false negatives
              } catch (e) {
                return repo; // Keep on exception
              }
            });
            const filtered = await Promise.all(checkPromises);
            collabRepos = filtered.filter(Boolean);
            console.log(`[GitHub API] Retained ${collabRepos.length} contributed repos for collaborator '${collaborator}'`);
          }
          allRepos.push(...collabRepos);
        }
      }

      // 3. Fetch organizations
      for (const org of organizations) {
        if (org && org.trim()) {
          let orgRepos = await fetchReposForTarget(org, "organization");
          const onlyContributed = (portfolioConfig as any).githubOnlyContributedCollab !== false;
          if (onlyContributed && username.trim() && orgRepos.length > 0) {
            console.log(`[GitHub API] Filtering organization '${org}' repos to only keep where '${username.trim()}' contributed...`);
            const primaryUserClean = username.trim();
            const checkPromises = orgRepos.map(async (repo: any) => {
              try {
                const checkUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?author=${encodeURIComponent(primaryUserClean)}&per_page=1`;
                const checkRes = await fetch(checkUrl, { headers });
                if (checkRes.ok) {
                  const commits = await checkRes.json();
                  if (Array.isArray(commits) && commits.length > 0) {
                    return repo;
                  }
                  return null;
                }
                return repo; // Keep on non-200 to avoid false negatives
              } catch (e) {
                return repo;
              }
            });
            const filtered = await Promise.all(checkPromises);
            orgRepos = filtered.filter(Boolean);
            console.log(`[GitHub API] Retained ${orgRepos.length} contributed repos for organization '${org}'`);
          }
          allRepos.push(...orgRepos);
        }
      }

      // If we got some repos or at least ran without throwing, write cache and proceed.
      // If server could not resolve any profiles (e.g. rate-limit or network failure), let's fall-back to cache.
      if (allRepos.length === 0 && (portfolioConfig as any).githubReposCache && (portfolioConfig as any).githubReposCache.length > 0) {
        const excluded = (portfolioConfig as any).githubExcludedRepos || [];
        const filteredRepos = (portfolioConfig as any).githubReposCache.filter(
          (repo: any) => !excluded.includes(repo.name)
        );
        return res.json({
          enabled: true,
          repos: filteredRepos,
          cached: true,
          lastSync: lastSync,
          warning: "Aucune donnée renvoyée par GitHub (limite de taux API ou cible inexistante), repli sur le cache."
        });
      }

      (portfolioConfig as any).githubReposCache = allRepos;
      (portfolioConfig as any).githubLastSync = now;

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(portfolioConfig, null, 2), "utf-8");

      const excluded = (portfolioConfig as any).githubExcludedRepos || [];
      const filteredRepos = allRepos.filter(
        (repo: any) => !excluded.includes(repo.name)
      );

      return res.json({
        enabled: true,
        repos: filteredRepos,
        cached: false,
        lastSync: now
      });

    } catch (e: any) {
      console.error("[GitHub Sync Exception]", e);
      if ((portfolioConfig as any).githubReposCache && (portfolioConfig as any).githubReposCache.length > 0) {
        const excluded = (portfolioConfig as any).githubExcludedRepos || [];
        const filteredRepos = (portfolioConfig as any).githubReposCache.filter(
          (repo: any) => !excluded.includes(repo.name)
        );
        return res.json({
          enabled: true,
          repos: filteredRepos,
          cached: true,
          lastSync: (portfolioConfig as any).githubLastSync || 0,
          warning: "Utilisation du cache suite à une exception réseau/serveur."
        });
      }
      return res.status(500).json({ error: "Erreur serveur lors de la synchronisation GitHub", details: e.message });
    }
  });

  app.post("/api/admin/github/sync", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Accès refusé. Token admin requis." });
      }
      
      const token = authHeader.split(" ")[1];
      const { data: { user }, error } = await getSupabase().auth.getUser(token);
      
      if (error || !user) {
        return res.status(403).json({ error: "Accès refusé. Session invalide ou expirée." });
      }

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-App-Reamj"
      };

      if ((portfolioConfig as any).githubToken) {
        headers["Authorization"] = `token ${(portfolioConfig as any).githubToken}`;
      }

      const username = (portfolioConfig as any).githubUsername || "delsDin";
      const collaborators = (portfolioConfig as any).githubCollaborators || [];
      const organizations = (portfolioConfig as any).githubOrganizations || [];

      console.log(`[GitHub Sync Force Admin] Synchronizing for user: ${username}, collaborators: ${JSON.stringify(collaborators)}, orgs: ${JSON.stringify(organizations)}`);

      const allRepos: any[] = [];

      async function fetchReposForTarget(ownerName: string, ownerType: "user" | "collaborator" | "organization") {
        const cleanName = ownerName.trim();
        if (!cleanName) return [];

        const candidates = [cleanName];
        if (cleanName.includes(" ")) {
          candidates.push(cleanName.replace(/\s+/g, "-"));
          candidates.push(cleanName.replace(/\s+/g, ""));
        }

        for (const candidate of candidates) {
          const encoded = encodeURIComponent(candidate);
          let urls: { url: string; type: "user" | "collaborator" | "organization" }[] = [];
          
          if (ownerType === "organization") {
            urls = [
              { url: `https://api.github.com/orgs/${encoded}/repos?sort=updated&per_page=100`, type: "organization" },
              { url: `https://api.github.com/users/${encoded}/repos?sort=updated&per_page=100`, type: "collaborator" }
            ];
          } else {
            urls = [
              { url: `https://api.github.com/users/${encoded}/repos?sort=updated&per_page=100`, type: ownerType },
              { url: `https://api.github.com/orgs/${encoded}/repos?sort=updated&per_page=100`, type: "organization" }
            ];
          }

          for (const { url, type } of urls) {
            try {
              const response = await fetch(url, { headers });
              if (response.ok) {
                const repos = await response.json();
                if (Array.isArray(repos)) {
                  console.log(`[GitHub Sync Force Admin Success] Synchronized repos for '${ownerName}' using candidate '${candidate}' as ${type}`);
                  return repos.map((repo: any) => ({
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    url: repo.html_url,
                    homepage: repo.homepage,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    watchers: repo.watchers_count,
                    language: repo.language,
                    topics: repo.topics || [],
                    updatedAt: repo.updated_at,
                    createdAt: repo.created_at,
                    pushedAt: repo.pushed_at,
                    size: repo.size,
                    license: repo.license ? repo.license.name : null,
                    private: repo.private,
                    owner: candidate,
                    ownerType: type,
                    ownerAvatar: repo.owner ? repo.owner.avatar_url : null
                  }));
                }
              } else {
                console.log(`[GitHub Sync Force Admin Info] Target '${candidate}' in URL '${url}' returned status ${response.status}`);
              }
            } catch (err) {
              console.warn(`[GitHub Sync Force Admin Exception] Error during fetch for target '${candidate}' in URL '${url}'`, err);
            }
          }
        }

        console.error(`[GitHub Sync Force Admin Warning] Could not fetch valid repos for target: ${ownerName} (type: ${ownerType})`);
        return [];
      }

      // 1. User
      if (username.trim()) {
        const userRepos = await fetchReposForTarget(username, "user");
        allRepos.push(...userRepos);
      }

      // 2. Collaborators
      for (const collaborator of collaborators) {
        if (collaborator && collaborator.trim()) {
          let collabRepos = await fetchReposForTarget(collaborator, "collaborator");
          const onlyContributed = (portfolioConfig as any).githubOnlyContributedCollab !== false;
          if (onlyContributed && username.trim() && collabRepos.length > 0) {
            console.log(`[GitHub Sync Force Admin] Filtering collaborator '${collaborator}' repos to only keep where '${username.trim()}' contributed...`);
            const primaryUserClean = username.trim();
            const checkPromises = collabRepos.map(async (repo: any) => {
              try {
                const checkUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?author=${encodeURIComponent(primaryUserClean)}&per_page=1`;
                const checkRes = await fetch(checkUrl, { headers });
                if (checkRes.ok) {
                  const commits = await checkRes.json();
                  if (Array.isArray(commits) && commits.length > 0) {
                    return repo;
                  }
                  return null;
                }
                return repo; // Keep on non-200 to avoid false negatives
              } catch (e) {
                return repo; // Keep on exception
              }
            });
            const filtered = await Promise.all(checkPromises);
            collabRepos = filtered.filter(Boolean);
            console.log(`[GitHub Sync Force Admin] Retained ${collabRepos.length} contributed repos for collaborator '${collaborator}'`);
          }
          allRepos.push(...collabRepos);
        }
      }

      // 3. Organizations
      for (const org of organizations) {
        if (org && org.trim()) {
          let orgRepos = await fetchReposForTarget(org, "organization");
          const onlyContributed = (portfolioConfig as any).githubOnlyContributedCollab !== false;
          if (onlyContributed && username.trim() && orgRepos.length > 0) {
            console.log(`[GitHub Sync Force Admin] Filtering organization '${org}' repos to only keep where '${username.trim()}' contributed...`);
            const primaryUserClean = username.trim();
            const checkPromises = orgRepos.map(async (repo: any) => {
              try {
                const checkUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?author=${encodeURIComponent(primaryUserClean)}&per_page=1`;
                const checkRes = await fetch(checkUrl, { headers });
                if (checkRes.ok) {
                  const commits = await checkRes.json();
                  if (Array.isArray(commits) && commits.length > 0) {
                    return repo;
                  }
                  return null;
                }
                return repo; // Keep on non-200 to avoid false negatives
              } catch (e) {
                return repo;
              }
            });
            const filtered = await Promise.all(checkPromises);
            orgRepos = filtered.filter(Boolean);
            console.log(`[GitHub Sync Force Admin] Retained ${orgRepos.length} contributed repos for organization '${org}'`);
          }
          allRepos.push(...orgRepos);
        }
      }

      (portfolioConfig as any).githubReposCache = allRepos;
      (portfolioConfig as any).githubLastSync = Date.now();

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(portfolioConfig, null, 2), "utf-8");

      return res.json({
        success: true,
        lastSync: (portfolioConfig as any).githubLastSync,
        count: allRepos.length,
        repos: allRepos
      });

    } catch (e: any) {
      console.error("[GitHub Sync Force Exception]", e);
      return res.status(500).json({ error: "Erreur serveur lors de la synchronisation forcée", details: e.message });
    }
  });

  // Homepage configuration endpoints - track dynamic page-load visits

  // Protected Visitor Analytics stats endpoints


  // API Chat route
  app.post("/api/chat", async (req, res) => {
    try {
      const { history } = req.body;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "Une clé d'API Gemini manquante. Veuillez configurer GEMINI_API_KEY dans vos secrets." 
        });
      }

      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: "Historique manquant ou invalide." });
      }

      // Format history into GoogleGenAI content schema: role('user' | 'model') and parts with text
      const contents = history.map((msg: any) => {
        const mappedRole = msg.role === 'assistant' ? 'model' : 'user';
        return {
          role: mappedRole,
          parts: [{ text: msg.content || "" }]
        };
      });

      let systemInstruction = `Tu es l'Agent IA assistant virtuel.
Ton rôle est de répondre de façon professionnelle, courtoise, chaleureuse et concise aux visiteurs de mon portfolio.`;

      try {
        const [generalRes, servicesRes, skillsRes, projectsRes, expRes] = await Promise.all([
          getSupabase().from('general_info').select('*').single(),
          getSupabase().from('services').select('title, description'),
          getSupabase().from('skills').select('*'),
          getSupabase().from('projects').select('title, description, tech_stack'),
          getSupabase().from('experiences').select('*').order('id', { ascending: true })
        ]);

        const general = generalRes.data;
        const services = servicesRes.data;
        const skills = skillsRes.data;
        const projects = projectsRes.data;
        const experiences = expRes.data;

        const ownerName = general?.owner_name || "le propriétaire de ce portfolio";
        const email = general?.owner_email || "l'adresse email de contact";
        const phone = general?.whatsapp_number || general?.owner_phone || "";

        let expText = "";
        if (experiences && experiences.length > 0) {
          expText = experiences.map((e: any) => `- ${e.role} chez "${e.company}" (${e.period}). ${e.description || ""}`).join('\n   ');
        }

        let servicesText = "";
        if (services && services.length > 0) {
          servicesText = services.map((s: any) => `- ${s.title} : ${s.description}`).join('\n   ');
        }

        let skillsText = "";
        if (skills && skills.length > 0) {
          skillsText = skills.map((s: any) => `- ${s.category} : ${s.skills?.map((sk: any)=>sk.name).join(', ') || ''}`).join('\n   ');
        }

        let projectsText = "";
        if (projects && projects.length > 0) {
          projectsText = projects.map((p: any) => `- ${p.title} : ${p.description}. Tech: ${Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : p.tech_stack}`).join('\n   ');
        }

        systemInstruction = `Tu es l'Agent IA assistant virtuel de ${ownerName}.
Ton rôle est de répondre de façon professionnelle, courtoise, chaleureuse et concise aux visiteurs de son portfolio.

Voici les informations clés sur ${ownerName} récupérées en temps réel :
1. Postes & Expérience :
   ${expText}

2. Services proposés :
   ${servicesText}

3. Compétences clés :
   ${skillsText}

4. Projets phares :
   ${projectsText}

5. Directives de comportement :
   - Exprime-toi principalement en français (sauf si le visiteur te parle en anglais ou autre langue).
   - Reste toujours positif, pro-actif et encourage-les à travailler avec ${ownerName}.
   - S'ils souhaitent collaborer ou démarrer un projet, invite-les chaleureusement à remplir le formulaire de contact du site ou à envoyer un email à ${email}${phone ? ` ou sur WhatsApp au ${phone}` : ''}.
   - Si on te demande de lister des éléments (projets, services, expériences, compétences), liste-les clairement avec des puces (sans te brider avec la limite de 2-3 phrases, sois exhaustif mais lisible).
   - Si on te demande des choses en dehors du cadre professionnel de ${ownerName}, réponds poliment que tu es dédié à répondre au sujet de son profil et de ses projets.
   - Pour les conversations générales, donne des réponses concises (maximum 2 à 3 phrases par message pour que ce soit agréable dans une interface de chat).`;
      } catch (err) {
        console.warn("Could not fetch real-time data for Gemini prompt, falling back to basic prompt.", err);
      }

      const ai = getGeminiClient();
      
      const isStream = req.query.stream === 'true' || req.headers.accept === 'text/event-stream';

      if (isStream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          const responseStream = await ai.models.generateContentStream({
            model: "gemini-3.1-flash-lite",
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });

          for await (const chunk of responseStream) {
            if (chunk.text) {
              res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            }
          }
          res.write(`data: [DONE]\n\n`);
          res.end();
        } catch (error: any) {
          console.error("Gemini stream error:", error);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        }
        return;
      }

      // Fallback for non-streaming clients
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
      return res.json({ response: responseText });

    } catch (error: any) {
      console.error("Gemini API Error in /api/chat:", error);
      return res.status(500).json({ 
        error: "Désolé, une erreur s'est produite lors de la génération de la réponse.",
        details: error.message 
      });
    }
  });

  // API Ask in terminal route
  app.post("/api/ask", async (req, res) => {
    try {
      const { question, history, currentDirFiles } = req.body;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "Une clé d'API Gemini manquante. Veuillez configurer GEMINI_API_KEY dans vos secrets." 
        });
      }

      if (!question) {
        return res.status(400).json({ error: "Question manquante." });
      }

      let vfsContext = "";
      if (currentDirFiles && Array.isArray(currentDirFiles)) {
        vfsContext = `Fichiers dans le dossier courant du terminal : ${currentDirFiles.join(', ')}`;
      }

      const systemInstruction = `Tu es le Mini-Agent Gemini rattaché à la console linux interactive de Reamj Dapme, Senior Data Scientist et Développeur Full-Stack de haut niveau à Paris.
Ton interface est un terminal d'ingénieur. Réponds de façon technique, concise, pro-active et avec style (cyberpunk/hacker cool mais extrêmement poli et utile).

Informations clés sur Reamj Dapme :
1. Titre & Rôle : Data Scientist Senior et Développeur Full-Stack. Machine Learning, Big Data pipelines, architectures Cloud et développement web moderne (React/Node).
2. Ce terminal est raccordé à son Système de Fichiers Virtuel (VFS). Les dossiers disponibles à la racine sont : /projects, /skills et /logs.
3. Astuce : Tu peux inviter les utilisateurs à exécuter des scripts Python existants dans le VFS pour en découvrir plus, par exemple 'python projects/data-pipeline.py' ou 'python projects/portfolio.py'. Ou de taper 'matrix' pour lancer la pluie de codes rétro !

Consignes pour tes réponses :
- Reste EXTRA-CONCIS (maximum 3 lignes ou 4 lignes de texte de terminal, soit environ 40-50 mots maximum par réponse).
- Ne fais jamais de longs paragraphes verbeux. Sois punchy et orienté terminal de geek.
- Si le visiteur pose des questions sur comment travailler/collaborer avec Reamj, invite-le amicalement à utiliser le formulaire de contact du site ou à lui écrire directement à hello@example.com.
${vfsContext ? `\n[CONTEXTE DU REPERTOIRE COURANT] : ${vfsContext}` : ""}`;

      let contentsInput: any = question;
      if (history && Array.isArray(history) && history.length > 0) {
        const cleanHistory = history.map((item: any) => ({
          role: item.role === "model" ? "model" : "user",
          parts: Array.isArray(item.parts) 
            ? item.parts.map((p: any) => ({ text: p.text || "" }))
            : [{ text: typeof item === "string" ? item : "" }]
        }));
        contentsInput = [...cleanHistory, { role: "user", parts: [{ text: question }] }];
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: contentsInput,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
      return res.json({ response: responseText });

    } catch (error: any) {
      console.error("Gemini API Error in /api/ask:", error);
      return res.status(500).json({ 
        error: "Désolé, une erreur s'est produite lors de la génération de la réponse.",
        details: error.message 
      });
    }
  });

  // API Romantic Pseudo-Code Generator route
  app.post("/api/romantic-code", async (req, res) => {
    try {
      const { concept, language } = req.body;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "Clé d'API Gemini manquante pour débloquer le compilateur d'amour." 
        });
      }

      const conceptDescriptions: Record<string, string> = {
        "infinite-loop": "Une boucle infinie de câlins programmée pour Reamj et Mike",
        "affection-algorithm": "Un algorithme de détection et démultiplication de l'affection",
        "gaze-detector": "Un capteur de regard envoûtant couplé à un booster de sentiments",
        "synaptic-gravity": "La force gravitationnelle et l'attraction mutuelle des coeurs"
      };

      const languageNames: Record<string, string> = {
        "typescript": "TypeScript d'Amour",
        "python": "Romantic Python",
        "html-css": "Style Céleste HTML/CSS",
        "sql": "Mémoire Sacrée SQL"
      };

      const chosenConcept = conceptDescriptions[concept] || "Un programme magique d'amour infini";
      const chosenLanguage = languageNames[language] || "un langage galactique";

      const systemInstruction = `Tu es un compilateur de cœur poétique et geek de haut niveau. Ton rôle est de concevoir du pseudo-code de haut niveau, extrêmement amusant, inventif et doux, mêlant de véritables paradigmes de programmation (data science, pipelines ETL, réseaux de neurones, récursivité, requêtes relationnelles, styles CSS modernes) avec des sentiments amoureux intenses entre Mike (le petit ami fou d'amour 💖) et Reamj (la Senior Data Scientist d'élite régnant sur son coeur 👑).
Le pseudo-code doit être propre, rigolo et plein d'allusions à l'informatique ou d'humour de développeur (comme client.cuddle(), reamj.smileIntensity, process.env.MIKE_TENDERNESS, tout en préservant le langage choisi).
Génère une réponse structurée au format JSON contenant :
1. "code": Du pseudo-code bien espacé et formaté au propre dans le style du langage requis (TypeScript, Python, HTML/CSS ou SQL).
2. "commentary": Un commentaire poétique, affectueux et drôle (en français) d'environ 3-4 phrases qui explique l'analogie entre cette fonction de développement et votre amour. Indique implicitement que Mike est fier de programmer avec elle.`;

      const userPrompt = `Génère le pseudo-code romantique suivant :
Thème : ${chosenConcept}
Langage : ${chosenLanguage}`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.95,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING, description: "The romantic pseudocode snippet matching the paradigm." },
              commentary: { type: Type.STRING, description: "A witty, sweet french commentary explaining how it compiles your love." }
            },
            required: ["code", "commentary"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText.trim());
      return res.json({ 
        code: parsed.code || `${language === 'python' ? '# Defect:\nprint("Love Overflow")' : '// Love Overflow error'}`, 
        commentary: parsed.commentary || "Notre compilateur a fondu devant tant d'amour." 
      });

    } catch (error: any) {
      console.error("Gemini API Error in /api/romantic-code:", error);
      return res.status(500).json({ 
        error: "Le serveur n'a pas pu compiler l'affection suite à une petite surchauffe.",
        details: error.message 
      });
    }
  });

  // API Project Updates (Search Grounding & Commits Activity) route
  app.post("/api/project-updates", async (req, res) => {
    try {
      const { title, techs } = req.body;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "Une clé d'API Gemini manquante. Veuillez configurer GEMINI_API_KEY dans vos secrets." 
        });
      }

      if (!title) {
        return res.status(400).json({ error: "Le titre du projet est requis." });
      }

      const techList = Array.isArray(techs) ? techs.join(', ') : 'React, TypeScript';
      const query = `Recherche les mises à jour réelles, commits récents ou tendances de développement GitHub pour des projets utilisant les technologies: ${techList} et basés sur le concept : "${title}". Sur la base de ces résultats, invente 4 entrées de commits/updates extrêmement précises et réalistes sous forme de flux d'activité Git pour Reamj Dapme et ses collaborateurs. Rédige les messages et détails techniques de manière crédible en français. Donne aussi un résumé clair de ce que tu as trouvé/groundé.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: query,
        config: {
          // tools: [{ googleSearch: {} }], // Commenté car le Search Grounding nécessite un quota/facturation spécifique
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              updates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    commitHash: { type: Type.STRING, description: "7-character short commit hash, e.g. a1b2c3d." },
                    author: { type: Type.STRING, description: "Author name, e.g. Reamj Dapme, Mike, or another collaborator." },
                    date: { type: Type.STRING, description: "Relative time of commit release, e.g. 'Il y a 3 heures', 'Hier', 'Il y a 2 jours'." },
                    message: { type: Type.STRING, description: "Detailed commit message title in French." },
                    category: { type: Type.STRING, description: "Category of commit: 'feature', 'fix', 'refactor', 'docs', 'chore'." },
                    details: { type: Type.STRING, description: "Detailed summary of the technical modifications made, file paths updated, or algorithms optimized (in French)." }
                  },
                  required: ["commitHash", "author", "date", "message", "category", "details"]
                }
              },
              searchSummary: { type: Type.STRING, description: "A highly concise summary of latest real-world developments or Github repository trends found via Google Search." }
            },
            required: ["updates", "searchSummary"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text.trim());

      // Extract search sources from groundingMetadata to show real proof of grounding
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources: Array<{ title: string; url: string }> = [];
      
      if (groundingMetadata && groundingMetadata.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web && chunk.web.uri) {
            sources.push({
              title: chunk.web.title || "Source de recherche",
              url: chunk.web.uri
            });
          }
        }
      }

      // De-duplicate resources
      const uniqueSources = sources.filter((item, index, self) =>
        index === self.findIndex((t) => t.url === item.url)
      ).slice(0, 3);

      return res.json({
        updates: parsed.updates || [],
        searchSummary: parsed.searchSummary || "Mises à jour récupérées.",
        sources: uniqueSources
      });

    } catch (error: any) {
      console.error("Gemini Search Grounding Error in /api/project-updates:", error);
      return res.status(500).json({
        error: "Erreur de récupération des informations de mise à jour.",
        details: error.message
      });
    }
  });

  // API Blog Article Detail — fetch rich content via Gemini + Google Search
  // In-memory cache to avoid repeated Gemini calls for the same article
  const articleDetailCache: Record<string, { timestamp: number; data: any }> = {};
  const ARTICLE_DETAIL_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  app.get("/api/blog/article", async (req, res) => {
    const articleUrl   = req.query.url   ? String(req.query.url).trim()   : '';
    const articleTitle = req.query.title ? String(req.query.title).trim() : '';
    const articleTech  = req.query.tech  ? String(req.query.tech).trim()  : '';

    if (!articleUrl && !articleTitle) {
      return res.status(400).json({ error: "url ou title requis." });
    }

    const cacheKey = articleUrl || articleTitle;
    const now = Date.now();

    // Serve from cache if fresh
    if (articleDetailCache[cacheKey] && (now - articleDetailCache[cacheKey].timestamp < ARTICLE_DETAIL_CACHE_DURATION)) {
      return res.json({ ...articleDetailCache[cacheKey].data, fromCache: true });
    }

    if (!apiKey) {
      return res.status(503).json({ error: "API Gemini non configurée." });
    }

    try {
      const searchTarget = articleUrl
        ? `l'article disponible à cette URL : ${articleUrl}`
        : `l'article intitulé "${articleTitle}" sur la technologie ${articleTech}`;

      const prompt = `Tu es un expert en veille technologique. Recherche et analyse ${searchTarget}.

Sur la base des résultats de recherche Google, génère un contenu détaillé en français pour cet article de blog technique. Le contenu doit :
1. Être fidèle au contenu réel trouvé sur la page (ne pas inventer).
2. Être rédigé de façon journalistique, claire et engagée.
3. Contenir entre 3 et 5 paragraphes substantiels (80-120 mots chacun).
4. Inclure 3 à 5 points clés synthétiques (bullet points concis).
5. Estimer le temps de lecture en minutes.

Si tu ne trouves pas le contenu exact de l'article, base-toi sur ce que Google Search te retourne sur ce sujet et cet article spécifique.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          // // tools: [{ googleSearch: {} }], // Commenté car le Search Grounding nécessite un quota/facturation spécifique // Commenté car le Search Grounding nécessite un quota/facturation spécifique
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              paragraphs: {
                type: Type.ARRAY,
                description: "3 à 5 paragraphes du contenu de l'article, en français.",
                items: { type: Type.STRING }
              },
              keyPoints: {
                type: Type.ARRAY,
                description: "3 à 5 points clés synthétiques extraits de l'article.",
                items: { type: Type.STRING }
              },
              readingTimeMinutes: {
                type: Type.NUMBER,
                description: "Temps de lecture estimé en minutes (nombre entier)."
              },
              sourceQuality: {
                type: Type.STRING,
                description: "Brève note sur la fiabilité et la fraîcheur des sources trouvées (1 phrase)."
              }
            },
            required: ["paragraphs", "keyPoints", "readingTimeMinutes"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text.trim());

      // Extract grounding sources
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources: Array<{ title: string; url: string }> = [];
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web?.uri) {
            sources.push({ title: chunk.web.title || "Source", url: chunk.web.uri });
          }
        }
      }

      const payload = {
        paragraphs: parsed.paragraphs || [],
        keyPoints: parsed.keyPoints || [],
        readingTimeMinutes: parsed.readingTimeMinutes || 3,
        sourceQuality: parsed.sourceQuality || null,
        sources: sources.slice(0, 4),
        fromCache: false
      };

      articleDetailCache[cacheKey] = { timestamp: Date.now(), data: payload };

      return res.json(payload);

    } catch (error: any) {
      console.error("[Blog Article Detail] Error:", error.message);
      return res.status(500).json({
        error: "Impossible de récupérer le contenu de l'article.",
        details: error.message
      });
    }
  });

  // API Blog Cache representation for robust performance & quota preservation
  interface BlogCacheEntry {
    timestamp: number;
    data: {
      articles: any[];
      techTrendSummary: string;
      fromCache?: boolean;
      cacheSource?: string;
    };
  }
  const blogCache: Record<string, BlogCacheEntry> = {};
  const BLOG_CACHE_DURATION = 60 * 60 * 1000; // 1-hour in-memory cache

  // Helper: save articles to Supabase blog_cache table
  const saveToSupabaseBlogCache = async (key: string, articles: any[], trendSummary: string, source: string = 'gemini') => {
    try {
      // 1. Save trend summary to the old blog_cache table
      await getSupabase().from('blog_cache').upsert({
        tech_key: key,
        trend_summary: trendSummary,
        fetched_at: new Date().toISOString(),
        source: source
      }, { onConflict: 'tech_key' });

      // 2. Save articles individually
      if (articles && articles.length > 0) {
        const rowsToInsert = articles.map(a => ({
          url: a.url,
          title: a.title,
          technology: a.technology || key,
          excerpt: a.excerpt,
          date: a.date,
          source_name: a.sourceName || a.source_name,
          fetched_at: new Date().toISOString()
        }));

        await getSupabase().from('blog_articles_cache').upsert(rowsToInsert, { onConflict: 'url' });
      }

      console.log(`[Blog DB Cache] Saved ${articles.length} articles individually for tech="${key}" to Supabase.`);
    } catch (e: any) {
      console.warn(`[Blog DB Cache] Could not save to Supabase: ${e.message}`);
    }
  };

  // Helper: load articles from Supabase blog_cache table
  const loadFromSupabaseBlogCache = async (key: string): Promise<{ articles: any[]; techTrendSummary: string; fetchedAt: string | null } | null> => {
    try {
      // Load trend summary
      const { data: trendData } = await getSupabase()
        .from('blog_cache')
        .select('trend_summary, fetched_at')
        .eq('tech_key', key)
        .single();

      // Load individual accumulated articles
      let articlesQuery = getSupabase()
        .from('blog_articles_cache')
        .select('title, technology, excerpt, date, source_name, url, fetched_at')
        .order('fetched_at', { ascending: false });

      if (key && key !== "All") {
        articlesQuery = articlesQuery.ilike('technology', `%${key}%`);
      }

      const { data: articlesData, error: articlesError } = await articlesQuery;

      if (articlesError && !articlesData) return null;

      const articles = articlesData ? articlesData.map(p => ({
        title: p.title,
        technology: p.technology,
        excerpt: p.excerpt,
        date: p.date,
        sourceName: p.source_name,
        url: p.url,
        isCache: true
      })) : [];

      if (articles.length === 0 && !trendData) return null;

      return {
        articles,
        techTrendSummary: trendData?.trend_summary || '',
        fetchedAt: trendData?.fetched_at || null
      };
    } catch (e: any) {
      console.warn(`[Blog DB Cache] Could not load from Supabase: ${e.message}`);
      return null;
    }
  };

  // Helper: load manual blog posts from Supabase
  const loadManualBlogPosts = async (techFilter: string): Promise<any[]> => {
    try {
      let query = getSupabase()
        .from('blog_posts')
        .select('title, technology, excerpt, date, source_name, url')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error || !data) return [];

      let posts = data.map(p => ({
        title: p.title,
        technology: p.technology,
        excerpt: p.excerpt,
        date: p.date,
        sourceName: p.source_name,
        url: p.url,
        isManual: true
      }));

      if (techFilter && techFilter !== "All") {
        const lowerFilter = techFilter.toLowerCase();
        posts = posts.filter(p => p.technology.toLowerCase().includes(lowerFilter));
      }
      return posts;
    } catch (e: any) {
      console.warn(`[Blog Manual Posts] Could not load from Supabase: ${e.message}`);
      return [];
    }
  };

  // API Blog articles route (Search Grounding, DB Caching & Resilient Fallback)
  app.get("/api/blog", async (req, res) => {
    const FALLBACK_ARTICLES = [
      {
        title: "React 19 Server Components & Actions : Le guide ultime",
        technology: "React",
        excerpt: "Découvrez comment l'architecture serveur de React 19 simplifie la gestion d'état et l'accès aux bases de données en direct sans API intermédiaire, tout en conservant d'excellentes performances d'affichage.",
        date: "Il y a 3 jours",
        sourceName: "react.dev",
        url: "https://react.dev/blog/2024/12/05/react-19"
      },
      {
        title: "Python 3.13 introduit un compilateur JIT expérimental",
        technology: "Python",
        excerpt: "La dernière mise à jour majeure de Python apporte une refonte du GIL (Global Interpreter Lock) permettant de vrais traitements parallèles, ainsi qu'un nouveau compilateur Just-In-Time pour accélérer l'exécution des boucles complexes.",
        date: "La semaine dernière",
        sourceName: "Python Software Foundation",
        url: "https://docs.python.org/3/whatsnew/3.13.html"
      },
      {
        title: "Construire des pipelines ETL résilients avec Apache Airflow et PostgreSQL",
        technology: "Data Engineering",
        excerpt: "Guide pas-à-pas pour orchestrer, monitorer et recouvrer automatiquement des pipelines de traitement de données complexes en utilisant les opérateurs d'Airflow et les indexations PostgreSQL de Reamj.",
        date: "Il y a 2 semaines",
        sourceName: "Medium / Towards Data Science",
        url: "https://airflow.apache.org/"
      },
      {
        title: "TypeScript 5.5 : Typage d'expressions régulières et vérifications de types plus rapides",
        technology: "TypeScript",
        excerpt: "TypeScript 5.5 améliore la syntaxe des prédicats de type filtrés, et intègre enfin une vérification syntaxique complète et un typage natif de vos expressions régulières directement dans votre EDI.",
        date: "Il y a un mois",
        sourceName: "TypeScript Blog",
        url: "https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/"
      },
      {
        title: "L'essor du RAG et de l'affinage (Fine-Tuning) pour l'IA générative",
        technology: "Machine Learning",
        excerpt: "Une plongée technique au cœur de l'optimisation des grands modèles de langage par génération augmentée par récupération (RAG) et apprentissage par renforcement issue des meilleurs articles récents du domaine.",
        date: "La semaine dernière",
        sourceName: "Hugging Face Blog",
        url: "https://huggingface.co/blog"
      }
    ];

    const tech = req.query.tech ? String(req.query.tech).trim() : "All";
    const forceRefresh = req.query.refresh === "true";
    const cacheKey = tech.toLowerCase();
    const now = Date.now();

    // Fetch manual posts to merge them into the final result
    const manualPosts = await loadManualBlogPosts(tech);

    // Serve from in-memory cache if available and not expired (skip on forceRefresh)
    if (!forceRefresh && blogCache[cacheKey] && (now - blogCache[cacheKey].timestamp < BLOG_CACHE_DURATION)) {
      const cachedPayload = blogCache[cacheKey].data;
      // Merge manual posts with cached articles (avoiding strict duplicates by URL could be done, but simple prepend is fine)
      const mergedArticles = [...manualPosts, ...cachedPayload.articles];
      return res.json({ ...cachedPayload, articles: mergedArticles });
    }

    try {
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing, trying Supabase DB cache first.");

        // Try Supabase DB cache
        const dbCached = await loadFromSupabaseBlogCache(cacheKey);
        if (dbCached) {
          return res.json({
            articles: [...manualPosts, ...dbCached.articles],
            techTrendSummary: dbCached.techTrendSummary,
            fromCache: true,
            cacheSource: 'database',
            cachedAt: dbCached.fetchedAt
          });
        }

        // Fall back to static articles
        const filtered = tech !== "All"
          ? FALLBACK_ARTICLES.filter(a => a.technology.toLowerCase().includes(tech.toLowerCase()))
          : FALLBACK_ARTICLES;

        const baseArticles = filtered.length > 0 ? filtered : FALLBACK_ARTICLES.slice(0, 3);
        
        return res.json({
          articles: [...manualPosts, ...baseArticles],
          techTrendSummary: `Sélection d'articles de référence sur l'écosystème ${tech !== "All" ? tech : "High-Tech et IA"}.`,
          fromCache: true,
          cacheSource: 'static'
        });
      }

      let searchQuery = "";
      if (tech && tech !== "All") {
        searchQuery = `Recherche d'articles de blog technique, tutoriels et actualités techniques récents sur la technologie : "${tech}".`;
      } else {
        searchQuery = `Recherche des actualités techniques majeures de l'année en cours sur React, TypeScript, Python, Machine Learning et PostgreSQL.`;
      }

      const prompt = `${searchQuery} 
Sur la base des résultats de recherche Google, génère exactement 5 articles de blog technique réels et récents. Chaque article doit contenir un titre exact basé sur tes résultats de recherche, le nom du média d'origine (ex: Medium, Dev.to, React Blog, TechCrunch), un aperçu/résumé détaillé de 3 phrases rédigé en français expliquant précisément le sujet technique traité, la date de publication réelle ou relative la plus exacte possible, la technologie spécifique concernée (ex: React, TypeScript, Python, ML, Docker), et l'URL réelle de l'article provenant des sources (googleSearch) que tu as trouvées. Associe chaque article avec sa véritable URL trouvée via webSearch.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          // tools: [{ googleSearch: {} }], // Commenté car le Search Grounding nécessite un quota/facturation spécifique
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              articles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Titre réel et accrocheur de l'article technique." },
                    technology: { type: Type.STRING, description: "La technologie spécifique (ex: React, TypeScript, Python, Machine Learning, Data Engineering, Docker, PostgreSQL)." },
                    excerpt: { type: Type.STRING, description: "Un résumé clair de 3 phrases en français du contenu technique de l'article." },
                    date: { type: Type.STRING, description: "Date exacte ou relative de publication." },
                    sourceName: { type: Type.STRING, description: "Médias d'origine (ex: Dev.to, Blog officiel de React, Medium, Hub)." },
                    url: { type: Type.STRING, description: "L'URL web réelle et directe de l'article trouvée dans les résultats Google Search." }
                  },
                  required: ["title", "technology", "excerpt", "date", "sourceName", "url"]
                }
              },
              techTrendSummary: { type: Type.STRING, description: "Un résumé en français de 2 phrases sur l'évolution globale de cette technologie ces derniers mois." }
            },
            required: ["articles", "techTrendSummary"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text.trim());

      const payload = {
        articles: parsed.articles || [],
        techTrendSummary: parsed.techTrendSummary || `Tendances sur l'écosystème ${tech !== "All" ? tech : "High-Tech"}.`,
        fromCache: false,
        cacheSource: 'live' as string
      };

      // Store in memory cache
      blogCache[cacheKey] = {
        timestamp: Date.now(),
        data: payload
      };

      // Persist to Supabase DB asynchronously (don't block the response)
      saveToSupabaseBlogCache(cacheKey, payload.articles, payload.techTrendSummary, 'gemini').catch(() => {});

      // Send response merging manual posts
      return res.json({
        ...payload,
        articles: [...manualPosts, ...payload.articles]
      });

    } catch (error: any) {
      console.log(`[Blog API] API unavailable for tech="${tech}", trying DB cache then in-memory cache.`);

      // 1. Try Supabase DB cache (persists across server restarts)
      const dbCached = await loadFromSupabaseBlogCache(cacheKey);
      if (dbCached) {
        console.log(`[Blog DB Cache] Serving ${dbCached.articles.length} articles from Supabase for tech="${tech}"`);
        return res.json({
          articles: [...manualPosts, ...dbCached.articles],
          techTrendSummary: dbCached.techTrendSummary,
          fromCache: true,
          cacheSource: 'database',
          cachedAt: dbCached.fetchedAt
        });
      }

      // 2. Try in-memory cache (even if expired, better than nothing)
      if (blogCache[cacheKey]) {
        console.log(`[Blog Cache] Serving expired in-memory cache for: ${tech}`);
        const cachedPayload = blogCache[cacheKey].data;
        return res.json({ ...cachedPayload, articles: [...manualPosts, ...cachedPayload.articles], fromCache: true, cacheSource: 'memory' });
      }

      // 3. Static fallback articles (last resort)
      const filtered = tech !== "All"
        ? FALLBACK_ARTICLES.filter(a => a.technology.toLowerCase().includes(tech.toLowerCase()))
        : FALLBACK_ARTICLES;

      const baseArticles = filtered.length > 0 ? filtered : FALLBACK_ARTICLES.slice(0, 3);

      return res.json({
        articles: [...manualPosts, ...baseArticles],
        techTrendSummary: `Tendances générales sur l'écosystème ${tech !== "All" ? tech : "High-Tech"}. (Mode résilient actif)`,
        fromCache: true,
        cacheSource: 'static'
      });
    }
  });

  const httpServer = http.createServer(app);

  // Serve static items / Vite handling
  if (process.env.NODE_ENV !== "production") {
    (async () => {
      const isHmrDisabled = process.env.DISABLE_HMR === "true";
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: isHmrDisabled ? false : {
            server: httpServer,
          },
        },
        appType: "spa",
      });
      app.use(vite.middlewares as any);
      
      httpServer.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })();
  } else {
    // En production sur Render, on sert l'application compilée
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Production server running on port ${PORT}`);
    });
  }
