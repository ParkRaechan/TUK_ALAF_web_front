import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WebHome.css';

const CommunityHome = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [postType, setPostType] = useState('ALL'); // ALL, LOST, LOOKING_FOR
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [postType]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // type 파라미터로 필터링 요청
      const typeQuery = postType !== 'ALL' ? `?type=${postType}` : '';
      const response = await axios.get(`http://49.50.138.248:8080/api/posts${typeQuery}`);
      setPosts(response.data);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다.", error);
    }
    setLoading(false);
  };

  return (
    <div className="pc-container">
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
            <h1>ALAF</h1>
            <span className="logo-sub">Any Lost Any Found</span>
          </div>
          <div className="pc-nav-menu">
             <button className="menu-item primary" onClick={() => navigate('/community/write')}>✏️ 글쓰기</button>
             <button className="menu-item" onClick={() => navigate('/')}>키오스크 보관함 가기</button>
          </div>
        </div>
      </header>

      <main className="pc-main">
        {/* 커뮤니티 전용 탭 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 30, justifyContent: 'center' }}>
          {['ALL', 'LOST', 'LOOKING_FOR'].map((type) => (
            <button 
              key={type}
              onClick={() => setPostType(type)}
              style={{
                padding: '12px 30px', borderRadius: 25, fontWeight: 'bold', fontSize: 16, cursor: 'pointer',
                border: postType === type ? 'none' : '1px solid #ddd',
                backgroundColor: postType === type ? '#3b82f6' : 'white',
                color: postType === type ? 'white' : '#666',
                boxShadow: postType === type ? '0 4px 10px rgba(59, 130, 246, 0.3)' : 'none'
              }}>
              {type === 'ALL' ? '전체 보기' : type === 'LOST' ? '🙌 습득했어요' : '👀 찾고있어요'}
            </button>
          ))}
        </div>

        <div className="pc-grid">
          {loading ? <div style={{gridColumn: '1/-1', textAlign:'center'}}>로딩 중...</div> : 
           posts.length > 0 ? posts.map((post) => (
            <div key={post.post_id} className="pc-card" onClick={() => navigate(`/community/${post.post_id}`)}>
              <div className="card-img" style={{
                backgroundColor: '#eee', 
                aspectRatio: '16/9', 
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center' // 이미지 중앙 정렬
                }}>
                {post.thumbnail ? (
                    <img src={`http://49.50.138.248:8080${post.thumbnail}`} alt="썸네일" 
                    style={{ 
                        width: '100%', height: '100%', 
                        objectFit: 'cover'
                    }} />
                ) : (
                  <span className="img-text">No Image</span>
                )}
              </div>
              <div className="card-info">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: post.post_type === 'LOST' ? '#2b8a3e' : '#e03131', fontWeight: 'bold' }}>
                    {post.post_type === 'LOST' ? '습득물' : '분실물'}
                    </span>
                    {/* 카테고리 표시 뱃지 */}
                    <span style={{ fontSize: 12, background: '#f1f3f5', color: '#495057', padding: '2px 8px', borderRadius: 12, fontWeight: '600' }}>
                    {post.category_name}
                    </span>
                </div>
                <h3 className="card-title" style={{ marginTop: 5 }}>{post.title}</h3>
                <div className="card-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="card-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{post.author_name}</span>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', padding: 100, textAlign: 'center', color: '#888', background: 'white', borderRadius: 16 }}>
              게시글이 없습니다.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CommunityHome;