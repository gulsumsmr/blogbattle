import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetPostsQuery, useDeletePostMutation } from '../features/posts/postsApi';
import { useSeedMatchesMutation } from '../features/match/matchApi';

function Home() {
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [bracketId, setBracketId] = useState(null);
  const { data: postsData, isLoading } = useGetPostsQuery();
  const [seedMatches, { isLoading: isSeeding }] = useSeedMatchesMutation();
  const [deletePost] = useDeletePostMutation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handlePostSelect = (postId) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else if (selectedPosts.length < 4) {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const handleSeedMatches = async () => {
    if (selectedPosts.length !== 4) {
      if (window.showToast) {
        window.showToast({
          message: 'Lütfen tam olarak 4 yazı seçin',
          type: 'warning',
          duration: 4000
        });
      }
      return;
    }

    try {
      const result = await seedMatches(selectedPosts).unwrap();
      setBracketId(result.bracketId);
              if (window.showToast) {
          window.showToast({
            message: `Savaş oluşturuldu! Bracket ID: ${result.bracketId}`,
            type: 'success',
            duration: 6000
          });
        }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Eşleşmeler oluşturulamadı',
          type: 'error',
          duration: 5000
        });
      }
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!window.confirm(`"${postTitle}" yazısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await deletePost(postId).unwrap();
      if (window.showToast) {
        window.showToast({
          message: 'Yazı başarıyla silindi',
          type: 'success',
          duration: 4000
        });
      }
      // Remove from selected posts if it was selected
      setSelectedPosts(prev => prev.filter(id => id !== postId));
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          message: error.data?.error || 'Yazı silinemedi',
          type: 'error',
          duration: 5000
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="text-xl">Yazılar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen soft-bg py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-6 float">
            Blog Savaşı
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            En sevdiğiniz blog yazılarına oy verin ve kimin kazandığını görün!
          </p>
          
          {isAuthenticated && (
            <div className="card soft-bg mb-12 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-accent mb-4">
                Savaş Oluştur
              </h2>
              <p className="text-slate-200 text-lg mb-6">
                Yarı final eşleşmeleri oluşturmak için 4 yazı seçin
              </p>
              
              <div className="mb-6">
                <span className="text-lg text-accent font-semibold">
                  Seçilen: <span className="text-accent-success">{selectedPosts.length}/4</span>
                </span>
              </div>
              
              <button
                onClick={handleSeedMatches}
                disabled={selectedPosts.length !== 4 || isSeeding}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSeeding ? 'Oluşturuluyor...' : '4 Yazı ile Savaş Başlat'}
              </button>
              
              {bracketId && (
                <div className="mt-6 p-4 card border-accent-success/30 bg-accent-success/10">
                  <p className="text-accent-success font-semibold">
                    Savaş oluşturuldu! Bracket ID: <span className="text-accent-success">{bracketId}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsData?.posts?.map((post) => (
            <div
              key={post._id}
              className={`card cursor-pointer hover-lift ${
                selectedPosts.includes(post._id) 
                  ? 'ring-2 ring-accent transform scale-105' 
                  : ''
              }`}
              onClick={() => isAuthenticated && handlePostSelect(post._id)}
            >
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-xl font-bold text-slate-100 mb-3">{post.title}</h3>
              <p className="text-slate-300 mb-4 line-clamp-3">{post.content}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm border border-accent/20">
                  {post.category}
                </span>
                <div className="flex items-center space-x-2">
                  {post.wins > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-accent-success">
                      🏆 {post.wins} zafer{post.wins > 1 ? '' : ''}
                    </span>
                  )}
                  <span className="text-sm text-accent">
                    yazar: {post.author?.username}
                  </span>
                </div>
              </div>
              
              {isAuthenticated && (
                <div className="mt-4 text-center pt-4 border-t border-slate-600/30">
                  {selectedPosts.includes(post._id) ? (
                    <span className="text-accent font-semibold">✓ Seçildi</span>
                  ) : (
                    <span className="text-slate-400">Seçmek için tıklayın</span>
                  )}
                  
                  {/* Delete button - only show for post author */}
                  {user && post.author && user._id === post.author._id && (
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent post selection
                          handleDeletePost(post._id, post.title);
                        }}
                        className="btn btn-error text-sm px-3 py-1"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {postsData?.posts?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl text-slate-600 mb-4">Henüz yazı yok</div>
            <p className="text-slate-500">
              {isAuthenticated 
                ? 'İlk yazıyı oluşturarak savaş başlatın!' 
                : 'Yazı oluşturmak ve savaş başlatmak için giriş yapın!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
