'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  Users,
  Heart,
  Shuffle,
  Briefcase,
  Loader2,
  X,
  Sparkles,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  connectWebSocket,
  disconnectWebSocket,
  getWebSocketClient,
} from '@/lib/websocket';
import { getApiUrl, getAuthHeaders } from '@/lib/api';

type MatchmakingMode = 'FRIENDS' | 'DATING' | 'RANDOM' | 'NETWORKING';

interface ChatMessage {
  id: number;
  sender: string;
  content: string | null;
  timestamp: string;
  isRead: boolean;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  mediaUrl?: string | null;
}

interface ChatRoom {
  roomId: string;
  otherUser: {
    username: string;
    age?: number;
    country?: string;
    bio?: string;
    avatarUrl?: string;
  },
  mode: MatchmakingMode;
  lastMessagePreview?: string;
  unreadCount: number;
  lastMessageAt: string;
  isActive: boolean;
}

interface MatchResponse {
  matchFound: boolean;
  roomId?: string;
  otherUser?: {
    username: string;
    age?: number;
    country?: string;
    bio?: string;
    avatarUrl?: string;
  };
  sharedInterests?: string[];
  score?: number;
}

interface ConversationOpener {
  id: number;
  text: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [mode, setMode] = useState<MatchmakingMode>('FRIENDS');
  const [matchmakingStatus, setMatchmakingStatus] = useState<
    'IDLE' | 'SEARCHING' | 'MATCHED'
  >('IDLE');
  const [currentMatch, setCurrentMatch] = useState<MatchResponse | null>(null);
  const [openers, setOpeners] = useState<ConversationOpener[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loadingOpeners, setLoadingOpeners] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/chat/rooms'), {
        headers: getAuthHeaders(authToken || undefined),
      });
      if (response.ok) {
        const data = await response.json();
        setChatRooms(data);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  }, [authToken]);

  const fetchMessages = useCallback(
    async (roomId: string) => {
      try {
        const response = await fetch(
          getApiUrl(`/api/v1/chat/room/${roomId}/messages?page=0&size=50`),
          { headers: getAuthHeaders(authToken || undefined) }
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data.content || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    },
    [authToken]
  );

  const fetchConversationOpeners = useCallback(
    async (roomId: string) => {
      if (!authToken) return;
      setLoadingOpeners(true);
      setError(null);
      try {
        const response = await fetch(
          getApiUrl(`/api/v1/chat/room/${roomId}/openers`),
          { headers: getAuthHeaders(authToken) }
        );
        if (response.ok) {
          const data = await response.json();
          setOpeners(data);
        } else {
          setError('Could not load AI conversation starters');
        }
      } catch (error) {
        console.error('Error fetching openers:', error);
        setError('Could not load AI conversation starters');
      } finally {
        setLoadingOpeners(false);
      }
    },
    [authToken]
  );

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/presence/online-users'), {
        headers: getAuthHeaders(authToken || undefined),
      });
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  }, [authToken]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Get auth token from localStorage (should be set during login)
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, [session]);

  useEffect(() => {
    if (!authToken) return;

    // Connect WebSocket
    const client = connectWebSocket(
      authToken,
      () => {
        console.log('WebSocket connected');
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );

    // Subscribe to user-specific match events
    if (session?.user?.name) {
      client.subscribe(`/topic/user/${session.user.name}/match`, (message) => {
        const match: MatchResponse = JSON.parse(message.body);
        if (match.matchFound) {
          setCurrentMatch(match);
          setMatchmakingStatus('MATCHED');
          setSelectedChat(match.roomId || null);
          fetchConversationOpeners(match.roomId!);
        }
      });
    }

    return () => {
      disconnectWebSocket();
    };
  }, [authToken, session, fetchConversationOpeners]);

  useEffect(() => {
    if (selectedChat && authToken) {
      const client = getWebSocketClient();
      if (!client || !client.connected) return;

      // Subscribe to chat room messages
      const subscription = client.subscribe(
        `/topic/chat/${selectedChat}`,
        (message) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, chatMessage]);
        }
      );

      // Subscribe to typing indicator
      const typingSub = client.subscribe(
        `/topic/chat/${selectedChat}/typing`,
        (message) => {
          const data = JSON.parse(message.body);
          if (data.username && data.username !== session?.user?.name) {
            setTypingUsers((prev) => new Set(prev).add(data.username));
            setTimeout(() => {
              setTypingUsers((prev) => {
                const next = new Set(prev);
                next.delete(data.username);
                return next;
              });
            }, 3000);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
        typingSub.unsubscribe();
      };
    }
  }, [selectedChat, authToken, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (authToken) {
      fetchChatRooms();
      fetchOnlineUsers();
      const interval = setInterval(fetchOnlineUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [authToken, fetchChatRooms, fetchOnlineUsers]);

  useEffect(() => {
    if (selectedChat && authToken) {
      fetchMessages(selectedChat);
      fetchConversationOpeners(selectedChat);
    }
  }, [selectedChat, authToken, fetchConversationOpeners, fetchMessages]);

  const handleStartMatchmaking = async () => {
    if (!authToken) return;
    setMatchmakingStatus('SEARCHING');
    setError(null);
    try {
      // First, update preferences if needed
      await fetch(getApiUrl('/api/v1/matchmaking/preferences'), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ mode }),
      });

      // Start matchmaking
      const response = await fetch(getApiUrl('/api/v1/matchmaking/start'), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to start matchmaking' }));
        throw new Error(
          errorData.message || errorData.error || 'Failed to start matchmaking'
        );
      }

      const match: MatchResponse = await response.json();
      if (match.matchFound) {
        setCurrentMatch(match);
        setMatchmakingStatus('MATCHED');
        setSelectedChat(match.roomId || null);
        if (match.roomId) {
          fetchConversationOpeners(match.roomId);
        }
      } else {
        // Poll for status
        pollMatchmakingStatus();
      }
    } catch (error) {
      console.error('Error starting matchmaking:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to start matchmaking'
      );
      setMatchmakingStatus('IDLE');
    }
  };

  const pollMatchmakingStatus = async () => {
    if (!authToken) return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(getApiUrl('/api/v1/matchmaking/status'), {
          headers: getAuthHeaders(authToken),
        });
        if (response.ok) {
          const status = await response.json();
          if (status.status === 'MATCHED' && status.match) {
            setCurrentMatch(status.match);
            setMatchmakingStatus('MATCHED');
            setSelectedChat(status.match.roomId || null);
            if (status.match.roomId) {
              fetchConversationOpeners(status.match.roomId);
            }
            clearInterval(interval);
          } else if (status.status === 'IDLE') {
            setMatchmakingStatus('IDLE');
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(interval);
      }
    }, 2000);

    // Stop after 60 seconds
    setTimeout(() => clearInterval(interval), 60000);
  };

  const handleStopMatchmaking = async () => {
    if (!authToken) return;
    try {
      await fetch(getApiUrl('/api/v1/matchmaking/stop'), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
      });
      setMatchmakingStatus('IDLE');
    } catch (error) {
      console.error('Error stopping matchmaking:', error);
    }
  };

  const handleSkipMatch = async () => {
    if (!authToken || !selectedChat) return;
    setError(null);
    try {
      const response = await fetch(getApiUrl('/api/v1/matchmaking/skip'), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ roomId: selectedChat }),
      });
      if (!response.ok) {
        throw new Error('Failed to skip match');
      }
      setSelectedChat(null);
      setCurrentMatch(null);
      setMatchmakingStatus('IDLE');
      setOpeners([]);
      fetchChatRooms();
    } catch (error) {
      console.error('Error skipping match:', error);
      setError(error instanceof Error ? error.message : 'Failed to skip match');
    }
  };

  const handleBlockUser = async (username: string) => {
    if (!authToken) return;
    setError(null);
    try {
      const response = await fetch(getApiUrl('/api/v1/user/block'), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ blockedUsername: username }),
      });
      if (!response.ok) {
        throw new Error('Failed to block user');
      }
      setShowBlockModal(false);
      setShowUserMenu(null);
      // Close chat if blocked user is in current chat
      const currentRoom = chatRooms.find((r) => r.roomId === selectedChat);
      if (currentRoom?.otherUser.username === username) {
        setSelectedChat(null);
      }
      fetchChatRooms();
    } catch (error) {
      console.error('Error blocking user:', error);
      setError(error instanceof Error ? error.message : 'Failed to block user');
    }
  };

  const handleReportUser = async (username: string, reason: string) => {
    if (!authToken || !reason.trim()) return;
    setError(null);
    try {
      const response = await fetch(getApiUrl('/api/v1/user/report'), {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ reportedUsername: username, reason }),
      });
      if (!response.ok) {
        throw new Error('Failed to report user');
      }
      setShowReportModal(false);
      setShowUserMenu(null);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting user:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to report user'
      );
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !authToken) return;

    const client = getWebSocketClient();
    if (!client || !client.connected) {
      console.error('WebSocket not connected');
      return;
    }

    client.publish({
      destination: `/app/chat/${selectedChat}/send`,
      body: JSON.stringify({
        content: newMessage,
        type: 'TEXT',
      }),
    });

    setNewMessage('');
  };

  const handleTyping = () => {
    if (!selectedChat || !authToken) return;
    const client = getWebSocketClient();
    if (client && client.connected) {
      client.publish({
        destination: `/app/chat/${selectedChat}/typing`,
        body: '',
      });
    }
  };

  const handleMarkAsRead = () => {
    if (!selectedChat || !authToken) return;
    const client = getWebSocketClient();
    if (client && client.connected) {
      client.publish({
        destination: `/app/chat/${selectedChat}/read`,
        body: '',
      });
    }
  };

  const modeIcons = {
    FRIENDS: Users,
    DATING: Heart,
    RANDOM: Shuffle,
    NETWORKING: Briefcase,
  };

  const modeLabels = {
    FRIENDS: 'Friends',
    DATING: 'Dating',
    RANDOM: 'Random',
    NETWORKING: 'Networking',
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Profile Header */}
        <div className="p-4 bg-gray-50 flex items-center justify-between border-b">
          <div className="flex items-center">
            <Image
              src="/default-avatar.png"
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <span className="font-semibold block">{session?.user?.name}</span>
              <span className="text-xs text-gray-500">
                {onlineUsers.includes(session?.user?.name || '')
                  ? 'Online'
                  : 'Offline'}
              </span>
            </div>
          </div>
          <MoreVertical className="text-gray-500 cursor-pointer" />
        </div>

        {/* Mode Selector */}
        <div className="p-4 border-b bg-gray-50">
          <label className="text-xs font-semibold text-gray-600 mb-2 block">
            Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(modeIcons) as MatchmakingMode[]).map((m) => {
              const Icon = modeIcons[m];
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`p-2 rounded-lg flex items-center justify-center space-x-1 transition ${
                    mode === m
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-xs">{modeLabels[m]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Matchmaking Controls */}
        <div className="p-4 border-b bg-gray-50">
          {matchmakingStatus === 'IDLE' ? (
            <button
              onClick={handleStartMatchmaking}
              disabled={!authToken}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Find someone to talk to
            </button>
          ) : matchmakingStatus === 'SEARCHING' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin text-blue-500" size={20} />
                <span className="text-sm text-gray-700">Searching...</span>
              </div>
              <button
                onClick={handleStopMatchmaking}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Stop
              </button>
            </div>
          ) : (
            <div className="text-sm text-green-600 font-semibold">
              ✓ Match found!
            </div>
          )}
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded flex items-center space-x-1">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search chats"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms
            .filter((room) =>
              room.otherUser.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .map((room) => (
              <div
                key={room.roomId}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedChat === room.roomId ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  setSelectedChat(room.roomId);
                  setCurrentMatch(null);
                  handleMarkAsRead();
                }}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <Image
                      src={room.otherUser.avatarUrl || '/default-avatar.png'}
                      alt={room.otherUser.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full"
                    />
                    {onlineUsers.includes(room.otherUser.username) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate">
                        {room.otherUser.username}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(room.lastMessageAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {room.lastMessagePreview || 'No messages yet'}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Side - Chat or Matchmaking View */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white flex items-center justify-between border-b relative">
              <div className="flex items-center">
                <Image
                  src={
                    chatRooms.find((r) => r.roomId === selectedChat)?.otherUser
                      .avatarUrl || '/default-avatar.png'
                  }
                  alt="Chat"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <h2 className="font-semibold">
                    {
                      chatRooms.find((r) => r.roomId === selectedChat)
                        ?.otherUser.username
                    }
                  </h2>
                  <p className="text-sm text-gray-500">
                    {onlineUsers.includes(
                      chatRooms.find((r) => r.roomId === selectedChat)
                        ?.otherUser.username || ''
                    )
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {currentMatch && (
                  <button
                    onClick={handleSkipMatch}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1"
                  >
                    <X size={16} />
                    <span>Skip</span>
                  </button>
                )}
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowUserMenu(
                        showUserMenu === selectedChat
                          ? null
                          : selectedChat || null
                      )
                    }
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showUserMenu === selectedChat && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          const username = chatRooms.find(
                            (r) => r.roomId === selectedChat
                          )?.otherUser.username;
                          if (username) {
                            setShowBlockModal(true);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-t-lg flex items-center space-x-2"
                      >
                        <Shield size={16} />
                        <span>Block User</span>
                      </button>
                      <button
                        onClick={() => {
                          const username = chatRooms.find(
                            (r) => r.roomId === selectedChat
                          )?.otherUser.username;
                          if (username) {
                            setShowReportModal(true);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg flex items-center space-x-2"
                      >
                        <AlertTriangle size={16} />
                        <span>Report User</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Starters (if new match) */}
            {(openers.length > 0 || loadingOpeners || error) && (
              <div className="p-4 bg-blue-50 border-b">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700">
                    Conversation Starters
                  </span>
                </div>
                {loadingOpeners ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Loading AI suggestions...</span>
                  </div>
                ) : error ? (
                  <div className="text-xs text-gray-600">
                    {error}. You can start with: Hey! How&rsquo;s your day going?
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {openers.map((opener) => (
                      <button
                        key={opener.id}
                        onClick={() => {
                          setNewMessage(opener.text);
                          handleSendMessage();
                        }}
                        className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-50 transition"
                      >
                        {opener.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === session?.user?.name
                      ? 'justify-end'
                      : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === session?.user?.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    {message.type === 'TEXT' ? (
                      <p>{message.content}</p>
                    ) : message.type === 'IMAGE' ? (
                      <Image
                        src={message.mediaUrl || ''}
                        alt="Shared"
                        width={400}
                        height={300}
                        className="max-w-full rounded-lg"
                      />
                    ) : (
                      <a
                        href={message.mediaUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500"
                      >
                        <Paperclip size={16} />
                        <span className="ml-2">Attachment</span>
                      </a>
                    )}
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {message.sender === session?.user?.name && (
                        <span className="ml-2">
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {typingUsers.size > 0 && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white rounded-lg p-3 text-gray-500 text-sm">
                    {Array.from(typingUsers).join(', ')} typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Smile size={24} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                  onClick={handleSendMessage}
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Select a chat or find a new match to start talking
              </h2>
              <p className="text-gray-500">
                {matchmakingStatus === 'SEARCHING'
                  ? 'Searching for your perfect match...'
                  : 'Click "Find someone to talk to" to get started'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Block User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to block{' '}
              <strong>
                {
                  chatRooms.find((r) => r.roomId === selectedChat)?.otherUser
                    .username
                }
              </strong>
              ? You won&rsquo;t be able to receive messages from them.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const username = chatRooms.find(
                    (r) => r.roomId === selectedChat
                  )?.otherUser.username;
                  if (username) {
                    handleBlockUser(username);
                  }
                }}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
              >
                Block
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Report User</h3>
            <p className="text-gray-600 mb-4">
              Report{' '}
              <strong>
                {
                  chatRooms.find((r) => r.roomId === selectedChat)?.otherUser
                    .username
                }
              </strong>{' '}
              for inappropriate behavior.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please describe the issue..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const username = chatRooms.find(
                    (r) => r.roomId === selectedChat
                  )?.otherUser.username;
                  if (username) {
                    handleReportUser(username, reportReason);
                  }
                }}
                disabled={!reportReason.trim()}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
