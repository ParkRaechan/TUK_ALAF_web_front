import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import axios from 'axios';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // 로그인 유저 정보
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://49.50.138.248:8080/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        alert('게시글을 불러올 수 없습니다.');
        navigate('/community');
      }
    };
    fetchDetail();
  }, [id]);

  if (!post) return <div style={{padding:50, textAlign:'center'}}>데이터 불러오는 중...</div>;

  // 내 글인지 확인
  const isMyPost = user && user.id === post.member_id;

  return (
    <div className="pc-container" style={{paddingBottom: 50, background:'#f8f9fa', minHeight:'100vh'}}>
      <header className="pc-header">
        <div className="header-inner">
           <button onClick={() => navigate(-1)} style={{display:'flex', alignItems:'center', gap:5, cursor:'pointer', fontWeight:'bold', fontSize: 16, border:'none', background:'none'}}>
             <ArrowLeft size={24} /> 뒤로가기
           </button>
        </div>
      </header>

      <main className="pc-main" style={{ marginTop: 20 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'white', padding: 50, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          
            <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{background: post.post_type === 'LOST' ? '#e6fcf5' : '#fff5f5', color: post.post_type === 'LOST' ? '#0ca678' : '#fa5252', padding:'6px 12px', borderRadius:20, fontSize:13, fontWeight:'bold'}}>
                    {post.post_type === 'LOST' ? '🙌 습득했어요 (보관중)' : '👀 찾고있어요 (분실함)'}
                </span>
                {/* 카테고리 표시 뱃지 */}
                <span style={{background:'#f1f3f5', color:'#495057', padding:'6px 12px', borderRadius:20, fontSize:13, fontWeight:'600'}}>
                    📂 {post.category_name}
                </span>
            </div>

          <h1 style={{ fontSize: 32, fontWeight: '800', marginBottom: 15 }}>{post.title}</h1>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#868e96', borderBottom: '1px solid #eee', paddingBottom: 20, marginBottom: 20 }}>
            <span>작성자: <strong style={{color:'#333'}}>{post.author_name}</strong></span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>

          {/* 이미지 영역 */}
          {post.images && post.images.length > 0 && (
            <div style={{ marginBottom: 30, textAlign: 'center', background:'#fafafa', borderRadius: 12, padding:10 }}>
                <img 
                src={`http://49.50.138.248:8080${post.images[0]}`} 
                alt="게시글 첨부" 
                style={{ 
                    maxWidth: '100%', 
                    maxHeight: '500px', 
                    objectFit: 'contain',
                    borderRadius: 12 
                }} />
            </div>
            )}

          {/* 본문 내용 */}
          <div style={{ fontSize: 16, lineHeight: 1.8, color: '#333', minHeight: 150, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>

          <div style={{height:1, background:'#eee', margin:'40px 0 30px'}}></div>

          {/* 액션 버튼 영역 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
            {isMyPost ? (
              <button style={{ padding: '15px 40px', borderRadius: 12, border: '1px solid #ddd', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                글 수정/삭제 (준비중)
              </button>
            ) : (
              <button 
                onClick={() => alert("채팅 기능은 향후 업데이트 예정입니다! 기대해주세요 😉")}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '15px 50px', borderRadius: 12, border: 'none', background: '#3b82f6', color: 'white', fontSize: 18, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
              >
                <MessageCircle size={24} />
                작성자에게 1:1 채팅 보내기
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default CommunityDetail;