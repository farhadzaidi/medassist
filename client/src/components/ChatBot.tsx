import { useState, useEffect, useRef } from 'react';
import { api, ChatMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { ConfirmationModal } from './ConfirmationModal';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      setMessages([]);
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory();
      setMessages(history.map(msg => ({
        content: msg.message,
        isUser: msg.is_user,
        timestamp: msg.timestamp
      })));
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleDeleteChat = async () => {
    try {
      await api.deleteChatHistory();
      setMessages([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage: Message = {
      content: userMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Get bot response
      const response = await api.chat(userMessage);
      const botMessage: Message = {
        content: response.message,
        isUser: false,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e as any);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="chat-container">
      {user && messages.length > 0 && (
        <div className="chat-header">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="delete-chat-button"
          >
            Delete Chat History
          </button>
        </div>
      )}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            <div className="message-timestamp">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-disclaimer">
        <p>This is an AI assistant providing general information and support. It is not a replacement for professional mental health care. For serious concerns, please seek help from a qualified mental health professional.</p>
      </div>
      <div className="chat-input-form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="chat-input"
          disabled={isLoading}
          rows={1}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="send-button"
        >
          Send
        </button>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteChat}
        title="Delete Chat History"
        message="Are you sure you want to delete your chat history? This action cannot be undone."
      />
    </div>
  );
}; 