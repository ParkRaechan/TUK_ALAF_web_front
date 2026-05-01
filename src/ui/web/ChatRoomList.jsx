import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatRoomList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get('http://49.50.138.248:8080/api/chat/rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRooms(response.data);
    } catch (error) {
      console.error("채팅방 목록을 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-list-container">
      <header className="chat-list-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>
        <h2>내 채팅방 목록</h2>
        <div style={{ width: '80px' }}></div> {/* 가운데 정렬용 빈 공간 */}
      </header>

      <main className="chat-list-main">
        {loading ? (
          <div className="empty-message">목록을 불러오는 중...</div>
        ) : rooms.length > 0 ? (
          <div className="room-list">
            {rooms.map((room) => (
              <div 
                key={room.room_id} 
                className="room-card" 
                onClick={() => navigate(`/chat/room/${room.room_id}`)} // ★ 회원님의 채팅방 상세 경로에 맞게 수정하세요!
              >
                <div className="room-avatar">
                  {room.partner_name.charAt(0)} {/* 프로필 대신 이름 첫 글자 */}
                </div>
                <div className="room-info">
                  <h3 className="partner-name">{room.partner_name} 님과의 대화</h3>
                  <span className="room-date">
                    {new Date(room.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-message">참여 중인 채팅방이 없습니다.</div>
        )}
      </main>
    </div>
  );
};

export default ChatRoomList;