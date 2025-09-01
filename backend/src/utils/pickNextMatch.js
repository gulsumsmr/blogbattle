const Match = require('../models/Match');

// Get the next available match for voting
const getNextMatch = async (bracketId = null, userId = null) => {
  try {
    let query = { isClosed: false };
    
    if (bracketId) {
      query.bracketId = bracketId;
    }

    let match = await Match.findOne(query)
      .populate('postA', 'title content category imageUrl')
      .populate('postB', 'title content category imageUrl')
      .sort({ createdAt: 1 });

    // If user is provided, filter out matches they've already voted on
    if (userId && match) {
      const Vote = require('../models/Vote');
      const userVote = await Vote.findOne({
        user: userId,
        match: match._id
      });
      
      if (userVote) {
        // User already voted on this match, get the next one
        const votedMatchIds = await Vote.distinct('match', { user: userId });
        
        query._id = { $nin: votedMatchIds };
        match = await Match.findOne(query)
          .populate('postA', 'title content category imageUrl')
          .populate('postB', 'title content category imageUrl')
          .sort({ createdAt: 1 });
      }
    }

    return match;
  } catch (error) {
    console.error('Error getting next match:', error);
    throw error;
  }
};

// Get all active matches for a bracket
const getActiveMatches = async (bracketId) => {
  try {
    const matches = await Match.find({ 
      bracketId, 
      isClosed: false 
    })
    .populate('postA', 'title content category imageUrl')
    .populate('postB', 'title content category imageUrl')
    .sort({ isFinal: 1, createdAt: 1 });

    return matches;
  } catch (error) {
    console.error('Error getting active matches:', error);
    throw error;
  }
};

// Get completed matches for a bracket
const getCompletedMatches = async (bracketId) => {
  try {
    const matches = await Match.find({ 
      bracketId, 
      isClosed: true 
    })
    .populate('postA', 'title content category imageUrl')
    .populate('postB', 'title content category imageUrl')
    .populate('winner', 'title content category imageUrl')
    .sort({ closedAt: 1 });

    return matches;
  } catch (error) {
    console.error('Error getting completed matches:', error);
    throw error;
  }
};

module.exports = {
  getNextMatch,
  getActiveMatches,
  getCompletedMatches
};
