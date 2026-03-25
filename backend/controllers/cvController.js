const db = require('../db');

const getAllCVs = (req, res) => {
  const sql = 'SELECT id, name, email, keyprogramming, URLlinks FROM cvs';
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }
    res.json(result);
  });
};

const getCVById = (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT id, name, email, keyprogramming, profile, education, URLlinks FROM cvs WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }
    if (result.length === 0) {
      return res.json({ message: 'Not found' });
    }
    res.json(result[0]);
  });
};

const searchCVs = (req, res) => {
  const name = (req.query.name || '').trim();
  const keyprogramming = (req.query.keyprogramming || '').trim();

  if (!name && !keyprogramming) {
    return res.json({ message: 'Search name or keyprogramming' });
  }

  let sql = 'SELECT id, name, email, keyprogramming FROM cvs WHERE 1=1';
  const data = [];

  if (name) {
    sql += ' AND LOWER(name) LIKE LOWER(?)';
    data.push('%' + name + '%');
  }

  if (keyprogramming) {
    sql += ' AND LOWER(keyprogramming) LIKE LOWER(?)';
    data.push('%' + keyprogramming + '%');
  }

  db.query(sql, data, (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }
    res.json(result);
  });
};

const createCV = (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();

  if (!name || !email || !keyprogramming) {
    return res.json({ message: 'Please fill required fields' });
  }

  // if row exists, update it instead of insert
  db.query('SELECT id, email FROM cvs WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }

    if (result.length > 0) {
      const row = result[0];
      const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ?';
      db.query(sql, [name, keyprogramming, profile, education, URLlinks, row.id], (err2, result2) => {
        if (err2) {
          console.error('CV update (create) failed:', err2);
          return res.send('error');
        }
        console.log('CV updated (create):', row.id, {name, keyprogramming, profile, education, URLlinks});
        return res.json({ message: 'CV updated', id: row.id });
      });
      return;
    }

    const sql = 'INSERT INTO cvs (name, email, password, keyprogramming, profile, education, URLlinks) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, '', keyprogramming, profile, education, URLlinks], (err3, result2) => {
      if (err3) {
        console.error('CV create failed:', err3);
        return res.send('error');
      }
      console.log('CV created:', result2.insertId, {name, email, keyprogramming, education, profile, URLlinks});
      res.json({ message: 'CV created', id: result2.insertId });
    });
  });
};

const updateCV = (req, res) => {
  const id = req.params.id;
  const name = (req.body.name || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();
  const email = (req.body.email || '').trim();

  if (!name && !keyprogramming && !education && !profile && !URLlinks) {
    return res.json({ message: 'Nothing to update' });
  }

  if (!email) {
    return res.json({ message: 'Not allowed' });
  }

  // check owner by email
  db.query('SELECT email FROM cvs WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send('error');
    }
    if (result.length === 0) {
      return res.json({ message: 'Not found' });
    }
    if (result[0].email !== email) {
      return res.json({ message: 'Not allowed' });
    }

    const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ?';
    db.query(sql, [name, keyprogramming, profile, education, URLlinks, id], (err2, result2) => {
      if (err2) {
        console.error('CV update failed:', err2);
        return res.send('error');
      }
      console.log('CV updated:', id, {name, keyprogramming, education, profile, URLlinks});
      res.json({ message: 'Updated', id });
    });
  });
};

module.exports = {
  getAllCVs,
  getCVById,
  searchCVs,
  createCV,
  updateCV
};
