const express = require('express');
const Match = require('../models/Match');
const Vote = require('../models/Vote');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { createSemifinals, closeMatchIfLimitReached } = require('../utils/bracket');
const { getNextMatch, getActiveMatches, getCompletedMatches } = require('../utils/pickNextMatch');

const router = express.Router();

// Seed matches from 4 posts
router.post('/seed', auth, async (req, res) => {
  try {
    const { postIds, category } = req.body;

    let posts;
    
    if (postIds && postIds.length === 4) {
      // Use provided post IDs
      posts = await Post.find({ _id: { $in: postIds } });
      if (posts.length !== 4) {
        return res.status(400).json({
          error: 'One or more posts not found'
        });
      }
    } else {
      // Get 4 posts by category or latest
      let query = {};
      if (category) {
        query.category = category;
      }
      
      posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .limit(4);
        
      if (posts.length !== 4) {
        return res.status(400).json({
          error: `Not enough posts found${category ? ` in category "${category}"` : ''}. Need exactly 4 posts.`
        });
      }
    }

    // Create semifinals
    const { bracketId, matches } = await createSemifinals(posts.map(p => p._id));

    // Send notifications to post authors
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      // Get unique author IDs from posts
      const authorIds = [...new Set(posts.map(post => post.author.toString()))];
      
      authorIds.forEach(authorId => {
        io.to(`user:${authorId}`).emit('notify:match', {
          bracketId,
          matchIds: matches.map(m => m._id),
          message: 'Your post has been included in a new battle!',
          type: 'match_created'
        });
        console.log(`Sent match notification to user: ${authorId}`);
      });
      
      // Emit global event for new bracket creation
      io.emit('bracket:created', {
        bracketId,
        message: 'New tournament created!',
        type: 'bracket_created'
      });
      console.log(`Emitted bracket:created event for bracket: ${bracketId}`);
    }

    res.status(201).json({
      message: 'Matches seeded successfully',
      bracketId,
      matches: matches.map(match => ({
        id: match._id,
        postA: match.postA,
        postB: match.postB,
        isFinal: match.isFinal
      }))
    });

  } catch (error) {
    console.error('Seed matches error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get next match for voting
router.get('/next', async (req, res) => {
  try {
    const { bracketId } = req.query;
    
    // Try to get user from auth token if available
    let userId = null;
    try {
      const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);
      if (token) {
        const jwt = require('jsonwebtoken');
        const config = require('../config');
        const decoded = jwt.verify(token, config.JWT_SECRET);
        userId = decoded.userId;
      }
    } catch (error) {
      // Token invalid or missing, continue without user
    }
    
    const match = await getNextMatch(bracketId, userId);

    if (!match) {
      return res.status(404).json({
        error: 'No active matches found'
      });
    }

    res.json({ match });

  } catch (error) {
    console.error('Get next match error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on a match
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'A' or 'B'

    if (!vote || !['A', 'B'].includes(vote)) {
      return res.status(400).json({
        error: 'Vote must be either "A" or "B"'
      });
    }

    // Check if match exists and is not closed
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.isClosed) {
      return res.status(400).json({ error: 'Match is already closed' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      user: req.user._id,
      match: id
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this match' });
    }

    // Create vote
    const newVote = new Vote({
      user: req.user._id,
      match: id,
      votedFor: vote
    });

    await newVote.save();

    // Update match vote count
    if (vote === 'A') {
      match.votesA += 1;
    } else {
      match.votesB += 1;
    }

    await match.save();

    // Check if match should be closed
    const updatedMatch = await closeMatchIfLimitReached(id);

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      // Emit to specific bracket room and also globally
      const updateData = {
        matchId: id,
        votesA: updatedMatch.votesA,
        votesB: updatedMatch.votesB,
        percentageA: updatedMatch.percentageA,
        percentageB: updatedMatch.percentageB,
        isClosed: updatedMatch.isClosed
      };
      
      // Emit to bracket room
      io.to(updatedMatch.bracketId).emit('match:update', updateData);
      // Also emit globally for immediate updates
      io.emit('match:update', updateData);

      if (updatedMatch.isClosed) {
        const closeData = {
          matchId: id,
          winner: updatedMatch.winner,
          bracketId: updatedMatch.bracketId,
          isFinal: updatedMatch.isFinal
        };
        io.to(updatedMatch.bracketId).emit('match:closed', closeData);
        io.emit('match:closed', closeData);
        
        // If this was a semifinal that closed, check if final was created
        if (!updatedMatch.isFinal) {
          const { checkAndCreateFinal } = require('../utils/bracket');
          const finalMatch = await checkAndCreateFinal(updatedMatch.bracketId);
          if (finalMatch) {
            // Emit event for new final match
            io.to(updatedMatch.bracketId).emit('final:created', {
              bracketId: updatedMatch.bracketId,
              finalMatchId: finalMatch._id,
              postA: finalMatch.postA,
              postB: finalMatch.postB
            });
            io.emit('final:created', {
              bracketId: updatedMatch.bracketId,
              finalMatchId: finalMatch._id,
              postA: finalMatch.postA,
              postB: finalMatch.postB
            });
          }
        }
      }
    }

    res.json({
      message: 'Vote recorded successfully',
      match: {
        id: updatedMatch._id,
        votesA: updatedMatch.votesA,
        votesB: updatedMatch.votesB,
        percentageA: updatedMatch.percentageA,
        percentageB: updatedMatch.percentageB,
        isClosed: updatedMatch.isClosed
      }
    });

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active matches for a bracket
router.get('/active/:bracketId', async (req, res) => {
  try {
    const { bracketId } = req.params;
    const matches = await getActiveMatches(bracketId);

    res.json({ matches });

  } catch (error) {
    console.error('Get active matches error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get completed matches for a bracket
router.get('/completed/:bracketId', async (req, res) => {
  try {
    const { bracketId } = req.params;
    const matches = await getCompletedMatches(bracketId);

    res.json({ matches });

  } catch (error) {
    console.error('Get completed matches error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's vote for a match
router.get('/:id/my-vote', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const vote = await Vote.findOne({
      user: req.user._id,
      match: id
    });

    res.json({ 
      hasVoted: !!vote,
      vote: vote ? vote.votedFor : null 
    });

  } catch (error) {
    console.error('Get my vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== ADMIN ENDPOINTS =====

// Admin: Manually create match with username-based bracket
router.post('/admin/create', auth, admin, async (req, res) => {
  try {
    const { postIds, username, matchType = 'semifinal' } = req.body;

    if (!postIds || postIds.length !== 2) {
      return res.status(400).json({
        error: 'Exactly 2 post IDs are required'
      });
    }

    if (!username) {
      return res.status(400).json({
        error: 'Username is required'
      });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Create bracket ID from username
    const bracketId = `${username}_bracket`;

    // Check if posts exist
    const posts = await Post.find({ _id: { $in: postIds } });
    if (posts.length !== 2) {
      return res.status(400).json({
        error: 'One or more posts not found'
      });
    }

    // Create match
    const match = new Match({
      bracketId,
      postA: posts[0]._id,
      postB: posts[1]._id,
      isFinal: matchType === 'final',
      votesA: 0,
      votesB: 0,
      isClosed: false
    });

    await match.save();

    // Send notification to post authors
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const authorIds = [...new Set(posts.map(post => post.author.toString()))];
      
      authorIds.forEach(authorId => {
        io.to(`user:${authorId}`).emit('notify:match', {
          bracketId,
          matchId: match._id,
          message: 'Your post has been included in a new admin-created battle!',
          type: 'match_created'
        });
      });
      
      // Emit global event for new bracket creation
      io.emit('bracket:created', {
        bracketId,
        message: 'New admin tournament created!',
        type: 'bracket_created'
      });
      console.log(`Emitted bracket:created event for admin bracket: ${bracketId}`);
    }

    res.status(201).json({
      message: 'Match created successfully',
      match: {
        id: match._id,
        bracketId: match.bracketId,
        postA: match.postA,
        postB: match.postB,
        isFinal: match.isFinal
      }
    });

  } catch (error) {
    console.error('Admin create match error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Reset votes for a specific match
router.post('/admin/reset-votes/:matchId', auth, admin, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Find match
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Reset votes
    match.votesA = 0;
    match.votesB = 0;
    match.isClosed = false;
    match.closedAt = null;
    match.winner = null;
    await match.save();

    // Delete all votes for this match
    await Vote.deleteMany({ match: matchId });

    // Emit reset event
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(match.bracketId).emit('match:reset', {
        matchId,
        bracketId: match.bracketId,
        votesA: 0,
        votesB: 0
      });
    }

    res.json({
      message: 'Votes reset successfully',
      match: {
        id: match._id,
        votesA: match.votesA,
        votesB: match.votesB,
        isClosed: match.isClosed
      }
    });

  } catch (error) {
    console.error('Admin reset votes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Reset all votes for a bracket
router.post('/admin/reset-bracket/:bracketId', auth, admin, async (req, res) => {
  try {
    const { bracketId } = req.params;

    // Find all matches in bracket
    const matches = await Match.find({ bracketId });
    if (matches.length === 0) {
      return res.status(404).json({ error: 'Bracket not found' });
    }

    // Reset all matches
    for (const match of matches) {
      match.votesA = 0;
      match.votesB = 0;
      match.isClosed = false;
      match.closedAt = null;
      match.winner = null;
      await match.save();
    }

    // Delete all votes for this bracket
    const matchIds = matches.map(m => m._id);
    await Vote.deleteMany({ match: { $in: matchIds } });

    // Emit reset events
    if (req.app.get('io')) {
      const io = req.app.get('io');
      matches.forEach(match => {
        io.to(bracketId).emit('match:reset', {
          matchId: match._id,
          bracketId,
          votesA: 0,
          votesB: 0
        });
      });
    }

    res.json({
      message: 'All votes reset successfully',
      bracketId,
      matchesCount: matches.length
    });

  } catch (error) {
    console.error('Admin reset bracket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test endpoint for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!', timestamp: new Date().toISOString() });
});

// Admin: Get all brackets and matches (public for vote page)
router.get('/admin/brackets', async (req, res) => {
  try {
    console.log('Admin brackets endpoint called');
    
    const brackets = await Match.aggregate([
      {
        $group: {
          _id: '$bracketId',
          matches: { $push: '$$ROOT' },
          totalMatches: { $sum: 1 },
          activeMatches: {
            $sum: { $cond: [{ $eq: ['$isClosed', false] }, 1, 0] }
          },
          completedMatches: {
            $sum: { $cond: [{ $eq: ['$isClosed', true] }, 1, 0] }
          },
          // En eski match'in createdAt'ini al (bracket'in oluşturulma zamanı)
          createdAt: { $min: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'matches.postA',
          foreignField: '_id',
          as: 'postsA'
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'matches.postB',
          foreignField: '_id',
          as: 'postsB'
        }
      },
      {
        $sort: { createdAt: -1 } // En yeni bracket en üstte
      }
    ]);

    // Extract usernames from bracket IDs and add user info
    const bracketsWithUsers = brackets.map((bracket, index) => {
      const username = bracket._id.replace('_bracket', '');
      return {
        ...bracket,
        username,
        displayName: `Turnuva-${index + 1}`, // Sıralı numara (1, 2, 3...)
        originalBracketId: bracket._id
      };
    });

    console.log('Found brackets:', bracketsWithUsers.length);
    console.log('Sample bracket:', bracketsWithUsers[0]);

    res.json({ brackets: bracketsWithUsers });

  } catch (error) {
    console.error('Admin get brackets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete a match
router.delete('/admin/match/:matchId', auth, admin, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Find and delete match
    const match = await Match.findByIdAndDelete(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Delete all votes for this match
    await Vote.deleteMany({ match: matchId });

    // Emit delete event
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(match.bracketId).emit('match:deleted', {
        matchId,
        bracketId: match.bracketId
      });
    }

    res.json({
      message: 'Match deleted successfully',
      matchId
    });

  } catch (error) {
    console.error('Admin delete match error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete entire bracket
router.delete('/admin/bracket/:bracketId', auth, admin, async (req, res) => {
  try {
    const { bracketId } = req.params;

    // Find all matches in bracket
    const matches = await Match.find({ bracketId });
    if (matches.length === 0) {
      return res.status(404).json({ error: 'Bracket not found' });
    }

    // Delete all matches
    const matchIds = matches.map(m => m._id);
    await Match.deleteMany({ bracketId });

    // Delete all votes for these matches
    await Vote.deleteMany({ match: { $in: matchIds } });

    // Emit delete events
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(bracketId).emit('bracket:deleted', {
        bracketId,
        matchesCount: matches.length
      });
    }

    res.json({
      message: 'Bracket deleted successfully',
      bracketId,
      matchesCount: matches.length
    });

  } catch (error) {
    console.error('Admin delete bracket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all users for bracket creation
router.get('/admin/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, email: 1, _id: 1 })
      .sort({ username: 1 });



    res.json({ users });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
