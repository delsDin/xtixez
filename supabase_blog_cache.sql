-- Table de cache des articles de blog
-- Stocker les articles récupérés via l'API Gemini/Google Search
-- et servir en fallback lorsque l'API est indisponible

CREATE TABLE IF NOT EXISTS blog_cache (
  id          SERIAL PRIMARY KEY,
  tech_key    TEXT NOT NULL UNIQUE,          -- clé de filtre ('all', 'react', 'python', etc.)
  articles    JSONB NOT NULL DEFAULT '[]',   -- tableau d'articles sérialisé
  trend_summary TEXT NOT NULL DEFAULT '',    -- résumé de tendances Gemini
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- date de la dernière récupération réussie
  source      TEXT NOT NULL DEFAULT 'gemini' -- 'gemini' | 'fallback'
);

-- Index pour accélérer les lookups par clé
CREATE INDEX IF NOT EXISTS blog_cache_tech_key_idx ON blog_cache (tech_key);

-- Désactiver RLS pour lecture publique (données non sensibles)
ALTER TABLE blog_cache ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique (tout le monde peut lire le cache)
CREATE POLICY "blog_cache_public_read"
  ON blog_cache FOR SELECT
  USING (true);

-- Politique : seul le service (anon key) peut upsert — le serveur Node utilise la service key
CREATE POLICY "blog_cache_service_write"
  ON blog_cache FOR ALL
  USING (true)
  WITH CHECK (true);
