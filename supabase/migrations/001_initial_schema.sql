-- ─────────────────────────────────────────────────────────────────────────────
-- Caloria — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  gender        TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date    DATE NOT NULL,
  height_cm     NUMERIC(5,1) NOT NULL,
  weight_kg     NUMERIC(5,2) NOT NULL,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Goals ───────────────────────────────────────────────────────────────────

CREATE TABLE goals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('lose', 'maintain', 'gain')),
  target_weight_kg  NUMERIC(5,2),
  weekly_change_kg  NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Food Items ───────────────────────────────────────────────────────────────

CREATE TABLE food_items (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  calories_per_100g    NUMERIC(7,2) NOT NULL,
  protein_per_100g     NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_per_100g         NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_per_100g       NUMERIC(6,2) NOT NULL DEFAULT 0,
  is_custom            BOOLEAN NOT NULL DEFAULT false,
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Meal Entries ─────────────────────────────────────────────────────────────

CREATE TABLE meal_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  meal_type     TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name          TEXT NOT NULL,
  calories      NUMERIC(7,2) NOT NULL,
  protein_g     NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat_g         NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs_g       NUMERIC(6,2) NOT NULL DEFAULT 0,
  weight_g      NUMERIC(6,1),
  food_item_id  UUID REFERENCES food_items(id) ON DELETE SET NULL,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Weight Logs ─────────────────────────────────────────────────────────────

CREATE TABLE weight_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  weight_kg   NUMERIC(5,2) NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ─── Water Logs ──────────────────────────────────────────────────────────────

CREATE TABLE water_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  amount_ml   NUMERIC(6,1) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Reminders ───────────────────────────────────────────────────────────────

CREATE TABLE reminders (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('meal', 'water', 'weigh_in')),
  label       TEXT NOT NULL,
  time        TIME NOT NULL,
  days        INTEGER[] NOT NULL,   -- 0=Sun..6=Sat
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_meal_entries_user_date    ON meal_entries(user_id, date) WHERE deleted_at IS NULL;
CREATE INDEX idx_weight_logs_user_date     ON weight_logs(user_id, date);
CREATE INDEX idx_water_logs_user_date      ON water_logs(user_id, date);
CREATE INDEX idx_food_items_name           ON food_items(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_food_items_user           ON food_items(user_id) WHERE is_custom = true;

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders    ENABLE ROW LEVEL SECURITY;

-- Each user can only see/modify their own data
CREATE POLICY "users own their profiles"     ON profiles     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own their goals"        ON goals        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own their meals"        ON meal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own their weight"       ON weight_logs  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own their water"        ON water_logs   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users own their reminders"    ON reminders    FOR ALL USING (auth.uid() = user_id);

-- Food items: public items visible to all, custom items only to owner
CREATE POLICY "public food items readable"   ON food_items   FOR SELECT USING (is_custom = false OR auth.uid() = user_id);
CREATE POLICY "users manage custom foods"    ON food_items   FOR ALL    USING (auth.uid() = user_id);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
