-- Proof-of-Play core schema
-- Tables: orgs, users_orgs, kiosks, assets, campaigns, campaigns_assets, plays
-- Optional MV: plays_daily

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Organizations
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User membership in orgs
CREATE TABLE IF NOT EXISTS public.users_orgs (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);

-- Kiosks (screens/devices)
CREATE TABLE IF NOT EXISTS public.kiosks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'optisigns',
  external_id TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, provider, external_id),
  UNIQUE (org_id, name)
);

-- Backfill support: if kiosks table pre-exists without org_id, add it so policies can reference it
ALTER TABLE public.kiosks ADD COLUMN IF NOT EXISTS org_id UUID;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public' AND tc.table_name = 'kiosks' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'org_id'
  ) THEN
    BEGIN
      ALTER TABLE public.kiosks ADD CONSTRAINT kiosks_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Ensure columns exist on legacy kiosks table
ALTER TABLE public.kiosks ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.kiosks ALTER COLUMN provider SET DEFAULT 'optisigns';
UPDATE public.kiosks SET provider = COALESCE(provider, 'optisigns');
ALTER TABLE public.kiosks ALTER COLUMN provider SET NOT NULL;
ALTER TABLE public.kiosks ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Assets
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  provider_asset_id TEXT,
  duration_sec INTEGER,
  asset_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, asset_key)
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

-- Backfill support: if campaigns table pre-exists without org_id, add it and FK
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS org_id UUID;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public' AND tc.table_name = 'campaigns' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'org_id'
  ) THEN
    BEGIN
      ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Campaigns to Assets junction
CREATE TABLE IF NOT EXISTS public.campaigns_assets (
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, asset_id)
);

-- Plays
CREATE TABLE IF NOT EXISTS public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  kiosk_id UUID NOT NULL REFERENCES public.kiosks(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  provider_event_id TEXT,
  played_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_sec INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, kiosk_id, asset_id, played_at)
);

-- Helper function to build asset_key
CREATE OR REPLACE FUNCTION public.build_asset_key(p_asset_name TEXT, p_provider_asset_id TEXT, p_duration_sec INTEGER)
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT lower(trim(regexp_replace(coalesce(p_asset_name,''), '\\s+', ' ', 'g'))) || '|' ||
         coalesce(p_provider_asset_id, '-') || '|' || coalesce(p_duration_sec::text, '-');
$$;

-- RLS enablement
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- Policies: users must belong to org via users_orgs

-- orgs: users can see orgs they belong to
DROP POLICY IF EXISTS orgs_select ON public.orgs;
CREATE POLICY orgs_select ON public.orgs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = orgs.id AND uo.user_id = auth.uid()
    )
  );

-- users_orgs: users can see their memberships
DROP POLICY IF EXISTS users_orgs_select ON public.users_orgs;
CREATE POLICY users_orgs_select ON public.users_orgs
  FOR SELECT USING (user_id = auth.uid());

-- kiosks: visible if user in same org
DROP POLICY IF EXISTS kiosks_select ON public.kiosks;
CREATE POLICY kiosks_select ON public.kiosks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = kiosks.org_id AND uo.user_id = auth.uid()
    )
  );

-- assets: visible if user in same org
DROP POLICY IF EXISTS assets_select ON public.assets;
CREATE POLICY assets_select ON public.assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = assets.org_id AND uo.user_id = auth.uid()
    )
  );

-- campaigns: visible if user in same org (and allow insert/update via Edge with service role typically)
DROP POLICY IF EXISTS campaigns_select ON public.campaigns;
CREATE POLICY campaigns_select ON public.campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = campaigns.org_id AND uo.user_id = auth.uid()
    )
  );

-- campaigns_assets: visible if user in same org through join
DROP POLICY IF EXISTS campaigns_assets_select ON public.campaigns_assets;
CREATE POLICY campaigns_assets_select ON public.campaigns_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.users_orgs uo ON uo.org_id = c.org_id AND uo.user_id = auth.uid()
      WHERE c.id = campaigns_assets.campaign_id
    )
  );

-- plays: visible if user in same org
DROP POLICY IF EXISTS plays_select ON public.plays;
CREATE POLICY plays_select ON public.plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = plays.org_id AND uo.user_id = auth.uid()
    )
  );

-- Write policies for Edge Functions (service role bypasses RLS). If needed for client inserts, restrict by membership.
DROP POLICY IF EXISTS kiosks_write ON public.kiosks;
CREATE POLICY kiosks_write ON public.kiosks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = kiosks.org_id AND uo.user_id = auth.uid())
  );

DROP POLICY IF EXISTS assets_write ON public.assets;
CREATE POLICY assets_write ON public.assets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = assets.org_id AND uo.user_id = auth.uid())
  );

DROP POLICY IF EXISTS campaigns_write ON public.campaigns;
CREATE POLICY campaigns_write ON public.campaigns
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = campaigns.org_id AND uo.user_id = auth.uid())
  );

DROP POLICY IF EXISTS campaigns_assets_write ON public.campaigns_assets;
CREATE POLICY campaigns_assets_write ON public.campaigns_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.users_orgs uo ON uo.org_id = c.org_id AND uo.user_id = auth.uid()
      WHERE c.id = campaigns_assets.campaign_id
    )
  );

DROP POLICY IF EXISTS plays_write ON public.plays;
CREATE POLICY plays_write ON public.plays
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users_orgs uo WHERE uo.org_id = plays.org_id AND uo.user_id = auth.uid())
  );

-- Optional MV for daily rollups
CREATE MATERIALIZED VIEW IF NOT EXISTS public.plays_daily AS
SELECT 
  org_id,
  asset_id,
  date_trunc('day', played_at) AS day,
  count(*)::bigint AS shows
FROM public.plays
GROUP BY 1,2,3;

CREATE INDEX IF NOT EXISTS idx_plays_daily_org_asset_day ON public.plays_daily(org_id, asset_id, day);

-- Helper function to safely refresh MV concurrently
CREATE OR REPLACE FUNCTION public.refresh_plays_daily()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.plays_daily;
  EXCEPTION WHEN feature_not_supported THEN
    -- Fallback if CONCURRENTLY not supported in the environment
    REFRESH MATERIALIZED VIEW public.plays_daily;
  END;
END;
$$;

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_kiosks_org_provider_ext ON public.kiosks(org_id, provider, external_id);
CREATE INDEX IF NOT EXISTS idx_assets_org_key ON public.assets(org_id, asset_key);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_name ON public.campaigns(org_id, name);
CREATE INDEX IF NOT EXISTS idx_plays_lookup ON public.plays(org_id, kiosk_id, asset_id, played_at);

-- Comments for clarity
COMMENT ON COLUMN public.assets.asset_key IS 'lower(trim(regexp_replace(asset_name,''\s+'','' '',''g'')))||''|''||coalesce(provider_asset_id,''-'')||''|''||coalesce(duration_sec::text,''-'')';

SELECT 'proof_of_play schema installed' AS status;


