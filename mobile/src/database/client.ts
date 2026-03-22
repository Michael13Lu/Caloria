import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schemas';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('caloria.db');

  // Execute all table creation statements
  await db.execAsync(CREATE_TABLES_SQL);

  return db;
}

export async function generateId(): Promise<string> {
  // Simple UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function now(): string {
  return new Date().toISOString();
}
