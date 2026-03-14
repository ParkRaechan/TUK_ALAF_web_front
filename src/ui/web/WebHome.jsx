import React, { useContext, useState, useEffect, useRef } from 'react';
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

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const handleLogoClick = () => {
    setActiveCategory('전체'); 
    setSearchTerm('');         
    setSortBy('date');         
    navigate('/');             
    window.scrollTo(0, 0);   
    setPage(1);
    setHasMore(true);
    fetchItems(1, false); 
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }, { threshold: 0.5 });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasMore]); 

  useEffect(() => {
    if (page > 1) {
      const loadMore = async () => {
        const moreAvailable = await fetchItems(page, true); 
        setHasMore(moreAvailable); // 더 이상 가져올 게 없으면 false가 됨
      };
      loadMore();
    }
  }, [page, fetchItems]);

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
        return (b.views || 0) - (a.views || 0); 
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
             <button className="menu-item primary" onClick={() => navigate('/register')}>분실물 등록</button>
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
                    조회 {data.views || 0}회
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

        {hasMore && (
          <div 
            ref={observerRef} 
            style={{ padding: '30px', textAlign: 'center', color: '#999', width: '100%' }}
          >
            데이터를 불러오는 중입니다... 🌀
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