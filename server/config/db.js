const { Sequelize } = require('sequelize');
const pg = require('pg');

/**
 * Supabase Postgres connection.
 * Set DATABASE_URL in server/.env (local) or Vercel Environment Variables (prod).
 * On Vercel, you can use the transaction-mode pooler (port 6543) or session-mode (5432).
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[db] DATABASE_URL is not set.');
}

const isLocal = connectionString && /localhost|127\.0\.0\.1/.test(connectionString);

const sequelize = new Sequelize(connectionString || 'postgres://postgres:postgres@127.0.0.1:5432/postgres', {
  dialect: 'postgres',
  dialectModule: pg, // Ensures Vercel @vercel/node bundles `pg` alongside `sequelize`
  logging: false,
  dialectOptions: isLocal ? {} : { ssl: { require: true, rejectUnauthorized: false } },
  pool: { max: 5, min: 0, idle: 10000, acquire: 30000 },
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});

let connected = false;
let connectPromise = null;

const connectDB = async () => {
  if (connected) return true;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      await sequelize.authenticate();
      require('../models');
      // Tables are already created in Supabase; only run sync() locally or when explicitly requested
      if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });
      }
      connected = true;
      console.log('Connected to Supabase Postgres');
      return true;
    } catch (err) {
      connected = false;
      console.error('Postgres connection error:', err.message);
      return false;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
};

const isConnected = () => connected;

module.exports = { sequelize, connectDB, isConnected };
