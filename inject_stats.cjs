const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const statsBlock = `
            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* En-tête des Statistiques */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div>
                    <h2 className="text-sm font-bold font-mono tracking-wide text-slate-100 flex items-center gap-2">
                      <BarChart2 size={16} className="text-emerald-400" />
                      <span>ANALYTIQUES & VISITES</span>
                    </h2>
                    <p className="text-slate-400 text-[10px] uppercase font-mono tracking-wider mt-1">
                      Métriques globales d'audience et de trafic.
                    </p>
                  </div>
                  <button 
                    onClick={fetchVisitStats} 
                    disabled={isStatsLoading}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 transition-all font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 border border-slate-850 self-start md:self-auto"
                  >
                    <RefreshCw size={11} className={isStatsLoading ? "animate-spin" : ""} />
                    <span>Actualiser</span>
                  </button>
                </div>

                {isStatsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
                    <RefreshCw size={24} className="animate-spin mb-4" />
                    <span className="font-mono text-xs uppercase tracking-wider">Génération des rapports...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Cartes KPI */}
                      {[
                        { label: 'VISITES TOTALES', value: visitStats.totalVisits.toLocaleString(), icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'VISITEURS UNIQUES', value: visitStats.uniqueVisitors.toLocaleString(), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { label: "VISITES AUJOURD'HUI", value: visitStats.visitsToday.toLocaleString(), icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                        { label: 'TAUX DE REBOND', value: visitStats.bounceRate, icon: MousePointerClick, color: 'text-rose-400', bg: 'bg-rose-500/10' }
                      ].map((kpi, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                          <div className={\`p-3 rounded-lg \${kpi.bg}\`}>
                            <kpi.icon size={20} className={kpi.color} />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">{kpi.label}</div>
                            <div className="text-xl font-bold text-slate-200 font-mono">{kpi.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Graphes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                        <h3 className="text-xs font-bold font-mono text-slate-300 mb-4 uppercase tracking-wider">Évolution du Trafic (14 derniers jours)</h3>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visitStats.byDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" stroke="#334155" fontSize={10} tickMargin={10} />
                              <YAxis stroke="#334155" fontSize={10} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                              />
                              <Area type="monotone" dataKey="visits" name="Visites" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                        <h3 className="text-xs font-bold font-mono text-slate-300 mb-4 uppercase tracking-wider">Répartition par Appareil</h3>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={visitStats.byDevice}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {visitStats.byDevice.map((entry, index) => (
                                  <Cell key={\`cell-\${index}\`} fill={['#10b981', '#6366f1', '#f59e0b', '#ec4899'][index % 4]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                              />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Références et Sources */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                      <h3 className="text-xs font-bold font-mono text-slate-300 mb-4 uppercase tracking-wider">Top Pages & Référents</h3>
                      <div className="space-y-3">
                        {visitStats.byReferrer.map((ref, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-xs text-slate-400 font-mono truncate max-w-[70%]">{ref.name}</span>
                            <span className="text-xs text-emerald-400 font-bold font-mono">{ref.value} visites</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </>
                )}
              </motion.div>
            )}
`;

content = content.replace("{activeTab === 'configAccess' && (", statsBlock + "{activeTab === 'configAccess' && (");
fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
console.log('Stats tab injected successfully!');
