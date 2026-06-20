import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RefreshCw, Sliders, Cpu, Activity, Info, Trash2, Plus, 
  Brain, Target, Sparkles, AlertTriangle, ChevronRight, Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Datasets interfaces
interface DataPoint {
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
  label: number; // 0 or 1 for Classification, or real value for Regression, or cluster group
}

interface WeightConnection {
  fromNode: number;
  toNode: number;
  weight: number;
}

export const MLPlayground: React.FC = () => {
  const { darkMode } = useTheme();
  
  // Tabs: 'classification' | 'clustering' | 'regression'
  const [activeTab, setActiveTab] = useState<'classification' | 'clustering' | 'regression'>('classification');
  
  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [epochs, setEpochs] = useState<number>(0);
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [noise, setNoise] = useState<number>(0.15);
  const [datasetType, setDatasetType] = useState<string>('moons'); // moons, circles, separable, spirals
  
  // Model Parameters
  const [activation, setActivation] = useState<'tanh' | 'sigmoid' | 'relu'>('tanh');
  const [hiddenNodes, setHiddenNodes] = useState<number>(4);
  const [loss, setLoss] = useState<number>(0.5);
  const [accuracy, setAccuracy] = useState<number>(50);
  
  // Clustering Parameters
  const [kClusters, setKClusters] = useState<number>(3);
  const [clusteringStep, setClusteringStep] = useState<number>(0);
  const [centroids, setCentroids] = useState<{ x: number; y: number; color: string }[]>([]);
  
  // Regression Parameters
  const [polyDegree, setPolyDegree] = useState<number>(3); // 1 to 5 degree polynomial
  const [regressionLoss, setRegressionLoss] = useState<number>(0.2);

  // Core Data
  const [points, setPoints] = useState<DataPoint[]>([]);
  const [hoveredNode, setHoveredNode] = useState<{ layer: number; index: number } | null>(null);
  const [logs, setLogs] = useState<{ id: string; time: string; msg: string; type: 'info' | 'success' | 'warn' | 'neural' }[]>([]);
  
  // Ref to hold current model state for fast neural net simulation
  const neuralNetRef = useRef<{
    wih: number[][]; // Weights Input -> Hidden
    bih: number[];   // Biases Hidden
    who: number[];   // Weights Hidden -> Output
    bo: number;      // Bias Output
  }>({
    wih: [],
    bih: [],
    who: [],
    bo: 0
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trainingIntervalRef = useRef<number | null>(null);
  const logIdCounter = useRef<number>(0);

  // Helper to push stylized logs
  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'neural' = 'info') => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    const id = `log_${logIdCounter.current++}_${Date.now()}`;
    setLogs(prev => [
      { id, time, msg, type },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // Helper activations and derivatives
  const activate = (x: number, type: 'tanh' | 'sigmoid' | 'relu') => {
    if (type === 'tanh') return Math.tanh(x);
    if (type === 'sigmoid') return 1 / (1 + Math.exp(-x));
    if (type === 'relu') return Math.max(0, x);
    return x;
  };

  const activateDerivative = (activatedVal: number, type: 'tanh' | 'sigmoid' | 'relu') => {
    if (type === 'tanh') return 1 - activatedVal * activatedVal;
    if (type === 'sigmoid') return activatedVal * (1 - activatedVal);
    if (type === 'relu') return activatedVal > 0 ? 1 : 0;
    return 1;
  };

  // 1. Initialize Datasets
  const generateDataset = (type: string, noiseVal: number, tab = activeTab) => {
    setIsPlaying(false);
    setEpochs(0);
    const generated: DataPoint[] = [];
    const count = tab === 'regression' ? 60 : (tab === 'clustering' ? 120 : 150);

    addLog(`Génération du jeu de données [Mode: ${tab.toUpperCase()} - Type: ${type.toUpperCase()}] avec bruit de ${Math.round(noiseVal * 100)}%`, 'info');

    if (tab === 'classification') {
      if (type === 'moons') {
        const half = Math.floor(count / 2);
        for (let i = 0; i < half; i++) {
          const theta = (i / half) * Math.PI;
          const x = Math.cos(theta) + (Math.random() - 0.5) * noiseVal;
          const y = Math.sin(theta) + (Math.random() - 0.5) * noiseVal - 0.2;
          generated.push({ x: x * 0.75, y: y * 0.75, label: 1 });
        }
        for (let i = 0; i < half; i++) {
          const theta = (i / half) * Math.PI;
          const x = 1 - Math.cos(theta) + (Math.random() - 0.5) * noiseVal;
          const y = 0.4 - Math.sin(theta) + (Math.random() - 0.5) * noiseVal - 0.2;
          generated.push({ x: (x - 0.5) * 0.75, y: (y + 0.1) * 0.75, label: 0 });
        }
      } else if (type === 'circles') {
        const half = Math.floor(count / 2);
        // Inner circle
        for (let i = 0; i < half; i++) {
          const r = 0.35 + (Math.random() - 0.5) * noiseVal * 0.3;
          const theta = (i / half) * 2 * Math.PI;
          generated.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), label: 1 });
        }
        // Outer circle
        for (let i = 0; i < half; i++) {
          const r = 0.8 + (Math.random() - 0.5) * noiseVal * 0.3;
          const theta = (i / half) * 2 * Math.PI;
          generated.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), label: 0 });
        }
      } else if (type === 'separable') {
        for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * 1.8;
          const y = (Math.random() - 0.5) * 1.8;
          // Separate using y > x line
          const margin = 0.1;
          const label = y > x ? 1 : 0;
          // Add some gap + noise
          if (Math.abs(y - x) > margin) {
            generated.push({ x: x + (Math.random() - 0.5) * noiseVal * 0.3, y: y + (Math.random() - 0.5) * noiseVal * 0.3, label });
          }
        }
      } else if (type === 'spirals') {
        const half = Math.floor(count / 2);
        for (let i = 0; i < half; i++) {
          const r = (i / half) * 0.95;
          const theta = (i / half) * 5 + 0.0;
          generated.push({ 
            x: r * Math.cos(theta) + (Math.random() - 0.5) * noiseVal * 0.15, 
            y: r * Math.sin(theta) + (Math.random() - 0.5) * noiseVal * 0.15, 
            label: 1 
          });
        }
        for (let i = 0; i < half; i++) {
          const r = (i / half) * 0.95;
          const theta = (i / half) * 5 + Math.PI;
          generated.push({ 
            x: r * Math.cos(theta) + (Math.random() - 0.5) * noiseVal * 0.15, 
            y: r * Math.sin(theta) + (Math.random() - 0.5) * noiseVal * 0.15, 
            label: 0 
          });
        }
      }
    } else if (tab === 'clustering') {
      // Create cluster groups
      const numCenters = kClusters;
      const centers = [];
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
      
      for (let i = 0; i < numCenters; i++) {
        const angle = (i / numCenters) * 2 * Math.PI;
        centers.push({
          x: 0.55 * Math.cos(angle) + (Math.random() - 0.5) * 0.1,
          y: 0.55 * Math.sin(angle) + (Math.random() - 0.5) * 0.1,
          color: colors[i % colors.length]
        });
      }

      setCentroids(centers.map(c => ({
        x: c.x + (Math.random() - 0.5) * 0.2,
        y: c.y + (Math.random() - 0.5) * 0.2,
        color: c.color
      })));

      setClusteringStep(0);

      const pointsPerCenter = Math.floor(count / numCenters);
      for (let c = 0; c < numCenters; c++) {
        for (let p = 0; p < pointsPerCenter; p++) {
          // Gaussian distribution approximation
          const r = Math.sqrt(-2.0 * Math.log(Math.random() || 0.01)) * 0.14 * (1 + noiseVal);
          const theta = Math.random() * 2 * Math.PI;
          generated.push({
            x: centers[c].x + r * Math.cos(theta),
            y: centers[c].y + r * Math.sin(theta),
            label: -1 // Unassigned initially
          });
        }
      }
    } else if (tab === 'regression') {
      if (type === 'sine') {
        for (let i = 0; i < count; i++) {
          const x = (i / count) * 1.8 - 0.9; // From -0.9 to 0.9
          const cleanY = Math.sin(x * Math.PI);
          const y = cleanY + (Math.random() - 0.5) * noiseVal * 0.6;
          generated.push({ x, y, label: 0 }); // Label is dummy
        }
      } else if (type === 'parabola') {
        for (let i = 0; i < count; i++) {
          const x = (i / count) * 1.8 - 0.9;
          const cleanY = 1.3 * x * x - 0.4;
          const y = cleanY + (Math.random() - 0.5) * noiseVal * 0.5;
          generated.push({ x, y, label: 0 });
        }
      } else if (type === 'linear') {
        for (let i = 0; i < count; i++) {
          const x = (i / count) * 1.8 - 0.9;
          const cleanY = 0.8 * x + 0.1;
          const y = cleanY + (Math.random() - 0.5) * noiseVal * 0.4;
          generated.push({ x, y, label: 0 });
        }
      }
    }

    setPoints(generated);
    if (tab === 'classification') {
      initializeNeuralNetwork();
    }
  };

  // 2. Initialize Neural Network weights
  const initializeNeuralNetwork = () => {
    const nodes = hiddenNodes;
    // Input is 2 nodes (x, y)
    const wih: number[][] = [];
    const bih: number[] = [];
    const who: number[] = [];
    
    for (let h = 0; h < nodes; h++) {
      wih.push([
        (Math.random() - 0.5) * 2.0, // Weight from Input x
        (Math.random() - 0.5) * 2.0  // Weight from Input y
      ]);
      bih.push((Math.random() - 0.5) * 0.5); // Bias hidden
      who.push((Math.random() - 0.5) * 2.0); // Weight to output
    }
    const bo = (Math.random() - 0.5) * 0.5; // Bias output
    
    neuralNetRef.current = { wih, bih, who, bo };
    setLoss(0.7);
    setAccuracy(50);
  };

  // Run initial generator once
  useEffect(() => {
    // Determine appropriate type for tab
    let type = 'moons';
    if (activeTab === 'clustering') type = 'clusters';
    else if (activeTab === 'regression') type = 'sine';
    
    generateDataset(type, noise, activeTab);
    
    return () => {
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
      }
    };
  }, [activeTab, kClusters]);

  // Re-initialize network when hidden nodes count changes
  useEffect(() => {
    if (activeTab === 'classification') {
      initializeNeuralNetwork();
    }
  }, [hiddenNodes]);

  // Handle live training interval loop
  useEffect(() => {
    if (isPlaying) {
      addLog(`Mise en route de l'optimiseur de calcul...`, 'success');
      const intervalMs = activeTab === 'classification' ? 50 : 350;
      trainingIntervalRef.current = window.setInterval(() => {
        handleTrainStep();
      }, intervalMs);
    } else {
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
        trainingIntervalRef.current = null;
      }
    }
    return () => {
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
        trainingIntervalRef.current = null;
      }
    };
  }, [isPlaying, points, learningRate, hiddenNodes, activation, polyDegree]);

  // Quick training logic
  const handleTrainStep = () => {
    if (points.length === 0) return;

    if (activeTab === 'classification') {
      trainNeuralNetworkOneEpoch();
    } else if (activeTab === 'clustering') {
      trainClusteringOneStep();
    } else if (activeTab === 'regression') {
      trainRegressionOneEpoch();
    }
  };

  // Neural Network custom Epoch Trainer
  const trainNeuralNetworkOneEpoch = () => {
    const net = { ...neuralNetRef.current };
    const lr = learningRate;
    const act = activation;

    // Safely copy weights, initializing on the fly if state changed asynchronously
    const wih = Array.from({ length: hiddenNodes }).map((_, h) => {
      const existing = net.wih?.[h] || [];
      return [
        existing[0] ?? (Math.random() - 0.5) * 2.0,
        existing[1] ?? (Math.random() - 0.5) * 2.0
      ];
    });
    const bih = Array.from({ length: hiddenNodes }).map((_, h) => net.bih?.[h] ?? (Math.random() - 0.5) * 0.5);
    const who = Array.from({ length: hiddenNodes }).map((_, h) => net.who?.[h] ?? (Math.random() - 0.5) * 2.0);
    let bo = net.bo ?? (Math.random() - 0.5) * 0.5;

    let accumLoss = 0;
    let correctCount = 0;

    // Mini batch or full batch. We do a stochastic/mini-batch gradient step for each point to train quickly!
    for (const p of points) {
      // 1. Forward process
      const hOutputs: number[] = [];
      const hInputs: number[] = [];

      for (let h = 0; h < hiddenNodes; h++) {
        const sum = wih[h][0] * p.x + wih[h][1] * p.y + bih[h];
        hInputs.push(sum);
        hOutputs.push(activate(sum, act));
      }

      let outSum = bo;
      for (let h = 0; h < hiddenNodes; h++) {
        outSum += hOutputs[h] * who[h];
      }
      const outputVal = activate(outSum, 'sigmoid'); // Always sigmoid for output classification [0, 1]

      // Accum Loss & stats (Binary Cross Entropy style approximation or MSE)
      const target = p.label;
      accumLoss += 0.5 * Math.pow(target - outputVal, 2);
      
      const predictedLabel = outputVal >= 0.5 ? 1 : 0;
      if (predictedLabel === target) {
        correctCount++;
      }

      // Backpropagation
      const outputDelta = (outputVal - target) * activateDerivative(outputVal, 'sigmoid'); // dLoss/dOut * dOut/dSum

      // Gradient with respect to output weights who
      const whoGradients = hOutputs.map(hOut => outputDelta * hOut);
      const boGradient = outputDelta;

      // Gradients with respect to hidden layer
      const hiddenDeltas: number[] = [];
      for (let h = 0; h < hiddenNodes; h++) {
        const dSum = outputDelta * who[h];
        const dAct = dSum * activateDerivative(hOutputs[h], act);
        hiddenDeltas.push(dAct);
      }

      // Weight modifications
      // Update Output layer
      for (let h = 0; h < hiddenNodes; h++) {
        who[h] -= lr * whoGradients[h];
      }
      bo -= lr * boGradient;

      // Update Hidden layer
      for (let h = 0; h < hiddenNodes; h++) {
        wih[h][0] -= lr * hiddenDeltas[h] * p.x;
        wih[h][1] -= lr * hiddenDeltas[h] * p.y;
        bih[h] -= lr * hiddenDeltas[h];
      }
    }

    // Assign back
    neuralNetRef.current = { wih, bih, who, bo };

    // Update state variables for display
    const finalAccuracy = Math.round((correctCount / points.length) * 100);
    const finalLoss = accumLoss / points.length;

    setLoss(prev => {
      const targetLoss = finalLoss;
      // Smooth decay display
      return parseFloat((prev * 0.7 + targetLoss * 0.3).toFixed(4));
    });
    setAccuracy(finalAccuracy);
    setEpochs(prev => prev + 1);

    if (epochs > 0 && epochs % 100 === 0) {
      addLog(`[NN] Époque ${epochs}: Loss = ${finalLoss.toFixed(4)} | Précision = ${finalAccuracy}%`, 'neural');
    }
  };

  // K-Means Clustering Step
  const trainClusteringOneStep = () => {
    if (centroids.length === 0) return;

    // Copy centroids state
    const currentCentroids = centroids.map(c => ({ ...c }));
    let pointsChanged = false;

    // Step 1: Assign each point to closest centroid
    const updatedPoints = points.map(p => {
      let minDist = Infinity;
      let closestIdx = 0;
      
      currentCentroids.forEach((c, idx) => {
        const dist = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });

      if (p.label !== closestIdx) {
        pointsChanged = true;
      }

      return { ...p, label: closestIdx };
    });

    // Step 2: Calculate new center centroids
    const nextCentroids = currentCentroids.map((c, idx) => {
      const assignedPoints = updatedPoints.filter(p => p.label === idx);
      if (assignedPoints.length === 0) return c; // keep same

      let sumX = 0;
      let sumY = 0;
      assignedPoints.forEach(p => {
        sumX += p.x;
        sumY += p.y;
      });

      return {
        ...c,
        x: sumX / assignedPoints.length,
        y: sumY / assignedPoints.length
      };
    });

    setPoints(updatedPoints);
    setCentroids(nextCentroids);
    
    const countStep = clusteringStep + 1;
    setClusteringStep(countStep);

    addLog(`[K-Means] Itération ${countStep}: Recalcul des centroïdes de proximité.`, 'info');

    // If clusters stabilized, auto-stop
    if (!pointsChanged && clusteringStep > 0) {
      setIsPlaying(false);
      addLog(`🎉 K-Means a convergé avec succès après ${countStep} itérations !`, 'success');
    }
  };

  // Regression live optimizer (Fit curve polynomials: y = w0 + w1*x + w2*x^2 + ...)
  const [regressionWeights, setRegressionWeights] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const trainRegressionOneEpoch = () => {
    const degree = polyDegree;
    const lr = learningRate * 0.4; // Slightly lower learning rate for stability
    const weights = [...regressionWeights];
    
    // Fit using simple batch gradient descent
    let totalError = 0;
    
    const gradients = new Array(degree + 1).fill(0);

    for (const p of points) {
      // Calculate prediction
      let predY = 0;
      for (let d = 0; d <= degree; d++) {
        predY += weights[d] * Math.pow(p.x, d);
      }

      const diff = predY - p.y;
      totalError += 0.5 * diff * diff;

      // Compute partial derivatives
      for (let d = 0; d <= degree; d++) {
        gradients[d] += diff * Math.pow(p.x, d);
      }
    }

    // Weight update using calculated gradients
    for (let d = 0; d <= degree; d++) {
      weights[d] -= lr * (gradients[d] / points.length);
    }

    setRegressionWeights(weights);
    setRegressionLoss(parseFloat((totalError / points.length).toFixed(4)));
    setEpochs(prev => prev + 1);

    if (epochs > 0 && epochs % 50 === 0) {
      addLog(`[Régression] Époque ${epochs}: MSE Loss = ${(totalError / points.length).toFixed(4)}`, 'neural');
    }
  };

  // Handle manual click on canvas to add a coordinate
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert to -1 to 1 model dimensions
    const x = ((clientX / canvas.width) * 2) - 1;
    const y = -(((clientY / canvas.height) * 2) - 1); // Flip Y coordinate

    let label = 1; // Default
    if (activeTab === 'classification') {
      // Alternate label for classification based on click or button active
      label = e.shiftKey ? 0 : 1; 
      addLog(`Point ajouté manuellement à [X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}] de classe ${label === 1 ? 'JAUNE (SHIFT pour VERT)' : 'VERT'}.`, 'info');
    } else if (activeTab === 'clustering') {
      label = -1; // Unassigned
      addLog(`Point ajouté non-étiqueté à [X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}]`, 'info');
    } else if (activeTab === 'regression') {
      label = 0;
      addLog(`Point de contact ajouté à [X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}] pour affinage courbe.`, 'info');
    }

    const newPoint: DataPoint = { x, y, label };
    setPoints(prev => [...prev, newPoint]);
  };

  // Re-render Canvas to display Neural Nets, Clusters, centroids, and Regression
  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear previous drawing
    ctx.clearRect(0, 0, width, height);

    // 1. Draw heatmap/background predictions for classification
    if (activeTab === 'classification') {
      const net = neuralNetRef.current;
      const act = activation;
      const gridSize = 4; // grid density size

      for (let gx = 0; gx < width; gx += gridSize) {
        for (let gy = 0; gy < height; gy += gridSize) {
          // Model scale translation
          const modelX = (gx / width) * 2 - 1;
          const modelY = -((gy / height) * 2 - 1);

          // MLP Feedforward pass
          let outVal = 0;
          if (net && net.wih && net.wih.length > 0) {
            const hOutputs = [];
            for (let h = 0; h < hiddenNodes; h++) {
              const weights = net.wih[h];
              if (weights) {
                const sum = (weights[0] ?? 0) * modelX + (weights[1] ?? 0) * modelY + (net.bih?.[h] ?? 0);
                hOutputs.push(activate(sum, act));
              } else {
                hOutputs.push(0);
              }
            }

            let outSum = net.bo ?? 0;
            for (let h = 0; h < hiddenNodes; h++) {
              outSum += (hOutputs[h] ?? 0) * (net.who?.[h] ?? 0);
            }
            outVal = activate(outSum, 'sigmoid');
          }

          // Build styling background based on value
          // Class 1 (Yellowish) vs Class 0 (Teal/Emerald/Cyan)
          const ratio = outVal;
          ctx.fillStyle = `rgba(${Math.floor(245 * ratio + 16 * (1 - ratio))}, ${Math.floor(158 * ratio + 185 * (1 - ratio))}, ${Math.floor(11 * ratio + 129 * (1 - ratio))}, 0.15)`;
          ctx.fillRect(gx, gy, gridSize, gridSize);
        }
      }

      // Draw faint boundary separator line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

    } else if (activeTab === 'clustering' && centroids.length > 0) {
      // Draw clusters background dividing lines (Voronoi decomposition)
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
      const gridSize = 8;
      
      for (let gx = 0; gx < width; gx += gridSize) {
        for (let gy = 0; gy < height; gy += gridSize) {
          const modelX = (gx / width) * 2 - 1;
          const modelY = -((gy / height) * 2 - 1);

          let minDist = Infinity;
          let closestIdx = 0;

          centroids.forEach((c, idx) => {
            const dist = Math.pow(modelX - c.x, 2) + Math.pow(modelY - c.y, 2);
            if (dist < minDist) {
              minDist = dist;
              closestIdx = idx;
            }
          });

          // Style Voronoi region very faintly
          const color = hexToRgba(centroids[closestIdx]?.color || colors[closestIdx % colors.length], 0.05);
          ctx.fillStyle = color;
          ctx.fillRect(gx, gy, gridSize, gridSize);
        }
      }
    } else if (activeTab === 'regression') {
      // Draw fitted poly regression mathematical curve line
      ctx.strokeStyle = 'rgb(59, 130, 246)'; // Vibrant blue curve
      ctx.lineWidth = 3.5;
      ctx.beginPath();

      const degree = polyDegree;
      for (let gx = 0; gx < width; gx++) {
        const modelX = (gx / width) * 2 - 1;
        
        let modelY = 0;
        for (let d = 0; d <= degree; d++) {
          modelY += regressionWeights[d] * Math.pow(modelX, d);
        }

        // Convert back to canvas pixel scale
        const canvasY = (-(modelY) + 1) * 0.5 * height;
        if (gx === 0) {
          ctx.moveTo(gx, canvasY);
        } else {
          ctx.lineTo(gx, canvasY);
        }
      }
      ctx.stroke();
    }

    // 2. Draw Data Points
    points.forEach((p) => {
      // Translate to canvas space
      const cx = (p.x + 1) * 0.5 * width;
      const cy = (-p.y + 1) * 0.5 * height;

      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);

      if (activeTab === 'classification') {
        if (p.label === 1) {
          // Class 1: Amber / Yellow
          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.2;
        } else {
          // Class 0: Emerald
          ctx.fillStyle = '#10b981';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.2;
        }
      } else if (activeTab === 'clustering') {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
        if (p.label === -1) {
          ctx.fillStyle = '#64748b'; // generic unassigned slate
        } else {
          ctx.fillStyle = centroids[p.label]?.color || colors[p.label % colors.length];
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1.1;
      } else if (activeTab === 'regression') {
        // Red nodes
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.2;
      }

      ctx.fill();
      ctx.stroke();
    });

    // 3. Draw Centroids for K-Means Clustering
    if (activeTab === 'clustering' && centroids.length > 0) {
      centroids.forEach((c) => {
        const cx = (c.x + 1) * 0.5 * width;
        const cy = (-c.y + 1) * 0.5 * height;

        // Draw big visual crossstar outline for cluster anchor
        ctx.fillStyle = c.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw an inner core
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });
    }

  }, [points, centroids, regressionWeights, activeTab, activation, hiddenNodes, polyDegree]);

  const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Force reinitialize
  const handleReset = () => {
    let type = 'moons';
    if (activeTab === 'clustering') type = 'clusters';
    else if (activeTab === 'regression') type = 'sine';
    generateDataset(type, noise, activeTab);
    addLog(`Index et poids du modèle réinitialisés à zéro.`, 'warn');
  };

  // Neural Connection Weights SVG calculations
  const getConnections = (): WeightConnection[] => {
    const list: WeightConnection[] = [];
    const net = neuralNetRef.current;
    if (!net || !net.wih || net.wih.length === 0) return [];

    // Layer 0 (Input) -> Layer 1 (Hidden)
    for (let i = 0; i < 2; i++) {
      for (let h = 0; h < hiddenNodes; h++) {
        const weights = net.wih[h];
        if (weights) {
          list.push({
            fromNode: i,
            toNode: h,
            weight: weights[i] ?? 0
          });
        }
      }
    }
    return list;
  };

  return (
    <div id="ml-playground-main" className="flex-grow flex flex-col pt-4 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full font-sans">
      
      {/* Visual Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 px-2.5 rounded bg-amber-500/10 text-amber-500 text-[10px] uppercase font-black tracking-wider border border-amber-500/20 font-mono">
              🧪 Module Expérimental
            </span>
            <span className="p-1 px-2.5 rounded bg-blue-500/10 text-blue-500 text-[10px] uppercase font-black tracking-wider border border-blue-500/20 font-mono flex items-center gap-1">
              <Brain size={10} /> 100% Client-side
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white font-mono uppercase tracking-wider">
            🧠 Aire de Jeu de Machine Learning
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Explorez, visualisez, entrainez et manipulez des algorithmes d'IA en temps réel à l'aide d'interactions tactiles de haute fidélité.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-905 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 self-start md:self-center">
          {[
            { id: 'classification', name: 'Classification', desc: 'Réseaux de Neurones' },
            { id: 'clustering', name: 'Clustering', desc: 'Secteurs K-Means' },
            { id: 'regression', name: 'Régression', desc: 'Ajustement Courbe' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsPlaying(false);
              }}
              className={`py-2 px-3.5 rounded-xl font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center min-w-[105px] ${
                activeTab === tab.id
                  ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-500 border border-amber-500/25 shadow'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{tab.name}</span>
              <span className="text-[7px] text-slate-400 opacity-80 mt-0.5 lowercase tracking-normal">{tab.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Controls & Tuner Parameters */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between gap-5 shadow-sm">
          <div className="space-y-5">
            <h2 className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Sliders size={13} className="text-amber-500" />
              Réglages Hyperparamètres
            </h2>

            {/* Classification Parameters */}
            {activeTab === 'classification' && (
              <div className="space-y-4">
                {/* Dataset types classification */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 font-mono">Dataset d'entraînement</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'moons', name: '🌙 Lunes' },
                      { id: 'circles', name: '🎯 Cercles' },
                      { id: 'separable', name: '📈 Isolé' },
                      { id: 'spirals', name: '🌀 Spirales' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => { setDatasetType(type.id); generateDataset(type.id, noise); }}
                        className={`py-1.5 px-2 bg-slate-50 dark:bg-slate-950 text-[10px] font-bold rounded-lg border text-center cursor-pointer transition-colors ${
                          datasetType === type.id 
                            ? 'border-yellow-500 bg-yellow-500/5 text-yellow-500' 
                            : 'border-slate-150 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hidden Nodes scale tuner */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="font-bold text-slate-400">NEURONES CACHÉS</span>
                    <span className="text-amber-500 font-black">{hiddenNodes}</span>
                  </div>
                  <input 
                    type="range" 
                    min={2} 
                    max={8} 
                    step={1} 
                    value={hiddenNodes} 
                    onChange={(e) => {
                      setHiddenNodes(parseInt(e.target.value));
                      addLog(`Configuration : Couche cachée redimensionnée à ${e.target.value} neurones.`, 'info');
                    }}
                    className="w-full h-1 bg-slate-250 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                {/* Custom active activation function */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 font-mono">Fonction d'Activation</label>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-805">
                    {['tanh', 'sigmoid', 'relu'].map(act => (
                      <button
                        key={act}
                        onClick={() => {
                          setActivation(act as any);
                          addLog(`Activation changée pour [${act.toUpperCase()}]`, 'info');
                        }}
                        className={`flex-1 py-1.5 font-mono text-[9px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                          activation === act 
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-505/20 font-black' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {act.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Clustering Parameters tuning */}
            {activeTab === 'clustering' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="font-bold text-slate-400">NOMBRE DE CLUSTERS (K)</span>
                    <span className="text-amber-500 font-black">{kClusters}</span>
                  </div>
                  <input 
                    type="range" 
                    min={2} 
                    max={5} 
                    value={kClusters} 
                    onChange={(e) => setKClusters(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-250 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <p className="text-[9px] text-slate-450 leading-relaxed pt-1 font-sans">
                    Détermine le nombre de centroïdes géométriques de classification K-Means.
                  </p>
                </div>
              </div>
            )}

            {/* Regression Parameters tuning */}
            {activeTab === 'regression' && (
              <div className="space-y-4">
                {/* Curve shapes template */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 font-mono">Allure Requis</label>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-805 gap-1">
                    {['sine', 'parabola', 'linear'].map(type => (
                      <button
                        key={type}
                        onClick={() => { setDatasetType(type); generateDataset(type, noise, 'regression'); }}
                        className={`flex-1 py-1.5 font-mono text-[9px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                          datasetType === type 
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {type === 'sine' ? 'Sinusoïde' : type === 'parabola' ? 'Parabole' : 'Linéaire'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Polynomial Degree exponent curve scale bias */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="font-bold text-slate-400">DEGRÉ POLYNOMIAL</span>
                    <span className="text-amber-500 font-black">x^{polyDegree}</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={5} 
                    value={polyDegree} 
                    onChange={(e) => {
                      setPolyDegree(parseInt(e.target.value));
                      addLog(`Degré polynomial fixé à ${e.target.value} (y = w0 + w1*x + ... + wn*x^n)`, 'info');
                    }}
                    className="w-full h-1 bg-slate-250 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Common parameters */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              {/* Learning rate (Taux d'apprentissage) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="font-bold text-slate-400">TAUX D'APPRENTISSAGE</span>
                  <span className="text-emerald-400 font-black">{learningRate}</span>
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  {[0.01, 0.05, 0.1, 0.3].map(rate => (
                    <button
                      key={rate}
                      onClick={() => { setLearningRate(rate); addLog(`Taux d'apprentissage calé à ${rate}`, 'info'); }}
                      className={`flex-1 py-1 font-mono text-[9px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                        learningRate === rate 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Noisiness slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="font-bold text-slate-400">BRUIT DES DONNÉES</span>
                  <span className="text-slate-400 font-bold">{Math.round(noise * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min={0.0} 
                  max={0.5} 
                  step={0.05} 
                  value={noise} 
                  onChange={(e) => {
                    const nextNoise = parseFloat(e.target.value);
                    setNoise(nextNoise);
                    generateDataset(datasetType, nextNoise);
                  }}
                  className="w-full h-1 bg-slate-250 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed font-mono flex items-center gap-1">
            <Info size={11} className="text-amber-500" />
            <span>Shift-cliquez pour inverser la classe du point inséré tactilement.</span>
          </div>
        </div>

        {/* MIDDLE COLUMN: Active Play Stage Canvas / Viewport */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Main Simulation View Card */}
          <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl flex flex-col relative overflow-hidden group">
            
            {/* Overlay indicators for interactive predicted feedback */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 pointer-events-none select-none">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-slate-400 font-mono font-bold tracking-wider uppercase">Scène interactive</span>
            </div>

            {/* Click indicators for learning context helper */}
            <div className="absolute top-4 right-4 z-10 text-[9px] text-slate-550 pointer-events-none font-mono">
              [cliquez pour ajouter vos points]
            </div>

            {/* Dynamic visual stage */}
            <div className="bg-slate-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-900/60 shadow-inner">
              <canvas
                ref={canvasRef}
                width={480}
                height={350}
                onClick={handleCanvasClick}
                className="w-full aspect-[4/3] rounded-lg cursor-crosshair max-w-[480px] h-auto p-1"
                title="Aire de simulation de Machine Learning - Cliquez pour ajouter des points"
              />
            </div>

            {/* Simulation controls strip */}
            <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-900">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-5 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                    isPlaying 
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-md' 
                      : 'bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-450 hover:scale-[1.02]'
                  }`}
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  {isPlaying ? 'PAUSER L\'ENTRAÎNEMENT' : 'ENTRAÎNER LE MODÈLE'}
                </button>

                <button
                  type="button"
                  onClick={handleTrainStep}
                  disabled={isPlaying}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-mono text-[10px] font-bold uppercase transition-all cursor-pointer border border-slate-800 flex items-center justify-center"
                  title="Exécuter une seule époque d'apprentissage"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[10px] hover:border-slate-700/80 font-black uppercase rounded-xl border border-slate-850 cursor-pointer transition-colors flex items-center gap-1.5"
                  title="Réinitialiser les paramètres"
                >
                  <RefreshCw size={11} />
                  Reset
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPoints([]);
                    addLog(`Points vidés. Cliquez pour concevoir une architecture personnalisée !`, 'warn');
                  }}
                  className="px-3.5 py-2.5 bg-slate-900/60 hover:bg-rose-950/20 text-slate-450 hover:text-rose-400 font-mono text-[10px] font-black uppercase rounded-xl border border-transparent hover:border-rose-500/10 cursor-pointer transition-all flex items-center gap-1"
                  title="Effacer tous les points existants"
                >
                  <Trash2 size={11} />
                  Nettoyer
                </button>
              </div>
            </div>

          </div>

          {/* Quick Explainer details card */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3.5">
            <div className="p-2.5 bg-yellow-500/15 text-yellow-500 rounded-xl flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-800 dark:text-white mb-0.5">
                {activeTab === 'classification' 
                  ? "RÉSEAU DE NEURONES DIRECT (FEEDFORWARD)" 
                  : activeTab === 'clustering'
                    ? "ALGORITHME COMPORTEMENTAL K-MEANS"
                    : "RÉGRESSION PAR ESTIMATEUR POLYNOMIAL"}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                {activeTab === 'classification' && (
                  "Ici, un vrai perceptron multicouche s'exécute localement. Les poids se réajustent par rétropropagation (Backpropagation) pour épouser la frontière des points. C'est le cœur des réseaux profonds d'IA."
                )}
                {activeTab === 'clustering' && (
                  "Algorithme non supervisé. K-Means cherche à partitionner les données brutes en K groupes en attirant récursivement chaque centroïde au milieu de sa classe de points géométriques à chaque cycle."
                )}
                {activeTab === 'regression' && (
                  "Ajuste un polynôme de degré variable par descente de gradient stochastique. Idéal pour modéliser des approximations continues, prédire des tendances ou comprendre la dispersion d'indices physiques."
                )}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Neural Net Architecture Map / Silhouette Score / Math Panel */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
          
          <h2 className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Brain size={13} className="text-yellow-500" />
              {activeTab === 'classification' ? 'Architecture Synaptique' : 'Variables Mathématiques'}
            </span>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 text-slate-500 rounded h-fit uppercase font-bold text-[8px]">
              {activeTab}
            </span>
          </h2>

          <div className="flex-grow flex flex-col justify-center min-h-[220px]">
            {activeTab === 'classification' ? (
              <div className="relative w-full aspect-square flex items-center justify-center">
                {/* Embedded dynamic Synaptic network SVG map */}
                <svg className="w-full h-full max-h-[280px]" viewBox="0 0 200 200">
                  {/* Sync connection weights glowing synapses */}
                  {getConnections().map((conn, idx) => {
                    const totalHidden = hiddenNodes;
                    
                    // Input node coords input X (0), input Y (1)
                    const xInput = 25;
                    const yInput = i => 60 + i * 80;

                    // Hidden node coords hiddenNode idx
                    const xHidden = 100;
                    const yHidden = h => 20 + h * (160 / (totalHidden - 1));

                    // Weight scalar line stroke thickness
                    const strokeWidth = 0.5 + Math.min(Math.abs(conn.weight) * 1.5, 3.5);
                    const isPositive = conn.weight >= 0;
                    const strokeColor = isPositive 
                      ? `rgba(16, 185, 129, ${0.15 + Math.min(Math.abs(conn.weight) * 0.4, 0.75)})` // Emerald positive
                      : `rgba(239, 68, 68, ${0.15 + Math.min(Math.abs(conn.weight) * 0.4, 0.75)})`;  // Red negative

                    return (
                      <g key={` synapse_${idx}`}>
                        <line
                          x1={xInput}
                          y1={yInput(conn.fromNode)}
                          x2={xHidden}
                          y2={yHidden(conn.toNode)}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                        />
                        {isPlaying && (
                          <circle r="1.5" fill={isPositive ? '#10b981' : '#ef4444'}>
                            <animateMotion 
                              path={`M ${xInput} ${yInput(conn.fromNode)} L ${xHidden} ${yHidden(conn.toNode)}`} 
                              dur={`${0.8 + Math.random() * 1.5}s`} 
                              repeatCount="indefinite" 
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Synapse connections Hidden -> Output (only 1 output node) */}
                  {Array.from({ length: hiddenNodes }).map((_, h) => {
                    const totalHidden = hiddenNodes;
                    const xHidden = 100;
                    const yHidden = h => 20 + h * (160 / (totalHidden - 1));
                    
                    const xOutput = 175;
                    const yOutput = 100;

                    const whoWeight = neuralNetRef.current?.who?.[h] || 0;
                    const strokeWidth = 0.5 + Math.min(Math.abs(whoWeight) * 1.5, 3.5);
                    const strokeColor = whoWeight >= 0
                      ? `rgba(16, 185, 129, ${0.2 + Math.min(Math.abs(whoWeight) * 0.4, 0.75)})`
                      : `rgba(239, 68, 68, ${0.2 + Math.min(Math.abs(whoWeight) * 0.4, 0.75)})`;

                    return (
                      <g key={`output_synapse_${h}`}>
                        <line
                          x1={xHidden}
                          y1={yHidden(h)}
                          x2={xOutput}
                          y2={yOutput}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                        />
                        {isPlaying && (
                          <circle r="1.5" fill={whoWeight >= 0 ? '#10b981' : '#ef4444'}>
                            <animateMotion 
                              path={`M ${xHidden} ${yHidden(h)} L ${xOutput} ${yOutput}`} 
                              dur={`${0.8 + Math.random() * 1.5}s`} 
                              repeatCount="indefinite" 
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Draw layer nodes labels */}
                  {/* Input Nodes */}
                  {[0, 1].map((i) => (
                    <circle 
                      key={`in_${i}`} 
                      cx={25} 
                      cy={60 + i * 80} 
                      r={10} 
                      fill="#0f172a" 
                      stroke="#475569" 
                      strokeWidth={1.5}
                      className="cursor-help"
                      onMouseEnter={() => setHoveredNode({ layer: 0, index: i })}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                  ))}
                  <text x={25} y={60} fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">X1</text>
                  <text x={25} y={140} fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">X2</text>

                  {/* Hidden Nodes */}
                  {Array.from({ length: hiddenNodes }).map((_, h) => {
                    const totalHidden = hiddenNodes;
                    const cy = 20 + h * (160 / (totalHidden - 1));
                    const isHovered = hoveredNode?.layer === 1 && hoveredNode?.index === h;
                    
                    return (
                      <circle
                        key={`hid_${h}`}
                        cx={100}
                        cy={cy}
                        r={8.5}
                        fill={isHovered ? '#1e293b' : '#0f172a'}
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        className="cursor-help transition-colors"
                        onMouseEnter={() => setHoveredNode({ layer: 1, index: h })}
                        onMouseLeave={() => setHoveredNode(null)}
                      />
                    );
                  })}

                  {/* Output Node */}
                  <circle 
                    cx={175} 
                    cy={100} 
                    r={11} 
                    fill="#0f172a" 
                    stroke="#10b981" 
                    strokeWidth={1.5} 
                    className="cursor-help"
                    onMouseEnter={() => setHoveredNode({ layer: 2, index: 0 })}
                    onMouseLeave={() => setHoveredNode(null)}
                  />
                  <text x={175} y={103} fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Y</text>
                </svg>

                {/* Node descriptor panel metadata bubble */}
                <AnimatePresence>
                  {hoveredNode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute bottom-1 left-1 right-1 bg-slate-950/95 border border-slate-805 p-2 rounded-xl text-[9px] font-mono leading-relaxed"
                    >
                      {hoveredNode.layer === 0 && (
                        <p className="text-slate-350">
                          <span className="text-blue-400 font-bold">ENTRÉE {hoveredNode.index === 0 ? "X₁ (Abscisse)" : "X₂ (Ordonnée)"}</span>: Coordonnée normalisée transmise au réseau.
                        </p>
                      )}
                      {hoveredNode.layer === 1 && (
                        <div>
                          <p className="text-slate-350">
                            <span className="text-yellow-500 font-bold">NEURONE H_{hoveredNode.index + 1}</span> : Calcule une séparation linéaire de l'espace.
                          </p>
                          <p className="text-slate-500 mt-0.5">
                            Biais: {(neuralNetRef.current?.bih?.[hoveredNode.index] || 0).toFixed(3)}
                          </p>
                        </div>
                      )}
                      {hoveredNode.layer === 2 && (
                        <p className="text-slate-350">
                          <span className="text-emerald-400 font-bold">NEURONE DE SORTIE (Y)</span> : Consolide les formes géométriques détectées pour donner la probabilité de classe (Sigmoïde).
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : activeTab === 'clustering' ? (
              <div className="space-y-3.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-805/40 rounded-xl space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 font-mono">Formule de Classification</span>
                  <p className="text-[10px] text-slate-550 leading-relaxed font-mono">
                    La distance euclidienne d = √((x - cx)² + (y - cy)²) associe chaque point à son barycentre le plus proche à chaque cycle.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 font-mono block">Statut des centroïdes K-Means</span>
                  <div className="space-y-1.5">
                    {centroids.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50/50 dark:bg-slate-905 border border-slate-100 dark:border-slate-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">Centroïde {idx + 1}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">
                          X:{c.x.toFixed(2)} | Y:{c.y.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-slate-350">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-805/40 rounded-xl space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 font-mono">Modèle Estimé</span>
                  <p className="text-[10px] text-yellow-500 font-mono font-bold leading-relaxed">
                    y = {regressionWeights.slice(0, polyDegree + 1).map((w, idx) => {
                      if (idx === 0) return w.toFixed(3);
                      return ` ${w >= 0 ? '+' : ''}${w.toFixed(3)}·x${idx > 1 ? `¹` : `²`}`;
                    }).join('')}
                  </p>
                </div>
                <div className="p-3 bg-slate-905 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-slate-500 font-mono block mb-1">Détail des coefficients</span>
                  <div className="space-y-1 font-mono text-[9px]">
                    {regressionWeights.slice(0, polyDegree + 1).map((w, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-900 pb-0.5">
                        <span className="text-slate-400">Coeff w{idx} ({idx === 0 ? 'biais' : idx === 1 ? 'pente' : `degré ${idx}`})</span>
                        <span className="font-bold text-slate-200">{w.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Analytics parameters indices metrics */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <span className="text-[9px] font-black uppercase text-slate-400 font-mono block">Indicateurs Principaux</span>
            
            <div className="grid grid-cols-2 gap-2 text-center text-mono">
              <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-150 dark:border-slate-805 rounded-xl">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono tracking-wider">Erreur (Loss)</p>
                <p className="text-sm font-black text-rose-500 font-mono mt-0.5">
                  {activeTab === 'regression' ? regressionLoss.toFixed(4) : loss.toFixed(4)}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-150 dark:border-slate-805 rounded-xl">
                <p className="text-[8px] font-black uppercase text-slate-500 font-mono tracking-wider">
                  {activeTab === 'classification' ? 'Précision' : activeTab === 'clustering' ? 'Itérations' : 'Époques'}
                </p>
                <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                  {activeTab === 'classification' 
                    ? `${accuracy}%` 
                    : activeTab === 'clustering' 
                      ? clusteringStep 
                      : epochs}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* METRICS & METADATA BOTTOM DASHBOARD ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        
        {/* Epoch indicator */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-805 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">Époques parcourues</p>
            <p className="text-xl font-black text-slate-800 dark:text-white font-mono mt-0.5">{epochs}</p>
          </div>
          <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-lg">
            <Activity size={18} />
          </div>
        </div>

        {/* Dataset Point load count indicator */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-805 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">Points de Données</p>
            <p className="text-xl font-black text-slate-800 dark:text-white font-mono mt-0.5">{points.length}</p>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <Target size={18} />
          </div>
        </div>

        {/* Optimisation status mode flag alert indicator */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-805 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">Statut Algorithme</p>
            <p className={`text-xs font-black font-mono mt-1.5 uppercase ${
              isPlaying ? "text-emerald-400" : "text-rose-400"
            }`}>
              {isPlaying ? "🔄 APPRENTISSAGE ACTIF" : "⏸️ EN PAUSE"}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isPlaying ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
            <Brain size={18} className={isPlaying ? "animate-pulse" : ""} />
          </div>
        </div>

        {/* Classification accuracy matrix indicator */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-805 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">Optimiseur</p>
            <p className="text-xs font-black text-slate-800 dark:text-white font-mono mt-1.5">
              GRADIENT DECENT (SGD)
            </p>
          </div>
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Plus size={18} />
          </div>
        </div>

      </div>

      {/* CORE LOGS PANEL & SIMULATION HISTORY CONSOLE */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 mt-6 flex flex-col gap-2 relative">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase font-mono tracking-wider text-slate-400 ml-2">Console d'Historique Optimiseur</span>
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[9px] text-slate-500 hover:text-slate-300 font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Effacer historiques
          </button>
        </div>

        <div className="h-28 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-1">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">Aucune information d'apprentissage disponible... Démarrez le simulateur pour observer les calculs synaptiques.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 hover:bg-slate-900/40 py-0.5 px-1 rounded transition-colors">
                <span className="text-slate-650 shrink-0">[{log.time}]</span>
                <span className={`flex-grow ${
                  log.type === 'success' 
                    ? 'text-emerald-400 font-bold' 
                    : log.type === 'warn' 
                      ? 'text-rose-400' 
                      : log.type === 'neural'
                        ? 'text-yellow-400'
                        : 'text-slate-350'
                }`}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
