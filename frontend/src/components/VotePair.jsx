import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useVoteMutation, useGetMyVoteQuery } from '../features/match/matchApi';
import WinnerBadge from './WinnerBadge';

function VotePair({ match, onVoteUpdate }) {
  const [selectedVote, setSelectedVote] = useState(null);
  const [vote, { isLoading: isVoting }] = useVoteMutation();
  const { data: myVote } = useGetMyVoteQuery(match._id);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [localVotesA, setLocalVotesA] = useState(match.votesA);
  const [localVotesB, setLocalVotesB] = useState(match.votesB);
  const [showProgressAnimation, setShowProgressAnimation] = useState(false);
  
  // Swipe state
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeCurrentX, setSwipeCurrentX] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (myVote?.hasVoted) {
      setSelectedVote(myVote.vote);
    }
  }, [myVote]);

  // Update local votes when match prop changes
  useEffect(() => {
    setLocalVotesA(match.votesA);
    setLocalVotesB(match.votesB);
  }, [match.votesA, match.votesB]);

  // Listen for Socket.IO updates
  useEffect(() => {
    const handleMatchUpdate = (data) => {
      if (data.matchId === match._id) {
        setLocalVotesA(data.votesA);
        setLocalVotesB(data.votesB);
        
        // Show progress animation
        setShowProgressAnimation(true);
        setTimeout(() => setShowProgressAnimation(false), 1000);
      }
    };

    // Add event listener if window.socket exists
    if (window.socket) {
      window.socket.on('match:update', handleMatchUpdate);
    }

    return () => {
      if (window.socket) {
        window.socket.off('match:update', handleMatchUpdate);
      }
    };
  }, [match._id]);

  const handleVote = async (voteChoice) => {
    if (!isAuthenticated) {
      if (window.showToast) {
        window.showToast({
          message: 'Oy vermek için giriş yapın',
          type: 'warning',
          duration: 3000
        });
      }
      return;
    }

    if (match.isClosed) {
      if (window.showToast) {
        window.showToast({
          message: 'Bu eşleşme zaten kapalı',
          type: 'warning',
          duration: 3000
        });
      }
      return;
    }

    if (myVote?.hasVoted) {
      if (window.showToast) {
        window.showToast({
          message: 'Bu eşleşmede zaten oy verdiniz',
          type: 'warning',
          duration: 3000
        });
      }
      return;
    }

    try {
      await vote({ matchId: match._id, vote: voteChoice }).unwrap();
      setSelectedVote(voteChoice);
      if (onVoteUpdate) {
        onVoteUpdate();
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Oy verilemedi',
          type: 'error',
          duration: 4000
        });
      }
    }
  };

  // Swipe handlers
  const handlePointerDown = (e) => {
    if (match.isClosed || myVote?.hasVoted || isVoting) return;
    
    setIsSwiping(true);
    setSwipeStartX(e.clientX);
    setSwipeCurrentX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isSwiping) return;
    setSwipeCurrentX(e.clientX);
  };

  const handlePointerUp = () => {
    if (!isSwiping) return;
    
    const deltaX = swipeCurrentX - swipeStartX;
    const minSwipeDistance = 60; // Minimum swipe distance in pixels
    
    if (Math.abs(deltaX) >= minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - vote for A
        handleVote('A');
      } else {
        // Swipe left - vote for B
        handleVote('B');
      }
    }
    
    setIsSwiping(false);
    setSwipeStartX(0);
    setSwipeCurrentX(0);
  };

  const handlePointerLeave = () => {
    if (isSwiping) {
      setIsSwiping(false);
      setSwipeStartX(0);
      setSwipeCurrentX(0);
    }
  };

  const totalVotes = localVotesA + localVotesB;
  const percentageA = totalVotes > 0 ? Math.round((localVotesA / totalVotes) * 100) : 0;
  const percentageB = totalVotes > 0 ? Math.round((localVotesB / totalVotes) * 100) : 0;

  return (
    <div 
      ref={containerRef}
      className="card max-w-6xl mx-auto"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{ 
        touchAction: 'none', // Prevent default touch behaviors
        userSelect: 'none' // Prevent text selection during swipe
      }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3 neon-cyan">
          {match.isFinal ? 'Final Eşleşme' : 'Yarı Final Eşleşme'}
        </h2>
        <p className="text-gray-300 text-lg">
          Toplam oy: <span className="neon-cyan">{totalVotes}</span> {match.isClosed && <span className="text-red-400">(Kapalı)</span>}
        </p>
        {!match.isClosed && !myVote?.hasVoted && (
          <div className="text-sm text-gray-400 mt-4 space-y-2">
            <p className="hidden md:block">💡 Oy vermek için butonlara tıklayın</p>
            <div className="md:hidden space-y-2">
              <p>💡 Sol/sağ kaydırın • Butonlara tıklayın</p>
              <div className="flex justify-center items-center space-x-6 text-xs">
                <span className="flex items-center text-cyan-400">
                  <span className="mr-1">←</span> B için sola kaydır
                </span>
                <span className="flex items-center text-pink-400">
                  A için sağa kaydır <span className="ml-1">→</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Post A */}
        <div className={`card cursor-pointer transition-all duration-300 ${
          selectedVote === 'A' ? 'ring-2 ring-cyan-400 transform scale-105 shadow-2xl' : 'hover:shadow-2xl hover:transform hover:scale-105'
        } ${isSwiping && swipeCurrentX > swipeStartX + 30 ? 'ring-2 ring-green-400 bg-green-400/10' : ''}`}>
          <div className="mb-6">
            {match.postA.imageUrl && (
              <img 
                src={match.postA.imageUrl} 
                alt={match.postA.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <h3 className="text-xl font-bold text-white mb-3">{match.postA.title}</h3>
            <p className="text-gray-300 mb-3">{match.postA.content}</p>
            <span className="inline-block bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-full text-sm border border-cyan-400/30">
              {match.postA.category}
            </span>
          </div>

          <div className="text-center">
            <div className="text-3xl font-black text-cyan-400 neon-cyan mb-3">
              {percentageA}%
            </div>
            <div className="text-sm text-gray-400 mb-4">
              <span className="neon-cyan">{localVotesA}</span> oy
            </div>
            {/* Progress Bar */}
            <div className="tech-progress mb-4">
              <div 
                className={`tech-progress-bar h-3 transition-all duration-500 ease-out ${
                  showProgressAnimation ? 'animate-pulse' : ''
                }`}
                style={{ width: `${percentageA}%` }}
              />
            </div>
            <button
              onClick={() => handleVote('A')}
              disabled={isVoting || match.isClosed || myVote?.hasVoted}
              className={`btn w-full text-lg ${
                selectedVote === 'A' 
                  ? 'btn-success' 
                  : 'btn-primary'
              }`}
            >
              {selectedVote === 'A' ? 'Oy Verildi ✓' : 'A İÇİN OY VER'}
            </button>
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-black text-pink-400 neon-pink mb-4 glitch" data-text="VS">VS</div>
            {isSwiping && (
              <div className="text-sm text-gray-400">
                {swipeCurrentX > swipeStartX + 30 ? '→ A için oy ver' : 
                 swipeCurrentX < swipeStartX - 30 ? '← B için oy ver' : 
                 'Oy vermek için kaydırın'}
              </div>
            )}
          </div>
        </div>

        {/* Post B */}
        <div className={`card cursor-pointer transition-all duration-300 ${
          selectedVote === 'B' ? 'ring-2 ring-pink-400 transform scale-105 shadow-2xl' : 'hover:shadow-2xl hover:transform hover:scale-105'
        } ${isSwiping && swipeCurrentX < swipeStartX - 30 ? 'ring-2 ring-green-400 bg-green-400/10' : ''}`}>
          <div className="mb-6">
            {match.postB.imageUrl && (
              <img 
                src={match.postB.imageUrl} 
                alt={match.postB.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <h3 className="text-xl font-bold text-white mb-3">{match.postB.title}</h3>
            <p className="text-gray-300 mb-3">{match.postB.content}</p>
            <span className="inline-block bg-pink-400/20 text-pink-400 px-3 py-1 rounded-full text-sm border border-pink-400/30">
              {match.postB.category}
            </span>
          </div>

          <div className="text-center">
            <div className="text-3xl font-black text-pink-400 neon-pink mb-3">
              {percentageB}%
            </div>
            <div className="text-sm text-gray-400 mb-4">
              <span className="neon-pink">{localVotesB}</span> oy
            </div>
            {/* Progress Bar */}
            <div className="tech-progress mb-4">
              <div 
                className={`tech-progress-bar h-3 transition-all duration-500 ease-out ${
                  showProgressAnimation ? 'animate-pulse' : ''
                }`}
                style={{ width: `${percentageB}%` }}
              />
            </div>
            <button
              onClick={() => handleVote('B')}
              disabled={isVoting || match.isClosed || myVote?.hasVoted}
              className={`btn w-full text-lg ${
                selectedVote === 'B' 
                  ? 'btn-success' 
                  : 'btn-secondary'
              }`}
            >
              {selectedVote === 'B' ? 'Oy Verildi ✓' : 'B İÇİN OY VER'}
            </button>
          </div>
        </div>
      </div>

      {match.isClosed && match.winner && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-white neon-green">
              Eşleşme Kapandı
            </div>
          </div>
          <WinnerBadge 
            post={match.winner} 
            isFinal={match.isFinal}
          />
        </div>
      )}
    </div>
  );
}

export default VotePair;
