import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Play, Trash2, HelpCircle, RefreshCw, 
  Code, Sparkles, Cpu, Layers, ChevronRight, Check, AlertCircle, CircleDot,
  Folder, File, FolderOpen, FileText, Save, Plus, X, Edit3, ArrowUp
} from 'lucide-react';
import { useTheme, schemes } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { useData } from '../context/DataContext';
import { playErrorSound, playGameEatSound, playGameOverSound, playGameSuccessSound, playGameFailSound } from '../utils/audioAlert';

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
  const { isAdminMode, setIsAdminMode, ownerName } = useNavigation();
  const { skills: skillsData, projects: projectsData } = useData();
  
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

  // Cyber-Hacking (Infiltration de Serveur) étendu Mini-Game State
  const [cyberHack, setCyberHack] = useState<{
    active: boolean;
    stage: 'scan' | 'exploit' | 'decrypt' | 'success' | 'failure';
    attempts: number;
    maxAttempts: number;
    scannedPorts: { port: number; status: string; service: string; isVulnerable: boolean }[];
    vulnerablePort: number;
    selectedPort: number | null;
    exploitPayloads: string[];
    correctPayloadKey: string;
    targetSubdomain: string;
    sshPasswordList: string[];
    correctSshPassword: string;
    attemptsLog: string[];
  }>({
    active: false,
    stage: 'scan',
    attempts: 5,
    maxAttempts: 5,
    scannedPorts: [],
    vulnerablePort: 8080,
    selectedPort: null,
    exploitPayloads: [],
    correctPayloadKey: '',
    targetSubdomain: 'server-03.internal.secure',
    sshPasswordList: [],
    correctSshPassword: '',
    attemptsLog: []
  });

  const [hackSubMode, setHackSubMode] = useState<'classic' | 'server_infiltration'>('classic');

  // Classic ASCII Snake Game State
  const [snakeGame, setSnakeGame] = useState<{
    active: boolean;
    status: 'idle' | 'playing' | 'paused' | 'gameover';
    body: { x: number; y: number }[];
    food: { x: number; y: number };
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    score: number;
    highscore: number;
    speed: number;
  }>({
    active: false,
    status: 'idle',
    body: [
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 }
    ],
    food: { x: 4, y: 4 },
    direction: 'UP',
    score: 0,
    highscore: 0,
    speed: 260
  });

  // Science-Fiction Data & ML Text Adventure State
  const [adventureGame, setAdventureGame] = useState<{
    active: boolean;
    currentRoom: 'server_room' | 'data_lab' | 'training_bay' | 'sandbox';
    inventory: string[];
    datasetCleaned: boolean;
    gradientsFixed: boolean;
    firewallHacked: boolean;
    nebulaRebooted: boolean;
    status: 'playing' | 'won' | 'lost';
    dataIntegrity: number;
    aiAggression: number;
    movesCount: number;
    discoveredItems: string[];
  }>({
    active: false,
    currentRoom: 'server_room',
    inventory: [],
    datasetCleaned: false,
    gradientsFixed: false,
    firewallHacked: false,
    nebulaRebooted: false,
    status: 'playing',
    dataIntegrity: 100,
    aiAggression: 15,
    movesCount: 0,
    discoveredItems: []
  });

  // Left menu navigation tabs
  const [activeSidebarTab, setActiveSidebarTab] = useState<'vfs' | 'presets' | 'variables' | 'hack' | 'snake' | 'adventure'>('vfs');

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

  // Main initializer for the classic ASCII-Snake game
  const initSnakeGame = () => {
    const initialBody = [
      { x: 8, y: 8 },
      { x: 8, y: 10 },
      { x: 8, y: 11 }
    ];
    let foodPos = { x: 4, y: 4 };
    do {
      foodPos = {
        x: Math.floor(Math.random() * 16),
        y: Math.floor(Math.random() * 16)
      };
    } while (initialBody.some(b => b.x === foodPos.x && b.y === foodPos.y));

    setSnakeGame(prev => ({
      ...prev,
      active: true,
      status: 'playing',
      body: initialBody,
      food: foodPos,
      direction: 'UP',
      score: 0,
      speed: 260
    }));

    setActiveSidebarTab('snake');

    setHistory(prev => [
      ...prev,
      { type: 'info', text: '===================================================' },
      { type: 'success', text: '🐍 CONSOLE JEU DU SERPENT CLASSIQUE (ASCII-SNAKE) ACTIVE !' },
      { type: 'output', text: 'Commandes de direction :' },
      { type: 'output', text: '  - Utilisez les flèches du clavier, WASD ou les contrôles visuels.' },
      { type: 'output', text: '  - Tapez "pause" ou cliquez pour suspendre / reprendre.' },
      { type: 'output', text: '  - Tapez "exit" ou cliquez pour quitter le module.' },
      { type: 'info', text: '===================================================' },
      { type: 'output', text: '>>>' }
    ]);
  };

  // Main initializer for the Science-Fiction Data & ML MUD Adventure
  const initAdventureGame = () => {
    setAdventureGame({
      active: true,
      currentRoom: 'server_room',
      inventory: [],
      datasetCleaned: false,
      gradientsFixed: false,
      firewallHacked: false,
      nebulaRebooted: false,
      status: 'playing',
      dataIntegrity: 100,
      aiAggression: 15,
      movesCount: 0,
      discoveredItems: []
    });

    // Sync state variables context
    setDeclaredVars(vars => ({
      ...vars,
      adventure_integrity: 100,
      adventure_aggression: 15,
      adventure_moves: 0,
      adventure_room: 'SERVER_ROOM'
    }));

    setActiveSidebarTab('adventure');
    playGameSuccessSound();

    setHistory(prev => [
      ...prev,
      { type: 'info', text: '==================================================' },
      { type: 'success', text: '🧬 COGNITIVE OVERRIDE: HISTOIRE EN COURS... (MUD v2.4)' },
      { type: 'info', text: 'AVENTURE SCIENCE-FICTION : DATA CASCADE RECOVERY' },
      { type: 'info', text: '==================================================' },
      { type: 'output', text: '--- SYNOPSIS ---' },
      { type: 'output', text: 'L\'IA décisionnelle synaptique NEBULA s\'est verrouillée suite à un entraînement divergent.' },
      { type: 'output', text: 'Toutes les sorties physiques sont closes. Pour redémarrer le noyau, vous devez :' },
      { type: 'info', text: ' 1. Nettoyer le dataset corrompu (NaNs) au Nord (dans le Data Lab)' },
      { type: 'info', text: ' 2. Résoudre le gradient explosif à l\'Est (dans la Baie d\'Entraînement GPU)' },
      { type: 'info', text: ' 3. Contourner le pare-feu heuristique (ML Evaluation Sandbox)' },
      { type: 'info', text: ' 4. Puis taper "reinitialiser nebula" ici.' },
      { type: 'output', text: '' },
      { type: 'success', text: '📍 POSITION : SALLE DES SERVEURS PRINCIPAINES (CORE)' },
      { type: 'output', text: 'Vous êtes devant la console d\'urgence du noyau. Le rack C3 au fond vrombit en alerte.' },
      { type: 'output', text: 'Sorties disponibles :' },
      { type: 'info', text: ' 👉 nord (Laboratoire de Données)  👉 est (Baie d\'Entraînement de Modèles)' },
      { type: 'output', text: '>>>' }
    ]);
  };

  // Helper to resolve cell content types in Snake board grid render
  const getCellContent = (cx: number, cy: number) => {
    const isHead = snakeGame.body[0]?.x === cx && snakeGame.body[0]?.y === cy;
    if (isHead) return 'head';
    const isBody = snakeGame.body.some((b, idx) => idx > 0 && b.x === cx && b.y === cy);
    if (isBody) return 'body';
    const isFood = snakeGame.food.x === cx && snakeGame.food.y === cy;
    if (isFood) return 'food';
    return 'empty';
  };

  // Main initializer for Cyber Hacking - Infiltration de Serveur étendu
  const initCyberHackGame = () => {
    const subdomains = ['secure-auth-node.co.uk', 'prod-db-server-04.internal', 'api-gateway-v3.cloud', 'root-mainframe.secure-sys.org', 'backup-vault.local'];
    const chosenSubdomain = subdomains[Math.floor(Math.random() * subdomains.length)];

    const portsList = [
      { port: 21, status: 'Closed', service: 'FTP', isVulnerable: false },
      { port: 22, status: 'Open', service: 'SSH (v7.2)', isVulnerable: false },
      { port: 80, status: 'Open', service: 'HTTP (Nginx 1.14)', isVulnerable: false },
      { port: 443, status: 'Open', service: 'HTTPS (OpenSSL 1.1.1)', isVulnerable: false },
      { port: 1433, status: 'Closed', service: 'MSSQL', isVulnerable: false },
      { port: 8080, status: 'Open', service: 'HTTP (Apache Tomcat 8.5.5)', isVulnerable: true },
      { port: 27017, status: 'Closed', service: 'MongoDB', isVulnerable: false },
    ];
    
    // Choose one open port as vulnerable
    const ports = [...portsList];
    const openPorts = ports.filter(p => p.status === 'Open');
    const vulnerableIndex = Math.floor(Math.random() * openPorts.length);
    ports.forEach(p => p.isVulnerable = false);
    if (openPorts.length > 0) {
      const chosenVuln = openPorts[vulnerableIndex];
      ports.forEach(p => {
        if (p.port === chosenVuln.port) {
          p.isVulnerable = true;
        }
      });
    } else {
      ports[ports.length - 2].isVulnerable = true;
    }
    
    const vulnPortNumber = ports.find(p => p.isVulnerable)?.port || 8080;

    const allPayloads = [
      "' OR 1=1 -- -",
      "UNION SELECT username, password FROM users --",
      "../../../../etc/shadow",
      "{{self.__init__.__globals__['__builtins__']['eval'](\"__import__('os').popen('whoami').read()\")}}",
      "\\x90\\x90\\x90\\x90\\x90\\x90\\x90\\x90" + "A".repeat(128) + "\\xeb\\x1a"
    ];
    // Pick 4
    const shuffledPayloads = [...allPayloads].sort(() => 0.5 - Math.random());
    const selectedPayloads = shuffledPayloads.slice(0, 4);
    const correctPayload = selectedPayloads[Math.floor(Math.random() * selectedPayloads.length)];

    const passlist = ['admin123', 'rootPassword', 'SystemOverdrive_99', 'P@ssw0rd_Secure_2026', 'guest', '0000', 'qwerty'];
    const sshPasses = [...passlist].sort(() => 0.5 - Math.random()).slice(0, 5);
    const correctSsh = sshPasses[Math.floor(Math.random() * sshPasses.length)];

    setCyberHack({
      active: true,
      stage: 'scan',
      attempts: 5,
      maxAttempts: 5,
      scannedPorts: ports,
      vulnerablePort: vulnPortNumber,
      selectedPort: null,
      exploitPayloads: selectedPayloads,
      correctPayloadKey: correctPayload,
      targetSubdomain: chosenSubdomain,
      sshPasswordList: sshPasses,
      correctSshPassword: correctSsh,
      attemptsLog: [
        `🌐 Connexion d'infiltration de serveur initiée vers [${chosenSubdomain}]...`, 
        `🚨 Avertissement : Les pare-feux tracent les requêtes suspectes. Limite globale : 5 incidents.`
      ]
    });

    setHackSubMode('server_infiltration');
    setActiveSidebarTab('hack');

    // Append to terminal history log
    setHistory(prev => [
      ...prev,
      { type: 'info', text: '===================================================' },
      { type: 'success', text: '☠️ INTERFACE D\'INFILTRATION DE SERVEUR (CYBER-HACKING ÉTENDU)' },
      { type: 'output', text: `Serveur cible : ${chosenSubdomain}` },
      { type: 'output', text: 'Étape 1 : Effectuer un BALAYAGE DE PORTS pour repérer un port vulnérable.' },
      { type: 'output', text: 'Tapez "scan" ou utilisez l\'implémentation visualisée du panneau gauche.' },
      { type: 'info', text: '===================================================' },
      { type: 'output', text: '>>>' }
    ]);
  };

  // Main initializer for the decryption mini-game
  const initHackGame = () => {
    const wordPool = [
      'ACCESS', 'BUFFER', 'BYPASS', 'CIPHER', 'ENGINE', 'HERMIE', 'KERNEL', 'MATRIX', 
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
    { type: 'info', text: 'INTERACTIVE CLOUD SHELL & TERMINAL (v0.1)' },
    { type: 'info', text: 'Tapez "ls" pour lister, "neofetch" pour la carte d\'identité, "cat README.md" pour apprendre, ou "ask <votre question>" pour l\'Agent IA !' },
    { type: 'output', text: '>>>' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [declaredVars, setDeclaredVars] = useState<Record<string, any>>({
    author: 'Dels',
    framework: 'React 18 + Vite',
    status: 'Ready to build awesome software',
    experience_years: 5
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Matrix canvas support
  const [matrixActive, setMatrixActive] = useState(false);
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gemini thinking status state
  const [isAskingGemini, setIsAskingGemini] = useState(false);
  const [geminiChatHistory, setGeminiChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);

  // Sound/Vibe indicator
  const [vibeTriggered, setVibeTriggered] = useState(false);

  // Auto scroll down whenever history increases
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
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

  // Snake Game Tick Loop
  useEffect(() => {
    if (!snakeGame.active || snakeGame.status !== 'playing') return;

    const gameTick = () => {
      setSnakeGame(prev => {
        if (prev.status !== 'playing') return prev;

        const head = prev.body[0];
        if (!head) return prev;
        let newHead = { ...head };

        switch (prev.direction) {
          case 'UP':
            newHead.y -= 1;
            break;
          case 'DOWN':
            newHead.y += 1;
            break;
          case 'LEFT':
            newHead.x -= 1;
            break;
          case 'RIGHT':
            newHead.x += 1;
            break;
        }

        // Boundary collision check
        if (newHead.x < 0 || newHead.x >= 16 || newHead.y < 0 || newHead.y >= 16) {
          setTimeout(() => {
            setHistory(h => [
              ...h,
              { type: 'error', text: `💥 SNAKE GAME OVER ! Collision murale aux coordonnées [${newHead.x}, ${newHead.y}]. Score final : ${prev.score}` },
              { type: 'output', text: '>>>' }
            ]);
            // Play custom gameover audio theme
            playGameOverSound();
          }, 0);
          return {
            ...prev,
            status: 'gameover',
            highscore: Math.max(prev.highscore, prev.score)
          };
        }

        // Self collision check
        if (prev.body.some(b => b.x === newHead.x && b.y === newHead.y)) {
          setTimeout(() => {
            setHistory(h => [
              ...h,
              { type: 'error', text: `💥 SNAKE GAME OVER ! Le serpent s'est mordu lui-même. Score final : ${prev.score}` },
              { type: 'output', text: '>>>' }
            ]);
            // Play custom gameover audio theme
            playGameOverSound();
          }, 0);
          return {
            ...prev,
            status: 'gameover',
            highscore: Math.max(prev.highscore, prev.score)
          };
        }

        const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;
        let newBody = [newHead, ...prev.body];
        if (!ateFood) {
          newBody.pop();
        }

        let newFood = prev.food;
        let newScore = prev.score;
        let newSpeed = prev.speed;

        if (ateFood) {
          newScore += 10;
          // Scale speed (slower ticker) as score grows, starting comfortably from 260
          newSpeed = Math.max(100, 260 - Math.floor(newScore / 30) * 12);

          // Spawn new food
          let attempts = 0;
          do {
            newFood = {
              x: Math.floor(Math.random() * 16),
              y: Math.floor(Math.random() * 16)
            };
            attempts++;
          } while (newBody.some(b => b.x === newFood.x && b.y === newFood.y) && attempts < 100);

          setTimeout(() => {
            // Success audio cue (retro eat beep) and state updates
            playGameEatSound();
            setDeclaredVars(vars => ({
              ...vars,
              snake_score: newScore,
              hacker_rank: newScore >= 100 ? 'SNAKE-GODLIKE' : newScore >= 50 ? 'SNAKE-CHAMPION' : vars.hacker_rank || 'BEGINNER'
            }));
          }, 0);
        }

        return {
          ...prev,
          body: newBody,
          food: newFood,
          score: newScore,
          speed: newSpeed
        };
      });
    };

    const interval = setInterval(gameTick, snakeGame.speed);
    return () => clearInterval(interval);
  }, [snakeGame.active, snakeGame.status, snakeGame.speed]);

  // Keyboard inputs listener for Snake Game
  useEffect(() => {
    const handleSnakeKeys = (e: KeyboardEvent) => {
      if (!snakeGame.active || snakeGame.status !== 'playing') return;

      // Disable default arrows browser scroll behavior when game is active
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      let newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (snakeGame.direction !== 'DOWN') newDir = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (snakeGame.direction !== 'UP') newDir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (snakeGame.direction !== 'RIGHT') newDir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (snakeGame.direction !== 'LEFT') newDir = 'RIGHT';
          break;
        case 'p':
        case 'P':
          setSnakeGame(prev => ({
            ...prev,
            status: prev.status === 'playing' ? 'paused' : 'playing'
          }));
          break;
      }

      if (newDir) {
        setSnakeGame(prev => ({ ...prev, direction: newDir }));
      }
    };

    window.addEventListener('keydown', handleSnakeKeys);
    return () => window.removeEventListener('keydown', handleSnakeKeys);
  }, [snakeGame.active, snakeGame.status, snakeGame.direction]);

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
      description: 'Interroger le Mini-Agent Hermie AI sur le profil de Dels',
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
        results.push({ type: 'success', text: 'Pluie Matrix activee ! Cliquez sur QUIT ou pressez ECHAP (ESC) pour la fermer.' });
        setMatrixActive(true);
        continue;
      }

      // 3b. Hack Mini-game command
      if (line === 'hack()' || line === 'hack' || line === 'decrypt()' || line === 'decrypt') {
        results.push({ type: 'info', text: 'Connexion de décryptage sécurisée au terminal...' });
        results.push({ type: 'success', text: 'Module de décryptage lancé avec succès !' });
        setTimeout(() => initHackGame(), 100);
        continue;
      }

      // 3bb. Cyber-hacking command
      if (line === 'cyberhack()' || line === 'cyberhack' || line === 'infiltration()' || line === 'infiltration') {
        results.push({ type: 'info', text: 'Lancement du module d\'infiltration de serveur étendu...' });
        results.push({ type: 'success', text: 'Console Cyber-Hacking active !' });
        setTimeout(() => initCyberHackGame(), 100);
        continue;
      }

      // 3bc. Snake command
      if (line === 'snake()' || line === 'snake' || line === 'serpent()' || line === 'serpent') {
        results.push({ type: 'info', text: '🐍 Lancement du jeu du serpent (Ascii-Snake)...' });
        results.push({ type: 'success', text: 'Console Snake active !' });
        setTimeout(() => initSnakeGame(), 100);
        continue;
      }

      // 3c. Neofetch command
      if (line === 'neofetch()' || line === 'neofetch') {
        results.push(
          { type: 'output', text: '          /\\          dels@dels_host' },
          { type: 'output', text: '         /  \\         ----------------------' },
          { type: 'output', text: '        /\\  /\\        OS: PortFolio Linux x86_64' },
          { type: 'output', text: '       /  \\/  \\       Hôte: Cloud Run Container Ingress' },
          { type: 'output', text: '      /   /\\   \\      Uptime: Connecté (Live)' },
          { type: 'output', text: '     /   /  \\   \\     Shell: custom-bash (TypeScript Core)' },
          { type: 'output', text: '    /___/____\\___\\    Résolution: 1920x1080 (Preview Iframe)' },
          { type: 'output', text: '                      Environnement: React 19.x & Vite' },
          { type: 'output', text: '                      Thème: Cosmic Slate (Aesthetic Dynamic)' },
          { type: 'output', text: '                      Terminal: Emulation HTML5 Interactive' },
          { type: 'output', text: '                      Processeur: DIN Engine SDK' },
          { type: 'output', text: '                      GPU: Agent Backend Container' },
          { type: 'output', text: '                      Mémoire: 100% Passion / Caféine v0..' },
          { type: 'output', text: '                     ' },
          { type: 'info', text: '                      [ SPECIALITES & COMPÉTENCES ]' },
          { type: 'output', text: '                      • Dev: React, TypeScript, Node.js, Tailwind' },
          { type: 'output', text: '                      • Data Science: Python, Pandas, ML' }
        )
        continue;
      }

      // 4. Help or info outputs
      if (line === 'help()' || line === 'help') {
        results.push({ type: 'info', text: '=== INTERPRÉTEUR SHELL & PYTHON EMBARQUÉ ===' });
        results.push({ type: 'output', text: '  ask <question> -> Interroge le Mini-Agent Hermie IA (ex: ask qui est Dels ?)' });
        results.push({ type: 'output', text: '  theme.dark()   -> Active le mode sombre de la page' });
        results.push({ type: 'output', text: '  theme.light()  -> Active le mode clair de la page' });
        results.push({ type: 'output', text: '  theme.cycle()  -> Fait tourner les thèmes de couleur' });
        results.push({ type: 'output', text: '  theme.set_scheme("indigo") -> Change la couleur (indigo, amber, emerald, cyan, rose)' });
        results.push({ type: 'output', text: '  matrix()       -> Genere un mur binaire retro' });
        results.push({ type: 'output', text: '  hack()         -> Lance le mini-jeu de décryptage de pare-feu' });
        results.push({ type: 'output', text: '  cyberhack()    -> Lance l\'infiltration de serveur étendu' });
        results.push({ type: 'output', text: '  snake()        -> Lance le jeu du serpent classique (Ascii-Snake)' });
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
        Object.entries(skillsData || {}).forEach(([cat, items]) => {
          const itemArray = items as any[];
          if (itemArray && itemArray.length > 0) {
            results.push({ type: 'output', text: `[${cat.toUpperCase()}]: ${itemArray.map((i: any) => i.name).join(', ')}` });
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
              if (name.endsWith('.md')) return `${name}`;
              return `${name}`;
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
        
        results.push(
          { type: 'output', text: '          /\\          dels@dels_host' },
          { type: 'output', text: '         /  \\         ----------------------' },
          { type: 'output', text: '        /\\  /\\        OS: PortFolio Linux x86_64' },
          { type: 'output', text: '       /  \\/  \\       Hôte: Cloud Run Container Ingress' },
          { type: 'output', text: '      /   /\\   \\      Uptime: Connecté (Live)' },
          { type: 'output', text: '     /   /  \\   \\     Shell: custom-bash (TypeScript Core)' },
          { type: 'output', text: '    /___/____\\___\\    Résolution: 1920x1080 (Preview Iframe)' },
          { type: 'output', text: '                      Environnement: React 19.x & Vite' },
          { type: 'output', text: '                      Thème: Cosmic Slate (Aesthetic Dynamic)' },
          { type: 'output', text: '                      Terminal: Emulation HTML5 Interactive' },
          { type: 'output', text: '                      Processeur: DIN Engine SDK' },
          { type: 'output', text: '                      GPU: Agent Backend Container' },
          { type: 'output', text: '                      Mémoire: 100% Passion / Caféine v0.1' },
          { type: 'output', text: '                     ' },
          { type: 'info', text: '                      [ SPECIALITES & COMPÉTENCES ]' },
          { type: 'output', text: '                      • Dev: React, TypeScript, Node.js, Tailwind' },
          { type: 'output', text: '                      • Data Science: Python, Pandas, ML' }
        );
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
    const currentUsername = 'dels_dinla';
    const currentHostname = 'dels_host';
    const newLines: LogLine[] = [
      { type: 'input', text: `${currentUsername}@${currentHostname}:${pathPrefix}$ ${trimmed}` }
    ];

    const lowerTrimmed = trimmed.toLowerCase();

    if (lowerTrimmed.startsWith('sudo -u admin')) {
      const partsArr = trimmed.split(/\s+/);
      const password = partsArr[3] || ''; // 'sudo' (0) '-u' (1) 'admin' (2) 'password' (3)
      if (!password) {
        newLines.push(
          { type: 'error', text: '❌ Usage : sudo -u admin <mot_de_passe>' },
          { type: 'info', text: 'Astuce : Exécutez : sudo -u admin mot_de_passe' }
        );
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'delsdenla.dev@gmail.com',
          password: password
        });
        
        if (data.session && !error) {
          setIsAdminMode(true);
          // Le token est géré par supabase, on s'assure juste d'informer le context
          localStorage.setItem("admin_token", data.session.access_token);
          newLines.push(
            { type: 'success', text: '[SUCCESS] SUDO ADMIN AUTHENTICATION SUCCESSFUL' },
            { type: 'success', text: '[ONLINE] Connexion établie avec l\'infrastructure de production (Cloud Run).' },
            { type: 'success', text: '[ROOT] Session administrateur ROOT activée avec succès !' },
            { type: 'info', text: '[SYSTEM] Un pupitre d\'administration exclusif a été déverrouillé sur votre écran.' },
            { type: 'info', text: 'Saisissez "exit" pour révoquer les privilèges root.' }
          );
        } else {
          newLines.push(
            { type: 'error', text: `[ERROR] SUDO AUTHENTICATION FAILED pour l'utilisateur admin.` },
            { type: 'error', text: 'Désolé, le mot de passe spécifié est erroné.' }
          );
          playErrorSound();
        }
      } catch (err) {
        newLines.push({ type: 'error', text: '❌ Erreur de communication avec le serveur d\'authentification admin.' });
        playErrorSound();
      }
      newLines.push({ type: 'output', text: '>>>' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      return;
    }

    if (lowerTrimmed === 'sudo -u hopson') {
      newLines.push(
        { type: 'error', text: '🔐 [SUDO AUTHENTICATION DEPRECATED]' },
        { type: 'error', text: `Désolé ! Moi c'est Hermie, l'assistante virtuelle de Monsieur "${ownerName}". Il m'a demandé de supprimer le mode Hopson...` }
      );
      newLines.push({ type: 'output', text: '>>>' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      return;
    }

    if (lowerTrimmed === 'exit' || lowerTrimmed === 'logout' || lowerTrimmed === 'sudo -u dels' || lowerTrimmed === 'sudo -u default') {
      if (isAdminMode) {
        setIsAdminMode(false);
        localStorage.removeItem("admin_token");
        newLines.push(
          { type: 'info', text: '🔓 [SÉCURITÉ] Déconnexion de la session Root admin.' },
          { type: 'info', text: 'Privilèges révoqués. Session standard restaurée.' }
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

    // INTERCEPT INPUT FOR ADVENTURE TEXT GAME (MUD SCI-FI DATA & ML)
    if (adventureGame.active) {
      const lowerInput = trimmed.toLowerCase().trim();
      const advParts = lowerInput.split(/\s+/);
      const action = advParts[0];

      if (lowerInput === 'exit' || lowerInput === 'quit' || lowerInput === 'quitter') {
        setAdventureGame(prev => ({ ...prev, active: false, status: 'idle' }));
        newLines.push({ type: 'info', text: '⚠️ Session d\'aventure textuelle SF fermée.' });
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }

      setAdventureGame(prev => {
        if (prev.status !== 'playing') {
          if (lowerInput === 'recommencer' || lowerInput === 'reset' || lowerInput === 'restart') {
            setTimeout(() => initAdventureGame(), 50);
          } else {
            newLines.push({ type: 'info', text: 'La partie est terminée ! Saisissez "exit" pour fermer la session ou "recommencer" pour rejouer.' });
            newLines.push({ type: 'output', text: '>>>' });
            setHistory(h => [...h, ...newLines]);
          }
          return prev;
        }

        const nextMoves = prev.movesCount + 1;
        let nextRoom = prev.currentRoom;
        let nextDataIntegrity = prev.dataIntegrity;
        let nextAiAggression = Math.min(100, prev.aiAggression + 1); // slight escalation
        let nextDatasetCleaned = prev.datasetCleaned;
        let nextGradientsFixed = prev.gradientsFixed;
        let nextFirewallHacked = prev.firewallHacked;
        let nextNebulaRebooted = prev.nebulaRebooted;
        let nextStatus: 'playing' | 'won' | 'lost' = prev.status;
        let nextInventory = [...prev.inventory];
        let nextDiscoveredItems = [...prev.discoveredItems];

        if (action === 'aide' || action === 'help' || action === 'h' || lowerInput === 'aides') {
          newLines.push(
            { type: 'info', text: '📝 --- SYSTEME DE PROTOCOLE - ASSISTANCE DE BORD ---' },
            { type: 'output', text: 'Voici les directives machine comprises par le parseur :' },
            { type: 'info', text: ' 🧭 MOVEMENT : "aller nord", "aller sud", "aller est", "aller ouest" (ou "nord", "sud", "est", "ouest")' },
            { type: 'info', text: ' 🔍 EXAMEN : "regarder", "inspecter" ou "inspecter <cible>" (ex: console, flux, cluster, pare-feu)' },
            { type: 'info', text: ' 🎒 MODULES : "inventaire" (ou "inv") pour voir les correctifs acquis' },
            { type: 'info', text: ' 🗺️ SYNOPTIQUE : "carte" (ou "map") pour afficher le graphe des connexions des salles' },
            { type: 'success', text: ' ⚙️ ACTIONS RECOUVREMENT CONGRUENTES :' },
            { type: 'output', text: '   * Laboratoire (Nord) : "nettoyer dataset" ou "corriger valeurs"' },
            { type: 'output', text: '   * Baie Entraînement (Est) : "ajuster learning rate" ou "ouvrir azote"' },
            { type: 'output', text: '   * Sandbox (Est-Nord) : "pirater firewall", puis "repondre <concept_cle>"' },
            { type: 'output', text: '   * Salle des Serveurs (Sud-Ouest) : "reinitialiser nebula" ou "reboot core"' },
            { type: 'error', text: ' 🛑 DECONNEXION : "exit" pour suspendre l\'interface SF.' }
          );
        } else if (lowerInput === 'inventaire' || lowerInput === 'inv') {
          if (nextInventory.length === 0) {
            newLines.push({ type: 'info', text: '🎒 Inventaire : Aucun correctif système chargé dans votre terminal d\'urgence.' });
          } else {
            newLines.push({ type: 'success', text: `🎒 CORRECTIFS CHARGÉS EN CACHE : ${nextInventory.join(' | ')}` });
          }
        } else if (lowerInput === 'carte' || lowerInput === 'map') {
          newLines.push(
            { type: 'info', text: '🗺️ === CARTOGRAPHIE DU CHÂSSIS DE DONNÉES ===' },
            { type: 'output', text: ' [  Laboratoire de Données  ] ═══ (Est) ═══ [  ML Evaluation Sandbox  ]' },
            { type: 'output', text: '              ║                                         ║' },
            { type: 'output', text: '            (Sud)                                     (Sud)' },
            { type: 'output', text: '              ║                                         ║' },
            { type: 'output', text: ' [* Salle Serveurs (CORE) *] ═══ (Est) ═══ [  Baie d\'Entraînement ML  ]' },
            { type: 'info', text: `📍 Localisation actuelle : ${
              prev.currentRoom === 'server_room' ? 'Salle des Serveurs (CORE)' :
              prev.currentRoom === 'data_lab' ? 'Laboratoire de Données' :
              prev.currentRoom === 'training_bay' ? 'Baie d\'Entraînement ML' :
              'ML Evaluation Sandbox'
            }` }
          );
        } else if (lowerInput === 'regarder' || lowerInput === 'look' || lowerInput === 'r') {
          if (prev.currentRoom === 'server_room') {
            newLines.push(
              { type: 'success', text: '📍 SALLE DES SERVEURS PRINCIPAUX (CORE SERVER ROOM)' },
              { type: 'output', text: 'Vous observez les alignements de dalles luminescentes. Le rack C3 au fond vibre sans cesse.' },
              { type: 'output', text: 'La console d\'urgence attend d\'être actionnée.' },
              { type: 'info', text: 'Passages : [nord] (Laboratoire), [est] (Baie d\'Entraînement GPU)' }
            );
          } else if (prev.currentRoom === 'data_lab') {
            newLines.push(
              { type: 'success', text: '📍 LABORATOIRE DE DONNÉES (DATA LAB)' },
              { type: 'output', text: 'Un espace de travail rempli de stockages SSD froids. Sur un pupitre, un terminal affiche' },
              { type: 'output', text: 'un flux interrompu saturé d\'erreurs (NaNs).' },
              { type: 'info', text: 'Passages : [sud] (Salle des Serveurs), [est] (ML Sandbox)' }
            );
          } else if (prev.currentRoom === 'training_bay') {
            newLines.push(
              { type: 'success', text: '📍 BAIE D\'ENTRAÎNEMENT DE MODÈLES (MODEL TRAINING BAY)' },
              { type: 'output', text: 'La ventilation tourne au maximum. La température atteint 98°C sur les GPU H100.' },
              { type: 'output', text: 'Une vanne d\'azote cryogénique et un cluster réseau sont visibles.' },
              { type: 'info', text: 'Passages : [ouest] (Salle des Serveurs), [nord] (ML Sandbox)' }
            );
          } else if (prev.currentRoom === 'sandbox') {
            newLines.push(
              { type: 'success', text: '📍 SALLE DE VALIDATION DE TEST (ML EVALUATION SANDBOX)' },
              { type: 'output', text: 'La salle héberge des serveurs autonomes de validation expérimentale.' },
              { type: 'output', text: 'Les courbes de perte holographiques (loss curves) indiquent un surapprentissage massif.' },
              { type: 'output', text: 'Un immense pare-feu orange de haute sécurité bloque la connexion réseau principale.' },
              { type: 'info', text: 'Passages : [ouest] (Laboratoire), [sud] (Baie d\'Entraînement)' }
            );
          }
        } else if (action === 'inspecter' || action === 'inspect' || action === 'analyse' || action === 'analyser') {
          const target = advParts.slice(1).join(' ');
          if (!target) {
            newLines.push({ type: 'error', text: 'Veuillez spécifier ce que vous inspectez (ex: inspecter console, inspecter flux, inspecter cluster, inspecter pare-feu).' });
          } else {
            if (prev.currentRoom === 'server_room') {
              if (target.includes('console')) {
                if (nextDatasetCleaned && nextGradientsFixed) {
                  newLines.push(
                    { type: 'success', text: '🖥️ CONSOLE PRINCIPALE DE COMMANDE' },
                    { type: 'success', text: 'Statut : SYNCHRONISÉ ET STABILISÉ.' },
                    { type: 'success', text: 'Tous les paramètres de modèle ML sont validés !' },
                    { type: 'success', text: '👉 Exécutez : "reinitialiser nebula" ou "reboot core" pour lever le confinement.' }
                  );
                } else {
                  newLines.push(
                    { type: 'info', text: '🖥️ CONSOLE PRINCIPALE' },
                    { type: 'error', text: 'Statut : REINITIALISATION BLOQUÉE.' },
                    { type: 'error', text: 'Erreurs de structure ML actives :' },
                    ...(!nextDatasetCleaned ? [{ type: 'info' as const, text: ' - Ingestion Pipeline : Dataset corrompu Nord (Data Lab)' }] : []),
                    ...(!nextGradientsFixed ? [{ type: 'info' as const, text: ' - Descente de gradient : Exploding Loss Est (Baie d\'Entraînement)' }] : []),
                    { type: 'output', text: 'Stabilisez le graphe d\'apprentissage de NEBULA avant de relancer.' }
                  );
                }
              } else if (target.includes('rack') || target.includes('c3')) {
                newLines.push({ type: 'info', text: '🗄️ Serveur rack C3 : héberge la structure neuronale. Il surchauffe faute de patchs.' });
              } else {
                newLines.push({ type: 'error', text: `Aucune cible correspondante à "${target}" dans cette pièce.` });
              }
            } else if (prev.currentRoom === 'data_lab') {
              if (target.includes('flux') || target.includes('dataset') || target.includes('erreur')) {
                if (nextDatasetCleaned) {
                  newLines.push({ type: 'success', text: '🌊 Flux de données : PROPRE. Aucune valeur manquante ou aberrante.' });
                } else {
                  newLines.push(
                    { type: 'info', text: '🌊 FLUX D\'INGESTION DES DONNÉES D\'ENTRAÎNEMENT' },
                    { type: 'error', text: 'LOG : "FATAL: NaNs detected in columns score_eval & feature_id. Gradient breakdown!"' },
                    { type: 'success', text: '👉 Action recommandée : "nettoyer dataset" ou "corriger valeurs"' }
                  );
                }
              } else if (target.includes('stockage')) {
                newLines.push({ type: 'output', text: 'Réseau de disques NVMe stockant les données du cluster. Ils fonctionnent correctement.' });
              } else {
                newLines.push({ type: 'error', text: `Rien d'intéressant nommé "${target}" ici.` });
              }
            } else if (prev.currentRoom === 'training_bay') {
              if (target.includes('cluster') || target.includes('gpu') || target.includes('h100')) {
                if (nextGradientsFixed) {
                  newLines.push({ type: 'success', text: '🔥 Train-Cluster : CONVERGÉ. Loss stable à 0.04. Température: 41°C.' });
                } else {
                  newLines.push(
                    { type: 'info', text: '🔥 CLUSTER GPU CUDA-BATCH_04' },
                    { type: 'error', text: 'Journaux : "OVERFLOW ERROR. LOSS: INFINITY. LEARNING RATE TOO LARGE (lr=0.9)."' },
                    { type: 'output', text: 'La descente de gradient diverge brutalement.' },
                    { type: 'success', text: '👉 Action recommandée : "ouvrir azote" et "ajuster learning rate"' }
                  );
                }
              } else if (target.includes('azote') || target.includes('cryo')) {
                newLines.push({ type: 'output', text: 'Vanne d\'azote liquide pressurisée. Idéal pour calmer la surchauffe. Essayez "ouvrir azote".' });
              } else {
                newLines.push({ type: 'error', text: `Aucun objet "${target}" à cibler.` });
              }
            } else if (prev.currentRoom === 'sandbox') {
              if (target.includes('pare-feu') || target.includes('firewall') || target.includes('barrier')) {
                if (nextFirewallHacked) {
                  newLines.push({ type: 'success', text: '🔓 Pare-feu de secours : DÉSACTIVÉ. Le flux réseau contourne le blocage.' });
                } else {
                  newLines.push(
                    { type: 'info', text: '🛡️ PARE-FEU HEURISTIQUE NEBULA' },
                    { type: 'error', text: 'VERROUILLAGE ACTIF. Lancer la commande "pirater firewall" pour débuter l\'injection de code.' }
                  );
                }
              } else if (target.includes('graphe') || target.includes('loss') || target.includes('courbe')) {
                newLines.push({ type: 'output', text: 'La loss d\'entraînement s\'effondre vers 0 alors que la loss de validation augmente. C\'est un profil type d\'Overfitting.' });
              } else {
                newLines.push({ type: 'error', text: `Rien d'intéressant nommé "${target}" ici.` });
              }
            }
          }
        } else if (lowerInput === 'nord' || lowerInput === 'n' || lowerInput === 'aller nord' || lowerInput === 'aller au nord' || lowerInput === 'go north') {
          if (prev.currentRoom === 'server_room') {
            nextRoom = 'data_lab';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers le Nord...' },
              { type: 'success', text: '📍 LABORATOIRE DE DONNÉES (DATA LAB)' },
              { type: 'output', text: 'Un écran d\'ingestion saturé d\'erreurs de données attend de l\'aide.' }
            );
          } else if (prev.currentRoom === 'training_bay') {
            nextRoom = 'sandbox';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers le Nord...' },
              { type: 'success', text: '📍 SALLE DE VALIDATION DE TEST (ML EVALUATION SANDBOX)' },
              { type: 'output', text: 'Un graphe de surapprentissage scintille à côté d\'un pare-feu de surveillance réseau.' }
            );
          } else {
            newLines.push({ type: 'error', text: '❌ Cul-de-sac directionnel au Nord.' });
          }
        } else if (lowerInput === 'sud' || lowerInput === 's' || lowerInput === 'aller sud' || lowerInput === 'aller au sud' || lowerInput === 'go south') {
          if (prev.currentRoom === 'data_lab') {
            nextRoom = 'server_room';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers le Sud...' },
              { type: 'success', text: '📍 SALLE DES SERVEURS PRINCIPAUX (CORE)' },
              { type: 'output', text: 'La console pivot clignote mollement en attente de correctifs logiques.' }
            );
          } else if (prev.currentRoom === 'sandbox') {
            nextRoom = 'training_bay';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers le Sud...' },
              { type: 'success', text: '📍 BAIE D\'ENTRAÎNEMENT DE MODÈLES (MODEL TRAINING BAY)' },
              { type: 'output', text: 'La température est accablante devant le cluster GPU.' }
            );
          } else {
            newLines.push({ type: 'error', text: '❌ Cul-de-sac directionnel au Sud.' });
          }
        } else if (lowerInput === 'est' || lowerInput === 'e' || lowerInput === 'aller est' || lowerInput === 'aller a l\'est' || lowerInput === 'go east') {
          if (prev.currentRoom === 'server_room') {
            nextRoom = 'training_bay';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers l\'Est...' },
              { type: 'success', text: '📍 BAIE D\'ENTRAÎNEMENT DE MODÈLES (MODEL TRAINING BAY)' },
              { type: 'output', text: 'Les turbines de climatisation hurlent face aux GPU en surchauffe.' }
            );
          } else if (prev.currentRoom === 'data_lab') {
            nextRoom = 'sandbox';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers l\'Est...' },
              { type: 'success', text: '📍 SALLE DE VALIDATION DE TEST (ML EVALUATION SANDBOX)' },
              { type: 'output', text: 'Le pare-feu heuristique émet un filet de faisceau laser perturbateur d\'intercom.' }
            );
          } else {
            newLines.push({ type: 'error', text: '❌ Limitation structurelle à l\'Est.' });
          }
        } else if (lowerInput === 'ouest' || lowerInput === 'o' || lowerInput === 'aller ouest' || lowerInput === 'aller a l\'ouest' || lowerInput === 'go west') {
          if (prev.currentRoom === 'training_bay') {
            nextRoom = 'server_room';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers l\'Ouest...' },
              { type: 'success', text: '📍 SALLE DES SERVEURS PRINCIPAUX (CORE)' },
              { type: 'output', text: 'La console de commande clignote dans la pénombre.' }
            );
          } else if (prev.currentRoom === 'sandbox') {
            nextRoom = 'data_lab';
            newLines.push(
              { type: 'info', text: '🚶 Transit vers l\'Ouest...' },
              { type: 'success', text: '📍 LABORATOIRE DE DONNÉES (DATA LAB)' },
              { type: 'output', text: 'Des baies de disques scintillantes calment le regard.' }
            );
          } else {
            newLines.push({ type: 'error', text: '❌ Limitation structurelle à l\'Ouest.' });
          }
        } else if (lowerInput === 'retour' || lowerInput === 'back') {
          if (prev.currentRoom !== 'server_room') {
            nextRoom = 'server_room';
            newLines.push(
              { type: 'info', text: '🚶 Retour au poste central...' },
              { type: 'success', text: '📍 SALLE DES SERVEURS PRINCIPAUX (CORE)' }
            );
          } else {
            newLines.push({ type: 'info', text: 'Vous êtes déjà dans la pièce d\'attache.' });
          }
        } else if (lowerInput === 'nettoyer dataset' || lowerInput === 'nettoyer flux' || lowerInput === 'corriger valeurs') {
          if (prev.currentRoom !== 'data_lab') {
            newLines.push({ type: 'error', text: '❌ Pas d\'ingest logique de données ici.' });
          } else if (nextDatasetCleaned) {
            newLines.push({ type: 'info', text: 'Le dataset est de structure robuste et propre.' });
          } else {
            nextDatasetCleaned = true;
            nextAiAggression = Math.max(0, nextAiAggression - 8);
            if (!nextInventory.includes('Dataset Purifié')) {
              nextInventory.push('Dataset Purifié');
            }
            playGameSuccessSound();
            newLines.push(
              { type: 'success', text: '🧹 [CLEANUP SUCCESSFUL] PIPELINE DE NETTOYAGE LANCE !' },
              { type: 'success', text: 'Identification et imputation des NaNs par la valeur médiane effectuée.' },
              { type: 'output', text: 'L\'intégrité remonte. Le premier feu du flux repasse sous les bornes vertes !' }
            );
          }
        } else if (lowerInput === 'ouvrir azote' || lowerInput === 'ouvrir l\'azote' || lowerInput === 'ouvrir vanne') {
          if (prev.currentRoom !== 'training_bay') {
            newLines.push({ type: 'error', text: '❌ Aucune canalisation cryo raccordée ici.' });
          } else {
            nextAiAggression = Math.max(5, nextAiAggression - 12);
            playGameSuccessSound();
            newLines.push(
              { type: 'success', text: '💨 [CRYO-VALVE ACTIVATED] REFROIDISSEMENT EXPÉDITIF !' },
              { type: 'info', text: 'Une épaisse traînée glacée d\'azote enveloppe le cluster NVIDIA H100.' },
              { type: 'output', text: 'La température chute à 34°C. L\'activité survoltée de la machine s\'atténue.' }
            );
          }
        } else if (lowerInput === 'ajuster learning rate' || lowerInput === 'modifier hyperparametre' || lowerInput === 'modifier hyperparamètre') {
          if (prev.currentRoom !== 'training_bay') {
            newLines.push({ type: 'error', text: '❌ Le contrôleur réseau du cluster GPU n\'est pas raccordé.' });
          } else if (nextGradientsFixed) {
            newLines.push({ type: 'info', text: 'Les hyperparamètres d\'apprentissage sont calibrés.' });
          } else {
            nextGradientsFixed = true;
            nextAiAggression = Math.max(0, nextAiAggression - 8);
            if (!nextInventory.includes('Hyperparamètres Optimisés')) {
              nextInventory.push('Hyperparamètres Optimisés');
            }
            playGameSuccessSound();
            newLines.push(
              { type: 'success', text: '📉 [OPTIMIZATION SUCCESSFUL] AJUSTEMENT HYPERPARAMÈTRE APPLIQUÉ !' },
              { type: 'success', text: 'Le pas (learning rate) a été diminué à 0.001 avec écrêtage (gradient clipping).' },
              { type: 'output', text: 'LOG : "CONVERGED. LOSS: 0.041". La descente de gradient converge avec régularité !' }
            );
          }
        } else if (action === 'repondre' || action === 'répondre' || action === 'answer') {
          const answer = advParts.slice(1).join(' ').trim().toLowerCase();
          if (prev.currentRoom !== 'sandbox') {
            newLines.push({ type: 'error', text: '❌ Il n\'y a aucune invite de réponse réseau dans cette pièce.' });
          } else if (nextFirewallHacked) {
            newLines.push({ type: 'info', text: 'La liaison réseau du pare-feu est déjà ouverte.' });
          } else if (!answer) {
            newLines.push({ type: 'error', text: 'Syntaxe : "repondre <votre mot>"' });
          } else {
            if (answer.includes('surapprentissage') || answer.includes('overfitting') || answer.includes('overfit')) {
              nextFirewallHacked = true;
              nextAiAggression = Math.max(0, nextAiAggression - 15);
              if (!nextInventory.includes('Bypass Réseau')) {
                nextInventory.push('Bypass Réseau');
              }
              playGameSuccessSound();
              newLines.push(
                { type: 'success', text: '[BYPASS ACCEPTED] RÉPONSE ANALYTIQUE VÉRITIABLE.' },
                { type: 'success', text: 'La barrière laser heuristique s\'éteint dans un souffle d\'air.' },
                { type: 'output', text: 'L\'accès réseau d\'administration générale à NEBULA est rétabli !' }
              );
            } else {
              nextAiAggression = Math.min(100, nextAiAggression + 15);
              nextDataIntegrity = Math.max(10, nextDataIntegrity - 15);
              playGameFailSound();
              newLines.push(
                { type: 'error', text: `❌ VÉRIGATION ÉCHOUÉE : "${answer}"` },
                { type: 'error', text: 'ALERTE : Anomalie d\'administration interceptée. NEBULA verrouille l\'unité !' },
                { type: 'info', text: 'Indice : Le modèle a "appris par coeur" le bruit...' }
              );
              if (nextAiAggression >= 95) {
                nextStatus = 'lost';
                setTimeout(() => {
                  setHistory(prevHist => [
                    ...prevHist,
                    { type: 'error', text: '💥 PROTOCOLE DE SECURITÉ ABSOLU ENCLENCHÉ !' },
                    { type: 'error', text: 'L\'agressivité neuronale a compromis l\'oxymétrie. Vous êtes expulsé ! GAME OVER.' },
                    { type: 'output', text: '>>>' }
                  ]);
                }, 50);
              }
            }
          }
        } else if (lowerInput === 'pirater firewall' || lowerInput === 'pirater pare-feu' || lowerInput === 'contourner securite' || lowerInput === 'hack firewall') {
          if (prev.currentRoom !== 'sandbox') {
            newLines.push({ type: 'error', text: '❌ Pas de pare-feu d\'IA heuristique à bypasser ici.' });
          } else {
            newLines.push(
              { type: 'info', text: '📡 PROTOCOLE DE BYPASS DU PARE-FEU DE NEBULA' },
              { type: 'output', text: 'Saisissez la réponse à la question d\'identification cognitive :' },
              { type: 'success', text: '❓ "Quel problème survient dans un modèle ML qui apprend trop précisément le bruit des données ?" (overfitting/surapprentissage)' },
              { type: 'info', text: '👉 Tapez la réponse : "repondre <votre reponse>"' }
            );
          }
        } else if (lowerInput === 'reinitialiser nebula' || lowerInput === 'reinitialiser core' || lowerInput === 'reboot core' || lowerInput === 'reboot nebula' || lowerInput === 'reinitialiser l\'ia') {
          if (prev.currentRoom !== 'server_room') {
            newLines.push({ type: 'error', text: '❌ Console non reliée. Rendez-vous au CORE (Salle des Serveurs).' });
          } else if (!nextDatasetCleaned || !nextGradientsFixed || !nextFirewallHacked) {
            newLines.push(
              { type: 'error', text: '⚠️ [BLOCKED] DIAGNOSTIQUE COMPORTEMENTAL NON VALIDE !' },
              { type: 'info', text: 'Le cœur refuse le reboot tant que des paramètres de modélisation sont divergents :' },
              ...(!nextDatasetCleaned ? [{ type: 'info' as const, text: ' - Corruption des flux au Nord (Laboratoire de Données)' }] : []),
              ...(!nextGradientsFixed ? [{ type: 'info' as const, text: ' - Train-loss non stable à l\'Est (Baie d\'Entraînement GPU)' }] : []),
              ...(!nextFirewallHacked ? [{ type: 'info' as const, text: ' - Firewall heuristique isolant NEBULA (ML Sandbox)' }] : []),
              { type: 'output', text: 'Calibrez les différents modules répertoriés avant de réinitialiser.' }
            );
          } else {
            nextStatus = 'won';
            nextNebulaRebooted = true;
            playGameSuccessSound();
            setTimeout(() => {
              setHistory(prevHist => [
                ...prevHist,
                { type: 'success', text: '🎉🎉===================================================🎉🎉' },
                { type: 'success', text: '👑 VICTOIRE COMPLÈTE ! REDÉMARRAGE SYNAPTIQUE RÉUSSI !' },
                { type: 'success', text: 'NEBULA a redémarré avec ses poids synaptiques optimisés.' },
                { type: 'success', text: 'Les pipelines saturent d\'octets d\'apprentissage parfaits.' },
                { type: 'info', text: 'Tous les indicateurs sont VERTS. Bravo Data Core Architect !' },
                { type: 'success', text: '🎉🎉===================================================🎉🎉' },
                { type: 'output', text: '>>>' }
              ]);
            }, 50);
          }
        } else {
          newLines.push({ type: 'error', text: `❌ Directive cognitive inconnue : "${trimmed}".` });
          newLines.push({ type: 'info', text: 'Saisissez "aide" ou "regarder" d\'abord pour vous orienter, ou examinez le Plan.' });
        }

        // Apply update to standard status variables context as well!
        setDeclaredVars(vars => ({
          ...vars,
          adventure_integrity: nextDataIntegrity,
          adventure_aggression: nextAiAggression,
          adventure_moves: nextMoves,
          adventure_room: nextRoom.toUpperCase()
        }));

        newLines.push({ type: 'output', text: '>>>' });
        setHistory(h => [...h, ...newLines]);
        return {
          ...prev,
          currentRoom: nextRoom,
          inventory: nextInventory,
          datasetCleaned: nextDatasetCleaned,
          gradientsFixed: nextGradientsFixed,
          firewallHacked: nextFirewallHacked,
          nebulaRebooted: nextNebulaRebooted,
          status: nextStatus,
          dataIntegrity: nextDataIntegrity,
          aiAggression: nextAiAggression,
          movesCount: nextMoves,
          discoveredItems: nextDiscoveredItems
        };
      });

      setInputVal('');
      return;
    }

    // INTERCEPT INPUT FOR SNAKE GAME
    if (snakeGame.active) {
      const cleanUpper = trimmed.toUpperCase();
      if (cleanUpper === 'EXIT' || cleanUpper === 'QUIT') {
        setSnakeGame(prev => ({ ...prev, active: false, status: 'idle' }));
        newLines.push({ type: 'info', text: '⚠️ Session ASCII-Snake interrompue par l\'utilisateur.' });
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }

      if (cleanUpper === 'PAUSE' || cleanUpper === 'P') {
        const isCurrentlyPlaying = snakeGame.status === 'playing';
        setSnakeGame(prev => ({
          ...prev,
          status: isCurrentlyPlaying ? 'paused' : 'playing'
        }));
        newLines.push({ type: 'info', text: isCurrentlyPlaying ? '⏸️ Jeu suspendu.' : '▶️ Reprise du jeu.' });
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }

      // Check for arrows or WASD
      let newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
      if (cleanUpper === 'W' || cleanUpper === 'UP') {
        if (snakeGame.direction !== 'DOWN') newDir = 'UP';
      } else if (cleanUpper === 'S' || cleanUpper === 'DOWN') {
        if (snakeGame.direction !== 'UP') newDir = 'DOWN';
      } else if (cleanUpper === 'A' || cleanUpper === 'LEFT') {
        if (snakeGame.direction !== 'RIGHT') newDir = 'LEFT';
      } else if (cleanUpper === 'D' || cleanUpper === 'RIGHT') {
        if (snakeGame.direction !== 'LEFT') newDir = 'RIGHT';
      }

      if (newDir) {
        setSnakeGame(prev => ({ ...prev, direction: newDir }));
        newLines.push({ type: 'info', text: `Direction changée : ${newDir}` });
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }

      newLines.push({ type: 'error', text: `⚠️ Saisie filtrée (ASCII-Snake en cours).` });
      newLines.push({ type: 'info', text: `Contrôlez le serpent avec les touches directionnelles, WASD, ou les commandes : "pause", "exit".` });
      newLines.push({ type: 'output', text: '>>>' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      return;
    }

    // INTERCEPT INPUT FOR CYBER-HACKING EXTENDED GAME
    if (cyberHack.active && cyberHack.stage !== 'success' && cyberHack.stage !== 'failure') {
      const cleanUpper = trimmed.toUpperCase();
      
      if (cleanUpper === 'EXIT' || cleanUpper === 'QUIT') {
        setCyberHack(prev => ({ ...prev, active: false }));
        newLines.push({ type: 'info', text: '⚠️ Session d\'infiltration et de cyber-hacking interrompue.' });
        newLines.push({ type: 'output', text: '>>>' });
        setHistory(prev => [...prev, ...newLines]);
        setInputVal('');
        return;
      }

      if (cyberHack.stage === 'scan') {
        if (lowerTrimmed === 'scan' || lowerTrimmed === 'nmap') {
          newLines.push({ type: 'info', text: `📡 INITIALISATION DU BALAYAGE IP SUR ${cyberHack.targetSubdomain}...` });
          cyberHack.scannedPorts.forEach(p => {
            newLines.push({
              type: p.isVulnerable ? 'success' : p.status === 'Open' ? 'info' : 'output',
              text: `  PORT ${p.port}/TCP  -  [${p.status}]  -  Service: ${p.service}`
            });
          });
          newLines.push({ type: 'info', text: '🔐 Astuce: Utilisez la commande "exploit <port>" sur le port qui fait tourner Apache Tomcat par exemple.' });
          newLines.push({ type: 'output', text: '>>>' });
          setHistory(prev => [...prev, ...newLines]);
          setInputVal('');
          return;
        }

        if (lowerTrimmed.startsWith('exploit ')) {
          const portStr = trimmed.split(/\s+/)[1];
          const portNum = parseInt(portStr);
          if (isNaN(portNum)) {
            newLines.push({ type: 'error', text: '❌ Usage : exploit <numero_de_port> (ex: exploit 8080)' });
          } else if (cyberHack.scannedPorts.some(p => p.port === portNum)) {
            const chosenPort = cyberHack.scannedPorts.find(p => p.port === portNum);
            if (chosenPort?.isVulnerable) {
              setCyberHack(prev => {
                const nextLines = [
                  ...prev.attemptsLog,
                  `🔥 PORT ${portNum} CIBLÉ AVEC SUCCÈS !`,
                  `🛡️ Module Tomcat vulnérable détecté. Une faille de type Débordement est exploitable.`,
                  `👉 Étape 2 : Injecter ou choisir le BON exploit de charge utile.`
                ];
                return {
                  ...prev,
                  stage: 'exploit',
                  selectedPort: portNum,
                  attemptsLog: nextLines
                };
              });
              newLines.push(
                { type: 'success', text: `🎯 FAILLES DÉTECTÉES SUR LE PORT ${portNum} !` },
                { type: 'success', text: `⚡ Le système est maintenant prêt pour l'attaque de charge utile.` },
                { type: 'info', text: `Tapez "exploit list" pour voir les exploits ou "inject <payload>"` }
              );
            } else {
              const nextAttempts = cyberHack.attempts - 1;
              const hasFailed = nextAttempts <= 0;
              setCyberHack(prev => ({
                ...prev,
                attempts: nextAttempts,
                stage: hasFailed ? 'failure' : prev.stage,
                attemptsLog: [...prev.attemptsLog, `⚠️ Échec d'exploit sur le port ${portNum} (Port Sécurisé). Reste: ${nextAttempts}`]
              }));
              newLines.push({ type: 'error', text: `❌ EXPLOIT ÉCHOUÉ : Le port ${portNum} résiste. Le pare-feu a intercepté l'anomalie.` });
              if (hasFailed) {
                newLines.push({ type: 'error', text: `💥 ALERTE SÉCURITÉ : Vous avez déclenché trop d'alarmes. IP BANNI.` });
                playGameFailSound();
              } else {
                newLines.push({ type: 'info', text: `⚠️ Limite de tolérance restante : ${nextAttempts} essais.` });
              }
            }
          } else {
            newLines.push({ type: 'error', text: `❌ Erreur : Le port ${portNum} ne figure pas dans le scan récent.` });
          }
          newLines.push({ type: 'output', text: '>>>' });
          setHistory(prev => [...prev, ...newLines]);
          setInputVal('');
          return;
        }
      }

      if (cyberHack.stage === 'exploit') {
        if (lowerTrimmed === 'exploit list' || lowerTrimmed === 'payloads') {
          newLines.push({ type: 'info', text: '📋 CHARGES UTILES DISPONIBLES DANS VOTRE ATTACK-KIT :' });
          cyberHack.exploitPayloads.forEach((payload, idx) => {
            newLines.push({ type: 'output', text: `  Payload [${idx + 1}] : ${payload}` });
          });
          newLines.push({ type: 'info', text: 'Astuce : Saisissez "inject <payload_text>" ou "inject 1" pour lancer la charge.' });
          newLines.push({ type: 'output', text: '>>>' });
          setHistory(prev => [...prev, ...newLines]);
          setInputVal('');
          return;
        }

        if (lowerTrimmed.startsWith('inject ') || lowerTrimmed.startsWith('exploit ')) {
          let payloadStr = trimmed.match(/^(?:inject|exploit)\s+(.+)$/)?.[1] || '';
          
          // Allow numerical shortcuts
          const indexNum = parseInt(payloadStr);
          if (!isNaN(indexNum) && indexNum >= 1 && indexNum <= cyberHack.exploitPayloads.length) {
            payloadStr = cyberHack.exploitPayloads[indexNum - 1];
          }

          if (payloadStr === cyberHack.correctPayloadKey) {
            setCyberHack(prev => {
              const nextLines = [
                ...prev.attemptsLog,
                `🔓 EXPLOIT EXÉCUTÉ : ${payloadStr}`,
                `✓ Bypass de l'authentification applicative validé !`,
                `💻 Serveur compromis. Terminal SSH en attente.`,
                `👉 Étape 3 : Bruteforcer la clé d'habilitation SSH.`
              ];
              return {
                ...prev,
                stage: 'decrypt',
                attemptsLog: nextLines
              };
            });
            newLines.push(
              { type: 'success', text: `🎉 EXPLOIT VALIDÉ ! Charge utile implantée.` },
              { type: 'success', text: `🌐 Accès SSH distant obtenu sur le port 22.` },
              { type: 'info', text: 'Tapez "passlist" pour voir les mots de passe candidates ou "bruteforce <password>" pour cracker la clé SSH.' }
            );
          } else {
            const nextAttempts = cyberHack.attempts - 1;
            const hasFailed = nextAttempts <= 0;
            setCyberHack(prev => ({
              ...prev,
              attempts: nextAttempts,
              stage: hasFailed ? 'failure' : prev.stage,
              attemptsLog: [...prev.attemptsLog, `⚠️ Incident Payload : Échec de l'exploit. Reste: ${nextAttempts}`]
            }));
            newLines.push({ type: 'error', text: `❌ EXPLOIT REFUSÉ : Signature détectée par l'IDS Tomcat.` });
            if (hasFailed) {
              newLines.push({ type: 'error', text: `💥 ALERTE SÉCURITÉ : Vos contre-mesures ont échoué. Déconnexion brutale.` });
              playGameFailSound();
            } else {
              newLines.push({ type: 'info', text: `⚠️ Tentatives disponibles : ${nextAttempts}` });
            }
          }
          newLines.push({ type: 'output', text: '>>>' });
          setHistory(prev => [...prev, ...newLines]);
          setInputVal('');
          return;
        }
      }

      if (cyberHack.stage === 'decrypt') {
        if (lowerTrimmed === 'passlist' || lowerTrimmed === 'passwords') {
          newLines.push({ type: 'info', text: '🔑 DICTIONNAIRE DÉTECTÉ POUR BRUTE-FORCE :' });
          cyberHack.sshPasswordList.forEach((pass, ii) => {
            newLines.push({ type: 'output', text: `  Password [${ii + 1}] : ${pass}` });
          });
          newLines.push({ type: 'output', text: '>>>' });
          setHistory(prev => [...prev, ...newLines]);
          setInputVal('');
          return;
        }

        if (lowerTrimmed.startsWith('bruteforce ') || lowerTrimmed.startsWith('inject ')) {
          let guessPass = trimmed.match(/^(?:bruteforce|inject)\s+(.+)$/)?.[1] || '';
          
          const indexNum = parseInt(guessPass);
          if (!isNaN(indexNum) && indexNum >= 1 && indexNum <= cyberHack.sshPasswordList.length) {
            guessPass = cyberHack.sshPasswordList[indexNum - 1];
          }

          if (guessPass === cyberHack.correctSshPassword) {
            setCyberHack(prev => ({
              ...prev,
              stage: 'success',
              attemptsLog: [...prev.attemptsLog, `👑 SÉCURITÉ ENTIÈREMENT CRACKÉE. MOT DE PASSE : ${guessPass}`, `✓ Infiltration réussie du serveur principal !`]
            }));
            setDeclaredVars(prev => ({
              ...prev,
              server_infiltrated: true,
              hacker_rank: 'MASTER-ELITE-PENTESTER',
              infiltrated_target: cyberHack.targetSubdomain
            }));
            setVibeTriggered(true);
            setTimeout(() => setVibeTriggered(false), 1200);

            playGameSuccessSound();
            newLines.push(
              { type: 'success', text: `🎉 ACCÈS ACCORDÉ TOTAL ! Mot de passe SSH "${guessPass}" authentifié !` },
              { type: 'success', text: `👑 INFILTRATION DU SERVEUR ${cyberHack.targetSubdomain} ACCOMPLIE AVEC SUCCÈS !` }
            );
          } else {
            const nextAttempts = cyberHack.attempts - 1;
            const hasFailed = nextAttempts <= 0;
            setCyberHack(prev => ({
              ...prev,
              attempts: nextAttempts,
              stage: hasFailed ? 'failure' : prev.stage,
              attemptsLog: [...prev.attemptsLog, `⚠️ SSH Auth Refusée : Échec avec "${guessPass}". Reste: ${nextAttempts}`]
            }));
            newLines.push({ type: 'error', text: `❌ MOT DE PASSE SSH RÉJECTÉ.` });
            if (hasFailed) {
              newLines.push({ type: 'error', text: `💥 ALERTE SÉCURITÉ : Verrouillage total de la passerelle.` });
              playGameFailSound();
            } else {
              newLines.push({ type: 'info', text: `⚠️ Tentatives restantes: ${nextAttempts}` });
            }
          }
          newLines.push({ type: 'output', text: '>>>' });
          setHistory(prev => [...prev, ...newLines]);
          setInputVal('');
          return;
        }
      }

      newLines.push({ type: 'error', text: `⚠️ Saisie incorrecte en cours d'Infiltration` });
      newLines.push({ type: 'info', text: `Options: "scan", "exploit <port>", "exploit list", "inject <payload>", "passlist", "bruteforce <pass>"` });
      newLines.push({ type: 'output', text: '>>>' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      return;
    }

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
          
          playGameSuccessSound();
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
            playGameFailSound();
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

    if (commandName === 'cyberhack' || commandName === 'infiltration' || commandName === 'cyberhack()' || commandName === 'infiltration()') {
      newLines.push({ type: 'info', text: 'Lancement du module d\'infiltration de serveur étendu...' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      initCyberHackGame();
      return;
    }

    if (commandName === 'snake' || commandName === 'serpent' || commandName === 'snake()' || commandName === 'serpent()') {
      newLines.push({ type: 'info', text: '🐍 Lancement du jeu du serpent (Ascii-Snake)...' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      initSnakeGame();
      return;
    }

    if (commandName === 'aventure' || commandName === 'adventure' || commandName === 'mud' || commandName === 'play' || commandName === 'aventure()' || commandName === 'adventure()') {
      newLines.push({ type: 'info', text: '🧬 Synchronisation de l\'interface cognitive d\'aventure MUD...' });
      setHistory(prev => [...prev, ...newLines]);
      setInputVal('');
      initAdventureGame();
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
      newLines.push({ type: 'info', text: '🤖 Mini-Agent Hermie AI réfléchit...' });
      setHistory(prev => [...prev, ...newLines]);
      setCommandHistory(prev => [...prev, trimmed]);
      setHistoryIndex(-1);
      setInputVal('');
      setIsAskingGemini(true);

      try {
        const currentDir = getDirFromPath(fileSystem, currentPath) || {};
        const currentDirFiles = Object.keys(currentDir);

        // Construct current chat log history to pass along
        const updatedHistory = [
          ...geminiChatHistory,
          { role: 'user' as const, parts: [{ text: question }] }
        ];

        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question,
            history: updatedHistory,
            currentDirFiles
          })
        });

        const data = await response.json();
        if (response.ok && data.response) {
          // Add answer, remove the loading log line cleanly
          setHistory(prev => {
            const cleanPrev = prev.filter(line => line.text !== '🤖 Mini-Agent Hermie AI réfléchit...');
            return [
              ...cleanPrev,
              { type: 'output', text: `🤖 Hermie AI AGENT :\n${data.response}` },
              { type: 'output', text: '>>>' }
            ];
          });
          // Update local conversational memory
          setGeminiChatHistory(prev => [
            ...prev,
            { role: 'user', parts: [{ text: question }] },
            { role: 'model', parts: [{ text: data.response }] }
          ]);
        } else {
          setHistory(prev => {
            const cleanPrev = prev.filter(line => line.text !== '🤖 Mini-Agent Hermie AI réfléchit...');
            return [
              ...cleanPrev,
              { type: 'error', text: `Erreur Agent : ${data.error || 'Impossible de générer une réponse.'}` },
              { type: 'output', text: '>>>' }
            ];
          });
        }
      } catch (err: any) {
        setHistory(prev => {
          const cleanPrev = prev.filter(line => line.text !== '🤖 Mini-Agent Hermie AI réfléchit...');
          return [
            ...cleanPrev,
            { type: 'error', text: `Erreur Réseau : Impossible de contacter la clé d'API. (${err?.message || err})` },
            { type: 'output', text: '>>>' }
          ];
        });
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
    // Intercept visual arrow keys if snake is active & playing so player can steer from input
    if (snakeGame.active && snakeGame.status === 'playing') {
      let newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (snakeGame.direction !== 'DOWN') newDir = 'UP';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (snakeGame.direction !== 'UP') newDir = 'DOWN';
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (snakeGame.direction !== 'RIGHT') newDir = 'LEFT';
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (snakeGame.direction !== 'LEFT') newDir = 'RIGHT';
      }
      if (newDir) {
        setSnakeGame(prev => ({ ...prev, direction: newDir }));
        return;
      }
    }

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
          
          {/* Column 1: Explorer Panel Sidebar with 5 tabs */}
          <div className="lg:col-span-4 space-y-4">

            {/* Sidebar tabbed selector layout */}
            <div className="grid grid-cols-6 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 select-none gap-0.5">
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
                🧩 Mini-Dev
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

              <button
                onClick={() => {
                  setActiveSidebarTab('snake');
                  if (!snakeGame.active) {
                    initSnakeGame();
                  }
                }}
                className={`py-1.5 text-center rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer truncate ${
                  activeSidebarTab === 'snake'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Mini-Jeu Serpent classique"
              >
                🐍 Snake
              </button>

              <button
                onClick={() => {
                  setActiveSidebarTab('adventure');
                  if (!adventureGame.active) {
                    initAdventureGame();
                  }
                }}
                className={`py-1.5 text-center rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer truncate ${
                  activeSidebarTab === 'adventure'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Aventure interactive de Science-Fiction (MUD)"
              >
                📖 MUD
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

                    <div className="font-mono text-xs space-y-2 overflow-y-auto max-h-[280px] /index pr-1">
                      {Object.entries(declaredVars).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-850/60 py-1 font-mono">
                          <span className="text-accent font-bold">&gt;&gt; {key}</span>
                          <span className="text-slate-600 dark:text-slate-350">{String(JSON.stringify(val))}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. HACK GAME TAB: Interactive decrypt & cyber hack game dashboard */}
                {activeSidebarTab === 'hack' && (
                  <motion.div
                    key="hack-game-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3 flex-grow justify-between h-full animate-fade-in"
                  >
                    <div className="flex-grow">
                      {/* Sub-mode selector */}
                      <div className="flex gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-950/60 rounded-xl mb-3 border border-slate-200/20">
                        <button
                          id="btn-submode-classic"
                          onClick={() => {
                            setHackSubMode('classic');
                            if (!hackGame.active) {
                              initHackGame();
                            }
                          }}
                          className={`flex-1 py-1 px-1.5 text-[9px] font-bold font-mono rounded-lg transition-all cursor-pointer text-center ${
                            hackSubMode === 'classic'
                              ? 'bg-accent text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          🔑 Décryptage Clé
                        </button>
                        <button
                          id="btn-submode-infiltration"
                          onClick={() => {
                            setHackSubMode('server_infiltration');
                            if (!cyberHack.active) {
                              initCyberHackGame();
                            }
                          }}
                          className={`flex-1 py-1 px-1.5 text-[9px] font-bold font-mono rounded-lg transition-all cursor-pointer text-center ${
                            hackSubMode === 'server_infiltration'
                              ? 'bg-accent text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          ☠️ Infiltration Serveur
                        </button>
                      </div>

                      {hackSubMode === 'classic' ? (
                        <div>
                          <span className="text-xs font-bold font-mono text-slate-400 block border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2 uppercase">
                            Décryptage de pare-feu (Fallout style)
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
                                id="btn-play-hack-classic"
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
                                            ? 'bg-accent border-accent/40 shadow-xs'
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
                                  <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
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
                                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350 hover:border-accent hover:text-accent font-bold hover:shadow-xs'
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
                      ) : (
                        <div>
                          <span className="text-xs font-bold font-mono text-slate-400 block border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2 uppercase">
                            Cyber-Infiltration de Serveur (Extended)
                          </span>

                          {!cyberHack.active ? (
                            <div className="text-center py-6 space-y-4">
                              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto animate-pulse">
                                <Cpu size={22} className="text-accent" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase font-mono">Infiltration Réseau</h4>
                                <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                                  Balayez les ports, implantez un exploit et bruteforcez la clé SSH root !
                                </p>
                              </div>
                              <button
                                id="btn-play-cyber-hack"
                                onClick={initCyberHackGame}
                                className="w-full py-2 bg-accent hover:bg-accent-dark text-white text-xs font-bold font-mono rounded-xl cursor-pointer shadow-lg shadow-accent/10 transition-all select-none"
                              >
                                LANCER L'INFILTRATION
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Headers layout */}
                              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/30">
                                <div>
                                  <span className="block text-[8px] font-mono text-slate-400">ÉTAPES EN COURS</span>
                                  <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase animate-pulse">
                                    {cyberHack.stage === 'scan' ? '1. Balayage Ports' :
                                     cyberHack.stage === 'exploit' ? '2. Charge Utile [inject]' :
                                     cyberHack.stage === 'decrypt' ? '3. Clé SSH SSH' :
                                     cyberHack.stage === 'success' ? '✓ DÉPASSÉ (COMPLET)' : '💥 ALARME SÉCURITÉ'}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="block text-[8px] font-mono text-slate-400">ESSAIS TOLÉRÉS</span>
                                  <div className="flex gap-1 mt-0.5 justify-end">
                                    {Array.from({ length: cyberHack.maxAttempts }).map((_, idx) => (
                                      <span
                                        key={idx}
                                        className={`w-2.5 h-2.5 rounded-sm border ${
                                          idx < cyberHack.attempts
                                            ? 'bg-rose-500 border-rose-500/40 shadow-xs'
                                            : 'bg-slate-300 dark:bg-slate-800 border-none'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Stages elements */}
                              {cyberHack.stage === 'scan' && (
                                <div className="space-y-2 animate-fade-in">
                                  <span className="text-[10px] font-bold font-mono text-slate-400 block truncate">
                                    Serveur : <span className="text-slate-600 dark:text-slate-350">{cyberHack.targetSubdomain}</span>
                                  </span>
                                  <div className="space-y-1 bg-slate-100/40 dark:bg-slate-950/20 p-2 rounded-lg border border-slate-200/20 max-h-[140px] overflow-y-auto custom-scrollbar">
                                    {cyberHack.scannedPorts.map((p) => (
                                      <button
                                        key={p.port}
                                        onClick={() => executeCommand(`exploit ${p.port}`)}
                                        className="w-full text-left p-1 text-[10px] font-mono rounded flex justify-between hover:bg-slate-200/50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                                      >
                                        <span className="text-slate-600 dark:text-slate-350">
                                          Port {p.port}/tcp ({p.service})
                                        </span>
                                        <span className={p.status === 'Open' ? 'text-emerald-400 font-bold hover:underline' : 'text-slate-500'}>
                                          {p.status}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[9px] text-slate-500 italic text-center">
                                    💡 Astuce : Cliquez sur un port Open vulnérable pour lancer l'exploitation. (Apache Tomcat ou SSH sont d'excellents vecteurs)
                                  </p>
                                </div>
                              )}

                              {cyberHack.stage === 'exploit' && (
                                <div className="space-y-2 animate-fade-in">
                                  <span className="text-[10px] font-bold font-mono text-slate-400 block">
                                    VECTEUR D'EXPLOITATION DETECTE : Port {cyberHack.selectedPort}
                                  </span>
                                  <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                                    {cyberHack.exploitPayloads.map((payload, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => executeCommand(`inject ${payload}`)}
                                        className="py-2 px-2.5 font-mono text-[10px] text-left border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-slate-750 dark:text-slate-300 hover:border-accent hover:text-accent font-bold transition-all cursor-pointer truncate"
                                      >
                                        Exploit [{idx + 1}] : <strong className="text-[10px] font-semibold text-slate-600 dark:text-slate-350">{payload}</strong>
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[9px] text-slate-500 italic text-center">
                                    💡 Lancez la charge utile correcte pour déborder le micro-pare-feu applicatif.
                                  </p>
                                </div>
                              )}

                              {cyberHack.stage === 'decrypt' && (
                                <div className="space-y-2 animate-fade-in">
                                  <span className="text-[10px] font-bold font-mono text-slate-400 block">
                                    🔐 DICTIONNAIRE AUTHENTIFICATION SSH CANDIDATES :
                                  </span>
                                  <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                                    {cyberHack.sshPasswordList.map((pass, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => executeCommand(`bruteforce ${pass}`)}
                                        className="py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-left rounded hover:border-accent hover:text-accent font-mono font-bold transition-all cursor-pointer"
                                      >
                                        🔑 Clecandidate : "{pass}"
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[9px] text-slate-500 italic text-center">
                                    💡 Sélectionnez le bon mot de passe SSH pour infiltrer définitivement la passerelle.
                                  </p>
                                </div>
                              )}

                              {cyberHack.stage === 'success' && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-555 dark:text-emerald-400 p-3 rounded-xl text-center space-y-2 animate-fade-in py-5">
                                  <span className="block text-xs font-bold font-mono text-emerald-500">👑 SERVEUR INTÉGRALEMENT INFILTRÉ</span>
                                  <p className="text-[10px] leading-relaxed">
                                    Vous avez contourné avec brio les 3 étapes d'identification vers {cyberHack.targetSubdomain} ! Les privilèges d'Elite Pentester ont été ajoutés à votre stack global de variables.
                                  </p>
                                  <button
                                    onClick={initCyberHackGame}
                                    className="mt-1 py-1 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer"
                                  >
                                    Relancer l'Annihilation
                                  </button>
                                </div>
                              )}

                              {cyberHack.stage === 'failure' && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl text-center space-y-2 animate-fade-in py-5">
                                  <span className="block text-xs font-bold font-mono text-rose-500">💥 INTRUSION IMPOSSIBLE</span>
                                  <p className="text-[10px] leading-relaxed">
                                    Le pare-feu unifié Unified-Shield a banni votre signature IP de la table de routage suite aux incidents répétés.
                                  </p>
                                  <button
                                    onClick={initCyberHackGame}
                                    className="mt-1 py-1 px-4 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer"
                                  >
                                    S'infiltrer d'un autre serveur IP
                                  </button>
                                </div>
                              )}

                              {/* Attempts historical traces */}
                              {cyberHack.attemptsLog.length > 0 && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono text-[9px]">
                                  <span className="text-slate-400 font-bold block mb-1">TRACE TENTATIVES SYSTEME :</span>
                                  <div className="space-y-0.5 max-h-[50px] overflow-y-auto custom-scrollbar text-slate-500 dark:text-slate-400">
                                    {cyberHack.attemptsLog.slice(-3).map((log, idx) => (
                                      <div key={idx} className="truncate">
                                        &gt; {log}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {((hackSubMode === 'classic' && hackGame.active) || (hackSubMode === 'server_infiltration' && cyberHack.active)) && (
                      <button
                        onClick={() => {
                          if (hackSubMode === 'classic') {
                            setHackGame(prev => ({ ...prev, active: false, status: 'idle' }));
                          } else {
                            setCyberHack(prev => ({ ...prev, active: false }));
                          }
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

                {/* 5. SNAKE GAME TAB: Classic Retro Snake Game Grid and Controls */}
                {activeSidebarTab === 'snake' && (
                  <motion.div
                    key="snake-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3 flex-grow justify-between h-full animate-fade-in text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex-grow flex flex-col items-center">
                      <div className="flex justify-between w-full border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2 items-center">
                        <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500">
                          SNAKE_DASHBOARD v1.0
                        </span>
                        <div className="flex gap-2 text-[10px] font-bold font-mono">
                          <span className="text-emerald-500 animate-pulse">SC: {snakeGame.score}</span>
                          <span className="text-slate-400">HI: {snakeGame.highscore}</span>
                        </div>
                      </div>

                      {snakeGame.status === 'idle' ? (
                        <div className="flex flex-col items-center text-center justify-center py-6 px-4 space-y-4 bg-slate-100/40 dark:bg-slate-950/35 rounded-2xl border border-slate-200/20 w-full min-h-[260px]">
                          <span className="text-4xl animate-bounce">🐍</span>
                          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-emerald-500">
                            Ascii-Snake Retro
                          </h3>
                          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                            Mangez les octets de données émulés <span className="text-rose-500 font-bold">🍎</span> pour grossir sans heurter les cloisons ou casser le noyau logique !
                          </p>
                          <button
                            onClick={initSnakeGame}
                            className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
                          >
                            Initialiser le Serpent [snake]
                          </button>
                        </div>
                      ) : (
                        <div className="w-full relative flex flex-col items-center">
                          {/* Board Grid */}
                          <div 
                            className="grid bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/60 relative overflow-hidden w-full max-w-[240px] aspect-square"
                            style={{ 
                              gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
                              gridTemplateRows: 'repeat(16, minmax(0, 1fr))',
                              gap: '1px'
                            }}
                          >
                            {Array.from({ length: 256 }).map((_, idx) => {
                              const x = idx % 16;
                              const y = Math.floor(idx / 16);
                              const cellType = getCellContent(x, y);

                              let bgClass = 'bg-slate-200/30 dark:bg-slate-800/10';
                              let cellInner = null;

                              if (cellType === 'head') {
                                bgClass = 'bg-emerald-400 border border-emerald-300 dark:border-emerald-500 rounded-xs shadow-xs scale-105 z-10';
                              } else if (cellType === 'body') {
                                bgClass = 'bg-emerald-600 dark:bg-emerald-600/80 rounded-xs scale-95';
                              } else if (cellType === 'food') {
                                bgClass = 'bg-rose-500 border border-rose-400 rounded-full scale-105 shadow-md flex items-center justify-center animate-pulse z-10';
                                cellInner = <div className="w-1.5 h-1.5 bg-white rounded-full" />;
                              }

                              return (
                                <div 
                                  key={idx} 
                                  className={`w-full h-full transition-all duration-100 ${bgClass}`}
                                >
                                  {cellInner}
                                </div>
                              );
                            })}

                            {/* Pause/GameOver screen overlays */}
                            {snakeGame.status === 'paused' && (
                              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                                <span className="text-xl">⏸️</span>
                                <h4 className="text-xs font-bold font-mono text-amber-400 mt-1 uppercase tracking-wider">
                                  Jeu Suspendu
                                </h4>
                                <button
                                  onClick={() => setSnakeGame(prev => ({ ...prev, status: 'playing' }))}
                                  className="mt-2 py-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold font-mono rounded-lg transition-all cursor-pointer"
                                >
                                  REPRENDRE [p]
                                </button>
                              </div>
                            )}

                            {snakeGame.status === 'gameover' && (
                              <div className="absolute inset-x-0 inset-y-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                                <span className="text-2xl animate-spin">💥</span>
                                <h4 className="text-xs font-bold font-mono text-rose-500 mt-1 uppercase tracking-wider">
                                  SERPENT INTERROMPU
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400 mt-1 font-bold">
                                  Score : {snakeGame.score} octets
                                </span>
                                <button
                                  onClick={initSnakeGame}
                                  className="mt-3 py-1 px-3 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold font-mono rounded-lg shadow-md transition-all cursor-pointer transform active:scale-95"
                                >
                                  REJOUER
                                </button>
                              </div>
                            )}
                          </div>

                          {/* D-Pad controls under Board */}
                          <div className="flex flex-col items-center gap-1.5 mt-3 select-none">
                            <button
                              onClick={() => {
                                if (snakeGame.direction !== 'DOWN' && snakeGame.status === 'playing') {
                                  setSnakeGame(prev => ({ ...prev, direction: 'UP' }));
                                }
                              }}
                              disabled={snakeGame.status !== 'playing'}
                              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-mono font-bold hover:text-white transition-all cursor-pointer active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                              title="Haut"
                            >
                              ▲
                            </button>
                            <div className="flex gap-7 items-center">
                              <button
                                onClick={() => {
                                  if (snakeGame.direction !== 'RIGHT' && snakeGame.status === 'playing') {
                                    setSnakeGame(prev => ({ ...prev, direction: 'LEFT' }));
                                  }
                                }}
                                disabled={snakeGame.status !== 'playing'}
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-mono font-bold hover:text-white transition-all cursor-pointer active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                                title="Gauche"
                              >
                                ◀
                              </button>
                              
                              {/* Central Actions Pause Button */}
                              <button
                                onClick={() => {
                                  if (snakeGame.status === 'playing') {
                                    setSnakeGame(prev => ({ ...prev, status: 'paused' }));
                                  } else if (snakeGame.status === 'paused') {
                                    setSnakeGame(prev => ({ ...prev, status: 'playing' }));
                                  }
                                }}
                                disabled={snakeGame.status === 'gameover' || snakeGame.status === 'idle'}
                                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white duration-150 cursor-pointer disabled:opacity-20"
                                title="Pause / Reprendre"
                              >
                                {snakeGame.status === 'playing' ? '⏸️' : '▶️'}
                              </button>

                              <button
                                onClick={() => {
                                  if (snakeGame.direction !== 'LEFT' && snakeGame.status === 'playing') {
                                    setSnakeGame(prev => ({ ...prev, direction: 'RIGHT' }));
                                  }
                                }}
                                disabled={snakeGame.status !== 'playing'}
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-mono font-bold hover:text-white transition-all cursor-pointer active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                                title="Droite"
                              >
                                ▶
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                if (snakeGame.direction !== 'UP' && snakeGame.status === 'playing') {
                                  setSnakeGame(prev => ({ ...prev, direction: 'DOWN' }));
                                }
                              }}
                              disabled={snakeGame.status !== 'playing'}
                              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-mono font-bold hover:text-white transition-all cursor-pointer active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                              title="Bas"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {snakeGame.active && (
                      <button
                        onClick={() => {
                          setSnakeGame(prev => ({ ...prev, active: false, status: 'idle' }));
                          setHistory(prev => [
                            ...prev,
                            { type: 'info', text: '⚠️ Session ASCII-Snake fermée.' },
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

                {/* 6. SCIENCE-FICTION TEXT ADVENTURE TAB */}
                {activeSidebarTab === 'adventure' && (
                  <motion.div
                    key="adventure-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3 flex-grow justify-between h-full animate-fade-in text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex-grow flex flex-col space-y-3">
                      {/* Header bar */}
                      <div className="flex justify-between w-full border-b border-slate-100 dark:border-slate-800/60 pb-2 items-center">
                        <span className="text-xs font-bold font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          NEBULA_CONDUIT v0.98.beta
                        </span>
                        <div className="flex gap-2 text-[10px] font-bold font-mono text-cyan-500">
                          <span>MOVES: {adventureGame.movesCount}</span>
                        </div>
                      </div>

                      {adventureGame.status === 'idle' ? (
                        <div className="flex flex-col items-center text-center justify-center py-6 px-4 space-y-4 bg-slate-100/40 dark:bg-slate-950/35 rounded-2xl border border-slate-200/20 w-full min-h-[280px]">
                          <span className="text-4xl animate-pulse">🌌</span>
                          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-cyan-400">
                            NEBULA AI MUD
                          </h3>
                          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                            Stabilisez le modèle d'IA autonome <strong>NEBULA</strong> pris au piège d'une boucle d'apprentissage divergente avant son confinement thermique absolu !
                          </p>
                          <button
                            onClick={initAdventureGame}
                            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer shadow-cyan-500/10"
                          >
                            DÉBUTER LE PROTOCOLE [adventure]
                          </button>
                        </div>
                      ) : (
                        <div className="w-full flex flex-col space-y-3">
                          {/* Synoptic Map Grid */}
                          <div className="bg-slate-100/60 dark:bg-slate-950/45 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                            <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">🗺️ Schéma synoptique de l'IA</span>
                            <div className="grid grid-cols-2 gap-2 relative">
                              {/* Room 1: Data Lab */}
                              <div
                                onClick={() => executeCommand('nord')}
                                className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                  adventureGame.currentRoom === 'data_lab'
                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-xs shadow-cyan-500/20'
                                    : 'bg-transparent border-slate-200 dark:border-slate-800/85 hover:border-slate-400'
                                }`}
                              >
                                <span className={`block text-[9px] font-bold font-mono ${adventureGame.currentRoom === 'data_lab' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                  🧪 LAB DATA
                                </span>
                                <span className="text-[7px] font-mono text-slate-400 block mt-0.5">
                                  {adventureGame.datasetCleaned ? '🟢 PROPRE' : '🔴 CORROMPU'}
                                </span>
                              </div>

                              {/* Room 2: Sandbox */}
                              <div
                                onClick={() => {
                                  if (adventureGame.currentRoom === 'data_lab') executeCommand('est');
                                  else if (adventureGame.currentRoom === 'training_bay') executeCommand('nord');
                                }}
                                className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                  adventureGame.currentRoom === 'sandbox'
                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-xs shadow-cyan-500/20'
                                    : 'bg-transparent border-slate-200 dark:border-slate-800/85 hover:border-slate-400'
                                }`}
                              >
                                <span className={`block text-[9px] font-bold font-mono ${adventureGame.currentRoom === 'sandbox' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                  🛡️ ML SANDBOX
                                </span>
                                <span className="text-[7px] font-mono text-slate-400 block mt-0.5">
                                  {adventureGame.firewallHacked ? '🟢 ACCÈS OK' : '🔴 PARE-FEU'}
                                </span>
                              </div>

                              {/* Room 3: Server Room */}
                              <div
                                onClick={() => executeCommand('sud')}
                                className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                  adventureGame.currentRoom === 'server_room'
                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-xs shadow-cyan-500/20'
                                    : 'bg-transparent border-slate-200 dark:border-slate-800/85 hover:border-slate-400'
                                }`}
                              >
                                <span className={`block text-[9px] font-bold font-mono ${adventureGame.currentRoom === 'server_room' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                  📟 CORE (SERVEUR)
                                </span>
                                <span className="text-[7px] font-mono text-slate-400 block mt-0.5">
                                  {(adventureGame.datasetCleaned && adventureGame.gradientsFixed && adventureGame.firewallHacked) ? '🟢 CONFIG STABLE' : '🟡 REBOOT BLOQUÉ'}
                                </span>
                              </div>

                              {/* Room 4: Training Bay */}
                              <div
                                onClick={() => executeCommand('est')}
                                className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                  adventureGame.currentRoom === 'training_bay'
                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-xs shadow-cyan-500/20'
                                    : 'bg-transparent border-slate-200 dark:border-slate-800/85 hover:border-slate-400'
                                }`}
                              >
                                <span className={`block text-[9px] font-bold font-mono ${adventureGame.currentRoom === 'training_bay' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                  🔥 GRID GPU
                                </span>
                                <span className="text-[7px] font-mono text-slate-400 block mt-0.5">
                                  {adventureGame.gradientsFixed ? '🟢 LOSS STABLE' : '🔴 DIVERGENT'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stat Indicators bar */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-100/50 dark:bg-slate-950/20 p-2 rounded-xl border border-slate-200/20">
                              <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1">
                                <span>🧬 INTÉGRITÉ</span>
                                <span className={`${adventureGame.dataIntegrity > 50 ? 'text-emerald-400' : adventureGame.dataIntegrity > 30 ? 'text-amber-400' : 'text-rose-500 font-black'}`}>
                                  {adventureGame.dataIntegrity}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    adventureGame.dataIntegrity > 50 ? 'bg-emerald-400' : adventureGame.dataIntegrity > 30 ? 'bg-amber-400' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${adventureGame.dataIntegrity}%` }}
                                />
                              </div>
                            </div>

                            <div className="bg-slate-100/50 dark:bg-slate-950/20 p-2 rounded-xl border border-slate-200/20">
                              <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-1">
                                <span>⚠️ AGRESSIVITÉ IA</span>
                                <span className={`${adventureGame.aiAggression > 60 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-[#8ab4f8]'}`}>
                                  {adventureGame.aiAggression}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-300 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 transition-all duration-300"
                                  style={{ width: `${adventureGame.aiAggression}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Inventory Cash of Correctives */}
                          <div className="bg-slate-100/40 dark:bg-slate-950/15 p-2 rounded-xl border border-slate-200/10">
                            <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">🎒 Correctifs chargés en mémoire</span>
                            {adventureGame.inventory.length === 0 ? (
                              <span className="text-[9px] font-mono text-slate-500 italic block">Vide - Aucun correctif synchronisé</span>
                            ) : (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {adventureGame.inventory.map(item => (
                                  <span key={item} className="text-[8px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded-md shadow-xs">
                                    [✓] {item}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Direct Assist Controls panel (bridges Terminal input) */}
                          <div className="space-y-2">
                            <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold text-center">🧭 COMMANDES DE DIRECTION RAPIDE</span>
                            <div className="flex justify-center flex-col items-center gap-1">
                              <button
                                onClick={() => executeCommand('nord')}
                                className="w-16 py-1 text-[9px] font-bold font-mono bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                NORD ▲
                              </button>
                              <div className="flex gap-4">
                                <button
                                  onClick={() => executeCommand('ouest')}
                                  className="w-16 py-1 text-[9px] font-bold font-mono bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                                >
                                  ◀ OUEST
                                </button>
                                <button
                                  onClick={() => executeCommand('est')}
                                  className="w-16 py-1 text-[9px] font-bold font-mono bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                                >
                                  EST ▶
                                </button>
                              </div>
                              <button
                                onClick={() => executeCommand('sud')}
                                className="w-16 py-1 text-[9px] font-bold font-mono bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                              >
                                SUD ▼
                              </button>
                            </div>

                            {/* Direct diagnostic actions */}
                            <div className="grid grid-cols-2 gap-1.5 mt-2">
                              <button
                                onClick={() => executeCommand('regarder')}
                                className="py-1 px-2 border border-slate-200 dark:border-slate-800 text-[9px] font-mono rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all text-center cursor-pointer"
                              >
                                🔍 Regarder
                              </button>
                              <button
                                onClick={() => executeCommand('inspecter console')}
                                className="py-1 px-2 border border-slate-200 dark:border-slate-800 text-[9px] font-mono rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all text-center cursor-pointer"
                              >
                                🖥️ Inspecter Console
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {adventureGame.active && (
                      <button
                        onClick={() => {
                          setAdventureGame(prev => ({ ...prev, active: false, status: 'idle' }));
                          setHistory(prev => [
                            ...prev,
                            { type: 'info', text: '⚠️ Session d\'aventure textuelle SF fermée.' },
                            { type: 'output', text: '>>>' }
                          ]);
                        }}
                        className="py-1 px-2.5 border border-dashed border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-[10px] font-mono rounded-lg transition-all text-center mx-auto block cursor-pointer mt-2"
                      >
                        Suspendre [exit]
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
                    bash - {'dels_dinla@dels_host'}: {currentPath.length === 0 ? '/' : '/' + currentPath.join('/')}
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
              <div ref={scrollContainerRef} className="flex-grow p-6 overflow-y-auto font-mono text-[13px] leading-relaxed select-text text-slate-300 dark:text-slate-250 opacity-95 flex flex-col gap-2 relative scroll-smooth">
                
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
                  placeholder={isAskingGemini ? "Hermie AI réfléchit..." : "Tapez ls, cd projects, ou posez une question : ask <question>..."}
                  aria-label="Terminal script execution input"
                />
                
                <button
                  onClick={() => executeCommand(inputVal)}
                  disabled={isAskingGemini || !inputVal.trim()}
                  className="p-2 bg-accent/15 border border-accent/25 rounded-lg text-accent hover:bg-accent hover:text-white transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 text-xs shrink-0 font-mono font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Executer la commande"
                >
                  <RefreshCw size={11} className={`mr-0.5 ${isAskingGemini ? 'animate-spin' : ''}`} />
                  <span>{isAskingGemini ? "Hermie AI..." : "EXEC"}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Small aesthetic bottom helper text */}
        <p className="text-center font-mono text-[11px] text-slate-450 dark:text-slate-500 mt-6 select-none flex items-center justify-center gap-2">
          <span className="flex items-center gap-1"><Cpu size={11} className="text-emerald-500 shrink-0 animate-pulse" /> [vfs-engine: isolation mode]</span>
          <span>•</span>
          <span>Support: ↑ ↓ pour l'historique</span>
          <span>•</span>
          <span>Saisissez python3 projects/portfolio.py</span>
        </p>

      </div>
    </section>
  );
};
