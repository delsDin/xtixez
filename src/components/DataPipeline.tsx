import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Play, Pause, RefreshCw, Sliders, Database, Cpu, Layers, 
  AlertTriangle, Trash2, Webhook, FileCode, CheckCircle2, XCircle, 
  Terminal, ArrowRight, Zap, Info, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Payload {
  id: string;
  type: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  errorDetail?: string;
  stage: number; // 0: Ingest, 1: Validate, 2: Transform, 3: AI Enrich, 4: Target, 5: DLQ
  data: Record<string, any>;
  progress: number; // 0 to 1 along the segment
}

interface StageDetail {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconName: string;
  color: string;
  borderColor: string;
  glowColor: string;
  metricLabel: string;
  metricValue: number;
  status: 'active' | 'warning' | 'idle';
  tooltip: string;
}

const PAYLOAD_TYPES = [
  { id: 'telemetry', name: '📡 Télémétrie IoT', description: 'Capteurs climatiques & vibration' },
  { id: 'ecommerce', name: '🛒 Transaction E-Commerce', description: 'Commandes, paniers d\'achat & paiement' },
  { id: 'auth_logs', name: '🔑 Logs d\'Accès Securisés', description: 'Alertes SSH, connexions OAuth & IAM' },
  { id: 'custom_json', name: '🧪 Requête JSON Brute', description: 'Requêtes de debug personnalisées' },
];

export const DataPipeline: React.FC = () => {
  const { darkMode } = useTheme();
  
  // Pipeline settings
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [errorRate, setErrorRate] = useState<number>(15); // Percentage
  const [throughput, setThroughput] = useState<number>(1.5); // Packets per second (Hz)
  const [selectedPayloadType, setSelectedPayloadType] = useState<string>('telemetry');
  
  // Pipeline metrics
  const [stats, setStats] = useState({
    totalIngested: 1420,
    totalValidated: 1390,
    totalTransformed: 1250,
    totalEnriched: 1180,
    totalStored: 1162,
    totalDLQ: 18,
    averageLatency: 350, // ms
    throughputCalculated: 1.5, // items/sec
  });

  // State Management for Active/Moving Payloads
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [logs, setLogs] = useState<{ id: string; time: string; msg: string; type: 'info' | 'success' | 'error' | 'warning' }[]>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: 'Initialisation du pipeline de données Spark/WASM...', type: 'info' },
    { id: '2', time: new Date().toLocaleTimeString(), msg: 'Connexion établie avec l\'agent AI-Pipeline.', type: 'success' },
  ]);

  // Selected stage for detail panel
  const [selectedStageId, setSelectedStageId] = useState<number>(0);

  // Payload counter to guarantee unique IDs
  const payloadCounter = useRef<number>(2000);

  // Log sequence counter to guarantee unique IDs
  const logCounter = useRef<number>(100);

  // Stages array definition
  const stages: StageDetail[] = [
    {
      id: 0,
      name: 'ingestation',
      title: 'Ingestion Express',
      description: 'Collecteur multicanal d\'événements temps réel (Kafka, Web Sockets, webhooks)',
      icon: <Layers size={20} />,
      iconName: 'Layers',
      color: 'bg-emerald-500/10 text-emerald-500',
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-emerald-500/20',
      metricLabel: 'Débit Ingest',
      metricValue: stats.totalIngested,
      status: isPlaying ? 'active' : 'idle',
      tooltip: 'Reçoit le JSON brut de l\'application et lui appose un timestamp universel.'
    },
    {
      id: 1,
      name: 'validation',
      title: 'Valider & Filtrer',
      description: 'Vérification syntaxique, validation de typage et filtrage anti-brutality',
      icon: <CheckCircle2 size={20} />,
      iconName: 'CheckCircle2',
      color: 'bg-blue-500/10 text-blue-500',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/20',
      metricLabel: 'Validité Rate',
      metricValue: Math.round((stats.totalValidated / stats.totalIngested) * 100) || 100,
      status: isPlaying ? 'active' : 'idle',
      tooltip: 'Sépare les requêtes intègres du code malveillant ou corrompu.'
    },
    {
      id: 2,
      name: 'transformation',
      title: 'Normaliser & Parser',
      description: 'Interpolation, conversion logique, nettoyage et formatage des dates',
      icon: <FileCode size={20} />,
      iconName: 'FileCode',
      color: 'bg-amber-500/10 text-amber-500',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/20',
      metricLabel: 'Formatage',
      metricValue: stats.totalTransformed,
      status: isPlaying ? 'active' : 'idle',
      tooltip: 'Normalise tous les attributs en camelCase et standardise les coordonnées GPS.'
    },
    {
      id: 3,
      name: 'enrichment',
      title: 'IA & Enrichissement',
      description: 'Calcul d\'insights prédictifs, sentiment et tag par modèle Gemini intégré',
      icon: <Cpu size={20} />,
      iconName: 'Cpu',
      color: 'bg-indigo-500/10 text-indigo-500',
      borderColor: 'border-indigo-500/30',
      glowColor: 'shadow-indigo-500/20',
      metricLabel: 'Enrichi IA',
      metricValue: stats.totalEnriched,
      status: isPlaying ? 'active' : 'idle',
      tooltip: 'Fait appel à un moteur de scoring ultra-rapide pour enrichir la donnée.'
    },
    {
      id: 4,
      name: 'storage',
      title: 'Stockage & SQL',
      description: 'Persistance durable ACID ou acheminement vers BigQuery & Analytics',
      icon: <Database size={20} />,
      iconName: 'Database',
      color: 'bg-accent/10 text-accent',
      borderColor: 'border-accent/30',
      glowColor: 'shadow-accent/20',
      metricLabel: 'Base de donnée',
      metricValue: stats.totalStored,
      status: isPlaying ? 'active' : 'idle',
      tooltip: 'Base de données persistante synchronisée. Prêt pour les requêtes.'
    }
  ];

  // Helper to add logs efficiently
  const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    logCounter.current += 1;
    setLogs(prev => [
      { id: `log-${Date.now()}-${logCounter.current}-${Math.random()}`, time: new Date().toLocaleTimeString(), msg, type },
      ...prev.slice(0, 19) // Limit to 20 logs
    ]);
  };

  // Generate payload templates based on interactive types
  const createPayloadItem = (): Record<string, any> => {
    payloadCounter.current += 1;
    const isError = Math.random() * 100 < errorRate;

    switch (selectedPayloadType) {
      case 'ecommerce':
        return {
          id: `PAY-${payloadCounter.current}`,
          uid: `usr_${Math.floor(Math.random() * 9000 + 1000)}`,
          amount_eur: isError ? -49.99 : parseFloat((Math.random() * 180 + 5).toFixed(2)),
          items_count: isError ? 'undefined' : Math.floor(Math.random() * 5 + 1),
          payment_method: Math.random() > 0.4 ? 'STRIPE' : 'PAYPAL',
          success: !isError,
          client_ip: `193.51.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`,
        };
      case 'auth_logs':
        return {
          id: `LOG-${payloadCounter.current}`,
          user: isError ? "root_invalid" : `dev_${['dels', 'hopson', 'guest'][Math.floor(Math.random() * 3)]}`,
          action: isError ? 'SECURITY_BREACH' : 'OAUTH_LOGIN_SUCCESS',
          country: isError ? 'UNKNOWN_VPC_PROXY' : 'FRANCE',
          ip_addr: `10.0.12.${Math.floor(Math.random() * 250)}`,
          security_score: isError ? 12 : 98,
        };
      case 'custom_json':
        return {
          id: `DBG-${payloadCounter.current}`,
          debug_level: isError ? 'FATAL' : 'VERBOSE',
          stack_trace: isError ? 'NullPointerException error at router.tsx:42' : 'Null',
          compilation_ms: Math.floor(Math.random() * 80),
          env: 'production',
        };
      case 'telemetry':
      default:
        return {
          id: `TEL-${payloadCounter.current}`,
          sensor_node: `NODE-${Math.floor(Math.random() * 99 + 1)}`,
          temperature: isError ? 180.5 : parseFloat((Math.random() * 12 + 18).toFixed(1)), // Celsius
          vibration_ratio: parseFloat(Math.random().toFixed(3)),
          humidity: isError ? -5 : Math.floor(Math.random() * 30 + 40), // %
          flow_rate: '0.82 m/s',
        };
    }
  };

  // Triggered manual single-token injection
  const handleManualTrigger = () => {
    const dataObj = createPayloadItem();
    const packetId = dataObj.id;

    const newPayload: Payload = {
      id: packetId,
      type: selectedPayloadType.toUpperCase(),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      stage: 0,
      data: dataObj,
      progress: 0,
    };

    setPayloads(prev => [...prev, newPayload]);
    addLog(`📥 Injection manuelle du Payload ID: ${packetId}`, 'info');
  };

  // Trigger continuous simulation of data stream
  useEffect(() => {
    if (!isPlaying) return;

    // Stream speed depends on throughput slider
    const delay = 1000 / throughput;
    
    const interval = setInterval(() => {
      const dataObj = createPayloadItem();
      const packetId = dataObj.id;

      const newPayload: Payload = {
        id: packetId,
        type: selectedPayloadType.toUpperCase(),
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending',
        stage: 0,
        data: dataObj,
        progress: 0,
      };

      setPayloads(prev => [...prev, newPayload]);
      
      // Keep state totals updated
      setStats(prev => ({
        ...prev,
        totalIngested: prev.totalIngested + 1,
      }));

    }, delay);

    return () => clearInterval(interval);
  }, [isPlaying, throughput, selectedPayloadType, errorRate]);


  // Drive moving packets through stages frame by frame (timer transition loop)
  useEffect(() => {
    const frameRate = 30; // Milliseconds per frame update
    const speedMultiplier = 0.05 * throughput; // Travel velocity relative to throughput slider

    const interval = setInterval(() => {
      setPayloads(prevPayloads => {
        const nextPayloads: Payload[] = [];

        for (const p of prevPayloads) {
          let updatedProgress = p.progress + speedMultiplier;

          if (updatedProgress >= 1) {
            // Target stage completed! Move to next node or finish
            const currentStage = p.stage;
            const nextStage = currentStage + 1;
            
            // Failure check specifically at stage boundary (Validation stage 1)
            let isFailed = false;
            let failureDetail = '';

            if (currentStage === 0) {
              // From Ingest to Validate: Evaluate if payload holds fraudulent metadata simulation
              const hasErrors = 
                (p.data.temperature !== undefined && (p.data.temperature > 100 || p.data.humidity < 0)) ||
                (p.data.amount_eur !== undefined && p.data.amount_eur < 0) ||
                (p.data.security_score !== undefined && p.data.security_score < 25) ||
                (p.data.debug_level === 'FATAL');

              if (hasErrors) {
                isFailed = true;
                failureDetail = p.data.amount_eur < 0 
                  ? 'Err_NegativePaymentAmount' 
                  : p.data.humidity < 0 
                    ? 'Err_NegativeSensorHumidity_Rejected' 
                    : p.data.security_score < 25 
                      ? 'Err_Sec_LowScore_VpcProxyThreat' 
                      : 'Err_FatalStacktrace_CrashAlert';
              }
            }

            if (isFailed) {
              // Route to DLQ (Stage ID 5)
              addLog(`🚨 Alert Pipeline: Validation erronée pour ${p.id}. Motif: ${failureDetail}. Envoi vers le Dead Letter Queue (DLQ).`, 'error');
              setStats(s => ({
                ...s,
                totalDLQ: s.totalDLQ + 1
              }));
              
              nextPayloads.push({
                ...p,
                stage: 5, // Branch out to DLQ Stage
                status: 'failed',
                errorDetail: failureDetail,
                progress: 0,
              });
            } else if (nextStage < 5) {
              // Successfully entering next stage!
              // Perform stats increment
              if (nextStage === 1) setStats(s => ({ ...s, totalValidated: s.totalValidated + 1 }));
              if (nextStage === 2) setStats(s => ({ ...s, totalTransformed: s.totalTransformed + 1 }));
              if (nextStage === 3) setStats(s => ({ ...s, totalEnriched: s.totalEnriched + 1 }));
              if (nextStage === 4) {
                setStats(s => ({ ...s, totalStored: s.totalStored + 1 }));
                addLog(`✓ Payload ${p.id} persisté avec succès dans Cloud SQL. (Temps: ${Math.floor(Math.random() * 150 + 200)}ms)`, 'success');
              }

              nextPayloads.push({
                ...p,
                stage: nextStage,
                progress: 0, // Reset progress for the segment
              });
            } else {
              // Completed final storage node (Stage 4) - safely terminate animation
            }
          } else if (p.stage === 5 && updatedProgress > 0.8) {
            // Reached end of Dead Letter Queue visual track, safely drop
          } else {
            // Keep traveling along active segment
            nextPayloads.push({
              ...p,
              progress: updatedProgress,
            });
          }
        }

        return nextPayloads;
      });
    }, frameRate);

    return () => clearInterval(interval);
  }, [throughput]);

  const clearStatsAndConsole = () => {
    setPayloads([]);
    logCounter.current += 1;
    setLogs([
      { id: `log-clear-${Date.now()}-${logCounter.current}`, time: new Date().toLocaleTimeString(), msg: '🗑️ Historique de debug et piles effacés.', type: 'info' }
    ]);
    setStats({
      totalIngested: 0,
      totalValidated: 0,
      totalTransformed: 0,
      totalEnriched: 0,
      totalStored: 0,
      totalDLQ: 0,
      averageLatency: 280,
      throughputCalculated: throughput,
    });
  };

  return (
    <section id="pipeline" className="py-20 bg-transparent text-slate-800 dark:text-slate-200">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header Unit */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-light text-accent text-xs font-bold border border-accent/20 mb-4"
          >
            <Activity size={14} className="animate-pulse" />
            <span>STUDIO DE DONNÉES TEMPS RÉEL</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Pipeline de Données <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">Animé & Interactif</span>
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Observez, inspectez et modifiez le transit des micro-packages logiques au travers de notre 
            architecture d'enrichissement. Ajustez les tolérances système pour simuler des ruptures de pipeline.
          </p>
        </div>

        {/* Dynamic State Overview Bar (Bento-styled) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          
          <div className="p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-405 font-[500]">Ingestion de Flux</span>
            <span className="text-2xl font-bold font-mono text-emerald-500 mt-2">{stats.totalIngested}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-mono">Total Packets</span>
          </div>

          <div className="p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-405 font-[500]">Validations OK</span>
            <span className="text-2xl font-bold font-mono text-blue-500 mt-2">{stats.totalValidated}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-mono">Format Vérifié</span>
          </div>

          <div className="p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-405 font-[500]">Modèle IA Gemini</span>
            <span className="text-2xl font-bold font-mono text-indigo-500 mt-2">{stats.totalEnriched}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-mono">Enrichissements</span>
          </div>

          <div className="p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-405 font-[500]">Base de Données</span>
            <span className="text-2xl font-bold font-mono text-accent mt-2">{stats.totalStored}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-mono">Sync ACID SQL</span>
          </div>

          <div className="p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between col-span-1">
            <span className="text-xs text-slate-650 dark:text-slate-400 font-[500] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              DLQ Rejetés
            </span>
            <span className="text-2xl font-bold font-mono text-rose-500 mt-2">{stats.totalDLQ}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-mono">Dead Letter Queue</span>
          </div>

          <div className="p-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between col-span-1">
            <span className="text-xs text-slate-600 dark:text-slate-405 font-[500]">Latence de Transit</span>
            <span className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-350 mt-2">{stats.averageLatency}ms</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-mono">Calculé (en direct)</span>
          </div>

        </div>

        {/* Dashboard grid panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main simulation graphic panel (interactive nodes & flying packets) */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md rounded-3xl border border-slate-800 p-4 sm:p-6 flex-grow flex flex-col relative overflow-hidden shadow-xl min-h-[380px] sm:min-h-[440px]">
              
              {/* Header bar of simulator - Refactored for complete mobile safety without absolute overlaps */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4 text-xs font-mono relative z-20">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] md:text-[11px] text-slate-500 bg-slate-800/45 px-2.5 py-1 rounded">
                    STREAM ENGINE v2.2 - WASM
                  </span>
                  {isPlaying ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SIMULATION EN DIRECT
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 font-mono bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      SIMULATION PAUSÉE
                    </span>
                  )}
                </div>

                <button 
                  onClick={clearStatsAndConsole}
                  className="p-1.5 px-2.5 rounded bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer text-xs flex items-center gap-1.5 font-mono"
                  title="Repartir à zéro"
                >
                  <Trash2 size={12} />
                  <span>VIDER</span>
                </button>
              </div>

              {/* Visual Grid Track */}
              <div className="flex-grow flex flex-col justify-center py-6 sm:py-10 relative z-10 w-full min-h-[220px] sm:min-h-[300px]">
                
                {/* SVG Connecting Tracks & Rails */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '220px' }}>
                  {/* Dynamic glow filter */}
                  <defs>
                    <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Connecting line segments between Stage 0 -> 1 -> 2 -> 3 -> 4 */}
                  {/* Stages layout points (representing x percentage coordinates) */}
                  {/* Stage 0 (Ingest): x=10% or absolute layout steps */}
                  {/* We draw static connecting path line */}
                  <line x1="12%" y1="50%" x2="31%" y2="50%" stroke="rgba(100, 116, 139, 0.25)" strokeWidth="4" />
                  <line x1="31%" y1="50%" x2="50%" y2="50%" stroke="rgba(100, 116, 139, 0.25)" strokeWidth="4" />
                  <line x1="50%" y1="50%" x2="69%" y2="50%" stroke="rgba(100, 116, 139, 0.25)" strokeWidth="4" />
                  <line x1="69%" y1="50%" x2="88%" y2="50%" stroke="rgba(100, 116, 139, 0.25)" strokeWidth="4" />

                  {/* Auxiliary path branch for DLQ failures branching from Stage 1 (Validate) to Dead Letter Queue (bottom axis) */}
                  <path d="M 31% 50% Q 31% 85% 50% 85%" fill="transparent" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="3" strokeDasharray="5,5" />

                  {/* Active telemetry signal pulses running backward / forward */}
                  {isPlaying && (
                    <>
                      <line x1="12%" y1="50%" x2="31%" y2="50%" stroke="#10b981" strokeWidth="2" strokeDasharray="6,24" className="stroke-[2.5]" style={{ strokeDashoffset: '100', animation: 'dash 4s linear infinite' }} />
                      <line x1="31%" y1="50%" x2="50%" y2="50%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,24" className="stroke-[2.5]" style={{ strokeDashoffset: '120', animation: 'dash 5s linear infinite' }} />
                      <line x1="50%" y1="50%" x2="69%" y2="50%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,24" className="stroke-[2.5]" style={{ strokeDashoffset: '140', animation: 'dash 4s linear infinite' }} />
                      <line x1="69%" y1="50%" x2="88%" y2="50%" stroke="#6366f1" strokeWidth="2" strokeDasharray="6,24" className="stroke-[2.5]" style={{ strokeDashoffset: '160', animation: 'dash 6s linear infinite' }} />
                    </>
                  )}
                </svg>

                {/* Inline Style to support dashed line animation simply */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -200;
                    }
                  }
                `}} />

                {/* Main Horizontal stage flow layout */}
                <div className="flex justify-between items-center w-full px-1 sm:px-2 z-20 relative">
                  {stages.map((stage) => {
                    const isSelected = selectedStageId === stage.id;
                    return (
                      <div 
                        key={stage.id}
                        className="flex flex-col items-center flex-1"
                        style={{ maxWidth: '18%' }}
                      >
                        <button
                          onClick={() => setSelectedStageId(stage.id)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center p-2 sm:p-2.5 md:p-3 transition-all relative cursor-pointer border-2 ${
                            isSelected 
                              ? 'bg-slate-800 border-accent shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-110' 
                              : 'bg-slate-900/90 border-slate-800 dark:hover:border-slate-700'
                          } ${stage.color}`}
                        >
                          <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 md:[&>svg]:w-[20px] md:[&>svg]:h-[20px]">
                            {stage.icon}
                          </span>

                          {/* Pulsing indicator when stream is active */}
                          {isPlaying && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/80 flex items-center justify-center">
                              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            </span>
                          )}
                        </button>
                        
                        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold font-mono tracking-tight text-slate-100 mt-1 sm:mt-2 md:mt-2.5 text-center truncate w-full px-0.5">
                          <span className="block sm:hidden">
                            {stage.id === 0 ? "Ingest" :
                             stage.id === 1 ? "Valid" :
                             stage.id === 2 ? "Norm" :
                             stage.id === 3 ? "IA" : "Store"}
                          </span>
                          <span className="hidden sm:block">
                            {stage.title}
                          </span>
                        </span>
                        
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-mono mt-0.5 font-semibold text-center leading-none">
                          <span className="hidden xs:inline">{stage.metricLabel.split(' ')[0]}:</span> <span className="text-white font-bold">{stage.metricValue}{stage.id === 1 ? '%' : ''}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* DLQ (Dead Letter Queue) Container Bottom aligned */}
                <div className="absolute bottom-1 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                  <button
                    onClick={() => setSelectedStageId(5)}
                    className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                      selectedStageId === 5 
                        ? 'bg-slate-850 border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105' 
                        : 'bg-slate-900 border-slate-850 hover:border-slate-800'
                    } text-rose-500 bg-rose-500/10`}
                  >
                    <AlertTriangle size={15} className="sm:size-[18px]" />
                  </button>
                  <span className="text-[8px] sm:text-[10px] font-bold font-mono text-rose-400 mt-1 uppercase tracking-wider text-center">
                    <span className="block sm:hidden">DLQ</span>
                    <span className="hidden sm:block">Dead Letter Queue (DLQ)</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 leading-none mt-0.5">
                    Rejetés: <span className="text-white font-bold">{stats.totalDLQ}</span>
                  </span>
                </div>

                {/* FLYING DATA PACKETS RENDERER */}
                <div className="absolute inset-0 pointer-events-none z-30">
                  {payloads.map((packet) => {
                    // Position calculating depending on status & stage
                    // Stage coordinates range definitions
                    // Stage locations along the horizontal X axis: Ingest(11%), Validate(30.5%), Transform(50%), Enrichment(69.5%), Storage(89%)
                    const xCoords = [11, 30.5, 50, 69.5, 89];
                    
                    let leftPct = 11;
                    let topPct = 50;

                    if (packet.stage < 4) {
                      const startX = xCoords[packet.stage];
                      const endX = xCoords[packet.stage + 1];
                      leftPct = startX + (endX - startX) * packet.progress;
                      topPct = 50; // straight horizontal line
                    } else if (packet.stage === 4) {
                      leftPct = xCoords[4];
                      topPct = 50;
                    } else if (packet.stage === 5) {
                      // Custom Bezier curve simulation branching from Stage 1 (Validate 30.5%) to DLQ (Center: 50%, Y: 85%)
                      const startX = 30.5;
                      const endX = 50;
                      leftPct = startX + (endX - startX) * packet.progress;
                      
                      // Simulate parabolical fall
                      const progress = packet.progress;
                      topPct = 50 + (35 * (progress * progress)); // Curve downwards to 85%
                    }

                    // Packet color based on type
                    let packetBg = 'bg-emerald-500';
                    if (packet.stage === 0) packetBg = 'bg-emerald-400';
                    else if (packet.stage === 1) packetBg = 'bg-blue-400';
                    else if (packet.stage === 2) packetBg = 'bg-amber-400';
                    else if (packet.stage === 3) packetBg = 'bg-indigo-400';
                    else if (packet.stage === 4) packetBg = 'bg-accent';
                    else if (packet.stage === 5) packetBg = 'bg-rose-500';

                    return (
                      <motion.div
                        key={packet.id}
                        className={`absolute w-3 h-3 rounded-full ${packetBg} shadow-[0_0_8px_currentColor] -ml-1.5 -mt-1.5 flex items-center justify-center`}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        <span className="absolute -top-5 text-[9px] font-mono font-bold text-slate-300 drop-shadow-md select-none shrink-0">
                          {packet.id.split('-')[1]}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

              </div>

              {/* Action Toolbar on Bottom - Responsive stacked layout to avoid overcrowding on small screens */}
              <div className="border-t border-slate-900 pt-4 sm:pt-5 mt-auto flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                
                {/* Simulated variables control & controls */}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-2.5 px-4 sm:px-5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all select-none ${
                      isPlaying 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/35' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                    <span>{isPlaying ? 'PAUSER LE FLUX' : 'ACTIVER LE FLUX'}</span>
                  </button>

                  <button
                    onClick={handleManualTrigger}
                    className="p-2.5 px-4 rounded-xl font-bold font-mono text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 cursor-pointer active:scale-95 transition-all select-none flex items-center justify-center gap-1.5"
                  >
                    <Zap size={12} className="text-amber-400 fill-amber-400 animate-bounce" />
                    <span>INJECTER UN PACKET</span>
                  </button>
                </div>

                {/* Dropdown stream data type choice */}
                <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-slate-850/50 sm:border-0 pt-3 sm:pt-0">
                  <span className="text-xs font-mono text-slate-400">Flux:</span>
                  <select
                    value={selectedPayloadType}
                    onChange={(e) => setSelectedPayloadType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 font-mono text-xs text-white rounded-lg px-2.5 py-2 outline-none cursor-pointer focus:border-accent flex-grow sm:flex-grow-0"
                  >
                    {PAYLOAD_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

              </div>

            </div>
          </div>

          {/* Settings & Selected Node Detail Panel (Sidebar 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Live Sliders / Adjuster Box */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-405 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-5 font-mono">
                <Sliders size={16} className="text-accent" />
                <span>Paramètres de Simulation</span>
              </h3>

              <div className="space-y-6">
                
                {/* Throughput slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Débit d'ingestion (Hz)</span>
                    <span className="text-accent font-black">{throughput} packets/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.5"
                    value={throughput}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setThroughput(val);
                      addLog(`⚡ Débit d'ingestion modifié sur : ${val} Hz`, 'info');
                    }}
                    className="w-full accent-accent bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>Lent</span>
                    <span>Modéré</span>
                    <span>Temps-Réel Instable (Pro)</span>
                  </div>
                </div>

                {/* Error percentage slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Taux d'erreurs (Simulation)</span>
                    <span className="text-rose-400 font-black">{errorRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="75"
                    step="5"
                    value={errorRate}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setErrorRate(val);
                      addLog(`⚠️ Taux d'erreurs du flux positionné sur : ${val}%`, 'warning');
                    }}
                    className="w-full accent-rose-500 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>Zéro Échec (0%)</span>
                    <span>Réseau Perturbé</span>
                    <span>Panne Générale (75%)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Selected Node Details Box (Changes when users click stages in graph) */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800 flex-grow flex flex-col">
              
              {/* Selected Tab Head */}
              {selectedStageId === 5 ? (
                // DLQ Special Detail
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-550 border-rose-500/20">
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                        Dead Letter Queue (DLQ)
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mt-0.5">
                        File d'attente des échecs
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-4">
                    Les données rejetées par le micro-validateur finissent ici. Ce conteneur évite que les erreurs 
                    ne fassent écrouler les bases SQL en aval. Vos équipes d'ingénieurs peuvent ensuite les réinsérer.
                  </p>

                  <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/15 font-mono text-[11px] leading-relaxed text-rose-300">
                    <div className="font-bold mb-1 flex items-center gap-1">
                      <ShieldAlert size={12} /> COMPTEUR DE FAILURES : {stats.totalDLQ}
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400 dark:text-slate-350">
                      <li>Taux d'échecs planifiés: {errorRate}%</li>
                      <li>Vérification: Schéma erroné rejeté</li>
                      <li>Conséquence: Transaction avortée</li>
                    </ul>
                  </div>
                </div>
              ) : (
                // Normal Stage Detail
                (() => {
                  const s = stages.find(item => item.id === selectedStageId) || stages[0];
                  return (
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className={`p-3 rounded-2xl ${s.color} border border-slate-200/30 dark:border-slate-800`}>
                          {s.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                            {s.title}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-0.5">
                            Étape {s.id + 1} du Pipeline
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-4">
                        {s.description}
                      </p>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 font-mono text-[11px] space-y-3">
                        <div className="flex justify-between items-center py-0.5 border-b border-dashed border-slate-200 dark:border-slate-900">
                          <span className="text-slate-400">Status logique</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            ACTIF
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-dashed border-slate-200 dark:border-slate-900">
                          <span className="text-slate-400">Total traité</span>
                          <span className="text-white font-bold">{s.metricValue} items</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Action interne</span>
                          <span className="text-slate-300 text-right max-w-[150px] truncate">{s.tooltip}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Display code logic drawer preview inside sidebar */}
              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  Code Interne (Mock Parser)
                </span>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 font-mono text-[10px] leading-relaxed text-emerald-400 overflow-x-auto">
                  <span className="text-blue-400">def</span> <span className="text-amber-300">process_event</span>(payload):<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;timestamp = time.now()<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Schema integrity checks</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">if</span> payload[<span className="text-accent">'status'</span>] == <span className="text-rose-400">"fraud"</span>:<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">raise</span> PipelineException(<span className="text-rose-400">"DLQ_Routing"</span>)<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> payload
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Live Tracking Console Logs stream (Logs block spanning full width at bottom) */}
        <div className="mt-8 bg-slate-900 dark:bg-slate-950/95 rounded-3xl border border-slate-800/80 p-5 overflow-hidden shadow-md">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-3 select-none">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-accent" />
              <span className="text-xs font-bold font-mono text-white">Live Pipeline JSON Console Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono text-slate-500">LISTENING ON HOOKS...</span>
            </div>
          </div>

          <div className="font-mono text-[11px] leading-relaxed max-h-[160px] overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
            <AnimatePresence>
              {logs.map((log) => {
                let textCol = 'text-slate-400';
                if (log.type === 'success') textCol = 'text-emerald-400 font-medium';
                else if (log.type === 'error') textCol = 'text-rose-400 font-bold bg-rose-950/20 px-2 py-0.5 rounded border border-rose-950/40 inline-block w-full';
                else if (log.type === 'warning') textCol = 'text-amber-400 font-medium';

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2.5 hover:bg-slate-850/30 p-0.5 rounded transition-colors"
                  >
                    <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                    <span className={`${textCol} flex-grow`}>{log.msg}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
};
