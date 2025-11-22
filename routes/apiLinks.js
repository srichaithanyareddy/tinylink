const express = require('express');
const validUrl = require('valid-url');
const router = express.Router();
const Link = require('../models/linkModel');

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;
function makeRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

// POST /api/links
router.post('/', async (req, res) => {
  try {
    const { target, code: customCode } = req.body || {};
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ error: 'target is required' });
    }

    if (!validUrl.isWebUri(target)) {
      return res.status(400).json({ error: 'invalid URL' });
    }

    let code = customCode && String(customCode).trim();
    if (code) {
      if (!CODE_REGEX.test(code)) {
        return res.status(400).json({ error: 'custom code must match [A-Za-z0-9]{6,8}' });
      }
      const existing = await Link.findByCode(code);
      if (existing) {
        return res.status(409).json({ error: 'code already exists' });
      }
    } else {
      let attempts = 0;
      do {
        code = makeRandomCode();
        attempts++;
        if (attempts > 10) break;
      } while (await Link.findByCode(code));
      if (await Link.findByCode(code)) {
        code = code + Date.now().toString().slice(-2);
      }
    }

    const created = await Link.createLink({ code, target });
    return res.status(201).json({ code: created.code, target: created.target });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// GET /api/links
router.get('/', async (req, res) => {
  try {
    const rows = await Link.listLinks();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// GET /api/links/:code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const row = await Link.findByCode(code);
    if (!row) return res.status(404).json({ error: 'not found' });
    return res.json(row);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// DELETE /api/links/:code
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const deleted = await Link.deleteByCode(code);
    if (!deleted) return res.status(404).json({ error: 'not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
