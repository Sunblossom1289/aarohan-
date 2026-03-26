// backend/routes/sheetsOauth.js
// Public OAuth endpoints for Google integration setup.

const express = require('express');
const router = express.Router();
const googleSheets = require('../services/googleSheets');
const careerSheet = require('../services/careerApplicationSheet');

router.get('/ui', async (req, res) => {
  const authenticated = await googleSheets.isAuthenticated();
  const careerId = await careerSheet.getSpreadsheetId();
  const careerUrl = careerId ? `https://docs.google.com/spreadsheets/d/${careerId}` : null;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Aarohan - Google OAuth Setup</title>
    <style>
      body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; }
      .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 560px; width: 92%; }
      h1 { margin: 0 0 8px 0; font-size: 22px; }
      .status { color: ${authenticated ? '#16a34a' : '#dc2626'}; font-weight: 700; }
      .btn { display: inline-block; margin-top: 16px; background: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 10px; font-weight: 600; }
      .note { margin-top: 12px; color: #64748b; font-size: 14px; }
      .warn { color: #b45309; font-size: 14px; margin-top: 12px; }
    </style>
    </head>
    <body>
      <div class="card">
        <h1>Google OAuth Status</h1>
        <div>Google Access: <span class="status">${authenticated ? 'Connected' : 'Not connected'}</span></div>
        ${careerUrl ? `<div class="note">Career Sheet: <a href="${careerUrl}" target="_blank" rel="noopener noreferrer">Open</a></div>` : ''}
        <a class="btn" href="/sheets/oauth/start?redirect=true">Connect Google Account</a>
        <div class="note">After connecting, the Career Applications sheet will be created automatically if it does not exist.</div>
        <div class="note">Then submissions from the Career page form are appended to that sheet.</div>
      </div>
    </body>
    </html>
  `);
});

router.get('/start', async (req, res) => {
  const url = await googleSheets.getAuthUrl();
  if (!url) {
    return res.status(500).json({
      success: false,
      error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
  }

  if (req.query.redirect === 'true') {
    return res.redirect(url);
  }

  return res.json({ success: true, authUrl: url });
});

router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Missing authorization code' });
    }

    await googleSheets.handleOAuthCallback(code);

    let careerId = await careerSheet.getSpreadsheetId();
    let createdCareer = false;
    if (!careerId) {
      careerId = await careerSheet.createCareerSheet();
      createdCareer = true;
    }

    const careerUrl = `https://docs.google.com/spreadsheets/d/${careerId}`;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Aarohan - Career Sheet Connected</title>
      <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f4f8; }
        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 600px; }
        h1 { color: #2563eb; margin-bottom: 8px; }
        a { color: #2563eb; }
        .tag { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 99px; font-size: 14px; margin-top: 8px; }
      </style>
      </head>
      <body>
        <div class="card">
          <h1>Google Connected for Career Form</h1>
          <p class="tag">${createdCareer ? 'New career sheet created' : 'Using existing career sheet'}</p>
          <p style="margin-top: 20px;">
            <a href="${careerUrl}" target="_blank" rel="noopener noreferrer">Open Career Applications Google Sheet</a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
            You can now submit the Career form and entries will appear in this sheet.
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Sheets OAuth callback error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
