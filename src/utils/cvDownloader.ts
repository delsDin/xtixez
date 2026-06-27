/**
 * Generates and downloads a beautifully formatted, print-optimized HTML CV.
 */
export const downloadCV = (data: { generalInfo: any, experiences: any[], skills: any, certifications: any[] }) => {
  const { generalInfo, experiences, skills, certifications } = data;

  const ownerName = generalInfo?.owner_name || 'Dels Dinla';
  const ownerTitlePrefix = generalInfo?.owner_title_prefix || 'Développeur';
  const ownerTitleSuffix = generalInfo?.owner_title_suffix || '';
  const ownerEmail = generalInfo?.owner_email || 'email@example.com';
  const githubUrl = generalInfo?.github_url || '#';
  const linkedinUrl = generalInfo?.linkedin_url || '#';
  
  const aboutText = generalInfo?.about_paragraphs 
    ? generalInfo.about_paragraphs.join('<br/><br/>')
    : "Je transforme des données complexes en applications web performantes et intuitives. Passionné par l’intersection entre l’ingénierie logicielle et l’intelligence artificielle, je conçois des architectures full-stack robustes et des modèles de Machine Learning scalables.";

  const getSkillsHtml = (category: string, title: string) => {
    const list = skills?.[category] || [];
    if (list.length === 0) return '';
    return `
          <div>
            <h4 class="text-xs font-bold text-amber-700 font-sans mb-3 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              ${title}
            </h4>
            <div class="space-y-2">
              ${list.map((skill: any) => `
              <div>
                <div class="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>${skill.name}</span>
                  <span>${skill.level}%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-800 rounded-full" style="width: ${skill.level}%"></div>
                </div>
              </div>
              `).join('')}
            </div>
          </div>
    `;
  };

  const getExperiencesHtml = () => {
    if (!experiences || experiences.length === 0) return '';
    return experiences.map((exp: any, index: number) => `
            <div class="relative pl-6 border-l border-slate-100">
              <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-amber-500${index === 0 ? '' : '/50'} rounded-full border border-white"></div>
              
              <div class="flex flex-wrap items-baseline justify-between gap-x-4 mb-2">
                <h4 class="text-base sm:text-lg font-bold text-slate-900">${exp.role}</h4>
                <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold font-mono rounded-full">${exp.period || ''}</span>
              </div>
              <div class="text-xs sm:text-sm font-semibold text-amber-600 mb-2">${exp.company}</div>
              
              <ul class="space-y-2 mt-2">
                ${(exp.description || []).map((desc: string) => `
                <li class="flex items-start gap-2.5 text-xs sm:text-sm">
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-slate-500 shrink-0"></span>
                  <span class="text-slate-700 font-medium">${desc}</span>
                </li>
                `).join('')}
              </ul>
              ${exp.technologies && exp.technologies.length > 0 ? `
              <div class="mt-3 flex flex-wrap gap-1">
                ${exp.technologies.map((tech: string) => `<span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold font-mono rounded-md">${tech}</span>`).join('')}
              </div>` : ''}
            </div>
    `).join('<div class="h-8"></div>');
  };

  const getCertificationsHtml = () => {
    if (!certifications || certifications.length === 0) return '';
    return certifications.map((cert: any, index: number) => `
          <div class="relative pl-6 border-l border-slate-100 ${index !== certifications.length - 1 ? 'mb-8' : ''}">
            <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-slate-400 rounded-full border border-white"></div>
            
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 mb-2">
              <h4 class="text-base font-bold text-slate-900">${cert.title}</h4>
              <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold font-mono rounded-full">${cert.date || ''}</span>
            </div>
            <div class="text-xs sm:text-sm font-semibold text-amber-500 mb-2">${cert.issuer}</div>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              ${cert.description || ''}
            </p>
          </div>
    `).join('');
  };

  const cvHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${ownerName}</title>
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
        Version interactive & imprimable du CV de <strong>${ownerName}</strong>
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
          <h1 class="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white mb-2">${ownerName}</h1>
          <p class="text-lg sm:text-2xl font-bold text-slate-300 font-display flex items-center gap-2">
            ${ownerTitlePrefix} ${ownerTitleSuffix ? `<span class="text-amber-500">&</span> ${ownerTitleSuffix}` : ''}
          </p>
        </div>
        
        <!-- Contact Grid -->
        <div class="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans">
          <div class="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500 shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            <a href="mailto:${ownerEmail}" class="hover:text-amber-400 font-medium">${ownerEmail}</a>
          </div>
          ${githubUrl ? `
          <div class="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500 shrink-0"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            <a href="${githubUrl}" target="_blank" class="hover:text-amber-400 font-medium">GitHub</a>
          </div>` : ''}
          ${linkedinUrl ? `
          <div class="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500 shrink-0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            <a href="${linkedinUrl}" target="_blank" class="hover:text-amber-400 font-medium">LinkedIn</a>
          </div>` : ''}
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
            ${aboutText}
          </p>
        </div>

        <!-- Skills Sections -->
        <div class="space-y-6">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">COMPÉTENCES TECHNIQUES</h3>
          
          ${getSkillsHtml('development', 'Développement Web')}
          ${getSkillsHtml('dataScience', 'Data Science / IA')}
          ${getSkillsHtml('autres', 'Autres Compétences')}
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
            ${getExperiencesHtml()}
          </div>
        </div>

        <!-- Formations Section -->
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-6 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>FORMATIONS & CERTIFICATIONS</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-450"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
          </h3>
          
          ${getCertificationsHtml()}
        </div>

      </section>

    </div>

    <!-- CV Footer Section -->
    <footer class="bg-slate-50 p-6 border-t border-slate-100 text-center text-xs text-slate-400 font-mono no-print">
      Imprimé le ${new Date().toLocaleDateString('fr-FR')} | Réalisé avec le portfolio de ${ownerName}
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
  link.download = `CV_${ownerName.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
