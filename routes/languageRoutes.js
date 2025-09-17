const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const { validateLanguagePreference, validateSessionId } = require('../middleware/validation');

// GET /api/language/welcome - Language selection landing page data
router.get('/welcome', languageController.getWelcomePage);

// GET /api/language/options - Get available language options
router.get('/options', languageController.getLanguageOptions);

// POST /api/language/preference - Set user language preference
router.post('/preference', validateLanguagePreference, languageController.setLanguagePreference);

// GET /api/language/preference/:sessionId - Get user language preference
router.get('/preference/:sessionId', validateSessionId, languageController.getLanguagePreference);

// GET /api/language/stats - Get language usage statistics (admin endpoint)
router.get('/stats', languageController.getLanguageStats);

module.exports = router;