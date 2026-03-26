// backend/routes/careerApplications.js
// Routes for career application form submissions to a dedicated Google Sheet.

const express = require('express');
const router = express.Router();
const careerSheet = require('../services/careerApplicationSheet');
const googleSheets = require('../services/googleSheets');

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const hasDomain = (value, domain) => {
  try {
    const parsed = new URL(value);
    return parsed.hostname.includes(domain);
  } catch {
    return false;
  }
};

router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      linkedin,
      github,
      resumeDriveLink,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    if (!linkedin || !linkedin.trim() || !hasDomain(linkedin.trim(), 'linkedin.com')) {
      return res.status(400).json({ success: false, error: 'Valid LinkedIn URL is required' });
    }
    if (!github || !github.trim() || !hasDomain(github.trim(), 'github.com')) {
      return res.status(400).json({ success: false, error: 'Valid GitHub URL is required' });
    }
    if (!resumeDriveLink || !resumeDriveLink.trim() || !isValidUrl(resumeDriveLink.trim())) {
      return res.status(400).json({ success: false, error: 'Valid resume drive link is required' });
    }

    const authenticated = await googleSheets.isAuthenticated();
    if (!authenticated) {
      const baseUrl = getBaseUrl(req);
      console.warn('Google Sheets not authenticated - career submission stored only in logs');
      console.log('Career submission (no sheet):', {
        name,
        email,
        phone,
        linkedin,
        github,
        resumeDriveLink,
      });
      return res.status(503).json({
        success: false,
        error: 'Google Sheets is not connected on the server. Ask an admin to complete Google Sheets OAuth and sheet setup.',
        setupUrl: `${baseUrl}/sheets/oauth/ui`,
        statusUrl: `${baseUrl}/career-applications/status`,
      });
    }

    let sheetId = await careerSheet.getSpreadsheetId();
    if (!sheetId) {
      try {
        sheetId = await careerSheet.createCareerSheet();
        console.log('Auto-created career sheet:', sheetId);
      } catch (createErr) {
        console.error('Failed to auto-create career sheet:', createErr.message);
        return res.status(500).json({
          success: false,
          error: 'Could not create the career applications sheet. Please try again later.',
        });
      }
    }

    const appended = await careerSheet.appendCareerSubmission({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      linkedin: linkedin.trim(),
      github: github.trim(),
      resumeDriveLink: resumeDriveLink.trim(),
    });

    if (!appended) {
      return res.status(502).json({
        success: false,
        error: 'Failed to write application to Google Sheets. Please try again.',
      });
    }

    return res.json({ success: true, message: 'Application submitted successfully.' });
  } catch (error) {
    console.error('Career applications error:', error);
    return res.status(500).json({
      success: false,
      error: 'Career application submission failed due to a server error.',
    });
  }
});

router.get('/status', async (req, res) => {
  const authenticated = await googleSheets.isAuthenticated();
  const sheetId = await careerSheet.getSpreadsheetId();
  const baseUrl = getBaseUrl(req);

  return res.json({
    success: true,
    careerSheetConnected: authenticated && !!sheetId,
    spreadsheetId: sheetId || null,
    spreadsheetUrl: sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}` : null,
    setupUrl: `${baseUrl}/sheets/oauth/ui`,
  });
});

// Career-specific OAuth flow (public setup helper)
router.get('/oauth/start', async (req, res) => {
  const authUrl = await googleSheets.getAuthUrl();
  if (!authUrl) {
    return res.status(500).json({
      success: false,
      error: 'Google OAuth is not configured on the backend. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.',
    });
  }

  if (req.query.redirect === 'true') {
    return res.redirect(authUrl);
  }

  return res.json({ success: true, authUrl });
});

router.get('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Missing authorization code' });
    }

    await googleSheets.handleOAuthCallback(code);

    let sheetId = await careerSheet.getSpreadsheetId();
    let created = false;

    if (!sheetId) {
      sheetId = await careerSheet.createCareerSheet();
      created = true;
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Aarohan Career Sheet Connected</title>
      <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f4f8; }
        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 560px; }
        h1 { color: #2563eb; margin-bottom: 8px; }
        a { color: #2563eb; }
        .tag { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 99px; font-size: 14px; margin-top: 8px; }
      </style>
      </head>
      <body>
        <div class="card">
          <h1>Career Applications Sheet Connected</h1>
          <p class="tag">${created ? 'New career sheet created' : 'Using existing career sheet'}</p>
          <p style="margin-top: 18px;">
            <a href="${sheetUrl}" target="_blank" rel="noopener noreferrer">Open Career Applications Google Sheet</a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
            All new career applications will now be appended to this sheet.
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Career OAuth callback error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/sheet-link', async (req, res) => {
  const authenticated = await googleSheets.isAuthenticated();
  const sheetId = await careerSheet.getSpreadsheetId();
  const baseUrl = getBaseUrl(req);

  return res.json({
    success: true,
    authenticated,
    spreadsheetId: sheetId || null,
    spreadsheetUrl: sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}` : null,
    setupUrl: `${baseUrl}/sheets/oauth/ui`,
    message: sheetId
      ? 'Career sheet is connected.'
      : 'Career sheet is not connected yet. Open setupUrl to connect and create one.',
  });
});

router.post('/create-sheet', async (req, res) => {
  try {
    const authenticated = await googleSheets.isAuthenticated();
    if (!authenticated) {
      return res.status(401).json({ success: false, error: 'Google Sheets not authenticated. Connect via /sheets/oauth/start first.' });
    }

    const sheetId = await careerSheet.createCareerSheet();
    return res.json({
      success: true,
      spreadsheetId: sheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      message: 'Career applications sheet created. Optionally set GOOGLE_CAREER_SHEET_ID in your env.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/connect', (req, res) => {
  const { spreadsheetId } = req.body;
  if (!spreadsheetId) {
    return res.status(400).json({ success: false, error: 'spreadsheetId is required' });
  }

  careerSheet.setSpreadsheetId(spreadsheetId);

  return res.json({
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  });
});

module.exports = router;
