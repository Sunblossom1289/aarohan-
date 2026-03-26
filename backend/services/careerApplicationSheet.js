// backend/services/careerApplicationSheet.js
// Google Sheets integration for career applications.
// Uses shared OAuth2 client from googleSheets.js and persists sheet ID to MongoDB.

const { sheets: sheetsFactory } = require('@googleapis/sheets');
const mongoose = require('mongoose');

let sheetsApi = null;
let careerSpreadsheetId = null;

const SHEET_NAME = 'Career Applications';

const CAREER_HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Message',
  'LinkedIn',
  'GitHub',
  'Resume Drive Link',
];

const DB_KEY = 'career_sheet_id';

function getAppConfigModel() {
  if (mongoose.models.AppConfig) return mongoose.models.AppConfig;
  const configSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    updatedAt: { type: Date, default: Date.now },
  });
  return mongoose.model('AppConfig', configSchema);
}

async function loadSheetIdFromDB() {
  try {
    const AppConfig = getAppConfigModel();
    const doc = await AppConfig.findOne({ key: DB_KEY });
    return doc ? doc.value : null;
  } catch (e) {
    console.warn('Could not load career sheet ID from DB:', e.message);
    return null;
  }
}

async function saveSheetIdToDB(id) {
  try {
    const AppConfig = getAppConfigModel();
    await AppConfig.findOneAndUpdate(
      { key: DB_KEY },
      { value: id, updatedAt: new Date() },
      { upsert: true }
    );
    console.log('Career sheet ID saved to DB:', id);
  } catch (e) {
    console.error('Failed to save career sheet ID to DB:', e.message);
  }
}

async function getSheetsApi() {
  if (sheetsApi) return sheetsApi;

  const { getOAuth2Client, isAuthenticated } = require('./googleSheets');
  const client = await getOAuth2Client();
  const authed = await isAuthenticated();
  if (!client || !authed) return null;

  sheetsApi = sheetsFactory({ version: 'v4', auth: client });
  return sheetsApi;
}

async function getSpreadsheetId() {
  if (careerSpreadsheetId) return careerSpreadsheetId;

  if (process.env.GOOGLE_CAREER_SHEET_ID) {
    careerSpreadsheetId = process.env.GOOGLE_CAREER_SHEET_ID;
    return careerSpreadsheetId;
  }

  const fromDB = await loadSheetIdFromDB();
  if (fromDB) {
    careerSpreadsheetId = fromDB;
    return careerSpreadsheetId;
  }

  return null;
}

function setSpreadsheetId(id) {
  careerSpreadsheetId = id;
  saveSheetIdToDB(id).catch(() => {});
}

async function createCareerSheet() {
  const sheets = await getSheetsApi();
  if (!sheets) throw new Error('Sheets API not authenticated');

  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'Aarohan - Career Applications' },
      sheets: [{
        properties: {
          title: SHEET_NAME,
          gridProperties: { frozenRowCount: 1 },
        },
      }],
    },
  });

  const newId = res.data.spreadsheetId;
  careerSpreadsheetId = newId;
  await saveSheetIdToDB(newId);

  await sheets.spreadsheets.values.update({
    spreadsheetId: newId,
    range: `'${SHEET_NAME}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [CAREER_HEADERS] },
  });

  const sheetTabId = res.data.sheets[0].properties.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: newId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: sheetTabId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.106, green: 0.286, blue: 0.396 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId: sheetTabId, dimension: 'COLUMNS', startIndex: 0, endIndex: CAREER_HEADERS.length },
          },
        },
      ],
    },
  });

  return newId;
}

async function appendCareerSubmission(data) {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();

  if (!sheets || !sheetId) {
    console.warn('Career applications sheet not configured - skipping write');
    return false;
  }

  try {
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

    const row = [
      timestamp,
      data.name || '',
      data.email || '',
      data.phone || '',
      data.message || '',
      data.linkedin || '',
      data.github || '',
      data.resumeDriveLink || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${SHEET_NAME}'!A:H`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    return true;
  } catch (error) {
    console.error('Career sheet write error (non-fatal):', error.message);
    return false;
  }
}

module.exports = {
  getSpreadsheetId,
  setSpreadsheetId,
  createCareerSheet,
  appendCareerSubmission,
};
