import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import '../chat-styles.css';
import { jwtDecode } from 'jwt-decode';
import { FaPaperPlane, FaComments } from 'react-icons/fa';

interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
}

interface Message {
    id: number;
    room_name: string;
    sender_id: string;
    content: string;
    timestamp: string;
}

const getRoomName = (user1: string, user2: string) => {
    return [user1, user2].sort().join('-');
};

const Chat = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            setCurrentUser(localUser);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/chat/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    console.error('Failed to fetch users');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();

        socketRef.current = io('http://localhost:3000');

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketRef.current.on('chat_history', (history: Message[]) => {
            setMessages(history);
        });

        socketRef.current.on('receive_message', (message: Message) => {
            // Ensure we don't add duplicate messages
            setMessages(prevMessages => 
                prevMessages.find(m => m.id === message.id) ? prevMessages : [...prevMessages, message]
            );
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedUser && currentUser && socketRef.current) {
            const roomName = getRoomName(currentUser.id, selectedUser.id);
            socketRef.current.emit('join_room', { userId1: currentUser.id, userId2: selectedUser.id });
        }
    }, [selectedUser, currentUser]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && selectedUser && currentUser && socketRef.current) {
            const roomName = getRoomName(currentUser.id, selectedUser.id);
            socketRef.current.emit('send_message', {
                room_name: roomName,
                sender_id: currentUser.id,
                content: newMessage
            });
            setNewMessage('');
        }
    };
    
    const renderAvatar = (user: User) => {
        if (user.picture) {
            return <img src={user.picture} alt={user.name} className="avatar" />;
        }
        return <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>;
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    Conversations
                </div>
                <div className="conversations-list">
                    {users.map(user => (
                        <div 
                            key={user.id} 
                            className={`conversation-item ${selectedUser?.id === user.id ? 'selected' : ''}`} 
                            onClick={() => setSelectedUser(user)}
                        >
                            {renderAvatar(user)}
                            <div className="conversation-details">
                                <div className="conversation-name">{user.name}</div>
                                <div className="conversation-email">{user.email}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <main className="chat-main">
                {selectedUser ? (
                    <>
                        <header className="chat-header">
                            {renderAvatar(selectedUser)}
                            <div className="chat-header-name">{selectedUser.name}</div>
                        </header>
                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-bubble ${msg.sender_id === currentUser?.id ? 'sent' : 'received'}`}>
                                    <div>
                                        <div className="message-content">{msg.content}</div>
                                        <div className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-input-area">
                            <form className="chat-input-form" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className="chat-input"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                />
                                <button type="submit" className="send-button">
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="no-conversation-selected">
                        <FaComments />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Chat;