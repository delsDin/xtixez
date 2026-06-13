import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Play, Trash2, HelpCircle, RefreshCw, 
  Code, Sparkles, Cpu, Layers, ChevronRight, Check, AlertCircle, CircleDot,
  Folder, File, FolderOpen, FileText, Save, Plus, X, Edit3, ArrowUp
} from 'lucide-react';
import { useTheme, schemes } from '../context/ThemeContext';
import { skillsData, projectsData } from '../data/mockData';
import { useNavigation } from '../context/NavigationContext';

interface LogLine {
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
}

interface CodePreset {
  name: string;
  description: string;
  code: string;
  language: 'python';
}

// Complete Virtual File System types definition
interface VNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;             // populated for 'file' type nodes
  children?: Record<string, VNode>; // populated for 'dir' type nodes
}

export const TerminalPlayground: React.FC = () => {
  const { darkMode, toggleDarkMode, currentSchemeIndex, currentScheme, setSchemeIndex, cycleScheme } = useTheme();
  const { isHopsonMode, setIsHopsonMode } = useNavigation();
  
  // 1. Initial Content Virtual File Tree State
  const initialFileTree: Record<string, VNode> = {
    'projects': {
      name: 'projects',
      type: 'dir',
      children: {
        'data-pipeline.py': {
          name: 'data-pipeline.py',
          type: 'file',
          content: `print("=== DIAGNOSTIC PIPELINE DISPATCH ===")\ningested_total = 12948\ndlq_rejected = 42\nratio_valid = 99.6\nprint(f"Stats: Total Ingested={ingested_total}")\nprint(f"Stats: Rejetes DLQ={dlq_rejected}")\nprint(f"Stats: Taux validite={ratio_valid}%")`
        },
        'portfolio.py': {
          name: 'portfolio.py',
          type: 'file',
          content: `print("=== SYNTHESE DE L'ARCHITECTURE ===")\nprint("Systeme : React 18 + Vite + TailwindCSS")\nprint("Design : Swiss Typography Minimaliste")\nprint("Lancer theme.cycle() dans la console !")`
        }
      }
    },
    'skills': {
      name: 'skills',
      type: 'dir',
      children: {
        'frontend.txt': {
          name: 'frontend.txt',
          type: 'file',
          content: `• React (Expert - Hooks v2 & Suspense)\n• TypeScript (Typage statique strict haut de gamme)\n• Tailwind CSS (Thèmes adaptatifs fluides)`
        },
        'datascience.txt': {
          name: 'datascience.txt',
          type: 'file',
          content: `• Python (Séries temporelles avec Pandas)\n• Machine Learning (Scikit-Learn Classifiers)\n• Deep Learning (TensorFlow neural networks)`
        }
      }
    },
    'logs': {
      name: 'logs',
      type: 'dir',
      children: {
        'stream_engine.log': {
          name: 'stream_engine.log',
          type: 'file',
          content: `[2026-06-11 09:30:11] INFO: Initialisation du contrôleur WASM.\n[2026-06-11 09:30:15] DEBUG: WebSocket rattaché au buffer d'entrée.\n[2026-06-11 09:31:02] WARN: Débordement temporaire évité sur DLQ.`
        }
      }
    },
    'README.md': {
      name: 'README.md',
      type: 'file',
      content: `# Terminal Virtuel Complet avec VFS (Virtual File System)

Vous pouvez naviguer et manipuler les fichiers directement avec les commandes shell standard :
• ls             : Lister les fichiers et dossiers actuels
• cd <dossier>   : Entrer dans un dossier (ex: cd projects)
• cd ..          : Remonter d'un dossier
• cat <fichier>  : Afficher le contenu textuel
• touch <nom>    : Créer un fichier vierge
• mkdir <nom>    : Créer un répertoire vide
• rm <nom>       : Supprimer temporairement un fichier
• rm -rf <nom>   : Forcer la suppression d'un dossier
• python <nom>   : Évaluer un fichier de script python (.py)
• pwd            : Afficher le dossier actuel
• hack           : Lancer le mini-jeu de décryptage du terminal !
• neofetch       : Afficher la carte d'identité du système !

Utilisez les onglets interactifs à gauche pour modifier visuellement l'arbre de fichiers !`
    }
  };

  const [fileSystem, setFileSystem] = useState<Record<string, VNode>>(initialFileTree);
  const [currentPath, setCurrentPath] = useState<string[]>([]); // Current absolute nested folder path arrays
  const [selectedFile, setSelectedFile] = useState<{ path: string[]; name: string; content: string } | null>(null);
  
  // Hacking / Decryption Mini-Game State
  const [hackGame, setHackGame] = useState<{
    active: boolean;
    words: string[];
    targetWord: string;
    attempts: number;
    maxAttempts: number;
    wordLength: number;
    guesses: { word: string; likeness: number }[];
    gridLines: { offset: string; text: string }[];
    status: 'idle' | 'playing' | 'won' | 'lost';
  }>({
    active: false,
    words: [],
    targetWord: '',
    attempts: 4,
    maxAttempts: 4,
    wordLength: 6,
    guesses: [],
    gridLines: [],
    status: 'idle',
  });

  // Left menu navigation tabs
  const [activeSidebarTab, setActiveSidebarTab] = useState<'vfs' | 'presets' | 'variables' | 'hack'>('vfs');

  // Lib: Get similarity (likeness) score between two words
  const getLikeness = (g: string, t: string) => {
    let score = 0;
    const minLen = Math.min(g.length, t.length);
    for (let i = 0; i < minLen; i++) {
      if (g[i].toUpperCase() === t[i].toUpperCase()) {
        score++;
      }
    }
    return score;
  };

  // Main initializer for the decryption mini-game
  const initHackGame = () => {
    const wordPool = [
      'ACCESS', 'BUFFER', 'BYPASS', 'CIPHER', 'ENGINE', 'GEMINI', 'KERNEL', 'MATRIX', 
      'MEMORY', 'ORACLE', 'PACKET', 'PYTHON', 'ROUTER', 'SECRET', 'SECTOR', 'SYSTEM', 
      'SOURCE', 'STREAM', 'BEACON', 'MODULE', 'DOCKER', 'PARSER', 'SHIELD', 'TROJAN', 
      'CLIENT', 'SERVER', 'SOCKET', 'BINARY', 'VECTOR', 'PROFIL'
    ];
    
    // Choose 10 random words
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, 10).map(w => w.toUpperCase());
    
    // Choose one as target
    const target = selectedWords[Math.floor(Math.random() * selectedWords.length)];
    
    // Generate dummy grid lines (Garbage hex dump layout)
    const garbageChars = '!@#$%^&*()_+-=[]{}|;:,.<>/?';
    const gridLines = selectedWords.map((word, idx) => {
      const offset = '0x' + (0x4E00 + idx * 12).toString(16).toUpperCase();
      
      const lenBefore = Math.floor(Math.random() * 4) + 3;
      const lenAfter = 14 - lenBefore - word.length;
      
      let before = '';
      for (let i = 0; i < lenBefore; i++) {
        before += garbageChars[Math.floor(Math.random() * garbageChars.length)];
      }
      let after = '';
      for (let i = 0; i < lenAfter; i++) {
        after += garbageChars[Math.floor(Math.random() * garbageChars.length)];
      }
      
      return {
        offset,
        text: `${before}${word}${after}`
      };
    });

    setHackGame({
      active: true,
      words: selectedWords,
      targetWord: target,
      attempts: 4,
      maxAttempts: 4,
      wordLength: 6,
      guesses: [],
      gridLines,
      status: 'playing',
    });

    setActiveSidebarTab('hack');

    // Append to terminal history log
    setHistory(prev => [
      ...prev,
      { type: 'info', text: '===================================================' },
      { type: 'info', text: '📡 CONNEXION SÉCURISÉE AU TERMINAL DE DÉCRYPTAGE' },
      { type: 'info', text: 'Objectif : Trouver le mot de passe maître de 6 lettres.' },
      { type: 'info', text: 'Saisissez un mot de passe ou cliquez sur vos choix dans l\'onglet de gauche.' },
      { type: 'info', text: '===================================================' },
      ...gridLines.map(g => ({ type: 'output' as const, text: `${g.offset}   ${g.text}` })),
      { type: 'output', text: '>>>' }
    ]);
  };
  
  // Action state creators
  const [newFileName, setNewFileName] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingDir, setIsCreatingDir] = useState(false);

  // Terminal commands history and inputs
  const [history, setHistory] = useState<LogLine[]>([
    { type: 'info', text: '=== INTERACTIVE CLOUD SHELL & TERMINAL (v3.12-gemini) ===' },
    { type: 'info', text: 'Un Système de Fichiers Virtuel (VFS) complet est monté sur /' },
    { type: 'info', text: 'Tapez "ls" pour lister, "neofetch" pour la carte d\'identité, "cat README.md" pour apprendre, ou "ask <votre question>" pour l\'Agent IA !' },
    { type: 'output', text: '>>>' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [declaredVars, setDeclaredVars] = useState<Record<string, any>>({
    author: 'Dels',
    co_author: 'Hopson',
    framework: 'React 18 + Vite',
    status: 'Ready to build awesome software',
    experience_years: 5
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Matrix canvas support
  const [matrixActive, setMatrixActive] = useState(false);
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gemini thinking status state
  const [isAskingGemini, setIsAskingGemini] = useState(false);

  // Sound/Vibe indicator
  const [vibeTriggered, setVibeTriggered] = useState(false);

  // Auto scroll down whenever history increases
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Escape key handler to exit matrix mode
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMatrixActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => {
      window.removeEventListener('keydown', handleKeyDownGlobal);
    };
  }, []);

  // Matrix canvas animation loop
  useEffect(() => {
    if (!matrixActive) return;

    const canvas = matrixCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters for cyber matrix rain
    const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZdels<>/{}[]";
    const charArr = chars.split("");

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // stagger drops
    }

    let animationId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.97) {
          ctx.fillStyle = '#ffffff'; // Highlight cluster head
        } else {
          ctx.fillStyle = '#10b981'; // Emerald-500 green
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [matrixActive]);

  // VFS Walk Helpers
  const getDirFromPath = (fs: Record<string, VNode>, pathArray: string[]): Record<string, VNode> | null => {
    let curr: Record<string, VNode> = fs;
    for (const part of pathArray) {
      const node = curr[part];
      if (!node || node.type !== 'dir') return null;
      curr = node.children || {};
    }
    return curr;
  };

  const updateFileSystemNode = (
    root: Record<string, VNode>,
    pathArray: string[],
    updater: (parentChildren: Record<string, VNode>) => Record<string, VNode>
  ): Record<string, VNode> => {
    const clone = JSON.parse(JSON.stringify(root));
    
    const locateAndApply = (curr: Record<string, VNode>, index: number): Record<string, VNode> => {
      if (index === pathArray.length) {
        return updater(curr);
      }
      const part = pathArray[index];
      if (curr[part] && curr[part].type === 'dir') {
        curr[part].children = locateAndApply(curr[part].children || {}, index + 1);
      }
      return curr;
    };
    
    return locateAndApply(clone, 0);
  };

  // Preset commands
  const presets: CodePreset[] = [
    {
      name: 'Poser une question à l\'Agent IA (ask)',
      description: 'Interroger le Mini-Agent Gemini sur le profil de Dels',
      code: 'ask qui est Dels Dinla et quelles sont ses spécialités ?',
      language: 'python'
    },
    {
      name: 'Lister les répertoires (/ls)',
      description: 'Découvrir le système de fichiers virtuels',
      code: 'ls',
      language: 'python'
    },
    {
      name: 'Afficher le Guide (cat)',
      description: 'Affiche la documentation README',
      code: 'cat README.md',
      language: 'python'
    },
    {
      name: 'Exécuter data-pipeline.py',
      description: 'Lancer un test python localisé dans le VFS',
      code: 'python projects/data-pipeline.py',
      language: 'python'
    },
    {
      name: 'Activer le mode sombre',
      description: 'Met à jour l\'interface graphique',
      code: 'theme.dark()',
      language: 'python'
    },
    {
      name: 'Theme Cosmic Indigo AI',
      description: 'Bascule le theme sur Violet',
      code: 'theme.set_scheme("indigo")',
      language: 'python'
    },
    {
      name: 'Lancer Pluie Matrix',
      description: 'Effet retro dans la console',
      code: 'matrix()',
      language: 'python'
    },
    {
      name: 'Mini-Jeu : Décryptage (hack)',
      description: 'Démarrer le jeu de hacking de pare-feu',
      code: 'hack()',
      language: 'python'
    },
    {
      name: 'Identité Système (neofetch)',
      description: 'Afficher la carte d\'identité système interactive',
      code: 'neofetch',
      language: 'python'
    }
  ];

  // Client-side execution of Python script statements line-by-line
  const executePythonCore = (code: string): LogLine[] => {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const results: LogLine[] = [];

    // Temporary context for evaluating multiple lines in current run
    let localVars = { ...declaredVars };

    for (const line of lines) {
      if (line.startsWith('#')) {
        // Skip comment line
        continue;
      }

      // 1. Interactive Theme Controls
      if (line === 'theme.dark()') {
        if (!darkMode) toggleDarkMode();
        results.push({ type: 'success', text: '✓ Theme Sombre active avec succes via Python control API.' });
        continue;
      }
      if (line === 'theme.light()') {
        if (darkMode) toggleDarkMode();
        results.push({ type: 'success', text: '✓ Theme Clair active avec succes via Python control API.' });
        continue;
      }
      if (line === 'theme.cycle()') {
        cycleScheme();
        results.push({ type: 'success', text: '✓ Scheme horaire boucle avec succes.' });
        continue;
      }

      // 2. Set Theme Schemes
      const schemeMatch = line.match(/theme\.set_scheme\((['"])(.*?)\1\)/);
      if (schemeMatch) {
         const schemeId = schemeMatch[2];
         const index = schemes.findIndex(s => s.id === schemeId);
         if (index !== -1) {
           setSchemeIndex(index);
           results.push({ type: 'success', text: `✓ Style de couleur commute sur: "${schemes[index].name}" (${schemes[index].vibe}).` });
         } else {
           results.push({ type: 'error', text: `NameError: Scheme "${schemeId}" introuvable. Disponibles: ${schemes.map(s => s.id).join(', ')}` });
         }
         continue;
      }

      // 3. Matrix Command
      if (line === 'matrix()' || line === 'matrix') {
        results.push({ type: 'info', text: '⚡ Initialisation de la pluie numerique Matrix...' });
        results.push({ type: 'success', text: '🤖 Pluie Matrix activee ! Cliquez sur QUIT ou pressez ECHAP (ESC) pour la fermer.' });
        setMatrixActive(true);
        continue;
      }

      // 3b. Hack Mini-game command
      if (line === 'hack()' || line === 'hack' || line === 'decrypt()' || line === 'decrypt') {
        results.push({ type: 'info', text: '🔌 Connexion de décryptage sécurisée au terminal...' });
        results.push({ type: 'success', text: '🎮 Module de décryptage lancé avec succès !' });
        setTimeout(() => initHackGame(), 100);
        continue;
      }

      // 3c. Neofetch command
      if (line === 'neofetch()' || line === 'neofetch') {
        if (isHopsonMode) {
          results.push(
            { type: 'output', text: '         💖           mike_gouthon@queen_host' },
            { type: 'output', text: '        💓💓          ---------------------' },
            { type: 'output', text: '       💓💓💓         OS: LoveOS x86_64' },
            { type: 'output', text: '      💓💓💓💓        Hôte: Re\'s Heart PortIn' },
            { type: 'output', text: '       💓💓💓         Uptime: Connecté pour l\'Éternité (Live)' },
            { type: 'output', text: '        💓💓          Shell: romantic-overdrive (Mike Edition)' },
            { type: 'output', text: '         💖           Résolution: Complète (Surprise de Dels)' },
            { type: 'output', text: '                      Environnement: React ❤️ Vite' },
            { type: 'output', text: '                      Thème: Amour Complice (Rose Gold Glow)' },
            { type: 'output', text: '                      Terminal: Interactive Surprise Deck' },
            { type: 'output', text: '                      Processeur: Dels Heart Core SDK' },
            { type: 'output', text: '                      GPU: Ultimate Passion Engine' },
            { type: 'output', text: '                      Mémoire: 100% de Douceur et Cafés' },
            { type: 'output', text: '                     ' },
            { type: 'info', text: '                      [ REINE SUPRÊME DE Dels ]' },
            { type: 'output', text: '                      • Spécialité: Faire chavirer le cœur de Re' },
            { type: 'output', text: '                      • Super-Pouvoir: Beauté céleste et sourire radieux' }
          );
        } else {
          results.push(
            { type: 'output', text: '          /\\          dels@Dels_host' },
            { type: 'output', text: '         /  \\         ----------------------' },
            { type: 'output', text: '        /\\  /\\        OS: PortFolio Linux x86_64' },
            { type: 'output', text: '       /  \\/  \\       Hôte: Cloud Run Container Ingress' },
            { type: 'output', text: '      /   /\\   \\      Uptime: Connecté (Live)' },
            { type: 'output', text: '     /   /  \\   \\     Shell: custom-bash (TypeScript Core)' },
            { type: 'output', text: '    /___/____\\___\\    Résolution: 1920x1080 (Preview Iframe)' },
            { type: 'output', text: '                      Environnement: React 19.x & Vite' },
            { type: 'output', text: '                      Thème: Cosmic Slate (Aesthetic Dynamic)' },
            { type: 'output', text: '                      Terminal: Emulation HTML5 Interactive' },
            { type: 'output', text: '                      Processeur: Gemini AI Engine SDK' },
            { type: 'output', text: '                      GPU: Agent Backend Container' },
            { type: 'output', text: '                      Mémoire: 100% Passion / Caféine v2.4' },
            { type: 'output', text: '                     ' },
            { type: 'info', text: '                      [ SPECIALITES & COMPÉTENCES ]' },
            { type: 'output', text: '                      • Dev: React, TypeScript, Node.js, Tailwind' },
            { type: 'output', text: '                      • Data Science: Python, Scikit-learn, Pandas, ML' }
          );
        }
        continue;
      }

      // 4. Help or info outputs
      if (line === 'help()' || line === 'help') {
        results.push({ type: 'info', text: '=== INTERPRÉTEUR SHELL & PYTHON EMBARQUÉ ===' });
        results.push({ type: 'output', text: '  ask <question> -> Interroge le Mini-Agent Gemini IA (ex: ask qui est Dels ?)' });
        results.push({ type: 'output', text: '  theme.dark()   -> Active le mode sombre de la page' });
        results.push({ type: 'output', text: '  theme.light()  -> Active le mode clair de la page' });
        results.push({ type: 'output', text: '  theme.cycle()  -> Fait tourner les thèmes de couleur' });
        results.push({ type: 'output', text: '  theme.set_scheme("indigo") -> Change la couleur (indigo, amber, emerald, cyan, rose)' });
        results.push({ type: 'output', text: '  matrix()       -> Genere un mur binaire retro' });
        results.push({ type: 'output', text: '  hack()         -> Lance le mini-jeu de décryptage de pare-feu' });
        results.push({ type: 'output', text: '  neofetch       -> Carte d\'identité du système (OS details)' });
        results.push({ type: 'output', text: '  skills()       -> Imprime la liste des competences de Dels' });
        results.push({ type: 'output', text: '  projects()     -> Deploie le catalogue des projets' });
        results.push({ type: 'output', text: '  clear()        -> Vide les historiques' });
        results.push({ type: 'info', text: 'Gérez également les fichiers physiques virtuels : ls, cd, cat, touch, mkdir, rm !' });
        continue;
      }

      // 5. skills() or list helper
      if (line === 'skills()' || line === 'skills') {
        results.push({ type: 'info', text: '--- LISTE DES COMPETENCES ---' });
        Object.entries(skillsData).forEach(([cat, items]) => {
          if (items.length > 0) {
            results.push({ type: 'output', text: `[${cat.toUpperCase()}]: ${items.map(i => i.name).join(', ')}` });
          }
        });
        continue;
      }

      // 6. projects() catalog helper
      if (line === 'projects()' || line === 'projects') {
        results.push({ type: 'info', text: '--- CATALOGUE DES PROJETS ---' });
        projectsData.forEach((p, idx) => {
          results.push({ type: 'output', text: `  ${idx + 1}. ${p.title} (${p.techs.slice(0, 3).join(', ')})` });
        });
        continue;
      }

      // 7. Simple variable parse
      const assignmentMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignmentMatch) {
         const varName = assignmentMatch[1];
         let varValRaw = assignmentMatch[2].trim();
         
         try {
           let value: any = varValRaw;
           if (varValRaw.startsWith('[') && varValRaw.endsWith(']')) {
             const insideJson = varValRaw.replace(/'/g, '"');
             value = JSON.parse(insideJson);
           } else if (!isNaN(Number(varValRaw))) {
             value = Number(varValRaw);
           } else if ((varValRaw.startsWith('"') && varValRaw.endsWith('"')) || (varValRaw.startsWith("'") && varValRaw.endsWith("'"))) {
             value = varValRaw.slice(1, -1);
           } else if (localVars[varValRaw] !== undefined) {
             value = localVars[varValRaw];
           }
           
           localVars[varName] = value;
           setDeclaredVars(prev => ({ ...prev, [varName]: value }));
           results.push({ type: 'success', text: `>>> Stack variable sauvegardée : [${varName} = ${JSON.stringify(value)}]` });
         } catch (e) {
           results.push({ type: 'error', text: `SyntaxError: Impossible d'evaluer l'assignation '${varValRaw}'` });
         }
         continue;
      }

      // 8. print statements with f-string emulation
      const printMatch = line.match(/^print\((.*)\)$/);
      if (printMatch) {
        const inside = printMatch[1].trim();
        
        // Emulation f"" Python string parsing
        if (inside.startsWith('f"') && inside.endsWith('"')) {
          let outputStr = inside.slice(2, -1);
          // find variables inside brackets {variable}
          const bracketMatches = outputStr.match(/\{[a-zA-Z0-9_]+\}/g);
          if (bracketMatches) {
            bracketMatches.forEach(m => {
              const cleanedVarName = m.slice(1, -1);
              if (localVars[cleanedVarName] !== undefined) {
                outputStr = outputStr.replace(m, String(localVars[cleanedVarName]));
              }
            });
          }
          results.push({ type: 'output', text: outputStr });
        } else if ((inside.startsWith('"') && inside.endsWith('"')) || (inside.startsWith("'") && inside.endsWith("'"))) {
          results.push({ type: 'output', text: inside.slice(1, -1) });
        } else {
          try {
            let expression = inside;
            Object.keys(localVars).forEach(v => {
              const regex = new RegExp(`\\b${v}\\b`, 'g');
              const valStr = typeof localVars[v] === 'string' ? `"${localVars[v]}"` : JSON.stringify(localVars[v]);
              expression = expression.replace(regex, valStr);
            });
            
            // eslint-disable-next-line no-eval
            const computed = eval(expression);
            results.push({ type: 'output', text: String(computed) });
          } catch (e) {
            results.push({ type: 'error', text: `NameError: Impossible d'interpréter l'expression print "${inside}".` });
          }
        }
        continue;
      }

      // Fallback simple line evaluation
      try {
        if (!isNaN(Number(line)) || line.match(/^[0-9+\-*/().\s]+$/)) {
          // eslint-disable-next-line no-eval
          const result = eval(line);
          results.push({ type: 'output', text: String(result) });
        } else {
          results.push({ type: 'error', text: `CommandUnknown : "${line}" n'est pas reconnu. Tapez "help()" pour l'aide.` });
        }
      } catch (err) {
        results.push({ type: 'error', text: `SyntaxError: Instruction "${line}" invalide.` });
      }
    }

    return results;
  };

  // VFS Shell command routing
  const executeShellCommand = (cmd: string, args: string[]): LogLine[] => {
    const results: LogLine[] = [];
    const currentDir = getDirFromPath(fileSystem, currentPath);
    
    if (!currentDir) {
      return [{ type: 'error', text: `Erreur fatale : répertoire '${currentPath.join('/')}' inaccessible.` }];
    }

    switch (cmd) {
      case 'pwd': {
        const pathStr = currentPath.length === 0 ? '/' : '/' + currentPath.join('/');
        results.push({ type: 'output', text: pathStr });
        break;
      }
      
      case 'ls': {
        const entries = Object.keys(currentDir);
        if (entries.length === 0) {
          results.push({ type: 'info', text: '(répertoire vide)' });
        } else {
          const formatted = entries.map(name => {
            const node = currentDir[name];
            if (node.type === 'dir') {
              return `📁 ${name}/`;
            } else {
              if (name.endsWith('.py')) return `🐍 ${name}`;
              if (name.endsWith('.md')) return `📝 ${name}`;
              return `📄 ${name}`;
            }
          }).join('   ');
          results.push({ type: 'output', text: formatted });
        }
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '~') {
          setCurrentPath([]);
          results.push({ type: 'info', text: 'Retour au répertoire racine (/).' });
        } else if (target === '..') {
          if (currentPath.length > 0) {
            setCurrentPath(prev => prev.slice(0, -1));
          }
        } else if (target === '/') {
          setCurrentPath([]);
        } else {
          const parts = target.split('/').filter(p => p.length > 0 && p !== '.');
          let tempPath = target.startsWith('/') ? [] : [...currentPath];
          
          let valid = true;
          for (const item of parts) {
            if (item === '..') {
              if (tempPath.length > 0) tempPath.pop();
            } else {
              const dirNode = getDirFromPath(fileSystem, tempPath);
              if (dirNode && dirNode[item] && dirNode[item].type === 'dir') {
                tempPath.push(item);
              } else {
                valid = false;
                break;
              }
            }
          }
          
          if (valid) {
            setCurrentPath(tempPath);
          } else {
            results.push({ type: 'error', text: `cd: "${target}" n'est pas un répertoire valide ou est inexistant.` });
          }
        }
        break;
      }

      case 'cat': {
        const fileName = args[0];
        if (!fileName) {
          results.push({ type: 'error', text: 'Usage : cat <nom_fichier>' });
        } else if (currentDir[fileName]) {
          const node = currentDir[fileName];
          if (node.type === 'dir') {
            results.push({ type: 'error', text: `cat: "${fileName}" est un dossier (use cd).` });
          } else {
            results.push({ type: 'output', text: node.content || '(fichier vierge)' });
          }
        } else {
          results.push({ type: 'error', text: `cat: "${fileName}" n'existe pas dans ce répertoire.` });
        }
        break;
      }

      case 'touch': {
        const fileName = args[0];
        if (!fileName) {
          results.push({ type: 'error', text: 'Usage : touch <nom_fichier>' });
        } else if (currentDir[fileName]) {
          results.push({ type: 'info', text: `Fichier existant "${fileName}" ouvert et rafraîchi.` });
        } else {
          const updated = updateFileSystemNode(fileSystem, currentPath, (children) => {
            return {
              ...children,
              [fileName]: {
                name: fileName,
                type: 'file',
                content: `# Fichier créé le ${new Date().toLocaleDateString()}\nprint("Fichier virtuelfs actif !")`
              }
            };
          });
          setFileSystem(updated);
          results.push({ type: 'success', text: `✓ Fichier "${fileName}" correctement initialisé !` });
        }
        break;
      }

      case 'mkdir': {
        const dirName = args[0];
        if (!dirName) {
          results.push({ type: 'error', text: 'Usage : mkdir <nom_dossier>' });
        } else if (currentDir[dirName]) {
          results.push({ type: 'error', text: `mkdir: Le répertoire "${dirName}" est indisponible.` });
        } else {
          const updated = updateFileSystemNode(fileSystem, currentPath, (children) => {
            return {
              ...children,
              [dirName]: {
                name: dirName,
                type: 'dir',
                children: {}
              }
            };
          });
          setFileSystem(updated);
          results.push({ type: 'success', text: `✓ Répertoire "${dirName}" créé avec succès.` });
        }
        break;
      }

      case 'rm': {
        let nodeTarget = args[0];
        let recursive = false;
        
        if (nodeTarget === '-rf' || nodeTarget === '-r') {
          nodeTarget = args[1];
          recursive = true;
        }

        if (!nodeTarget) {
          results.push({ type: 'error', text: 'Usage : rm <nom> ou rm -rf <nom_dossier>' });
        } else if (!currentDir[nodeTarget]) {
          results.push({ type: 'error', text: `rm: Impossible d'éliminer "${nodeTarget}" : inexistant.` });
        } else {
          const item = currentDir[nodeTarget];
          if (item.type === 'dir' && !recursive) {
            results.push({ type: 'error', text: `rm: "${nodeTarget}" est un dossier. Utilisez: rm -rf ${nodeTarget}` });
          } else {
            const updated = updateFileSystemNode(fileSystem, currentPath, (children) => {
              const copy = { ...children };
              delete copy[nodeTarget];
              return copy;
            });
            setFileSystem(updated);
            results.push({ type: 'success', text: `✓ Suppression terminée de "${nodeTarget}".` });
          }
        }
        break;
      }

      case 'python': {
        const scriptFile = args[0];
        if (!scriptFile) {
          results.push({ type: 'error', text: 'Usage : python <fichier_script.py>' });
        } else if (currentDir[scriptFile]) {
          const item = currentDir[scriptFile];
          if (item.type === 'dir') {
            results.push({ type: 'error', text: `python: "${scriptFile}" n'est pas un script exécutable valablement.` });
          } else {
            results.push({ type: 'info', text: `🐍 Envoi du script "${scriptFile}" au compilateur local...` });
            const logs = executePythonCore(item.content || '');
            results.push(...logs);
          }
        } else {
          results.push({ type: 'error', text: `python: Script "${scriptFile}" introuvable.` });
        }
        break;
      }

      case 'neofetch': {
        if (isHopsonMode) {
          results.push(
            { type: 'output', text: '         💖           mike_gouthon@queen_host' },
            { type: 'output', text: '        💓💓          ---------------------' },
            { type: 'output', text: '       💓💓💓         OS: LoveOS x86_64' },
            { type: 'output', text: '      💓💓💓💓        Hôte: Re\'s Heart PortIn' },
            { type: 'output', text: '       💓💓💓         Uptime: Connecté pour l\'Éternité (Live)' },
            { type: 'output', text: '        💓💓          Shell: romantic-overdrive (Mike Edition)' },
            { type: 'output', text: '         💖           Résolution: Complète (Surprise de Dels)' },
            { type: 'output', text: '                      Environnement: React ❤️ Vite' },
            { type: 'output', text: '                      Thème: Amour Complice (Rose Gold Glow)' },
            { type: 'output', text: '                      Terminal: Interactive Surprise Deck' },
            { type: 'output', text: '                      Processeur: Dels Heart Core SDK' },
            { type: 'output', text: '                      GPU: Ultimate Passion Engine' },
            { type: 'output', text: '                      Mémoire: 100% de Douceur et Cafés' },
            { type: 'output', text: '                     ' },
            { type: 'info', text: '                      [ REINE SUPRÊME DE Dels ]' },
            { type: 'output', text: '                      • Spécialité: Faire chavirer le cœur de Re' },
            { type: 'output', text: '                      • Super-Pouvoir: Beauté céleste et sourire radieux' }
          );
        } else {
          results.push(
            { type: 'output', text: '          /\\          dels@Dels_host' },
            { type: 'output', text: '         /  \\         ----------------------' },
            { type: 'output', text: '        /\\  /\\        OS: PortFolio Linux x86_64' },
            { type: 'output', text: '       /  \\/  \\       Hôte: Cloud Run Container Ingress' },
            { type: 'output', text: '      /   /\\   \\      Uptime: Connecté (Live)' },
            { type: 'output', text: '     /   /  \\   \\     Shell: custom-bash (TypeScript Core)' },
            { type: 'output', text: '    /___/____\\___\\    Résolution: 1920x1080 (Preview Iframe)' },
            { type: 'output', text: '                      Environnement: React 19.x & Vite' },
            { type: 'output', text: '                      Thème: Cosmic Slate (Aesthetic Dynamic)' },
            { type: 'output', text: '                      Terminal: Emulation HTML5 Interactive' },
            { type: 'output', text: '                      Processeur: Gemini AI Engine SDK' },
            { type: 'output', text: '                      GPU: Agent Backend Container' },
            { type: 'output', text: '                      Mémoire: 100% Passion / Caféine v2.4' },
            { type: 'output', text: '                     ' },
            { type: 'info', text: '                      [ SPECIALITES & COMPÉTENCES ]' },
            { type: 'output', text: '                      • Dev: React, TypeScript, Node.js, Tailwind' },
            { type: 'output', text: '                      • Data Science: Python, Scikit-learn, Pandas, ML' }
          );
        }
        break;
      }

      default:
        results.push({ type: 'error', text: `Shell command routing error: command "${cmd}" not found.` });
    }

    return results;
  };

  const executeCommand = async (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // Build the dynamic terminal input decorator path
    const pathPrefix = currentPath.length === 0 ? '~' : `~/${currentPath.join('/')}`;
    const currentUsername = isHopsonMode ? 'mike_gouthon' : 'dels_hopson';
    const currentHostname = isHopsonMode ? 'queen_host' : 'Dels_host';
    const newLines: LogLine[] = [
      { type: 'input', text: `${currentUsername}@${currentHostname}:${pathPrefix}$ ${trimmed}` }
    ];

    const lowerTrimmed = trimmed.toLowerCase();

    // if (lowerTrimmed === 'sudo -u hopson') {
    //   setIsHopsonMode(true);
    //   newLines.push(
    //     { type: 'success', text: '🔐 [SUDO AUTHENTICATION SUCCESSFUL]' },
    //     { type: 'success', text: '💖 Initialisation du protocole de suractivation romantique...' },
    //     { type: 'success', text: '👑 Session utilisateur basculée sur : hopson (Mike Gouthon - Re\'s Queen)' },
    //     { type: 'info', text: '🌹 Tout l\'affichage a été configuré avec amour pour surprendre notre Reine !' },
    //     { type: 'info', text: 'Saisissez "exit" ou "logout" pour revenir au profil par défaut (Dels).' }
    //   );
    //   newLines.push({ type: 'output', text: '>>>' });
    //   setHistory(prev => [...prev, ...newLines]);
    //   setInputVal('');
    //   return;
    // }

    if (lowerTrimmed === 'exit' || lowerTrimmed === 'logout' || lowerTrimmed === 'sudo -u Dels' || lowerTrimmed === 'sudo -u default') {
      if (isHopsonMode) {
        setIsHopsonMode(false);
        newLines.push(
          { type: 'info', text: '🔓 [SÉCURITÉ] Fermeture de la session de la Reine.' },
          { type: 'info', text: 'Désactivation du protocole romantique...' },
          { type: 'info', text: 'Profil restauré avec succès : Dels' }
        );
      } else {
        newLines.push({ type: 'info', text: 'Bye! (Ce shell virtuel est un simulateur interactif web, vous restez connectés !)' });
      }
      newLines.push({ type: 'output', text: '>>>' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      return;
    }

    if (trimmed === 'clear' || trimmed === 'clear()') {
      setHistory([
        { type: 'info', text: '=== INTERACTIVE CONSOLE CLEARED ===' },
        { type: 'output', text: '>>>' }
      ]);
      setInputVal('');
      return;
    }

    // Command parser
    const parts = trimmed.split(/\s+/);
    const commandName = parts[0].toLowerCase();

    // INTERCEPT INPUT FOR HACKING MINIGAME SYSTEM
    if (hackGame.active && hackGame.status === 'playing') {
      const cleanInput = trimmed.toUpperCase();
      
      if (cleanInput === 'EXIT' || cleanInput === 'QUIT' || trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        setHackGame(prev => ({ ...prev, active: false, status: 'idle' }));
        newLines.push({ type: 'info', text: '⚠️ Session de décryptage interrompue par l\'utilisateur.' });
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }

      if (hackGame.words.includes(cleanInput)) {
        const likeness = getLikeness(cleanInput, hackGame.targetWord);
        const correct = cleanInput === hackGame.targetWord;
        const updatedGuesses = [...hackGame.guesses, { word: cleanInput, likeness }];
        
        if (correct) {
          setHackGame(prev => ({
            ...prev,
            guesses: updatedGuesses,
            status: 'won',
          }));
          setDeclaredVars(prev => ({
            ...prev,
            system_decrypted: true,
            hacker_rank: 'PRO-DECRYPTER'
          }));
          setVibeTriggered(true);
          setTimeout(() => setVibeTriggered(false), 800);
          
          newLines.push({ type: 'success', text: `🎉 ACCÈS ACCORDÉ ! Mot de passe "${cleanInput}" décodé avec succès.` });
          newLines.push({ type: 'success', text: `🔓 Le pare-feu système est désormais Contourné. Statut rattaché au Stack global.` });
        } else {
          const nextAttempts = hackGame.attempts - 1;
          const lost = nextAttempts <= 0;
          
          setHackGame(prev => ({
            ...prev,
            guesses: updatedGuesses,
            attempts: nextAttempts,
            status: lost ? 'lost' : 'playing'
          }));

          if (lost) {
            newLines.push({ type: 'error', text: `❌ MOT DE PASSE ERRONÉ : "${cleanInput}"` });
            newLines.push({ type: 'error', text: `💥 ALERTE : Cooldown activé. Pare-feu verrouillé définitivement !` });
            newLines.push({ type: 'error', text: `Le mot correct était : "${hackGame.targetWord}"` });
          } else {
            newLines.push({ type: 'error', text: `❌ ACCÈS REFUSÉ : Similitude = ${likeness}/6` });
            const pips = '■ '.repeat(nextAttempts) + '□ '.repeat(4 - nextAttempts);
            newLines.push({ type: 'info', text: `🔑 Clés tentatives restantes : ${nextAttempts}  ${pips}` });
          }
        }
        
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }
    }

    if (commandName === 'hack' || commandName === 'decrypt' || commandName === 'hack()') {
      newLines.push({ type: 'info', text: '🔌 Connexion de décryptage sécurisée au terminal...' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      initHackGame();
      return;
    }

    if (commandName === 'ask') {
      const question = trimmed.substring(3).trim();
      if (!question) {
        newLines.push({ type: 'error', text: "Usage : ask <votre question ou prompt ici>" });
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setCommandHistory(prev => [...prev, trimmed]);
        setInputVal('');
        return;
      }

      // Output command line and the initial loader line
      newLines.push({ type: 'info', text: '🤖 Mini-Agent Gemini réfléchit...' });
      setHistory(prev => [...prev, ...newLines]);
      setCommandHistory(prev => [...prev, trimmed]);
      setHistoryIndex(-1);
      setInputVal('');
      setIsAskingGemini(true);

      try {
        const currentDir = getDirFromPath(fileSystem, currentPath) || {};
        const currentDirFiles = Object.keys(currentDir);

        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question,
            currentDirFiles
          })
        });

        const data = await response.json();
        if (response.ok && data.response) {
          setHistory(prev => [
            ...prev,
            { type: 'output', text: `🤖 GEMINI AGENT :\n${data.response}` },
            { type: 'output', text: '>>>' }
          ]);
        } else {
          setHistory(prev => [
            ...prev,
            { type: 'error', text: `Erreur Agent : ${data.error || 'Impossible de générer une réponse.'}` },
            { type: 'output', text: '>>>' }
          ]);
        }
      } catch (err: any) {
        setHistory(prev => [
          ...prev,
          { type: 'error', text: `Erreur Réseau : Impossible de contacter la clé d'API. (${err?.message || err})` },
          { type: 'output', text: '>>>' }
        ]);
      } finally {
        setIsAskingGemini(false);
      }
      return;
    }

    if (['ls', 'cd', 'pwd', 'cat', 'touch', 'mkdir', 'rm', 'python', 'python3', 'neofetch'].includes(commandName)) {
      const normalizedCmd = (commandName === 'python3') ? 'python' : commandName;
      const shellOutput = executeShellCommand(normalizedCmd, parts.slice(1));
      newLines.push(...shellOutput);
    } else {
      // Evaluate line as default python code
      const runResult = executePythonCore(trimmed);
      newLines.push(...runResult);
    }

    newLines.push({ type: 'output', text: '>>>' });

    setHistory(prev => [...prev, ...newLines]);
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInputVal(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      if (historyIndex === commandHistory.length - 1) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputVal(commandHistory[newIndex]);
      }
    }
  };

  const runPreset = (preset: CodePreset) => {
    executeCommand(preset.code);
    setVibeTriggered(true);
    setTimeout(() => setVibeTriggered(false), 800);
  };

  const clearLogs = () => {
    setHistory([
      { type: 'info', text: '=== INTERACTIVE CONSOLE CLEARED ===' },
      { type: 'output', text: '>>>' }
    ]);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // GUI Quick Creation Wrapper: Click touch
  const handleGUICreateFile = () => {
    if (!newFileName) return;
    const cleanName = newFileName.trim();
    const updated = updateFileSystemNode(fileSystem, currentPath, (children) => {
      return {
        ...children,
        [cleanName]: {
          name: cleanName,
          type: 'file',
          content: `# Fichier ${cleanName} créé via GUI\nprint("Fichier activé !")`
        }
      };
    });
    setFileSystem(updated);
    setNewFileName('');
    setIsCreatingFile(false);
    
    // Auto-feed terminal action feedback
    setHistory(prev => [
      ...prev,
      { type: 'input', text: `gui_action: touch ${cleanName}` },
      { type: 'success', text: `✓ Fichier "${cleanName}" créé à la racine actuelle depuis l'explorateur.` },
      { type: 'output', text: '>>>' }
    ]);
  };

  const handleGUICreateDir = () => {
    if (!newDirName) return;
    const cleanName = newDirName.trim();
    const updated = updateFileSystemNode(fileSystem, currentPath, (children) => {
      return {
        ...children,
        [cleanName]: {
          name: cleanName,
          type: 'dir',
          children: {}
        }
      };
    });
    setFileSystem(updated);
    setNewDirName('');
    setIsCreatingDir(false);

    setHistory(prev => [
      ...prev,
      { type: 'input', text: `gui_action: mkdir ${cleanName}` },
      { type: 'success', text: `✓ Dossier "${cleanName}" créé à la racine actuelle.` },
      { type: 'output', text: '>>>' }
    ]);
  };

  // UI Interactive file save updates
  const handleSaveEditedFile = (newContent: string) => {
    if (!selectedFile) return;
    const updated = updateFileSystemNode(fileSystem, selectedFile.path, (children) => {
      if (children[selectedFile.name]) {
        children[selectedFile.name] = {
          ...children[selectedFile.name],
          content: newContent
        };
      }
      return children;
    });
    setFileSystem(updated);
    setSelectedFile(prev => prev ? { ...prev, content: newContent } : null);

    // Logging save feedback into the shell console stream
    setHistory(prev => [
      ...prev,
      { type: 'input', text: `gui_action: edit /${[...selectedFile.path, selectedFile.name].join('/')}` },
      { type: 'success', text: `✓ Fichier "${selectedFile.name}" mis à jour et sauvegardé dans le VFS.` },
      { type: 'output', text: '>>>' }
    ]);
  };

  // GUI Execution bindings
  const handleGUIFileExecution = () => {
    if (!selectedFile) return;
    const fullName = [...selectedFile.path, selectedFile.name].join('/');
    
    // Command simulated
    let cmdToRun = `cat ${selectedFile.name}`;
    if (selectedFile.name.endsWith('.py')) {
      cmdToRun = `python ${selectedFile.name}`;
    }
    
    // Change path directly if needed to run accurately
    setCurrentPath(selectedFile.path);
    executeCommand(cmdToRun);
  };

  // Directory Tree recursion renderer
  const renderTree = (nodes: Record<string, VNode>, currentLevelPath: string[]) => {
    return Object.keys(nodes).map((key) => {
      const node = nodes[key];
      const nodePath = [...currentLevelPath, key];
      const isDir = node.type === 'dir';
      const isSelectedDir = currentPath.join('/') === nodePath.join('/');
      
      return (
        <div key={key} className="pl-3 border-l border-slate-150 dark:border-slate-800/80 my-1">
          <div 
            onClick={() => {
              if (isDir) {
                setCurrentPath(nodePath);
              } else {
                setSelectedFile({
                  path: currentLevelPath,
                  name: key,
                  content: node.content || ''
                });
              }
            }}
            className={`group flex items-center justify-between py-1 px-2 rounded-lg text-xs cursor-pointer select-none transition-all ${
              isSelectedDir
                ? 'bg-accent/15 border border-accent/20 text-accent font-bold'
                : 'text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900/30'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {isDir ? (
                <Folder size={12} className="text-amber-500 shrink-0" />
              ) : (
                <FileText size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
              )}
              <span className="truncate">{key}</span>
            </div>

            <span className="text-[9px] font-mono text-slate-400 group-hover:inline hidden">
              {isDir ? 'cd' : 'edit'}
            </span>
          </div>
          
          {isDir && node.children && Object.keys(node.children).length > 0 && (
            <div className="mt-0.5">
              {renderTree(node.children, nodePath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <section id="terminal" className="py-20 relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Head Description */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-light text-accent text-xs font-bold border border-accent/20 mb-4"
          >
            <Cpu size={14} className="animate-spin" />
            <span>SHELL SANDBOX COMPLETE</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Système de Fichiers <span className="bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">Interactif (VFS)</span>
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explorez un véritable environnement Linux simulé. Utilisez la console pour naviguer (`cd`, `ls`), éditer ou exécuter des scripts Python, ou manipuler l'arbre de dossiers via l'explorateur visuel.
          </p>
        </div>

        {/* Console / Explorer Row Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Explorer Panel Sidebar with 4 tabs */}
          <div className="lg:col-span-4 space-y-4">

            {/* Sidebar tabbed selector layout */}
            <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 select-none gap-0.5">
              <button
                onClick={() => setActiveSidebarTab('vfs')}
                className={`py-1.5 text-center rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer truncate ${
                  activeSidebarTab === 'vfs'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Virtual File System"
              >
                📂 VFS
              </button>

              <button
                onClick={() => setActiveSidebarTab('presets')}
                className={`py-1.5 text-center rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer truncate ${
                  activeSidebarTab === 'presets'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Scripts Presets"
              >
                🧩 Presets
              </button>

              <button
                onClick={() => setActiveSidebarTab('variables')}
                className={`py-1.5 text-center rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer truncate ${
                  activeSidebarTab === 'variables'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Variables local context"
              >
                📦 Stack
              </button>

              <button
                onClick={() => {
                  setActiveSidebarTab('hack');
                  if (!hackGame.active) {
                    initHackGame();
                  }
                }}
                className={`py-1.5 text-center rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer truncate ${
                  activeSidebarTab === 'hack'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Mini-Jeu Décryptage / Hack"
              >
                🎮 Hack
              </button>
            </div>

            {/* Content box based on active tab selection */}
            <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/80 min-h-[360px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                
                {/* 1. VFS TAB: File System Tree, controls and Mini Editor */}
                {activeSidebarTab === 'vfs' && (
                  <motion.div
                    key="vfs-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-4 flex-grow h-full justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500">
                          ROOT: /{[...currentPath].join('/')}
                        </span>
                        
                        {/* Upper helper button */}
                        {currentPath.length > 0 && (
                          <button
                            onClick={() => setCurrentPath(prev => prev.slice(0, -1))}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-mono py-0.5 px-2 rounded hover:bg-accent hover:text-white transition-all cursor-pointer"
                          >
                            parent directory ..
                          </button>
                        )}
                      </div>

                      {/* Folder visual list */}
                      <div className="my-3 max-h-[160px] overflow-y-auto custom-scrollbar font-mono">
                        {renderTree(fileSystem, [])}
                      </div>

                      {/* Quick File updates or creators forms */}
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">AJOUTER ÉLÉMENTS :</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setIsCreatingFile(!isCreatingFile); setIsCreatingDir(false); }}
                              className={`text-[9px] font-mono py-0.5 px-1.5 rounded transition-all cursor-pointer ${isCreatingFile ? 'bg-accent text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                            >
                              + Fichier
                            </button>
                            <button 
                              onClick={() => { setIsCreatingDir(!isCreatingDir); setIsCreatingFile(false); }}
                              className={`text-[9px] font-mono py-0.5 px-1.5 rounded transition-all cursor-pointer ${isCreatingDir ? 'bg-accent text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                            >
                              + Dossier
                            </button>
                          </div>
                        </div>

                        {/* File Generator input form */}
                        {isCreatingFile && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 items-center bg-slate-100/60 dark:bg-slate-950/40 p-1.5 rounded border border-slate-200/30">
                            <input
                              type="text"
                              placeholder="ex: test.py, hello.txt"
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              className="bg-transparent border-none text-[11px] font-mono outline-none text-white flex-1"
                            />
                            <button onClick={handleGUICreateFile} className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600 cursor-pointer">
                              <Check size={11} />
                            </button>
                          </motion.div>
                        )}

                        {/* Directory Generator input form */}
                        {isCreatingDir && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 items-center bg-slate-100/60 dark:bg-slate-950/40 p-1.5 rounded border border-slate-200/30">
                            <input
                              type="text"
                              placeholder="ex: scripts, tests"
                              value={newDirName}
                              onChange={(e) => setNewDirName(e.target.value)}
                              className="bg-transparent border-none text-[11px] font-mono outline-none text-white flex-1"
                            />
                            <button onClick={handleGUICreateDir} className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600 cursor-pointer">
                              <Check size={11} />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Integrated file content dynamic edit box */}
                    {selectedFile ? (
                      <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-dashed border-slate-200/40 dark:border-slate-850">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 truncate max-w-[160px]">
                            Éditeur: {selectedFile.name}
                          </span>
                          <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                            <X size={11} />
                          </button>
                        </div>
                        
                        <textarea
                          value={selectedFile.content}
                          onChange={(e) => setSelectedFile({ ...selectedFile, content: e.target.value })}
                          className="w-full h-[110px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-[10px] font-mono text-slate-800 dark:text-slate-200 outline-none resize-none focus:border-accent"
                        />

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEditedFile(selectedFile.content)}
                            className="flex-1 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-mono font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Save size={10} />
                            Enregistrer
                          </button>
                          
                          <button
                            onClick={handleGUIFileExecution}
                            className="py-1.5 px-3 bg-accent hover:bg-accent-dark text-white text-[10px] font-mono font-bold rounded flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Play size={10} fill="currentColor" />
                            Lancer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200/30 dark:border-slate-800/50 rounded-xl my-2">
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Sélectionnez un fichier ci-dessus pour l'éditer en direct et l'injecter !
                        </span>
                      </div>
                    )}

                  </motion.div>
                )}

                {/* 2. PRESETS TAB: Predefined run scripts links */}
                {activeSidebarTab === 'presets' && (
                  <motion.div
                    key="presets-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <span className="text-xs font-bold font-mono text-slate-400 block border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2">
                      COMMANDES PRÊTES À LANCER
                    </span>
                    
                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                      {presets.map((preset, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-205 border-slate-200/40 dark:border-slate-850 flex items-center justify-between gap-1 hover:border-accent/35 transition-all"
                        >
                          <div className="flex-1 truncate pr-2">
                            <span className="block font-bold text-xs text-slate-800 dark:text-white truncate">
                              {preset.name}
                            </span>
                            <span className="block text-[9px] text-slate-500 truncate">
                              {preset.description}
                            </span>
                            <code className="text-[9px] font-mono text-accent block mt-1">
                              $ {preset.code}
                            </code>
                          </div>

                          <button
                            onClick={() => runPreset(preset)}
                            className="p-1 px-2.5 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer select-none shrink-0"
                            title="Lancer la commande"
                          >
                            RUN
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 3. VARIABLES TAB: Live diagnostics Python objects stack */}
                {activeSidebarTab === 'variables' && (
                  <motion.div
                    key="variables-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2.5"
                  >
                    <span className="text-xs font-bold font-mono text-slate-400 block border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2">
                      VARIABLES ET OBJETS (MEMOIRE GLOBALE)
                    </span>

                    <div className="font-mono text-xs space-y-2 overflow-y-auto max-h-[280px] pr-1">
                      {Object.entries(declaredVars).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-850/60 py-1 font-mono">
                          <span className="text-accent font-bold">&gt;&gt; {key}</span>
                          <span className="text-slate-600 dark:text-slate-350">{String(JSON.stringify(val))}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. HACK GAME TAB: Interactive decrypt game dashboard */}
                {activeSidebarTab === 'hack' && (
                  <motion.div
                    key="hack-game-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3 flex-grow justify-between h-full"
                  >
                    <div className="flex-grow">
                      <span className="text-xs font-bold font-mono text-slate-400 block border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2">
                        DÉCRYPTAGE DE PARE-FEU (BYPASS)
                      </span>

                      {!hackGame.active ? (
                        <div className="text-center py-6 space-y-4">
                          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto animate-pulse">
                            <Cpu size={22} className="text-accent" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase font-mono">Pare-feu sécurisé</h4>
                            <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                              Trouverez-vous le mot de passe maître pour désactiver l'isolation réseau ?
                            </p>
                          </div>
                          <button
                            onClick={initHackGame}
                            className="w-full py-2 bg-accent hover:bg-accent-dark text-white text-xs font-bold font-mono rounded-xl cursor-pointer shadow-lg shadow-accent/10 transition-all select-none"
                          >
                            LANCER LE DECRYPTAGE
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/30">
                            <div>
                              <span className="block text-[8px] font-mono text-slate-400">STATUT PARE-FEU</span>
                              <span className={`text-[10px] font-bold font-mono ${
                                hackGame.status === 'won' ? 'text-emerald-400' :
                                hackGame.status === 'lost' ? 'text-rose-500' : 'text-amber-400 animate-pulse'
                              }`}>
                                {hackGame.status === 'won' ? '✓ DÉPASSÉ (OPEN)' :
                                 hackGame.status === 'lost' ? '🔐 BLOQUÉ (COOLDOWN)' : '⚠️ ACQUISITION...'}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="block text-[8px] font-mono text-slate-400">ESSAIS RESTANTS</span>
                              <div className="flex gap-1 mt-0.5 justify-end">
                                {Array.from({ length: hackGame.maxAttempts }).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-2.5 h-2.5 rounded-sm border ${
                                      idx < hackGame.attempts
                                        ? 'bg-accent border-accent/40 shadow-sm shadow-accent/25'
                                        : 'bg-slate-300 dark:bg-slate-800 border-none'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {hackGame.status === 'playing' ? (
                            <>
                              <span className="text-[10px] font-bold font-mono text-slate-400 block pb-1">
                                SÉLECTIONNEZ UN MOT DE PASSE :
                              </span>
                              <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                                {hackGame.words.map((w) => {
                                  const guessed = hackGame.guesses.find(g => g.word === w);
                                  return (
                                    <button
                                      key={w}
                                      onClick={() => executeCommand(w)}
                                      disabled={!!guessed}
                                      className={`py-1.5 px-2 font-mono text-[11px] font-semibold rounded-lg border cursor-pointer select-none transition-all duration-200 text-left truncate flex items-center justify-between ${
                                        guessed
                                          ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border-slate-250 dark:border-slate-900 cursor-not-allowed'
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350 hover:border-accent hover:text-accent font-bold hover:shadow-sm'
                                      }`}
                                    >
                                      <span>{w}</span>
                                      {guessed && (
                                        <span className="text-[8px] bg-slate-200 dark:bg-slate-800/80 px-1 py-0.5 rounded font-bold">
                                          L={guessed.likeness}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className="block text-[9px] text-slate-450 dark:text-slate-500 italic text-center leading-relaxed">
                                Cliquer sur un mot l'ordonne comme tentative de piratage.
                              </span>
                            </>
                          ) : hackGame.status === 'won' ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-555 dark:text-emerald-400 p-3 rounded-xl text-center space-y-1.5 animate-fade-in my-2">
                              <span className="block text-xs font-bold font-mono">🤖 ACCÈS ACCORDÉ</span>
                              <p className="text-[10px] leading-relaxed">
                                Le mot de passe correct était <strong className="underline decoration-double">{hackGame.targetWord}</strong>. Vous avez infiltré le cœur système !
                              </p>
                              <button
                                onClick={initHackGame}
                                className="mt-1 py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer"
                              >
                                Rejouer
                              </button>
                            </div>
                          ) : (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl text-center space-y-1.5 animate-fade-in my-2">
                              <span className="block text-xs font-bold font-mono">💥 PARE-FEU BLOQUÉ</span>
                              <p className="text-[10px] leading-relaxed">
                                Le système a tracé votre signature. Le code correct était <strong className="font-mono">{hackGame.targetWord}</strong>.
                              </p>
                              <button
                                onClick={initHackGame}
                                className="mt-1 py-1 px-3 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer"
                              >
                                Réessayer
                              </button>
                            </div>
                          )}

                          {hackGame.guesses.length > 0 && hackGame.status === 'playing' && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                              <span className="text-[9px] font-mono font-bold text-slate-400 block mb-1">JOURNAL DE SIMILITUDE :</span>
                              <div className="space-y-1 font-mono text-[10px] max-h-[60px] overflow-y-auto custom-scrollbar">
                                {hackGame.guesses.map((g, idx) => (
                                  <div key={idx} className="flex justify-between text-slate-500 dark:text-slate-400">
                                    <span>&gt;&gt; {g.word}</span>
                                    <span className="text-rose-400 font-bold font-mono">Similitude = {g.likeness}/6</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {hackGame.active && (
                      <button
                        onClick={() => {
                          setHackGame(prev => ({ ...prev, active: false, status: 'idle' }));
                          setHistory(prev => [
                            ...prev,
                            { type: 'info', text: '⚠️ Session de décryptage fermée.' },
                            { type: 'output', text: '>>>' }
                          ]);
                        }}
                        className="py-1 px-2.5 border border-dashed border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-[10px] font-mono rounded-lg transition-all text-center mx-auto block cursor-pointer mt-2"
                      >
                        Abandonner [exit]
                      </button>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>

            </div>

          </div>

          {/* Interactive Shell / Main CLI Terminal (Col span 8) */}
          <div className="lg:col-span-8">
            <div 
              className="w-full bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md rounded-3xl border border-slate-800 dark:border-slate-800/80 overflow-hidden shadow-2xl flex flex-col h-[520px]"
              onClick={focusInput}
            >
              
              {/* Terminal Frame Top-bar */}
              <div className="bg-slate-950/90 border-b border-slate-900 px-4 py-3.5 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 opacity-85" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-450 dark:text-slate-400 ml-3 flex items-center gap-1.5">
                    <Terminal size={12} className="text-accent animate-pulse" />
                    bash - {isHopsonMode ? 'mike_gouthon@queen_host' : 'dels@dels_host'}: {currentPath.length === 0 ? '/' : '/' + currentPath.join('/')}
                  </span>
                </div>
                
                {/* Actions indicators */}
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${vibeTriggered ? 'bg-accent scale-125 animate-ping' : 'bg-green-500/60'} transition-all`} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); clearLogs(); }}
                    className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded hover:bg-slate-900 cursor-pointer"
                    title="Vider la console"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Logs Stream Container */}
              <div className="flex-grow p-6 overflow-y-auto font-mono text-[13px] leading-relaxed select-text text-slate-300 dark:text-slate-250 opacity-95 flex flex-col gap-2 relative scroll-smooth">
                
                {matrixActive && (
                  <div className="absolute inset-0 z-30 bg-black/95 flex flex-col justify-between p-4 overflow-hidden select-none">
                    <canvas ref={matrixCanvasRef} className="absolute inset-0 w-full h-full block" />
                    <div className="absolute top-4 right-4 z-40 flex items-center gap-3 bg-black/75 px-3 py-1.5 rounded-lg border border-emerald-500/30 backdrop-blur-md">
                      <span className="text-[11px] font-mono text-emerald-400 font-bold animate-pulse flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        DECRYPT_MODE: ACTIVE
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setMatrixActive(false); }}
                        className="p-1 px-2.5 bg-rose-500/20 hover:bg-rose-500/45 text-rose-300 hover:text-white text-[11px] font-mono rounded cursor-pointer border border-rose-500/35 transition-all select-none font-bold"
                      >
                        QUIT [ESC]
                      </button>
                    </div>
                  </div>
                )}

                {history.map((line, idx) => {
                  if (line.text === '>>>') {
                    // Blank connector
                    return null;
                  }
                  
                  let txtClass = 'text-slate-350 dark:text-slate-200';
                  let icon: React.ReactNode = null;
                  
                  if (line.type === 'input') {
                    txtClass = 'text-white font-medium flex items-center gap-1.5 border-l border-accent/40 pl-2 my-1';
                    icon = <ChevronRight size={13} className="text-accent shrink-0" />;
                  } else if (line.type === 'error') {
                    txtClass = 'text-rose-400 font-bold bg-rose-950/15 py-1 px-2.5 rounded-md flex items-center gap-2 font-mono';
                    icon = <AlertCircle size={14} className="text-rose-500 shrink-0" />;
                  } else if (line.type === 'success') {
                    txtClass = 'text-emerald-400 font-medium bg-emerald-950/10 py-1 px-2.5 rounded-md flex items-center gap-2 font-mono';
                    icon = <Check size={14} className="text-emerald-450 shrink-0" />;
                  } else if (line.type === 'info') {
                    txtClass = 'text-accent font-medium opacity-90';
                    icon = <CircleDot size={10} className="text-accent shrink-0" />;
                  } else if (line.type === 'output') {
                    txtClass = 'text-slate-400 dark:text-slate-350 bg-slate-950/35 p-1 px-2.5 rounded whitespace-pre-wrap leading-relaxed font-mono';
                  }

                  return (
                    <div key={idx} className={`${txtClass} flex items-start gap-1`}>
                      {icon}
                      <span className="flex-1">{line.text}</span>
                    </div>
                  );
                })}
                
                <div ref={terminalEndRef} />
              </div>

              {/* Input Interactive Rail */}
              <div className="bg-slate-950/90 border-t border-slate-900 px-6 py-4 flex items-center gap-2">
                <span className="font-mono text-[13px] font-bold text-accent select-none shrink-0 flex items-center gap-1.5">
                  <span>$</span>
                </span>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAskingGemini}
                  className="w-full bg-transparent border-none text-[13px] text-white font-mono focus:ring-0 outline-none caret-accent disabled:opacity-50"
                  placeholder={isAskingGemini ? "Gemini réfléchit..." : "Tapez ls, cd projects, ou posez une question : ask <question>..."}
                  aria-label="Terminal script execution input"
                />
                
                <button
                  onClick={() => executeCommand(inputVal)}
                  disabled={isAskingGemini || !inputVal.trim()}
                  className="p-2 bg-accent/15 border border-accent/25 rounded-lg text-accent hover:bg-accent hover:text-white transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 text-xs shrink-0 font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Executer la commande"
                >
                  <RefreshCw size={11} className={`mr-0.5 ${isAskingGemini ? 'animate-spin' : ''}`} />
                  <span>{isAskingGemini ? "GEMINI..." : "EXEC"}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Small aesthetic bottom helper text */}
        <p className="text-center font-mono text-[11px] text-slate-450 dark:text-slate-500 mt-6 select-none flex items-center justify-center gap-2">
          <span>⚙️ [vfs-engine: isolation mode]</span>
          <span>•</span>
          <span>Support: ↑ ↓ pour l'historique</span>
          <span>•</span>
          <span>Saisissez python3 projects/portfolio.py</span>
        </p>

      </div>
    </section>
  );
};
