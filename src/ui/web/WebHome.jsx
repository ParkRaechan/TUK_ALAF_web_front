import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, ChevronRight } from 'lucide-react'; 
import { ItemContext } from '../../context/ItemContext';
import './WebHome.css';

// -----------------------------------------------------------
// [상수 데이터] 카테고리 대분류 - 소분류 매핑 정의
// (웹 환경의 상세한 67개 분류 체계를 그룹화하여 UI 드롭다운에 사용)
// -----------------------------------------------------------
const CATEGORY_DATA = {
  '가방': ['여성용가방', '남성용가방', '기타 가방'],
  '귀금속': ['반지', '목걸이', '귀걸이', '시계', '기타 귀금속'],
  '도서용품': ['학습서적', '소설', '컴퓨터서적', '만화책', '기타 서적'],
  '서류': ['서류', '기타 서류'],
  '쇼핑백': ['쇼핑백'],
  '스포츠용품': ['스포츠용품'],
  '악기': ['건반악기', '타악기', '관악기', '현악기', '기타 악기'],
  '의류': ['여성의류', '남성의류', '아기의류', '모자', '신발', '기타 의류'],
  '자동차': ['자동차열쇠', '네비게이션', '자동차번호판', '임시번호판', '기타 자동차용품'],
  '전자기기': ['태블릿', '스마트워치', '무선이어폰', '카메라', '기타 전자기기'],
  '지갑': ['여성용지갑', '남성용지갑', '기타 지갑'],
  '증명서': ['신분증', '면허증', '여권', '기타 증명서'],
  '컴퓨터': ['삼성노트북', 'LG노트북', '애플노트북', '기타 컴퓨터'],
  '카드': ['신용(체크)카드', '일반카드', '교통카드', '기타 카드'],
  '현금': ['현금'],
  '유가증권': ['어음','상품권','채권','기타 유가증권'],
  '휴대폰': ['삼성휴대폰', 'LG휴대폰', '아이폰', '기타 휴대폰', '기타 통신기기'],
  '기타물품': ['기타 물품']
};

const WebHome = () => {
  const { items, fetchItems } = useContext(ItemContext); 
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('전체'); 
  const [sortBy, setSortBy] = useState('date'); 
  const [searchTerm, setSearchTerm] = useState(''); 

  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const handleLogoClick = () => {
    setActiveCategory('전체'); 
    setSearchTerm('');         
    setSortBy('date');         
    navigate('/');             
    window.scrollTo(0, 0);   
    
    // 초기화 시 커서 리셋
    setCursor(null);
    setHasMore(true);
    fetchItems(null, false); 
  };
  const handleLoadMore = async () => {
    const nextCursor = await fetchItems(cursor, true);
    
    setCursor(nextCursor);
    setHasMore(!!nextCursor);
  };

  const getProcessedItems = () => {
    let processed = items;

    if (activeCategory !== '전체') {
      const isMajorCategory = Object.keys(CATEGORY_DATA).includes(activeCategory);
      if (isMajorCategory) {
        const subCategories = CATEGORY_DATA[activeCategory];
        processed = processed.filter(item => subCategories.includes(item.category));
      } else {
        processed = processed.filter(item => item.category === activeCategory);
      }
    }

    if (searchTerm.trim() !== '') {
      const lowerQuery = searchTerm.toLowerCase();
      processed = processed.filter(item => {
        return (item.title || item.name || '').toLowerCase().includes(lowerQuery);
      });
    }
    
    return [...processed].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date); 
      } else if (sortBy === 'views') {
        return (b.view_count || 0) - (a.view_count || 0);
      }
      return 0;
    });
  };

  const finalItems = getProcessedItems();

  return (
    <div className="pc-container">
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={handleLogoClick} style={{cursor:'pointer'}}>
            <h1>ALAF</h1>
            <span className="logo-sub">Any Lost Any Found</span>
          </div>

          <div className="pc-search-bar">
            <input 
              type="text" 
              placeholder="물건명으로 검색" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button><Search size={20} /></button>
          </div>

          <div className="pc-nav-menu">
             <button className="menu-item primary" onClick={() => navigate('/register')}>분실물 등록(등록테스트용)</button>
             <button className="menu-item primary" onClick={() => navigate('/community')}>커뮤니티</button>
             <button className="menu-item" onClick={() => navigate('/mypage')}>마이페이지</button>
          </div>
        </div>
      </header>

      <main className="pc-main">
        <div className="category-dropdown-container">
          <div className="dropdown-trigger">
            <Menu size={24} color="white" />
            <span>카테고리</span>
          </div>

          <ul className="main-menu">
            <li className="menu-item-li" onClick={() => setActiveCategory('전체')}>
              <span className="menu-text">전체 보기</span>
            </li>
            
            {Object.keys(CATEGORY_DATA).map((majorCat) => (
              <li key={majorCat} className="menu-item-li">
                <span className="menu-text">{majorCat}</span>
                <ChevronRight size={16} color="#ccc" className="arrow-icon" />
                
                <div className="sub-menu-panel">
                  <h4 className="sub-menu-title">{majorCat}</h4>
                  <div className="sub-menu-grid">
                    {CATEGORY_DATA[majorCat].map((subCat) => (
                      <button 
                        key={subCat} 
                        className="sub-cat-btn"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setActiveCategory(subCat);
                        }}
                      >
                        {subCat}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-header">
          <h2>
             {searchTerm 
               ? `🔍 "${searchTerm}" 검색 결과` 
               : (activeCategory === '전체' ? '📢 실시간 습득물 현황' : `📂 ${activeCategory}`)}
          </h2>
          <div className="sort-options">
            <span 
              className={sortBy === 'date' ? 'active-sort' : ''} 
              onClick={() => setSortBy('date')}
              style={{ cursor: 'pointer', fontWeight: sortBy === 'date' ? 'bold' : 'normal', color: sortBy === 'date' ? '#333' : '#999' }}
            >
              최신순
            </span>
            <span style={{ margin: '0 5px', color: '#ddd' }}>|</span>
            <span 
              className={sortBy === 'views' ? 'active-sort' : ''} 
              onClick={() => setSortBy('views')}
              style={{ cursor: 'pointer', fontWeight: sortBy === 'views' ? 'bold' : 'normal', color: sortBy === 'views' ? '#333' : '#999' }}
            >
              조회순
            </span>
          </div>
        </div>

        <div className="pc-grid">
          {finalItems.length > 0 ? (
            finalItems.map((data) => (
              <div 
                key={data.id} 
                className="pc-card"
                onClick={() => navigate(`/detail/${data.id}`)} 
              >
                <div className="card-img" style={{backgroundColor: data.imgColor || '#eee', overflow: 'hidden'}}>
                  {data.image ? (
                    <img 
                      src={data.image} 
                      alt="물건 사진" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span className="img-text">No Image</span>
                  )}
                </div>
                
                <div className="card-info">
                  <h3 className="card-title">{data.title}</h3>
                  <div className="card-meta">
                    <span className="card-date">{data.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 5 }}>
                    조회 {data.view_count || 0}회
                  </div>
                  <div className={`card-status ${data.status === '해결됨' ? 'done' : ''}`}>
                    {data.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: 100, textAlign: 'center', color: '#888', background: 'white', borderRadius: 16 }}>
              {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '해당 카테고리의 물건이 없습니다.'}
            </div>
          )}
        </div>

        {hasMore && finalItems.length > 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <button 
              onClick={handleLoadMore}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#9bb6ee'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#97a4ba'}
            >
              더보기  
            </button>
          </div>
        )}

      </main>

      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebHome;