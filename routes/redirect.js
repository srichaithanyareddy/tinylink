const express = require('express');
const router = express.Router();
const Link = require('../models/linkModel');

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const row = await Link.findByCode(code);
    if (!row) return res.status(404).send('Not found');
    await Link.incrementClick(code);
    return res.redirect(302, row.target);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
