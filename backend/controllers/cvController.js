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
  console.log('=== GET CV BY ID ===');
  console.log('Fetching ID:', id);
  
  const sql = 'SELECT id, name, email, keyprogramming, profile, education, URLlinks FROM cvs WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('SELECT getCVById error:', err);
      return res.send('error');
    }
    console.log('Query result:', result);
    
    if (result.length === 0) {
      console.log('No record found for id:', id);
      return res.json({ message: 'Not found' });
    }
    console.log('Returning CV data:', result[0]);
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
  console.log('\n>>> CREATE CV HANDLER CALLED');
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.body.name:', req.body.name, 'type:', typeof req.body.name);
  console.log('req.body.email:', req.body.email, 'type:', typeof req.body.email);
  console.log('req.body.keyprogramming:', req.body.keyprogramming, 'type:', typeof req.body.keyprogramming);
  console.log('req.body.profile:', req.body.profile, 'type:', typeof req.body.profile);
  console.log('req.body.education:', req.body.education, 'type:', typeof req.body.education);
  console.log('req.body.URLlinks:', req.body.URLlinks, 'type:', typeof req.body.URLlinks);
  
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();

  console.log('After trim - Parsed fields:', {
    name: `"${name}"`,
    email: `"${email}"`,
    keyprogramming: `"${keyprogramming}"`,
    education: `"${education}"`,
    profile: `"${profile}"`,
    URLlinks: `"${URLlinks}"`
  });

  // Validation like registration
  if (!name || !email || !keyprogramming) {
    console.log('❌ Validation FAILED - missing required fields');
    console.log('   name empty?', !name, ' email empty?', !email, ' keyprogramming empty?', !keyprogramming);
    return res.json({ message: 'Please fill required fields' });
  }

  console.log('✓ Validation passed');

  // Find user by email (must exist from registration)
  db.query('SELECT id FROM cvs WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('❌ SELECT error:', err);
      return res.send('error');
    }

    console.log('Database query result:', result);
    console.log('Records found:', result.length);

    if (result.length === 0) {
      console.log('❌ User not found for email:', email);
      return res.json({ message: 'User not found. Please register first.' });
    }

    const userId = result[0].id;
    console.log('✓ User found with ID:', userId);
    
    // UPDATE user's CV fields
    const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ?';
    const values = [name, keyprogramming, profile || null, education || null, URLlinks || null, userId];
    
    console.log('Executing UPDATE query:', sql);
    console.log('With parameters:', values);
    
    db.query(sql, values, (err2, result2) => {
      if (err2) {
        console.error('❌ UPDATE error:', err2);
        return res.send('error');
      }
      console.log('✓ UPDATE successful');
      console.log('Result:', result2);
      console.log('Affected rows:', result2.affectedRows);
      console.log('Changed rows:', result2.changedRows);
      
      res.json({ message: 'CV created', id: userId });
    });
  });
};

const updateCV = (req, res) => {
  const id = req.params.id;
  console.log('\n>>> UPDATE CV HANDLER CALLED');
  console.log('URL Param id:', id);
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.body.name:', req.body.name, 'type:', typeof req.body.name);
  console.log('req.body.keyprogramming:', req.body.keyprogramming, 'type:', typeof req.body.keyprogramming);
  console.log('req.body.email:', req.body.email, 'type:', typeof req.body.email);
  
  const name = (req.body.name || '').trim();
  const keyprogramming = (req.body.keyprogramming || '').trim();
  const education = (req.body.education || '').trim();
  const profile = (req.body.profile || '').trim();
  const URLlinks = (req.body.URLlinks || '').trim();
  const email = (req.body.email || '').trim();

  console.log('After trim - Parsed fields:', {
    name: `"${name}"`,
    keyprogramming: `"${keyprogramming}"`,
    email: `"${email}"`,
    education: `"${education}"`,
    profile: `"${profile}"`,
    URLlinks: `"${URLlinks}"`
  });

  // Validation like registration
  if (!name || !keyprogramming) {
    console.log('❌ Validation FAILED - name or keyprogramming empty');
    console.log('   name empty?', !name, ' keyprogramming empty?', !keyprogramming);
    return res.json({ message: 'Name and keyprogramming are required' });
  }

  if (!email) {
    console.log('❌ Validation FAILED - email required for verification');
    return res.json({ message: 'Email required for verification' });
  }

  console.log('✓ Validation passed');

  // Check ownership by email like registration checked email
  db.query('SELECT id, email FROM cvs WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ SELECT error:', err);
      return res.send('error');
    }

    console.log('Database query result:', result);
    console.log('Records found:', result.length);

    if (result.length === 0) {
      console.log('❌ CV not found for id:', id);
      return res.json({ message: 'CV not found' });
    }

    // Verify owner
    const dbEmail = result[0].email;
    console.log('Record email from DB:', dbEmail);
    console.log('Email provided:', email);
    console.log('Match?', dbEmail === email);
    
    if (dbEmail !== email) {
      console.log('❌ Email mismatch - ownership check failed');
      return res.json({ message: 'Not allowed - ownership verification failed' });
    }

    console.log('✓ Ownership verified');

    // UPDATE like registration just sets values
    const sql = 'UPDATE cvs SET name = ?, keyprogramming = ?, profile = ?, education = ?, URLlinks = ? WHERE id = ?';
    const values = [name, keyprogramming, profile || null, education || null, URLlinks || null, id];
    
    console.log('Executing UPDATE query:', sql);
    console.log('With parameters:', values);
    
    db.query(sql, values, (err2, result2) => {
      if (err2) {
        console.error('❌ UPDATE error:', err2);
        return res.send('error');
      }
      console.log('✓ UPDATE successful');
      console.log('Result:', result2);
      console.log('Affected rows:', result2.affectedRows);
      console.log('Changed rows:', result2.changedRows);
      
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
