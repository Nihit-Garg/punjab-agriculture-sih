const fs = require('fs');
const path = require('path');

// Mock data for peer board
let mockPeerBoardData = [
  {
    id: 1,
    title: "Best time to plant wheat in Punjab?",
    content: "I want to know the optimal planting time for wheat in Punjab region. What are the weather conditions to consider?",
    category: "crops",
    author: "Farmer Singh",
    authorLocation: "Amritsar, Punjab",
    type: "question",
    status: "open",
    createdAt: new Date('2024-01-15').toISOString(),
    viewCount: 45,
    answers: [
      {
        id: 1,
        content: "Best time is November 1st to December 15th. Soil temperature should be around 18-20°C.",
        author: "Agricultural Expert",
        authorLocation: "Ludhiana, Punjab",
        createdAt: new Date('2024-01-16').toISOString()
      }
    ]
  },
  {
    id: 2,
    title: "Organic fertilizer recommendations",
    content: "Looking for organic fertilizer options for vegetable farming. Any suggestions from experienced farmers?",
    category: "fertilizers",
    author: "Green Farmer",
    authorLocation: "Bathinda, Punjab",
    type: "question",
    status: "open",
    createdAt: new Date('2024-01-14').toISOString(),
    viewCount: 32,
    answers: []
  },
  {
    id: 3,
    title: "Pest control for cotton crops",
    content: "What are the best practices for controlling bollworm in cotton? Looking for both organic and chemical solutions.",
    category: "pest-control",
    author: "Cotton Farmer",
    authorLocation: "Fazilka, Punjab",
    type: "question",
    status: "answered",
    createdAt: new Date('2024-01-12').toISOString(),
    viewCount: 78,
    answers: [
      {
        id: 2,
        content: "Use BT cotton varieties and regular monitoring. Spray neem oil every 10 days for organic control.",
        author: "Pest Control Expert",
        authorLocation: "Bathinda, Punjab",
        createdAt: new Date('2024-01-13').toISOString()
      }
    ]
  }
];

let nextId = 4;
let nextAnswerId = 3;

const peerBoardController = {
  // GET /api/peer-board
  getPeerBoard: async (req, res) => {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        category, 
        status = 'open'
      } = req.query;
      
      let filteredData = [...mockPeerBoardData];
      
      // Filter by category
      if (category && category !== 'all') {
        filteredData = filteredData.filter(post => post.category === category);
      }
      
      // Filter by status
      if (status && status !== 'all') {
        filteredData = filteredData.filter(post => post.status === status);
      }
      
      // Sort by creation date (newest first)
      filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          posts: paginatedData,
          total: filteredData.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < filteredData.length
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
      const { 
        title, 
        content, 
        category, 
        author, 
        authorLocation,
        type
      } = req.body;
      
      if (!title || !content || !author) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'title, content, and author are required'
        });
      }
      
      // Create new post
      const newPost = {
        id: nextId++,
        title: title.trim(),
        content: content.trim(),
        category: category || 'general',
        author: author.trim(),
        authorLocation: authorLocation?.trim() || '',
        type: type || 'question',
        status: 'open',
        createdAt: new Date().toISOString(),
        viewCount: 0,
        answers: []
      };
      
      mockPeerBoardData.unshift(newPost);
      
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
      const postId = parseInt(id);
      
      const post = mockPeerBoardData.find(p => p.id === postId);
      
      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
          message: 'The specified post does not exist'
        });
      }

      // Increment view count
      post.viewCount++;

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
      const { content, author, authorLocation } = req.body;
      const postId = parseInt(id);
      
      if (!content || !author) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'content and author are required'
        });
      }

      const post = mockPeerBoardData.find(p => p.id === postId);
      
      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
          message: 'The specified post does not exist'
        });
      }

      const newAnswer = {
        id: nextAnswerId++,
        content: content.trim(),
        author: author.trim(),
        authorLocation: authorLocation?.trim() || '',
        createdAt: new Date().toISOString()
      };

      post.answers.push(newAnswer);
      post.status = 'answered';
      
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
      const { limit = 20, offset = 0, status = 'open' } = req.query;
      
      let filteredData = mockPeerBoardData.filter(post => post.category === category);
      
      if (status !== 'all') {
        filteredData = filteredData.filter(post => post.status === status);
      }
      
      // Sort by creation date (newest first)
      filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedData = filteredData.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          category: category,
          posts: paginatedData,
          total: filteredData.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < filteredData.length
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
  },
  
  // GET /api/peer-board/search - Search posts
  searchPosts: async (req, res) => {
    try {
      const { 
        q: query, 
        category, 
        status = 'open', 
        limit = 20, 
        offset = 0 
      } = req.query;
      
      if (!query) {
        return res.status(400).json({
          error: 'Missing query parameter',
          message: 'Search query (q) is required'
        });
      }
      
      let filteredData = mockPeerBoardData.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(query.toLowerCase()) ||
                             post.content.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = !category || category === 'all' || post.category === category;
        const matchesStatus = status === 'all' || post.status === status;
        
        return matchesSearch && matchesCategory && matchesStatus;
      });
      
      // Sort by creation date (newest first)
      filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          posts: paginatedData,
          query: query,
          category: category,
          status: status,
          total: filteredData.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < filteredData.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in searchPosts:', error);
      res.status(500).json({
        error: 'Failed to search posts',
        message: error.message
      });
    }
  }
};

module.exports = peerBoardController;