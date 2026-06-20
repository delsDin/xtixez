/**
 * Generates and downloads a beautifully formatted, print-optimized HTML CV.
 */
export const downloadCV = () => {
  const cvHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - Dels Dinla (Marcel Dinla)</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
            display: ['Outfit', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    @media print {
      body {
        background-color: white !important;
        color: black !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
    body {
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased p-4 sm:p-8 min-h-screen">
  
  <!-- Interactive Actions Header for Web View -->
  <div class="max-w-4xl mx-auto mb-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4 no-print">
    <div class="flex items-center gap-3">
      <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
      <p class="text-sm font-medium text-slate-600">
        Version interactive & imprimable du CV de <strong>Dels Dinla</strong>
      </p>
    </div>
    <div class="flex items-center gap-3">
      <button onclick="window.print()" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition duration-200 cursor-pointer flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimer / Sauvegarder en PDF
      </button>
    </div>
  </div>

  <!-- Main CV Container -->
  <main class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
    
    <!-- Top Header Banner -->
    <header class="relative bg-slate-950 text-white p-8 sm:p-12 overflow-hidden border-b border-amber-500/20">
      <!-- Amber glow background elements -->
      <div class="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span class="text-xs font-semibold tracking-widest text-amber-500 uppercase font-mono block mb-2">Disponible pour opportunités</span>
          <h1 class="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white mb-2">Dels Dinla</h1>
          <p class="text-lg sm:text-2xl font-bold text-slate-300 font-display flex items-center gap-2">
            Développeur Python <span class="text-amber-500">&</span> Data Scientist
          </p>
        </div>
        
        <!-- Contact Grid -->
        <div class="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans">
          <div class="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500 shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            <a href="mailto:delsmarceldinla@gmail.com" class="hover:text-amber-400 font-medium">delsmarceldinla@gmail.com</a>
          </div>
          <div class="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500 shrink-0"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            <a href="https://github.com/delsDin" target="_blank" class="hover:text-amber-400 font-medium">github.com/delsDin</a>
          </div>
          <div class="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500 shrink-0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            <a href="https://www.linkedin.com/in/marcel-dinla-02a72b25b" target="_blank" class="hover:text-amber-400 font-medium">LinkedIn</a>
          </div>
        </div>
      </div>
    </header>

    <!-- Content Sections Matrix -->
    <div class="grid grid-cols-1 lg:grid-cols-12">
      
      <!-- LEFT SIDEBAR: Skills & Context Info -->
      <aside class="lg:col-span-4 bg-slate-50 p-8 border-r border-slate-100 flex flex-col gap-8">
        
        <!-- Profile statement -->
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">À PROPOS</h3>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans font-medium">
            Je transforme des données complexes en applications web performantes et intuitives. Passionné par l’intersection entre l’ingénierie logicielle et l’intelligence artificielle, je conçois des architectures full-stack robustes et des modèles de Machine Learning scalables.
          </p>
        </div>

        <!-- Skills Sections -->
        <div class="space-y-6">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">COMPÉTENCES TECHNIQUES</h3>
          
          <!-- Development -->
          <div>
            <h4 class="text-xs font-bold text-amber-700 font-sans mb-3 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Développement Web
            </h4>
            <div class="space-y-2">
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Python (FastAPI, Django)</span>
                  <span>95%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 95%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>React / Next.js</span>
                  <span>90%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 90%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>TypeScript / JS</span>
                  <span>80%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 80%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Tailwind CSS</span>
                  <span>90%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 90%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Science -->
          <div>
            <h4 class="text-xs font-bold text-amber-700 font-sans mb-3 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Data Science / IA
            </h4>
            <div class="space-y-2">
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Pandas & NumPy</span>
                  <span>95%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 95%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Scikit-learn / ML</span>
                  <span>85%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 85%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>TensorFlow / PyTorch</span>
                  <span>75%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 75%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>SQL & NoSQL</span>
                  <span>90%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: 90%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tools / Others -->
          <div>
            <h4 class="text-xs font-bold text-amber-700 font-sans mb-3 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Infrastructures & Outils
            </h4>
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span class="px-2.5 py-1 bg-white border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg font-mono">Git & GitHub</span>
              <span class="px-2.5 py-1 bg-white border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg font-mono">Docker</span>
              <span class="px-2.5 py-1 bg-white border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg font-mono">Apache Airflow</span>
              <span class="px-2.5 py-1 bg-white border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg font-mono">AWS</span>
              <span class="px-2.5 py-1 bg-white border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg font-mono">CI/CD</span>
              <span class="px-2.5 py-1 bg-white border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg font-mono">Méthodes Agiles</span>
            </div>
          </div>

        </div>

      </aside>

      <!-- RIGHT PANEL: Experiences & Formations / Achievements -->
      <section class="lg:col-span-8 p-8 sm:p-10 flex flex-col gap-10">
        
        <!-- Experience Segment -->
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-6 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>EXPÉRIENCES PROFESSIONNELLES</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-450"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </h3>
          
          <div class="space-y-8">
            
            <!-- Job 1 -->
            <div class="relative pl-6 border-l border-slate-100">
              <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white"></div>
              
              <div class="flex flex-wrap items-baseline justify-between gap-x-4 mb-2">
                <h4 class="text-base sm:text-lg font-bold text-slate-900">Data Scientist Senior</h4>
                <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold font-mono rounded-full">2021 - Présent</span>
              </div>
              <div class="text-xs sm:text-sm font-semibold text-amber-600 mb-2">Tech Innovators Inc.</div>
              <p class="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed font-light">
                Chez Tech Innovators Inc., je dirige l'implémentation d'algorithmes d'apprentissage automatique pour optimiser les ventes de commerce électronique à grande échelle.
              </p>
              
              <!-- Core accomplishments -->
              <ul class="space-y-2 mt-2">
                <li class="flex items-start gap-2.5 text-xs sm:text-sm">
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                  <span class="text-slate-700 font-medium">Conception d'un modèle de recommandation personnalisé en temps réel ayant généré +15% de CA en 6 mois.</span>
                </li>
                <li class="flex items-start gap-2.5 text-xs sm:text-sm">
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                  <span class="text-slate-700 font-medium">Migration de pipelines de données legacy vers Apache Airflow, réduisant les temps de traitement quotidiens de 35%.</span>
                </li>
                <li class="flex items-start gap-2.5 text-xs sm:text-sm">
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                  <span class="text-slate-700 font-medium">Mentorat de développeurs juniors et mise en place d'un framework d'évaluation A/B testing automatisé.</span>
                </li>
              </ul>
              <div class="mt-3 flex flex-wrap gap-1">
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">Python</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">Pandas</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">Scikit-learn</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">TensorFlow</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">Airflow</span>
              </div>
            </div>

            <!-- Job 2 -->
            <div class="relative pl-6 border-l border-slate-100">
              <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-amber-500/50 rounded-full border border-white"></div>
              
              <div class="flex flex-wrap items-baseline justify-between gap-x-4 mb-2">
                <h4 class="text-base sm:text-lg font-bold text-slate-900">Développeur Full-Stack</h4>
                <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold font-mono rounded-full">2018 - 2021</span>
              </div>
              <div class="text-xs sm:text-sm font-semibold text-amber-600 mb-2">WebSolutions Agency</div>
              <p class="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed font-light">
                En tant que Développeur Full-Stack principal chez WebSolutions, j'ai conçu et déployé plus de 15 applications web hautement performantes pour divers clients.
              </p>
              
              <ul class="space-y-2 mt-2">
                <li class="flex items-start gap-2.5 text-xs sm:text-sm">
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                  <span class="text-slate-700 font-medium">Refonte complète d'une plateforme d'administration client, améliorant le score d'utilisabilité UX de 50%.</span>
                </li>
                <li class="flex items-start gap-2.5 text-xs sm:text-sm">
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                  <span class="text-slate-700 font-medium">Intégration d'un système de monétisation complexe avec Stripe, et mise en place d'une authentification JWT sécurisée.</span>
                </li>
              </ul>
              <div class="mt-3 flex flex-wrap gap-1">
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">React</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">TypeScript</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">Node.js</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">PostgreSQL</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Formations Section -->
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-6 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>FORMATIONS</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-450"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
          </h3>
          
          <div class="relative pl-6 border-l border-slate-100">
            <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-slate-400 rounded-full border border-white"></div>
            
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 mb-2">
              <h4 class="text-base font-bold text-slate-900">Master en Data Science</h4>
              <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold font-mono rounded-full">2016 - 2018</span>
            </div>
            <div class="text-xs sm:text-sm font-semibold text-amber-500 mb-2">Université des Sciences</div>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              Spécialisation en Machine Learning et traitement du langage naturel (NLP). Validation pratique sur de volumineux datasets en exploitant l'écosystème Apache Big Data.
            </p>
          </div>
        </div>

      </section>

    </div>

    <!-- CV Footer Section -->
    <footer class="bg-slate-50 p-6 border-t border-slate-100 text-center text-xs text-slate-400 font-mono no-print">
      Imprimé le ${new Date().toLocaleDateString('fr-FR')} | Réalisé avec le portfolio de Dels Dinla
    </footer>

  </main>

  <script>
    // Automatically trigger printing inside target browser wrapper
    window.onload = function() {
      console.log("Document de CV chargé avec succès");
    }
  </script>
</body>
</html>`;

  // Create document Blob for instant local download
  const blob = new Blob([cvHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Trigger modern download actions link
  const link = document.createElement('a');
  link.href = url;
  link.download = 'CV_Dels_Dinla.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
