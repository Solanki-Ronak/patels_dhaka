import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, query, onSnapshot, addDoc, orderBy, 
  serverTimestamp, getDocs, updateDoc, doc, deleteDoc, setDoc
} from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './MessageSystem.css';

const MessageSystem = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data(), online: false }))
        .filter(user => user.id !== auth.currentUser?.uid);
      setUsers(usersList);

      usersSnapshot.docs.forEach(userDoc => {
        onSnapshot(doc(db, 'users', userDoc.id), (doc) => {
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === doc.id ? { ...user, online: doc.data().online } : user
            )
          );
        });
      });
    };

    fetchUsers();
    
    const currentUserId = auth.currentUser?.uid;
    if (currentUserId) {
      updateDoc(doc(db, 'users', currentUserId), { 
        online: true,
        lastSeen: serverTimestamp()
      });
    }

    return () => {
      if (currentUserId) {
        updateDoc(doc(db, 'users', currentUserId), { 
          online: false,
          lastSeen: serverTimestamp()
        });
      }
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setMessages(fetchedMessages);
        setFilteredMessages(fetchedMessages);

        fetchedMessages.forEach(async (msg) => {
          if (msg.sender !== auth.currentUser.uid && msg.status !== 'read') {
            const messageRef = doc(messagesRef, msg.id);
            await updateDoc(messageRef, { status: 'read' });
          }
        });
      });

      return () => unsubscribe();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
      const typingRef = doc(db, 'chats', chatId, 'typing', selectedUser.id);
      const unsubscribe = onSnapshot(typingRef, (doc) => {
        setIsTyping(doc.data()?.isTyping || false);
      });

      return () => unsubscribe();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(msg => {
        if (msg.text) {
          try {
            const content = JSON.parse(msg.text);
            return content.blocks.some(block => 
              block.text.toLowerCase().includes(searchTerm.toLowerCase())
            );
          } catch {
            return msg.text.toLowerCase().includes(searchTerm.toLowerCase());
          }
        }
        return false;
      });
      setFilteredMessages(filtered);
    }
  }, [searchTerm, messages]);

  const sendMessage = async () => {
    const contentState = editorState.getCurrentContent();
    if (!contentState.hasText() || !selectedUser) return;

    try {
      const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      const messageData = {
        text: JSON.stringify(convertToRaw(contentState)),
        sender: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        status: 'sent',
        reactions: {},
        replyTo: replyingTo ? replyingTo.id : null
      };

      await addDoc(messagesRef, messageData);

      setEditorState(EditorState.createEmpty());
      setShowEmojiPicker(false);
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleTyping = () => {
    if (selectedUser) {
      const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
      const typingRef = doc(db, 'chats', chatId, 'typing', auth.currentUser.uid);
      setDoc(typingRef, { isTyping: true }, { merge: true });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setDoc(typingRef, { isTyping: false }, { merge: true });
      }, 2000);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (emojiObject) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      emojiObject.emoji
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-characters'
    );
    setEditorState(newEditorState);
    setShowEmojiPicker(false);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  };

  const addReaction = async (messageId, emoji) => {
    const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      [`reactions.${auth.currentUser.uid}`]: emoji
    });
  };

  const deleteMessage = async (messageId) => {
    const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
    await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
    setContextMenu(null);
  };

  const handleContextMenu = (event, messageId) => {
    event.preventDefault();
    setContextMenu({
      messageId,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const renderMessage = (msg) => {
    let messageContent;
    if (msg.text) {
      try {
        const contentState = convertFromRaw(JSON.parse(msg.text));
        messageContent = (
          <div className="message-content">
            <Editor editorState={EditorState.createWithContent(contentState)} readOnly={true} />
          </div>
        );
      } catch {
        messageContent = <p className="message-content">{msg.text}</p>;
      }
    }

    return (
      <div 
        key={msg.id} 
        className={`message ${msg.sender === auth.currentUser.uid ? 'sent' : 'received'}`}
        onContextMenu={(e) => handleContextMenu(e, msg.id)}
      >
        <div className="message-bubble">
          {msg.replyTo && (
            <div className="reply-to">
              Replying to: {messages.find(m => m.id === msg.replyTo)?.text || "Message not found"}
            </div>
          )}
          {messageContent}
          <span className="timestamp">
            {msg.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            {msg.sender === auth.currentUser.uid && (
              <span className={`message-status ${msg.status}`}>
                {msg.status === 'sent' && '✓'}
                {msg.status === 'delivered' && '✓✓'}
                {msg.status === 'read' && '✓✓'}
              </span>
            )}
          </span>
        </div>
        <div className="reactions">
          {Object.entries(msg.reactions || {}).map(([uid, emoji]) => (
            <span key={uid} className="reaction">{emoji}</span>
          ))}
        </div>
        <div className="message-actions">
          <button onClick={() => addReaction(msg.id, '👍')}>👍</button>
          <button onClick={() => addReaction(msg.id, '❤️')}>❤️</button>
          <button onClick={() => addReaction(msg.id, '😂')}>😂</button>
          <button onClick={() => addReaction(msg.id, '👋')}>👋</button>
          <button onClick={() => setReplyingTo(msg)}>↩️</button>
        </div>
      </div>
    );
  };

  return (
    <div className="message-system">
      <div className="chat-list">
        <div className="chat-list-header">
          <h3>Chats</h3>
          <input 
            type="text" 
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="chat-items">
          {users.map(user => {
            const lastMessage = messages.filter(m => m.sender === user.id || m.sender === auth.currentUser.uid).pop();
            let lastMessageText = 'No messages yet';
            if (lastMessage?.text) {
              try {
                lastMessageText = JSON.parse(lastMessage.text).blocks[0].text;
              } catch {
                lastMessageText = lastMessage.text;
              }
            }
            return (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user)} 
                className={`chat-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              >
                <div className={`user-avatar ${user.online ? 'online' : 'offline'}`}>
                  {user.username[0].toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name-status">
                    <span className="username">{user.username}</span>
                    <span className={`user-status ${user.online ? 'online' : ''}`}>
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <span className="last-message">{lastMessageText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="user-avatar-small">
                {selectedUser.username[0].toUpperCase()}
              </div>
              <div className="user-info">
                <h2>{selectedUser.username}</h2>
                <span className="user-status">{selectedUser.online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="messages">
              {filteredMessages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
            {isTyping && (
              <div className="typing-indicator">{selectedUser.username} is typing...</div>
            )}
            {replyingTo && (
              <div className="replying-to">
                <span>Replying to: {replyingTo.text}</span>
                <button onClick={() => setReplyingTo(null)}>Cancel</button>
              </div>
            )}
            <div className="message-input">
              <Editor
                editorState={editorState}
                onChange={(newState) => {
                  setEditorState(newState);
                  handleTyping();
                }}
                handleKeyCommand={handleKeyCommand}
                placeholder="Type a message"
                ref={editorRef}
              />
              <div className="input-actions">
                <button onClick={toggleEmojiPicker} className="emoji-button">😊</button>
                <button onClick={sendMessage} className="send-button">Send</button>
              </div>
            </div>
            {showEmojiPicker && (
              <div className="emoji-picker-container">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start messaging</p>
          </div>
        )}
      </div>
      {contextMenu && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => deleteMessage(contextMenu.messageId)}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default MessageSystem;