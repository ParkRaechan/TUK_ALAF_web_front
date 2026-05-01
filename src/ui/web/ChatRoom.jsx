// src/ui/web/ChatRoom.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { ArrowLeft, Send } from 'lucide-react';
import './ChatRoom.css'; // 디자인용 CSS (별도 생성 필요)

// 서버 주소에 맞게 소켓 연결
const socket = io('http://49.50.138.248:8080');

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null); // 자동 스크롤용

  // 1. 방 입장 및 과거 메시지 불러오기
  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 소켓 방 입장
    socket.emit('join_room', roomId);

    // 과거 채팅 내역 불러오기
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://49.50.138.248:8080/api/chat/rooms/${roomId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('메시지 내역을 불러오지 못했습니다.', error);
      }
    };
    fetchHistory();

    // 새 메시지 수신 이벤트 리스너
    const receiveMessageHandler = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on('receive_message', receiveMessageHandler);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      socket.off('receive_message', receiveMessageHandler);
    };
  }, [roomId, user, navigate]);

  // 2. 메시지가 추가될 때마다 맨 아래로 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. 메시지 전송
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      roomId,
      senderId: user.member_id,
      sender_name: user.name, // 화면 표시용
      message: inputMessage,
      created_at: new Date().toISOString(),
    };

    // 소켓으로 실시간 전송
    socket.emit('send_message', messageData);
    
    try {
      // DB에 저장
      await axios.post('http://49.50.138.248:8080/api/chat/messages', {
        roomId,
        message: inputMessage
      });
    } catch (error) {
      console.error('메시지 저장 실패', error);
    }
    
    setInputMessage(''); // 입력창 초기화
  };

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f4f5f7' }}>
      
      {/* 헤더 */}
      <header style={{ padding: '15px', backgroundColor: 'white', display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px' }}>1:1 채팅</h2>
      </header>

      {/* 대화창 */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, idx) => {
          const isMyMessage = msg.sender_id === user?.member_id;
          return (
            <div key={idx} style={{ alignSelf: isMyMessage ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              {!isMyMessage && <div style={{ fontSize: '12px', marginBottom: '4px', color: '#666' }}>{msg.sender_name}</div>}
              <div style={{
                backgroundColor: isMyMessage ? '#4CAF50' : 'white',
                color: isMyMessage ? 'white' : 'black',
                padding: '10px 14px',
                borderRadius: '15px',
                borderTopRightRadius: isMyMessage ? '4px' : '15px',
                borderTopLeftRadius: !isMyMessage ? '4px' : '15px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={sendMessage} style={{ padding: '15px', backgroundColor: 'white', display: 'flex', gap: '10px', borderTop: '1px solid #ddd' }}>
        <input 
          type="text" 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          placeholder="메시지를 입력하세요..." 
          style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
        />
        <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;