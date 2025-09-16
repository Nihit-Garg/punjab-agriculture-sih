const fs = require('fs-extra');
const path = require('path');

const PEER_BOARD_FILE = path.join(__dirname, '..', 'data', 'peer_board.json');

const peerBoardController = {
  // Helper function to read peer board data
  async readPeerBoardData() {
    try {
      if (await fs.pathExists(PEER_BOARD_FILE)) {
        return await fs.readJson(PEER_BOARD_FILE);
      }
      return { posts: [] };
    } catch (error) {
      console.error('Error reading peer board data:', error);
      return { posts: [] };
    }
  },

  // Helper function to write peer board data
  async writePeerBoardData(data) {
    try {
      await fs.writeJson(PEER_BOARD_FILE, data, { spaces: 2 });
    } catch (error) {
      console.error('Error writing peer board data:', error);
      throw error;
    }
  },

  // GET /api/peer-board
  getPeerBoard: async (req, res) => {
    try {
      const { limit = 20, offset = 0, category } = req.query;
      const data = await peerBoardController.readPeerBoardData();
      
      let posts = data.posts || [];
      
      // Filter by category if specified
      if (category) {
        posts = posts.filter(post => post.category === category);
      }
      
      // Sort by timestamp (most recent first)
      posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedPosts = posts.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          posts: paginatedPosts,
          total: posts.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getPeerBoard:', error);
      res.status(500).json({
        error: 'Failed to get peer board data',
        message: error.message
      });
    }
  },

  // POST /api/peer-board
  addToPeerBoard: async (req, res) => {
    try {
      const { title, content, category, author, type } = req.body;
      
      if (!title || !content || !author) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'title, content, and author are required'
        });
      }

      const data = await peerBoardController.readPeerBoardData();
      if (!data.posts) data.posts = [];

      const newPost = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title,
        content,
        category: category || 'general',
        author,
        type: type || 'question', // question, tip, discussion
        timestamp: new Date().toISOString(),
        answers: [],
        likes: 0,
        views: 0
      };

      data.posts.push(newPost);
      await peerBoardController.writePeerBoardData(data);

      res.status(201).json({
        success: true,
        message: 'Post added successfully',
        data: newPost,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in addToPeerBoard:', error);
      res.status(500).json({
        error: 'Failed to add post',
        message: error.message
      });
    }
  },

  // GET /api/peer-board/:id
  getPeerBoardItem: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await peerBoardController.readPeerBoardData();
      
      const post = data.posts.find(p => p.id === id);
      
      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
          message: 'The specified post does not exist'
        });
      }

      // Increment view count
      post.views = (post.views || 0) + 1;
      await peerBoardController.writePeerBoardData(data);

      res.json({
        success: true,
        data: post,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getPeerBoardItem:', error);
      res.status(500).json({
        error: 'Failed to get post',
        message: error.message
      });
    }
  },

  // PUT /api/peer-board/:id/answer
  addAnswer: async (req, res) => {
    try {
      const { id } = req.params;
      const { content, author } = req.body;
      
      if (!content || !author) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'content and author are required'
        });
      }

      const data = await peerBoardController.readPeerBoardData();
      const post = data.posts.find(p => p.id === id);
      
      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
          message: 'The specified post does not exist'
        });
      }

      if (!post.answers) post.answers = [];

      const newAnswer = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content,
        author,
        timestamp: new Date().toISOString(),
        likes: 0
      };

      post.answers.push(newAnswer);
      await peerBoardController.writePeerBoardData(data);

      res.json({
        success: true,
        message: 'Answer added successfully',
        data: newAnswer,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in addAnswer:', error);
      res.status(500).json({
        error: 'Failed to add answer',
        message: error.message
      });
    }
  },

  // GET /api/peer-board/category/:category
  getByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const data = await peerBoardController.readPeerBoardData();
      
      const posts = (data.posts || [])
        .filter(post => post.category === category)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedPosts = posts.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          category: category,
          posts: paginatedPosts,
          total: posts.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getByCategory:', error);
      res.status(500).json({
        error: 'Failed to get posts by category',
        message: error.message
      });
    }
  }
};

module.exports = peerBoardController;