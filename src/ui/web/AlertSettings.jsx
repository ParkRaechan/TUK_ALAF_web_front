import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 백엔드 명세와 동일하게 띄어쓰기 없는 카테고리 대분류 하드코딩
const MAJOR_CATEGORIES = [
  '가방', '귀금속', '도서용품', '서류', '쇼핑백', '스포츠용품',
  '악기', '의류', '자동차', '전자기기', '지갑', '증명서',
  '컴퓨터', '카드', '현금', '유가증권', '휴대폰', '기타물품'
];

const AlertSettings = () => {
  // 사용자가 체크한 카테고리들을 담는 배열
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 마운트 시 서버에서 기존 알림 설정 불러오기
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('http://49.50.138.248:8080/api/alerts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // 서버에서 ['가방', '전자기기'] 형태로 준다고 가정
        if (response.data.alerts) {
          setSelectedCategories(response.data.alerts);
        }
      } catch (error) {
        console.error('알림 설정 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // 2. 체크박스 클릭 시 배열에 넣거나 빼는 함수
  const handleToggle = (category) => {
    setSelectedCategories((prev) => {
      // 이미 체크되어 있으면 배열에서 제거, 없으면 추가
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // 3. [저장] 버튼 클릭 시 서버로 통째로 전송
  const handleSave = async () => {
    try {
      await axios.post('http://49.50.138.248:8080/api/alerts', 
        { categories: selectedCategories }, // 빈 배열([])을 보내면 전체 취소로 작동함!
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('알림 설정이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('알림 저장 실패:', error);
      alert('알림 설정 저장에 실패했습니다.');
    }
  };

  if (loading) return <div>알림 설정 불러오는 중...</div>;

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '5px', fontSize: '18px', fontWeight: 'bold' }}>🔔 키워드(카테고리) 이메일 알림</h3>
      <p style={{ color: '#868e96', fontSize: '14px', marginBottom: '20px' }}>
        선택하신 카테고리의 새로운 분실물이 등록되면 이메일로 알려드립니다.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
        gap: '15px',
        marginBottom: '25px'
      }}>
        {MAJOR_CATEGORIES.map((category) => (
          <label 
            key={category} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            <input 
              type="checkbox" 
              checked={selectedCategories.includes(category)}
              onChange={() => handleToggle(category)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            {category}
          </label>
        ))}
      </div>

      {/* 저장 버튼 */}
      <div style={{ textAlign: 'right' }}>
        <button 
          onClick={handleSave} 
          style={{
            padding: '10px 24px', background: '#343a40', color: 'white',
            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          알림 설정 저장
        </button>
      </div>
    </div>
  );
};

export default AlertSettings;