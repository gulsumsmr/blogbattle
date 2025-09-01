import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetAdminBracketsQuery } from '../features/match/matchApi';
import VotePair from '../components/VotePair';
import { io } from 'socket.io-client';

function Vote() {
  const [currentMatch, setCurrentMatch] = useState(null);
  const [socket, setSocket] = useState(null);
  const { data: bracketsData, error: bracketsError, isLoading: bracketsLoading, refetch: refetchBrackets } = useGetAdminBracketsQuery();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(import.meta.env.VITE_API_BASE || 'http://localhost:4000', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO');
      
      // Join user room for notifications if authenticated
      if (isAuthenticated && user?._id) {
        newSocket.emit('join-user', user._id);
        console.log('Joined user room for notifications');
      }
    });

    newSocket.on('match:update', (data) => {
      console.log('Match update received:', data);
      if (currentMatch && data.matchId === currentMatch._id) {
        setCurrentMatch(prev => ({
          ...prev,
          votesA: data.votesA,
          votesB: data.votesB,
          isClosed: data.isClosed
        }));
      }
      // Refresh brackets data
      refetchBrackets();
    });

    newSocket.on('match:closed', (data) => {
      console.log('Match closed:', data);
      if (currentMatch && data.matchId === currentMatch._id) {
        setCurrentMatch(prev => ({
          ...prev,
          isClosed: true,
          winner: data.winner
        }));
      }
      // Refresh brackets data
      refetchBrackets();
    });

    newSocket.on('final:created', (data) => {
      console.log('Final match created:', data);
      if (window.showToast) {
        window.showToast({
          message: 'Final eşleşmesi oluşturuldu! Savaş devam ediyor!',
          type: 'success',
          duration: 4000
        });
      }
      // Refresh brackets data
      refetchBrackets();
    });

    newSocket.on('bracket:created', (data) => {
      console.log('New bracket created:', data);
      if (window.showToast) {
        window.showToast({
          message: 'Yeni turnuva oluşturuldu! Listeyi güncelliyoruz...',
          type: 'success',
          duration: 3000
        });
      }
      // Refresh brackets data immediately
      setTimeout(() => {
        refetchBrackets();
      }, 1000);
    });

    setSocket(newSocket);
    
    // Make socket globally accessible for VotePair component
    window.socket = newSocket;

    return () => {
      newSocket.disconnect();
      window.socket = null;
    };
  }, [currentMatch, refetchBrackets, isAuthenticated, user?._id]);

  const handleVoteUpdate = () => {
    // This will be called when a vote is cast
    // The Socket.IO update will handle the real-time updates
  };

  return (
    <div className="min-h-screen soft-bg py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-6 float">
            Blog Battle - Oyla
          </h1>
          <p className="text-xl text-slate-400">
            Tüm turnuvaları görün ve en sevdiğiniz yazılara oy verin!
          </p>
        </div>

        {/* Seçili Eşleşme Oylama */}
        {currentMatch && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-accent mb-2">
                🗳️ Aktif Oylama
              </h2>
              
              {/* Post Detayları */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 mb-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Post A */}
                  <div className="text-center">
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold mb-3 inline-block">
                      {currentMatch.isFinal ? '🏆 Finalist A' : '⚔️ Yarı Finalist A'}
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 mb-2">
                      {(() => {
                        const bracket = bracketsData?.brackets?.find(b => 
                          b.matches.some(m => m._id === currentMatch._id)
                        );
                        const post = bracket?.postsA?.find(p => p._id.toString() === currentMatch.postA.toString());
                        return post?.title || 'Yükleniyor...';
                      })()}
                    </h3>
                    <div className="text-3xl font-bold text-accent mb-2">
                      {currentMatch.votesA} oy
                    </div>
                    <div className="text-sm text-slate-400">
                      {(() => {
                        const bracket = bracketsData?.brackets?.find(b => 
                          b.matches.some(m => m._id === currentMatch._id)
                        );
                        const post = bracket?.postsA?.find(p => p._id.toString() === currentMatch.postA.toString());
                        return post?.author?.username || 'Bilinmeyen';
                      })()}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-slate-400 mb-2">⚔️</div>
                      <div className="text-lg text-slate-500 font-medium">VS</div>
                      <div className="text-sm text-slate-400 mt-2">
                        {currentMatch.isFinal ? 'Final Savaşı' : 'Yarı Final'}
                      </div>
                    </div>
                  </div>

                  {/* Post B */}
                  <div className="text-center">
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold mb-3 inline-block">
                      {currentMatch.isFinal ? '🏆 Finalist B' : '⚔️ Yarı Finalist B'}
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 mb-2">
                      {(() => {
                        const bracket = bracketsData?.brackets?.find(b => 
                          b.matches.some(m => m._id === currentMatch._id)
                        );
                        const post = bracket?.postsB?.find(p => p._id.toString() === currentMatch.postB.toString());
                        return post?.title || 'Yükleniyor...';
                      })()}
                    </h3>
                    <div className="text-3xl font-bold text-accent mb-2">
                      {currentMatch.votesB} oy
                    </div>
                    <div className="text-sm text-slate-400">
                      {(() => {
                        const bracket = bracketsData?.brackets?.find(b => 
                          b.matches.some(m => m._id === currentMatch._id)
                        );
                        const post = bracket?.postsB?.find(p => p._id.toString() === currentMatch.postB.toString());
                        return post?.author?.username || 'Bilinmeyen';
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              <VotePair 
                match={currentMatch} 
                onVoteUpdate={handleVoteUpdate}
              />

              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setCurrentMatch(null);
                    // Sayfayı aşağı kaydır (turnuvalar kısmına)
                    setTimeout(() => {
                      const tournamentsSection = document.querySelector('[data-section="tournaments"]');
                      if (tournamentsSection) {
                        tournamentsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="btn btn-secondary"
                >
                  ← Tüm Turnuvalara Dön
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tüm Eşleşmeler */}
        <div className="mt-12" data-section="tournaments">
          <h2 className="text-3xl font-bold text-accent text-center mb-8">
            Tüm Turnuvalar
          </h2>
          
          {bracketsLoading && (
            <div className="text-center py-12">
              <div className="text-xl text-accent">Turnuvalar yükleniyor...</div>
              <div className="mt-4">
                <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {bracketsError && (
            <div className="text-center py-12">
              <div className="text-xl text-red-400 mb-4">Hata oluştu!</div>
              <div className="text-sm text-slate-400 mb-4">
                Hata detayı: {bracketsError.status || 'Bilinmeyen'} - {bracketsError.data?.error || bracketsError.error || 'Bilinmeyen hata'}
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Sayfayı Yenile
              </button>
            </div>
          )}

          {!bracketsLoading && !bracketsError && bracketsData?.brackets && bracketsData.brackets.length > 0 && (
            <div className="space-y-8">
              {bracketsData.brackets.map((bracket) => (
                <div key={bracket._id} className="card">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-100 mb-2">
                      {bracket.displayName}
                    </h3>
                    <div className="flex justify-center space-x-4 text-sm">
                      <span className="bg-accent/10 text-accent px-3 py-1 rounded-full">
                        {bracket.activeMatches} Aktif
                      </span>
                      <span className="bg-accent-success/10 text-accent-success px-3 py-1 rounded-full">
                        {bracket.completedMatches} Tamamlanan
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bracket.matches.map((match) => (
                      <div key={match._id} className="card bg-slate-800/50 border border-slate-600 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                        <div className="text-center mb-4">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                            match.isFinal 
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {match.isFinal ? '🏆 Final' : '⚔️ Yarı Final'}
                          </div>
                          <div className={`text-sm font-medium ${
                            match.isClosed ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {match.isClosed ? '🔒 Kapalı' : '🟢 Açık'}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Post A */}
                          <div className="bg-slate-700/50 rounded-lg p-3">
                            <div className="font-medium text-slate-200 text-xs mb-1">Post A:</div>
                            <div className="text-slate-300 text-sm font-medium truncate">
                              {bracket.postsA.find(p => p._id.toString() === match.postA.toString())?.title || 'Yükleniyor...'}
                            </div>
                            <div className="text-accent font-bold text-lg mt-2">{match.votesA} oy</div>
                          </div>

                          {/* VS */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-400">⚔️</div>
                            <div className="text-xs text-slate-500 font-medium">VS</div>
                          </div>

                          {/* Post B */}
                          <div className="bg-slate-700/50 rounded-lg p-3">
                            <div className="font-medium text-slate-200 text-xs mb-1">Post B:</div>
                            <div className="text-slate-300 text-sm font-medium truncate">
                              {bracket.postsB.find(p => p._id.toString() === match.postB.toString())?.title || 'Yükleniyor...'}
                            </div>
                            <div className="text-accent font-bold text-lg mt-2">{match.votesB} oy</div>
                          </div>
                        </div>

                        {!match.isClosed && (
                          <button
                            onClick={() => {
                              setCurrentMatch(match);
                              // Sayfayı yukarı kaydır
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn btn-primary w-full mt-4 text-sm hover:scale-105 transition-transform duration-200"
                          >
                            🗳️ Bu Eşleşmede Oyla
                          </button>
                        )}

                        {match.isClosed && (
                          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg text-center">
                            <div className="text-sm text-slate-400">
                              {match.winner === 'A' ? '🏆 Post A Kazandı!' : '🏆 Post B Kazandı!'}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!bracketsLoading && !bracketsError && (!bracketsData?.brackets || bracketsData.brackets.length === 0) && (
            <div className="mt-12 text-center">
              <div className="text-xl text-slate-200 mb-4">Henüz turnuva yok</div>
              <p className="text-slate-300">
                İlk turnuvayı oluşturmak için admin panelini kullanın
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vote;
