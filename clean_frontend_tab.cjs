const fs = require('fs');

const content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes("{activeTab === 'configAccess' && ("));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes("{activeTab === 'configHome' && ("));

if (startIdx !== -1 && endIdx !== -1) {
  const newTab = `            {activeTab === 'configAccess' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-8 text-center shadow-lg">
                  <Shield size={48} className="text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold font-mono tracking-wide text-white mb-2">
                    SÉCURITÉ DÉLÉGUÉE À SUPABASE AUTH
                  </h2>
                  <p className="text-slate-400 max-w-lg mx-auto mb-6 text-sm">
                    L'authentification de cette interface, la gestion des mots de passe administrateur et les journaux de connexion sont désormais entièrement pris en charge par le système de sécurité natif de Supabase.
                  </p>
                  <a 
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                  >
                    Ouvrir Supabase Dashboard
                  </a>
                </div>
              </motion.div>
            )}`;
            
  const newLines = [
    ...lines.slice(0, startIdx),
    newTab,
    ...lines.slice(endIdx)
  ];
  
  fs.writeFileSync('src/components/AdminDashboard.tsx', newLines.join('\n'), 'utf8');
  console.log("Tab replaced successfully!");
} else {
  console.log("Could not find start or end index.");
}
