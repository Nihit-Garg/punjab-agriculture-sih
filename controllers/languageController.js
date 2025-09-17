// Language preference storage (in-memory for now)
let userLanguagePreferences = {};

const languageController = {
  // GET /api/language/options - Get available language options
  getLanguageOptions: async (req, res) => {
    try {
      const availableLanguages = [
        {
          code: 'en',
          name: 'English',
          nativeName: 'English',
          flag: '🇺🇸',
          description: 'English language support for all agricultural content'
        },
        {
          code: 'hi',
          name: 'Hindi',
          nativeName: 'हिंदी',
          flag: '🇮🇳',
          description: 'कृषि सामग्री के लिए हिंदी भाषा समर्थन'
        },
        {
          code: 'pa',
          name: 'Punjabi',
          nativeName: 'ਪੰਜਾਬੀ',
          flag: '🇮🇳',
          description: 'ਖੇਤੀਬਾੜੀ ਸਮਗਰੀ ਲਈ ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਸਹਾਇਤਾ'
        }
      ];

      res.json({
        success: true,
        data: {
          languages: availableLanguages,
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'hi', 'pa']
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getLanguageOptions:', error);
      res.status(500).json({
        error: 'Failed to get language options',
        message: error.message
      });
    }
  },

  // POST /api/language/preference - Set user language preference
  setLanguagePreference: async (req, res) => {
    try {
      const { language, userId, sessionId } = req.body;

      // Validate language code
      const supportedLanguages = ['en', 'hi', 'pa'];
      if (!language || !supportedLanguages.includes(language)) {
        return res.status(400).json({
          error: 'Invalid language',
          message: 'Language must be one of: en, hi, pa',
          supportedLanguages: supportedLanguages
        });
      }

      // Generate a session identifier if none provided
      const sessionIdentifier = sessionId || userId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store language preference
      userLanguagePreferences[sessionIdentifier] = {
        language: language,
        setAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };

      // Get language details
      const languageDetails = {
        'en': { name: 'English', nativeName: 'English' },
        'hi': { name: 'Hindi', nativeName: 'हिंदी' },
        'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
      };

      res.json({
        success: true,
        data: {
          sessionId: sessionIdentifier,
          language: language,
          languageDetails: languageDetails[language],
          message: `Language preference set to ${languageDetails[language].name}`,
          redirectUrl: `/api/dashboard?lang=${language}`
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in setLanguagePreference:', error);
      res.status(500).json({
        error: 'Failed to set language preference',
        message: error.message
      });
    }
  },

  // GET /api/language/preference/:sessionId - Get user language preference
  getLanguagePreference: async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Missing session ID',
          message: 'Session ID is required'
        });
      }

      const preference = userLanguagePreferences[sessionId];

      if (!preference) {
        return res.status(404).json({
          error: 'Preference not found',
          message: 'No language preference found for this session',
          defaultLanguage: 'en'
        });
      }

      // Update last used timestamp
      preference.lastUsed = new Date().toISOString();

      const languageDetails = {
        'en': { name: 'English', nativeName: 'English' },
        'hi': { name: 'Hindi', nativeName: 'हिंदी' },
        'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
      };

      res.json({
        success: true,
        data: {
          sessionId: sessionId,
          language: preference.language,
          languageDetails: languageDetails[preference.language],
          setAt: preference.setAt,
          lastUsed: preference.lastUsed
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getLanguagePreference:', error);
      res.status(500).json({
        error: 'Failed to get language preference',
        message: error.message
      });
    }
  },

  // GET /api/language/welcome - Language selection landing page data
  getWelcomePage: async (req, res) => {
    try {
      const welcomeData = {
        title: "Welcome to Agri Advisory Platform",
        subtitle: "Choose your preferred language to get started",
        instructions: "Select a language to view all agricultural content in your preferred language",
        languages: [
          {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇺🇸',
            description: 'Get expert agricultural advice in English',
            buttonText: 'Continue in English'
          },
          {
            code: 'hi', 
            name: 'Hindi',
            nativeName: 'हिंदी',
            flag: '🇮🇳',
            description: 'हिंदी में विशेषज्ञ कृषि सलाह प्राप्त करें',
            buttonText: 'हिंदी में जारी रखें'
          },
          {
            code: 'pa',
            name: 'Punjabi',
            nativeName: 'ਪੰਜਾਬੀ', 
            flag: '🇮🇳',
            description: 'ਪੰਜਾਬੀ ਵਿੱਚ ਮਾਹਰ ਖੇਤੀਬਾੜੀ ਸਲਾਹ ਪ੍ਰਾਪਤ ਕਰੋ',
            buttonText: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ'
          }
        ],
        features: [
          "Crop recommendations based on your soil and weather",
          "Pest and disease identification",
          "Real-time weather updates",
          "Community Q&A with fellow farmers",
          "Soil analysis and fertilizer suggestions"
        ]
      };

      res.json({
        success: true,
        data: welcomeData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getWelcomePage:', error);
      res.status(500).json({
        error: 'Failed to get welcome page data',
        message: error.message
      });
    }
  },

  // GET /api/language/stats - Get language usage statistics
  getLanguageStats: async (req, res) => {
    try {
      const preferences = Object.values(userLanguagePreferences);
      
      const stats = {
        totalUsers: preferences.length,
        languageDistribution: {
          en: preferences.filter(p => p.language === 'en').length,
          hi: preferences.filter(p => p.language === 'hi').length,
          pa: preferences.filter(p => p.language === 'pa').length
        },
        recentActivity: preferences
          .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
          .slice(0, 10)
          .map(p => ({
            language: p.language,
            lastUsed: p.lastUsed
          }))
      };

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getLanguageStats:', error);
      res.status(500).json({
        error: 'Failed to get language statistics',
        message: error.message
      });
    }
  }
};

module.exports = languageController;