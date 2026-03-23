import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import type { Conversation, Message, User } from '../types';
import { getConversations, getMessages, sendMessage, getUser } from '../api';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<number | null>(
    userId ? Number(userId) : searchParams.get('user') ? Number(searchParams.get('user')) : null
  );
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadConversations();
  }, [user, authLoading, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeUserId) {
      loadMessages(activeUserId);
      getUser(activeUserId).then((r) => setActiveUser(r.data)).catch(() => {});
    }
  }, [activeUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh messages every 8 seconds when a conversation is open
  useEffect(() => {
    if (!activeUserId) return;
    const interval = setInterval(() => {
      getMessages(activeUserId).then((r) => setMessages(r.data)).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    try {
      const res = await getConversations();
      setConversations(res.data);
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadMessages = async (uid: number) => {
    setLoadingMsgs(true);
    try {
      const res = await getMessages(uid);
      setMessages(res.data);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeUserId || sending) return;
    setSending(true);
    try {
      const res = await sendMessage({ receiver_id: activeUserId, content: content.trim() });
      setMessages((prev) => [...prev, res.data]);
      setContent('');
      loadConversations();
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (uid: number) => {
    setActiveUserId(uid);
    navigate(`/messages/${uid}`, { replace: true });
  };

  if (authLoading || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-xl shadow-md overflow-hidden flex" style={{ height: '600px' }}>
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-600">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 px-4">No conversations yet.</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.other_user.id}
                  onClick={() => selectConversation(conv.other_user.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    activeUserId === conv.other_user.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    {conv.other_user.avatar_url ? (
                      <img src={conv.other_user.avatar_url} alt={conv.other_user.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                        {conv.other_user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900 text-sm truncate flex-1">
                      {conv.other_user.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {conv.unread_count > 0 && (
                        <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.last_message.content}
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeUserId && activeUser ? (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
                {activeUser.avatar_url ? (
                  <img src={activeUser.avatar_url} alt={activeUser.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{activeUser.name}</p>
                  {activeUser.city && (
                    <p className="text-xs text-gray-400">{activeUser.city}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {loadingMsgs ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm ${
                              isMine
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 px-1">
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="px-5 py-4 border-t border-gray-200 flex gap-3">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || sending}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400">
              <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
