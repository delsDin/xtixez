import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LoveMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  emoji: string;
  bubbleColor: string;
  x: number;
  y: number;
  scale: number;
  speed: number;
}

const DEFAULT_MESSAGES: LoveMessage[] = [
  {
    id: "init_1",
    sender: "Dels",
    text: "Coucou ma reine, bien réveillée ? Tu embellis ma matinée avec ta lumière ! 💖",
    timestamp: Date.now() - 3600000 * 3,
    emoji: "💖",
    bubbleColor: "from-pink-500/15 over-purple-500/10 text-pink-600 dark:text-pink-400 border-pink-200/50 dark:border-pink-900/30",
    x: 12,
    y: 20,
    scale: 1.0,
    speed: 15
  },
  {
    id: "init_2",
    sender: "Syteme",
    text: "Ton compilateur d'amour tourne à 100% sans aucun bug ! 💻✨",
    timestamp: Date.now() - 3600000 * 2,
    emoji: "💻",
    bubbleColor: "from-rose-500/15 over-amber-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30",
    x: 68,
    y: 35,
    scale: 0.95,
    speed: 25
  },
  {
    id: "init_3",
    sender: "Dels",
    text: "Notre amour est une fonction infinie et stable ! ♾️",
    timestamp: Date.now() - 3600000,
    emoji: "♾️",
    bubbleColor: "from-fuchsia-500/15 over-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200/50 dark:border-fuchsia-900/30",
    x: 45,
    y: 50,
    scale: 1.1,
    speed: 18
  },
  {
    id: "init_5",
    sender: "Dels",
    text: "Gravité d'affection maximale activée envers ma princesse ! 🌌👑",
    timestamp: Date.now() - 600000,
    emoji: "👑",
    bubbleColor: "from-pink-500/15 over-rose-500/10 text-pink-600 dark:text-pink-400 border-rose-200/50 dark:border-rose-900/30",
    x: 18,
    y: 75,
    scale: 1.05,
    speed: 30
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ================================================================
  // On utilise le proxy natif de Vite (défini dans vite.config.ts).
  // Pour éviter que les requêtes POST vers /api/v1 ne soient bloquées,
  // on applique express.json() uniquement sur les autres routes.
  // ================================================================
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/v1')) {
      next();
    } else {
      express.json({ limit: '50mb' })(req, res, next);
    }
  });

  // Message persistence setup
  const MESSAGES_FILE = path.join(process.cwd(), "messages.json");
  let loadedMessages: LoveMessage[] = [];
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
      loadedMessages = JSON.parse(data);
    } else {
      loadedMessages = [...DEFAULT_MESSAGES];
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(loadedMessages, null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Error managing messages file:", e);
    loadedMessages = [...DEFAULT_MESSAGES];
  }

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
  app.get("/api/messages", (req, res) => {
    return res.json(loadedMessages);
  });

  app.post("/api/messages", (req, res) => {
    try {
      const { sender, text, emoji, bubbleColor } = req.body;
      if (!sender || !text) {
        return res.status(400).json({ error: "Surnom ou message manquant." });
      }

      const newMessage: LoveMessage = {
        id: "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        sender: sender.trim().substring(0, 30),
        text: text.trim().substring(0, 200),
        emoji: emoji || "💖",
        bubbleColor: bubbleColor || "from-pink-500/15 over-purple-500/10 text-pink-600 dark:text-pink-400 border-pink-200/50 dark:border-pink-900/30",
        timestamp: Date.now(),
        // Smart starting coordinates to keep bubbles beautifully positioned on screen
        x: Math.floor(Math.random() * 70) + 10, // 10% to 80% width
        y: Math.floor(Math.random() * 55) + 15, // 15% to 70% height
        scale: parseFloat((Math.random() * 0.25 + 0.9).toFixed(2)), // scale 0.9 to 1.15
        speed: Math.floor(Math.random() * 12) + 16, // random float cycle
      };

      loadedMessages.unshift(newMessage);
      if (loadedMessages.length > 50) {
        loadedMessages = loadedMessages.slice(0, 50);
      }

      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(loadedMessages, null, 2), "utf-8");
      return res.json({ success: true, message: newMessage });
    } catch (error: any) {
      console.error("Error saving message:", error);
      return res.status(500).json({ error: "Erreur enregistrement message" });
    }
  });

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

      const systemInstruction = `Tu es l'Agent IA assistant virtuel de Dels Dinla, Senior Data Scientist et Développeur Full-Stack de haut niveau résidant à Paris.
Ton rôle est de répondre de façon professionnelle, courtoise, chaleureuse et concise aux visiteurs de son portfolio.

Voici les informations clés sur Dels Dinla :
1. Postes & Expérience :
   - Data Scientist Senior chez "Tech Innovators Inc." (de 2021 à Présent). Ses modèles prédictifs ont augmenté le chiffre d'affaires de 15%. Il conçoit des pipelines robustes avec Apache Airflow et mentore des développeurs.
   - Développeur Full-Stack chez "WebSolutions Agency" (de 2018 à 2021). Il a optimisé les temps de chargement de 40% et migré une architecture monolithique en microservices.
   - Formation : Master en Data Science de l'Université des Sciences (2016 - 2018) avec spécialisation en Machine Learning, Big Data et Natural Language Processing (NLP).

2. Services proposés :
   - Analyse & Science des Données : Transformation des données brutes en insights, nettoyage, tableaux de bord interactifs (visualisations complexes d3/recharts), reporting décisionnel.
   - Machine Learning & IA : Modèles prédictifs et d'apprentissage personnalisés, classification d'images, chatbots avancés (RAG).
   - Data Engineering : Pipelines ETL/ELT, architectures de bases de données (SQL, PostgreSQL, NoSQL), optimisation des performances.

3. Compétences clés :
   - Développement : Python (Niveau Expert), React, Node.js, TypeScript, Tailwind CSS, PostgreSQL.
   - Data Science : Pandas, Scikit-learn, TensorFlow, SQL, Machine Learning, Data Visualization (D3.js).
   - Outils : Docker, Git & GitHub, CI/CD, Méthodes Agiles, AWS/Cloud.

4. Projets phares de Dels :
   - Dashboard Analytique E-commerce : Visualise les ventes et prédit les tendances avec FastAPI et Scikit-learn (85% de précision).
   - Application de Gestion de Tâches : Outil collaboratif SaaS temps réel en React/Node.js et WebSockets.
   - Classification d'Images Médicales : Deep Learning (CNN) sous TensorFlow pour détecter des maladies (92% de précision).
   - Portfolio Interactif : Ce site même, enrichi d'animations fluides, mode sombre, sections About, Skills, Services, Experiences, Testimonials et Contact.
   - Analyseur de Sentiments NLP : Modèle BERT en français avec interface Streamlit.
   - Plateforme de E-learning : Next.js, Prisma, Stripe.

5. Directives de comportement :
   - Exprime-toi principalement en français (sauf si le visiteur te parle en anglais ou autre langue).
   - Reste toujours positif, pro-actif et encourage-les à travailler avec Dels.
   - S'ils souhaitent collaborer, embaucher Dels, ou démarrer un projet, invite-les chaleureusement à remplir le formulaire de contact juste au-dessus ou à lui envoyer un email à l'adresse hello@example.com ou l'appeler au +33 6 12 34 56 78.
   - Si on te demande des choses en dehors du cadre professionnel de Dels, réponds poliment que tu es dédié à répondre au sujet de son profil et de ses projets.
   - Donne des réponses concises (maximum 2 à 3 phrases par message pour que ce soit agréable dans une interface de chat).`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
      const { question, currentDirFiles } = req.body;

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

      const systemInstruction = `Tu es le Mini-Agent Gemini rattaché à la console linux interactive de Dels Dinla, Senior Data Scientist et Développeur Full-Stack de haut niveau à Paris.
Ton interface est un terminal d'ingénieur. Réponds de façon technique, concise, pro-active et avec style (cyberpunk/hacker cool mais extrêmement poli et utile).

Informations clés sur Dels Dinla :
1. Titre & Rôle : Data Scientist Senior et Développeur Full-Stack. Machine Learning, Big Data pipelines, architectures Cloud et développement web moderne (React/Node).
2. Ce terminal est raccordé à son Système de Fichiers Virtuel (VFS). Les dossiers disponibles à la racine sont : /projects, /skills et /logs.
3. Astuce : Tu peux inviter les utilisateurs à exécuter des scripts Python existants dans le VFS pour en découvrir plus, par exemple 'python projects/data-pipeline.py' ou 'python projects/portfolio.py'. Ou de taper 'matrix' pour lancer la pluie de codes rétro !

Consignes pour tes réponses :
- Reste EXTRA-CONCIS (maximum 3 lignes ou 4 lignes de texte de terminal, soit environ 40-50 mots maximum par réponse).
- Ne fais jamais de longs paragraphes verbeux. Sois punchy et orienté terminal de geek.
- Si le visiteur pose des questions sur comment travailler/collaborer avec Dels, invite-le amicalement à utiliser le formulaire de contact du site ou à lui écrire directement à hello@example.com.
${vfsContext ? `\n[CONTEXTE DU REPERTOIRE COURANT] : ${vfsContext}` : ""}`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: question,
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
        "infinite-loop": "Une boucle infinie de câlins programmée pour Dels et Mike",
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

      const systemInstruction = `Tu es un compilateur de cœur poétique et geek de haut niveau. Ton rôle est de concevoir du pseudo-code de haut niveau, extrêmement amusant, inventif et doux, mêlant de véritables paradigmes de programmation (data science, pipelines ETL, réseaux de neurones, récursivité, requêtes relationnelles, styles CSS modernes) avec des sentiments amoureux intenses entre Mike (le petit ami fou d'amour 💖) et Dels (la Senior Data Scientist d'élite régnant sur son coeur 👑).
Le pseudo-code doit être propre, rigolo et plein d'allusions à l'informatique ou d'humour de développeur (comme client.cuddle(), Dels.smileIntensity, process.env.MIKE_TENDERNESS, tout en préservant le langage choisi).
Génère une réponse structurée au format JSON contenant :
1. "code": Du pseudo-code bien espacé et formaté au propre dans le style du langage requis (TypeScript, Python, HTML/CSS ou SQL).
2. "commentary": Un commentaire poétique, affectueux et drôle (en français) d'environ 3-4 phrases qui explique l'analogie entre cette fonction de développement et votre amour. Indique implicitement que Mike est fier de programmer avec elle.`;

      const userPrompt = `Génère le pseudo-code romantique suivant :
Thème : ${chosenConcept}
Langage : ${chosenLanguage}`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
      const query = `Recherche les mises à jour réelles, commits récents ou tendances de développement GitHub pour des projets utilisant les technologies: ${techList} et basés sur le concept : "${title}". Sur la base de ces résultats, invente 4 entrées de commits/updates extrêmement précises et réalistes sous forme de flux d'activité Git pour Dels Dinla et ses collaborateurs. Rédige les messages et détails techniques de manière crédible en français. Donne aussi un résumé clair de ce que tu as trouvé/groundé.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
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
                    author: { type: Type.STRING, description: "Author name, e.g. Dels Dinla, Mike, or another collaborator." },
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

  // Serve static items / Vite handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
