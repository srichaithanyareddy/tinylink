const db = require('../db');

const findByCode = async (code) => {
  const res = await db.query('SELECT * FROM links WHERE code = $1', [code]);
  return res.rows[0] || null;
};

const createLink = async ({ code, target }) => {
  const res = await db.query(
    'INSERT INTO links (code, target) VALUES ($1, $2) RETURNING *',
    [code, target]
  );
  return res.rows[0];
};

const listLinks = async () => {
  const res = await db.query('SELECT * FROM links ORDER BY created_at DESC');
  return res.rows;
};

const deleteByCode = async (code) => {
  const res = await db.query('DELETE FROM links WHERE code = $1 RETURNING *', [code]);
  return res.rows[0] || null;
};

const incrementClick = async (code) => {
  const res = await db.query(
    'UPDATE links SET clicks = clicks + 1, last_clicked = now() WHERE code = $1 RETURNING *',
    [code]
  );
  return res.rows[0] || null;
};

module.exports = {
  findByCode,
  createLink,
  listLinks,
  deleteByCode,
  incrementClick
};
