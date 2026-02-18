import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import '../chat-styles.css';
import { jwtDecode } from 'jwt-decode';

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
            const decoded: any = jwtDecode(token);
            setCurrentUser(decoded);
        }
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the message list whenever messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch users you can chat with
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/chat/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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

        // Initialize socket connection
        socketRef.current = io('http://localhost:3000');

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketRef.current.on('chat_history', (history: Message[]) => {
            setMessages(history);
        });

        socketRef.current.on('receive_message', (message: Message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []); // Runs only once on component mount

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

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <h2>Conversations</h2>
                {users.map(user => (
                    <div key={user.id} className={`chat-user ${selectedUser?.id === user.id ? 'selected' : ''}`} onClick={() => setSelectedUser(user)}>
                        <img src={user.picture} alt={user.name} className="user-avatar" />
                        {user.name}
                    </div>
                ))}
            </div>
            <div className="chat-main">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h3>{selectedUser.name}</h3>
                        </div>
                        <div className="chat-messages">
                            {messages.map(msg => (
                                <div key={msg.id} className={`message ${msg.sender_id === currentUser?.id ? 'sent' : 'received'}`}>
                                    <p>{msg.content}</p>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-form" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                                placeholder="Type a message..." 
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;