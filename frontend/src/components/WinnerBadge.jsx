function WinnerBadge({ post, isFinal = false }) {
  return (
    <div className="card holographic border-2 border-yellow-400/50 p-8 text-center shadow-2xl">
      <div className="text-center">
        <div className="text-4xl font-black mb-4 float">
          {isFinal ? '🏆' : '🥇'}
        </div>
        <div className="text-3xl font-black text-yellow-400 neon-text mb-6" data-text={isFinal ? 'ŞAMPİYON' : 'KAZANAN'}>
          {isFinal ? 'ŞAMPİYON' : 'KAZANAN'}
        </div>
        
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-32 h-32 object-cover rounded-xl mx-auto mb-6 border-2 border-yellow-400/30"
          />
        )}
        
        <h3 className="text-2xl font-bold text-white mb-4">{post.title}</h3>
        <p className="text-gray-300 mb-6 line-clamp-2">{post.content}</p>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <span className="inline-block bg-yellow-400/20 px-4 py-2 rounded-full text-sm border border-yellow-400/30 text-yellow-400 font-semibold">
            {post.category}
          </span>
          {post.wins > 0 && (
            <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-bold bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
              🏆 {post.wins} zafer{post.wins > 1 ? '' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default WinnerBadge;
