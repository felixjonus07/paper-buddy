/**
 * Mongoose-style `populate` for Sequelize/Postgres.
 *
 * Replaces a foreign-key field (single UUID or UUID[]) on each record with the
 * referenced row(s) as plain objects, using ONE query per call (no N+1).
 *
 *   const fees = toPlain(await Fee.findAll({ where: { collegeId } }));
 *   await populate(fees, 'feeType', FeeType, ['name']);       // fee.feeType -> { _id, name } | null
 *   await populate(users, 'groups', Group, ['name']);         // user.groups -> [{ _id, name }, ...]
 *
 * - `records` may be a single object, an array, or null. Sequelize instances are
 *   converted to plain objects (the returned value is what you should use).
 * - `attributes` mirrors Mongoose's select string; `_id` is always included.
 *   Pass null/undefined for all columns. Use `exclude` (e.g. ['password']) to drop columns.
 * - Missing refs become null (single) or are dropped (arrays), like Mongoose.
 */
const toPlain = (rec) => {
  if (rec == null) return rec;
  if (Array.isArray(rec)) return rec.map(toPlain);
  return typeof rec.get === 'function' ? rec.get({ plain: true }) : rec;
};

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

async function populate(records, field, Model, attributes, { exclude } = {}) {
  if (records == null) return records;
  const isArray = Array.isArray(records);
  const list = toPlain(isArray ? records : [records]);

  const ids = new Set();
  for (const r of list) {
    if (!r) continue;
    const v = r[field];
    if (Array.isArray(v)) v.forEach((x) => x && ids.add(String(idOf(x))));
    else if (v) ids.add(String(idOf(v)));
  }

  let byId = new Map();
  if (ids.size) {
    const opts = { where: { _id: [...ids] }, raw: true };
    if (attributes && attributes.length) {
      opts.attributes = Array.from(new Set(['_id', ...attributes]));
    } else if (exclude && exclude.length) {
      opts.attributes = { exclude };
    }
    const rows = await Model.findAll(opts);
    byId = new Map(rows.map((row) => [String(row._id), row]));
  }

  for (const r of list) {
    if (!r) continue;
    const v = r[field];
    if (Array.isArray(v)) {
      r[field] = v.map((x) => byId.get(String(idOf(x)))).filter(Boolean);
    } else if (v) {
      r[field] = byId.get(String(idOf(v))) || null;
    } else {
      r[field] = null;
    }
  }

  return isArray ? list : list[0];
}

/** Escape user input before using it in an iLike pattern. */
const likeEscape = (s) => String(s).replace(/[\\%_]/g, (c) => `\\${c}`);

/** True if `v` looks like a UUID (replacement for mongoose.Types.ObjectId.isValid). */
const isUUID = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

module.exports = { populate, toPlain, likeEscape, isUUID };
