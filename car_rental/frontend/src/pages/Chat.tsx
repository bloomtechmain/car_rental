import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import API_URL from '../api';
import '../chat-styles.css';

interface ChatUser {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface Message {
  id?: number;
  room: string;
  sender_id: string;
  content: string;
  timestamp: string;
}

const socket = io(API_URL, { 
  autoConnect: false, 
  path: "/my-custom-chat-path"
});

const Chat = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token, do not proceed.
      return;
    }

    // Connect the socket when the component mounts
    socket.connect();

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data: ChatUser[] = await response.json();
        setUsers(data);
        
        // After fetching users, check if a previous chat was open
        const lastSelectedUserId = localStorage.getItem('selectedUserId');
        if (lastSelectedUserId) {
          const userToSelect = data.find(u => u.id === lastSelectedUserId);
          if (userToSelect) {
            selectUser(userToSelect, true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    fetchUsers();

    const handleHistory = (history: Message[]) => {
      setMessages(history);
    };

    const handleReceiveMessage = (newMessage: Message) => {
        // Only add if it belongs to the current conversation
        const currentRoom = getRoomName(currentUser.id, JSON.parse(localStorage.getItem('selectedUserId') || 'null'));
        if (newMessage.room === currentRoom) {
            setMessages(prev => [...prev, newMessage]);
        }
    };

    socket.on('history', handleHistory);
    socket.on('receiveMessage', handleReceiveMessage);

    // Disconnect on unmount
    return () => {
      socket.off('history', handleHistory);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.disconnect();
    };
  }, []); // Run only once when the component mounts

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getRoomName = (id1: string, id2: string | null) => {
    if (!id1 || !id2) return null;
    return [id1, id2].sort().join('-');
  };

  const selectUser = (user: ChatUser, isRestoring = false) => {
    if (!isRestoring && selectedUser?.id === user.id) return;

    setMessages([]); // Clear messages for the new chat
    setSelectedUser(user);
    localStorage.setItem('selectedUserId', user.id);
    const room = getRoomName(currentUser.id, user.id);
    if (room) {
        socket.emit('joinRoom', room);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      const room = getRoomName(currentUser.id, selectedUser.id);
      if (!room) return;

      const newMessage: Message = {
        room,
        sender_id: currentUser.id,
        content: message,
        timestamp: new Date().toISOString(),
      };

      // No optimistic update here to ensure we rely on the single source of truth from the server
      socket.emit('sendMessage', { room, sender_id: currentUser.id, content: message });
      setMessage('');
    }
  };

  return (
    <AuthenticatedLayout>
       <div className="chat-layout">
        <div className="user-list-panel">
          <h2 className="panel-header">Conversations</h2>
          {users.map(user => (
            <div 
              key={user.id} 
              className={`user-list-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => selectUser(user)}
            >
              <img src={user.avatar_url} alt={user.full_name} className="avatar" />
              <span className="username">{user.full_name}</span>
            </div>
          ))}
        </div>
        <div className="chat-main-panel">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="avatar" />
                <h3>{selectedUser.full_name}</h3>
              </div>
              <div className="message-area">
                {messages.map((msg, index) => (
                  <div key={msg.id || index} className={`message-bubble ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}>
                    <p>{msg.content}</p>
                    <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
                 <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="message-input-form">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="placeholder-view">
              <h3>Select a conversation to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Chat;