import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetPostsQuery } from '../features/posts/postsApi';
import { 
  useGetAdminBracketsQuery, 
  useCreateAdminMatchMutation, 
  useGetAdminUsersQuery,
  useResetMatchVotesMutation, 
  useResetBracketVotesMutation,
  useDeleteAdminMatchMutation,
  useDeleteAdminBracketMutation
} from '../features/match/matchApi';
import { io } from 'socket.io-client';

function AdminPanel() {
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [matchType, setMatchType] = useState('semifinal');
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'manage', 'reset'
  
  const { data: postsData } = useGetPostsQuery();
  const { data: bracketsData, refetch: refetchBrackets } = useGetAdminBracketsQuery();
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAdminUsersQuery();
  const [createAdminMatch] = useCreateAdminMatchMutation();
  const [resetMatchVotes] = useResetMatchVotesMutation();
  const [resetBracketVotes] = useResetBracketVotesMutation();
  const [deleteAdminMatch] = useDeleteAdminMatchMutation();
  const [deleteAdminBracket] = useDeleteAdminBracketMutation();
  
  const { user } = useSelector((state) => state.auth);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE || 'http://localhost:4000', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('AdminPanel: Connected to Socket.IO');
    });

    socket.on('bracket:created', (data) => {
      console.log('AdminPanel: New bracket created:', data);
      if (window.showToast) {
        window.showToast({
          message: 'Yeni turnuva oluşturuldu! Listeyi güncelliyoruz...',
          type: 'success',
          duration: 3000
        });
      }
      // Refresh brackets data
      setTimeout(() => {
        refetchBrackets();
      }, 1000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePostSelect = (postId) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else if (selectedPosts.length < 2) {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const handleCreateMatch = async () => {
    if (selectedPosts.length !== 2) {
      if (window.showToast) {
        window.showToast({
          message: 'Lütfen tam olarak 2 yazı seçin',
          type: 'warning',
          duration: 4000
        });
      }
      return;
    }

    if (!selectedUsername) {
      if (window.showToast) {
        window.showToast({
          message: 'Lütfen bir kullanıcı seçin',
          type: 'warning',
          duration: 4000
        });
      }
      return;
    }

    try {
      await createAdminMatch({
        postIds: selectedPosts,
        username: selectedUsername,
        matchType
      }).unwrap();

      if (window.showToast) {
        window.showToast({
          message: 'Eşleşme başarıyla oluşturuldu!',
          type: 'success',
          duration: 4000
        });
      }

      // Reset form
      setSelectedPosts([]);
      setSelectedUsername('');
      setMatchType('semifinal');
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Eşleşme oluşturulamadı',
          type: 'error',
          duration: 5000
        });
      }
    }
  };

  const handleResetMatchVotes = async (matchId) => {
    if (!window.confirm('Bu eşleşmedeki tüm oyları sıfırlamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await resetMatchVotes(matchId).unwrap();
      if (window.showToast) {
        window.showToast({
          message: 'Oylar başarıyla sıfırlandı!',
          type: 'success',
          duration: 4000
        });
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Oylar sıfırlanamadı',
          type: 'error',
          duration: 5000
        });
      }
    }
  };

  const handleResetBracketVotes = async (bracketId) => {
    if (!window.confirm('Bu bracket\'teki tüm oyları sıfırlamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await resetBracketVotes(bracketId).unwrap();
      if (window.showToast) {
        window.showToast({
          message: 'Tüm oylar başarıyla sıfırlandı!',
          type: 'success',
          duration: 4000
        });
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Oylar sıfırlanamadı',
          type: 'error',
          duration: 5000
        });
      }
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Bu eşleşmeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteAdminMatch(matchId).unwrap();
      if (window.showToast) {
        window.showToast({
          message: 'Eşleşme başarıyla silindi!',
          type: 'success',
          duration: 4000
        });
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Eşleşme silinemedi',
          type: 'error',
          duration: 5000
        });
      }
    }
  };

  const handleDeleteBracket = async (bracketId) => {
    if (!window.confirm('Bu turnuvayı ve tüm eşleşmelerini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteAdminBracket(bracketId).unwrap();
      if (window.showToast) {
        window.showToast({
          message: 'Turnuva başarıyla silindi!',
          type: 'success',
          duration: 4000
        });
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Turnuva silinemedi',
          type: 'error',
          duration: 5000
        });
      }
    }
  };

  return (
    <div className="min-h-screen soft-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-6 float">
            Admin Paneli
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Eşleşmeleri yönetin, oyları sıfırlayın ve sistemi kontrol edin
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 card p-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-accent text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Eşleşme Oluştur
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'manage'
                  ? 'bg-accent text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Eşleşmeleri Yönet
            </button>
            <button
              onClick={() => setActiveTab('reset')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'reset'
                  ? 'bg-accent text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Oyları Sıfırla
            </button>
          </div>
        </div>

        {/* Create Match Tab */}
        {activeTab === 'create' && (
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-accent mb-6">
              Manuel Eşleşme Oluştur
            </h2>
            
            <div className="space-y-6">
                             {/* Username Selection */}
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">
                   Kullanıcı Seçimi
                 </label>
                 
                 
                 
                 <select
                   value={selectedUsername}
                   onChange={(e) => setSelectedUsername(e.target.value)}
                   className="input"
                 >
                   <option value="">Kullanıcı seçin...</option>
                   {usersData?.users?.map((user) => (
                     <option key={user._id} value={user.username}>
                       {user.username} ({user.email})
                     </option>
                   ))}
                 </select>
                 
                 {/* Users Count */}
                 <p className="text-xs text-slate-500 mt-1">
                   Toplam kullanıcı: {usersData?.users?.length || 0}
                 </p>
                 
                 {selectedUsername && (
                   <p className="text-sm text-slate-400 mt-1">
                     Bracket ID: <span className="text-accent">{selectedUsername}_bracket</span>
                   </p>
                 )}
               </div>

              {/* Match Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Eşleşme Türü
                </label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                  className="input"
                >
                  <option value="semifinal">Yarı Final</option>
                  <option value="final">Final</option>
                </select>
              </div>

              {/* Post Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Yazı Seçimi ({selectedPosts.length}/2)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {postsData?.posts?.map((post) => (
                    <div
                      key={post._id}
                      className={`card cursor-pointer hover-lift ${
                        selectedPosts.includes(post._id) 
                          ? 'ring-2 ring-accent transform scale-105' 
                          : ''
                      }`}
                      onClick={() => handlePostSelect(post._id)}
                    >
                      <h3 className="text-lg font-bold text-slate-100 mb-2">{post.title}</h3>
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2">{post.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {post.author?.username}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                             {/* Create Button */}
               <button
                 onClick={handleCreateMatch}
                 disabled={selectedPosts.length !== 2 || !selectedUsername}
                 className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Eşleşme Oluştur
               </button>
            </div>
          </div>
        )}

        {/* Manage Matches Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-accent text-center mb-6">
              Aktif Eşleşmeleri Yönet
            </h2>
            
            {bracketsData?.brackets?.map((bracket) => (
              <div key={bracket._id} className="card">
                                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-bold text-slate-100">
                     {bracket.displayName}
                   </h3>
                   <div className="flex items-center space-x-4">
                     <div className="flex space-x-2 text-sm">
                       <span className="bg-accent/10 text-accent px-3 py-1 rounded-full">
                         {bracket.activeMatches} Aktif
                       </span>
                       <span className="bg-accent-success/10 text-accent-success px-3 py-1 rounded-full">
                         {bracket.completedMatches} Tamamlanan
                       </span>
                     </div>
                     <button
                       onClick={() => handleDeleteBracket(bracket.originalBracketId)}
                       className="btn btn-error btn-sm"
                       title="Tüm turnuvayı sil"
                     >
                       🗑️ Turnuvayı Sil
                     </button>
                   </div>
                 </div>

                 {/* Eşleşmeleri Görüntüle Butonu */}
                 <div className="mb-4">
                   <button
                     onClick={() => window.open('/vote', '_blank')}
                     className="btn btn-secondary w-full text-sm"
                   >
                     👁️ Eşleşmeleri Görüntüle
                   </button>
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bracket.matches.map((match) => (
                    <div key={match._id} className="border border-slate-600 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <h4 className="font-bold text-slate-100 mb-2">
                          {match.isFinal ? 'Final' : 'Yarı Final'}
                        </h4>
                        <div className="text-sm text-slate-400">
                          {match.isClosed ? 'Kapalı' : 'Açık'}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Post A */}
                        <div className="text-sm">
                          <div className="font-medium text-slate-200">Post A:</div>
                          <div className="text-slate-300 truncate">
                            {bracket.postsA.find(p => p._id.toString() === match.postA.toString())?.title || 'Yükleniyor...'}
                          </div>
                          <div className="text-accent font-bold">{match.votesA} oy</div>
                        </div>

                        {/* VS */}
                        <div className="text-center text-lg font-bold text-slate-400">VS</div>

                        {/* Post B */}
                        <div className="text-sm">
                          <div className="font-medium text-slate-200">Post B:</div>
                          <div className="text-slate-300 truncate">
                            {bracket.postsB.find(p => p._id.toString() === match.postB.toString())?.title || 'Yükleniyor...'}
                          </div>
                          <div className="text-accent font-bold">{match.votesB} oy</div>
                        </div>
                      </div>

                                             <div className="flex space-x-2 mt-3">
                         {!match.isClosed && (
                           <button
                             onClick={() => handleResetMatchVotes(match._id)}
                             className="btn btn-warning btn-sm flex-1"
                           >
                             🔄 Oyları Sıfırla
                           </button>
                         )}
                         <button
                           onClick={() => handleDeleteMatch(match._id)}
                           className="btn btn-error btn-sm flex-1"
                           title="Eşleşmeyi sil"
                         >
                           🗑️ Sil
                         </button>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-600">
                  <button
                    onClick={() => handleResetBracketVotes(bracket._id)}
                    className="btn btn-error w-full"
                  >
                    Tüm Bracket Oylarını Sıfırla
                  </button>
                </div>
              </div>
            ))}

            {(!bracketsData?.brackets || bracketsData.brackets.length === 0) && (
              <div className="text-center py-12">
                <div className="text-xl text-slate-200 mb-4">Henüz eşleşme yok</div>
                <p className="text-slate-300">
                  İlk eşleşmeyi oluşturmak için "Eşleşme Oluştur" sekmesini kullanın
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reset Votes Tab */}
        {activeTab === 'reset' && (
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-accent mb-6">
              Oyları Sıfırla
            </h2>
            
            <div className="space-y-6">
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-bold text-yellow-400">Dikkat!</h3>
                    <p className="text-slate-300 text-sm">
                      Oyları sıfırlamak geri alınamaz. Bu işlem tüm oy geçmişini kalıcı olarak siler.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('manage')}
                  className="btn btn-secondary"
                >
                  Eşleşmeleri Yönet Sekmesine Git
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn btn-primary"
                >
                  Yeni Eşleşme Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
