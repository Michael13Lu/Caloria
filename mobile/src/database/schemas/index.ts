// SQLite table definitions — offline-first local database

export const CREATE_TABLES_SQL = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
    birth_date TEXT NOT NULL,
    height_cm REAL NOT NULL,
    weight_kg REAL NOT NULL,
    activity_level TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('lose', 'maintain', 'gain')),
    target_weight_kg REAL,
    weekly_change_kg REAL NOT NULL DEFAULT 0.5,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    name TEXT NOT NULL,
    calories REAL NOT NULL,
    protein_g REAL NOT NULL DEFAULT 0,
    fat_g REAL NOT NULL DEFAULT 0,
    carbs_g REAL NOT NULL DEFAULT 0,
    weight_g REAL,
    food_item_id TEXT,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('synced', 'pending', 'conflict')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weight_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    note TEXT,
    sync_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS water_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    amount_ml REAL NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS food_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    calories_per_100g REAL NOT NULL,
    protein_per_100g REAL NOT NULL DEFAULT 0,
    fat_per_100g REAL NOT NULL DEFAULT 0,
    carbs_per_100g REAL NOT NULL DEFAULT 0,
    is_custom INTEGER NOT NULL DEFAULT 0,
    user_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('meal', 'water', 'weigh_in')),
    label TEXT NOT NULL,
    time TEXT NOT NULL,
    days TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('insert', 'update', 'delete')),
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_meal_entries_date ON meal_entries(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_water_logs_date ON water_logs(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(attempts);
`;
