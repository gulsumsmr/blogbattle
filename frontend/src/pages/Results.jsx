import { useState } from 'react';
import { useGetCompletedMatchesQuery } from '../features/match/matchApi';
import WinnerBadge from '../components/WinnerBadge';

function Results() {
  const [bracketId, setBracketId] = useState('');
  const [error, setError] = useState('');
  const { data: matchesData, isLoading } = useGetCompletedMatchesQuery(bracketId, {
    skip: !bracketId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!bracketId.trim()) {
      setError('Lütfen bir bracket ID girin');
      return;
    }
    
    if (bracketId.trim().length < 10) {
      setError('Bracket ID çok kısa görünüyor. Lütfen kontrol edin ve tekrar deneyin.');
      return;
    }
    
    // The query will automatically refetch when bracketId changes
  };

  return (
    <div className="min-h-screen tech-bg py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black neon-green glitch mb-6 float text-slate-600" data-text="SAVAŞ SONUÇLARI">
            SAVAŞ SONUÇLARI
          </h1>
          <p className="text-2xl text-slate-400">
            Tamamlanan savaşların kazananlarını görün
          </p>
        </div>

        <div className="card max-w-md mx-auto mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="bracketId" className="block text-sm font-medium text-green-400 mb-2">
                Bracket ID Girin
              </label>
              <input
                id="bracketId"
                type="text"
                value={bracketId}
                onChange={(e) => {
                  setBracketId(e.target.value);
                  if (error) setError('');
                }}
                className={`input ${error ? 'border-red-500 ring-red-500' : ''}`}
                placeholder="örn: bracket_1234567890_abc123"
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 neon-text">{error}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!bracketId.trim()}
              className="btn btn-success w-full text-lg disabled:opacity-50"
            >
              SONUÇLARI GÖRÜNTÜLE
            </button>
          </form>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="text-2xl text-slate-400 neon-cyan">Sonuçlar yükleniyor...</div>
          </div>
        )}

        {bracketId && matchesData?.matches && (
          <div className="space-y-8">
            {matchesData.matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-2xl text-slate-400 mb-4">Tamamlanan eşleşme bulunamadı</div>
                <p className="text-slate-500">
                  Bu bracket henüz tamamlanan eşleşmelere sahip olmayabilir.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2 neon-cyan">
                    Bracket: {bracketId}
                  </h2>
                  <p className="text-gray-300 text-lg">
                    {matchesData.matches.length} tamamlanan eşleşme
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {matchesData.matches.map((match) => (
                    <div key={match._id} className="card">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {match.isFinal ? 'Final Eşleşme' : 'Yarı Final Eşleşme'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Toplam oy: <span className="neon-cyan">{match.votesA + match.votesB}</span>
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Post A */}
                        <div className="border border-cyan-400/30 rounded-xl p-4 bg-cyan-400/5">
                          <h4 className="font-bold text-white mb-2">
                            {match.postA.title}
                          </h4>
                          <p className="text-sm text-gray-300 mb-3">
                            {match.postA.content.substring(0, 100)}...
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-400/30">
                              {match.postA.category}
                            </span>
                            <span className="text-lg font-bold text-cyan-400 neon-cyan">
                              {match.votesA} oy ({Math.round((match.votesA / (match.votesA + match.votesB)) * 100)}%)
                            </span>
                          </div>
                        </div>

                        {/* VS */}
                        <div className="text-center">
                          <div className="text-3xl font-black text-pink-400 neon-pink">VS</div>
                        </div>

                        {/* Post B */}
                        <div className="border border-pink-400/30 rounded-xl p-4 bg-pink-400/5">
                          <h4 className="font-bold text-white mb-2">
                            {match.postB.title}
                          </h4>
                          <p className="text-sm text-gray-300 mb-3">
                            {match.postB.content.substring(0, 100)}...
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm bg-pink-400/20 text-pink-400 px-3 py-1 rounded-full border border-pink-400/30">
                              {match.postB.category}
                            </span>
                            <span className="text-lg font-bold text-pink-400 neon-pink">
                              {match.votesB} oy ({Math.round((match.votesB / (match.votesA + match.votesB)) * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Winner */}
                      {match.winner && (
                        <div className="mt-6">
                          <WinnerBadge 
                            post={match.winner} 
                            isFinal={match.isFinal}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!bracketId && (
          <div className="text-center py-12">
            <div className="text-2xl text-slate-400 mb-4">Bracket ID Girin</div>
            <p className="text-slate-500">
              Sonuçları görüntülemek için tamamlanan bir savaşın bracket ID'sini girin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
