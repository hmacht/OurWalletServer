const express = require('express');
const router = express.Router();
const { createClient } = require("../lib/supabase")

router.get('/password-reset', async (req, res) => {
  const token_hash = req.query.token_hash
  const type = req.query.type

  if (token_hash && type) {
    const supabase = createClient({ req, res })
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return res.render('password-reset');
    }
  }

  return res.status(401).json({ error: error.message });
});

router.post('/password-reset', async (req, res) => {
  try {
      const { password, confirmPassword } = req.body;

      // Validate inputs
      if (!password || !confirmPassword) {
          return res.status(400).json({ error: 'Both password fields are required.' });
      }

      if (password !== confirmPassword) {
          return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const supabase = createClient({ req, res })

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({ 
          password: password 
      });

      if (updateError) {
          console.error('Error updating password:', updateError);
          return res.status(500).json({ error: 'Failed to update password.' });
      }

      return res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
      console.error('Password reset error:', err);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
