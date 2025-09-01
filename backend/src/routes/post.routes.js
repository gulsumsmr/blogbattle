const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, imageUrl } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        error: 'Title, content, and category are required'
      });
    }

    const post = new Post({
      title,
      content,
      category,
      imageUrl: imageUrl || null,
      author: req.user._id
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const { category, author } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({ posts });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Post.distinct('category');
    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
