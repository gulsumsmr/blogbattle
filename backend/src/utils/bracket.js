const Match = require('../models/Match');
const Post = require('../models/Post');
const config = require('../config');

// Generate a unique bracket ID
const generateBracketId = () => {
  return `bracket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create semifinal matches from 4 posts
const createSemifinals = async (postIds) => {
  if (postIds.length !== 4) {
    throw new Error('Exactly 4 posts required for semifinals');
  }

  const bracketId = generateBracketId();
  const matches = [];

  // Create two semifinal matches
  for (let i = 0; i < 2; i++) {
    const match = new Match({
      bracketId,
      postA: postIds[i * 2],
      postB: postIds[i * 2 + 1],
      isFinal: false
    });
    
    await match.save();
    matches.push(match);
  }

  console.log(`Created semifinals for bracket: ${bracketId}`);
  return { bracketId, matches };
};

// Check if both semifinals are closed and create final
const checkAndCreateFinal = async (bracketId) => {
  const semifinals = await Match.find({ 
    bracketId, 
    isFinal: false 
  }).populate('postA postB');

  console.log(`Checking semifinals for bracket: ${bracketId}, found: ${semifinals.length}`);

  if (semifinals.length !== 2) {
    console.log(`Not enough semifinals found for bracket: ${bracketId}`);
    return null;
  }

  const bothClosed = semifinals.every(match => match.isClosed);
  
  if (!bothClosed) {
    console.log(`Not all semifinals are closed for bracket: ${bracketId}`);
    return null;
  }

  // Check if final already exists
  const existingFinal = await Match.findOne({ 
    bracketId, 
    isFinal: true 
  });

  if (existingFinal) {
    console.log(`Final match already exists for bracket: ${bracketId}`);
    return existingFinal;
  }

  // Get winners
  const winners = semifinals.map(match => {
    const winner = match.votesA > match.votesB ? match.postA : match.postB;
    console.log(`Winner from match ${match._id}: ${winner.title} (${match.votesA} vs ${match.votesB})`);
    return winner;
  });

  // Create final match
  const finalMatch = new Match({
    bracketId,
    postA: winners[0],
    postB: winners[1],
    isFinal: true
  });

  await finalMatch.save();
  console.log(`Created final match ${finalMatch._id} for bracket: ${bracketId}`);
  console.log(`Final: ${winners[0].title} vs ${winners[1].title}`);
  
  return finalMatch;
};

// Close match when vote limit is reached
const closeMatchIfLimitReached = async (matchId) => {
  const match = await Match.findById(matchId);
  
  if (!match || match.isClosed) {
    return match;
  }

  const totalVotes = match.votesA + match.votesB;
  
  if (totalVotes >= config.VOTE_LIMIT) {
    match.isClosed = true;
    match.closedAt = new Date();
    match.winner = match.votesA > match.votesB ? match.postA : match.postB;
    
    await match.save();
    console.log(`Match ${matchId} closed with ${totalVotes} votes (VOTE_LIMIT: ${config.VOTE_LIMIT})`);
    
    // Update winner's wins count
    const winnerPost = match.votesA > match.votesB ? match.postA : match.postB;
    await Post.findByIdAndUpdate(winnerPost, { $inc: { wins: 1 } });
    console.log(`Updated wins count for post: ${winnerPost}`);
    
    // Check if we need to create a final (only for semifinals)
    if (!match.isFinal) {
      const finalMatch = await checkAndCreateFinal(match.bracketId);
      if (finalMatch) {
        console.log(`Final match created: ${finalMatch._id} for bracket: ${match.bracketId}`);
      }
    }
  }

  return match;
};

module.exports = {
  generateBracketId,
  createSemifinals,
  checkAndCreateFinal,
  closeMatchIfLimitReached
};
