// Usage (from anywhere):  node g:\paper-buddy\server\scripts\check-db.js
// Connects to DATABASE_URL, creates any missing tables, and lists them.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const { connectDB, isConnected, sequelize } = require('../config/db');

(async () => {
  await connectDB();
  console.log('connected:', isConnected());
  if (isConnected()) {
    const rows = await sequelize.query(
      "select table_name from information_schema.tables where table_schema = 'public' order by 1",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('tables:', rows.map((r) => r.table_name).join(', '));
  }
  await sequelize.close();
  process.exit(isConnected() ? 0 : 1);
})();
