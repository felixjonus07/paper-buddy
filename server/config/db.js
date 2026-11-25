const { Sequelize } = require('sequelize');

/**
 * Supabase Postgres connection.
 * Set DATABASE_URL in server/.env to the Supabase connection string
 * (Project Settings -> Database -> Connection string -> URI).
 * Use the "Session pooler" URI (port 5432) if your network has no IPv6.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[db] DATABASE_URL is not set. Add your Supabase Postgres URI to server/.env');
}

const isLocal = connectionString && /localhost|127\.0\.0\.1/.test(connectionString);

const sequelize = new Sequelize(connectionString || 'postgres://postgres:postgres@127.0.0.1:5432/postgres', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isLocal ? {} : { ssl: { require: true, rejectUnauthorized: false } },
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  define: {
    freezeTableName: true,
    timestamps: false,
  },
});

let connected = false;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Load models + associations, then create/alter tables to match the models
    require('../models');
    await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });
    connected = true;
    console.log('Connected to Supabase Postgres');
  } catch (err) {
    connected = false;
    console.error('Postgres connection error:', err.message);
  }
};

const isConnected = () => connected;

module.exports = { sequelize, connectDB, isConnected };
