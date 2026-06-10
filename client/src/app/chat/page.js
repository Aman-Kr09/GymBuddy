"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageCircle, Send, Search, Phone, Video, MoreVertical,
  ChevronLeft, Paperclip, Smile
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { chatAPI } from "@/lib/api";
import { io } from "socket.io-client";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlConvId = searchParams.get("conv");

  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({}); // convId -> isTyping bool
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize user and socket
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("gymbuddy_token");
    const storedUser = localStorage.getItem("gymbuddy_user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Connect to Socket.io server
      const socketUrl = process.env.NEXT_PUBLIC_API_URL 
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') 
        : 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        auth: { token }
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("⚡ Connected to real-time chat socket server");
      });

      newSocket.on("users:online", (onlineIds) => {
        setOnlineUsers(onlineIds);
      });

      newSocket.on("message:received", (data) => {
        const { message, conversationId } = data;
        
        // Append message if it belongs to selected chat
        setSelectedChat((currentSelected) => {
          if (currentSelected && currentSelected._id === conversationId) {
            setMessages((prev) => [...prev, message]);
            // Acknowledge read
            newSocket.emit("messages:read", { conversationId });
          }
          return currentSelected;
        });

        // Refresh conversation list to show last message
        fetchConversations();
      });

      newSocket.on("typing:start", ({ conversationId }) => {
        setTypingStatus((prev) => ({ ...prev, [conversationId]: true }));
      });

      newSocket.on("typing:stop", ({ conversationId }) => {
        setTypingStatus((prev) => ({ ...prev, [conversationId]: false }));
      });

      newSocket.on("messages:read", ({ conversationId, readBy }) => {
        // Update read receipts in current messages
        setMessages((prev) => 
          prev.map(msg => {
            if (msg.conversation === conversationId && !msg.readBy.includes(readBy)) {
              return { ...msg, readBy: [...msg.readBy, readBy] };
            }
            return msg;
          })
        );
      });

      return () => {
        newSocket.close();
      };
    } catch (err) {
      router.push("/login");
    }
  }, []);

  // Fetch all conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Handle URL redirect query parameter for selecting specific conversation
  useEffect(() => {
    if (urlConvId && conversations.length > 0) {
      const match = conversations.find(c => c._id === urlConvId);
      if (match) {
        setSelectedChat(match);
      }
    }
  }, [urlConvId, conversations]);

  // Load messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      
      // Notify read receipt
      if (socket) {
        socket.emit("messages:read", { conversationId: selectedChat._id });
      }
    }
  }, [selectedChat, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  const fetchConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await chatAPI.getMessages(convId);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleSend = () => {
    if (!messageInput.trim() || !selectedChat || !socket) return;

    // Send message via socket
    socket.emit("message:send", {
      conversationId: selectedChat._id,
      text: messageInput
    });

    // Stop typing indicator
    socket.emit("typing:stop", {
      conversationId: selectedChat._id,
      recipientId: getRecipientId(selectedChat)
    });

    setMessageInput("");
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (!socket || !selectedChat) return;

    // Start typing indicator
    socket.emit("typing:start", {
      conversationId: selectedChat._id,
      recipientId: getRecipientId(selectedChat)
    });

    // Debounce stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        conversationId: selectedChat._id,
        recipientId: getRecipientId(selectedChat)
      });
    }, 2000);
  };

  const getRecipientId = (conv) => {
    return conv.participants.find(p => p._id !== user?._id)?._id;
  };

  const getRecipientName = (conv) => {
    return conv.participants.find(p => p._id !== user?._id)?.fullName || "Workout Buddy";
  };

  const getRecipientInitials = (conv) => {
    const name = getRecipientName(conv);
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const isRecipientOnline = (conv) => {
    const rId = getRecipientId(conv);
    return onlineUsers.includes(rId);
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getRecipientName(conv);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <div style={{ paddingTop: '64px' }} className="h-screen flex">
        {/* Sidebar */}
        <div className={`${selectedChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] border-r border-[#1a1a1a] bg-[#080808]`}>
          {/* Header */}
          <div className="p-5 border-b border-[#1a1a1a]">
            <h1 className="text-xl font-black text-white flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#39FF14]" /> Messages
            </h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                id="chat-search"
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark !pl-11 !rounded-xl !py-3 !text-sm"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const online = isRecipientOnline(conv);
                const name = getRecipientName(conv);
                const initials = getRecipientInitials(conv);
                const lastMsgText = conv.lastMessage?.text || "No messages yet";
                const isTyping = typingStatus[conv._id];
                
                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedChat(conv)}
                    className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-all border-b border-[#111] ${
                      selectedChat?._id === conv._id
                        ? "bg-[rgba(57,255,20,0.05)] border-l-2 border-l-[#39FF14]"
                        : "hover:bg-[#0d0d0d]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black font-bold text-sm">
                        {initials}
                      </div>
                      {online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#39FF14] rounded-full border-2 border-[#080808]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
                        <span className="text-[#666] text-[10px] shrink-0">
                          {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className="text-[#888] text-xs truncate mt-0.5">
                        {isTyping ? <span className="text-[#39FF14] animate-pulse">Typing...</span> : lastMsgText}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-[#555] text-sm mt-12">
                No active conversations
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedChat ? "flex" : "hidden md:flex"} flex-col flex-1 bg-[#050505]`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] bg-[#080808]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 rounded-lg text-[#888] hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black font-bold text-sm">
                      {getRecipientInitials(selectedChat)}
                    </div>
                    {isRecipientOnline(selectedChat) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#39FF14] rounded-full border-2 border-[#080808]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{getRecipientName(selectedChat)}</h3>
                    <p className="text-[10px] text-[#39FF14]">
                      {isRecipientOnline(selectedChat) ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#111] transition-all">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#111] transition-all">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#111] transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                          isMe
                            ? "bg-[#39FF14] text-black rounded-br-md"
                            : "bg-[#111] text-[#ddd] border border-[#1a1a1a] rounded-bl-md"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div className="flex justify-between items-center gap-4 mt-1">
                          <p className={`text-[9px] ${isMe ? "text-black/50" : "text-[#666]"}`}>
                            {time}
                          </p>
                          {isMe && (
                            <span className="text-[9px] text-black/50">
                              {(msg.readBy || []).length > 1 ? "✓✓ Read" : "✓ Sent"}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {typingStatus[selectedChat._id] && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-2xl bg-[#111] border border-[#1a1a1a] text-[#777] text-xs italic flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-[#1a1a1a] bg-[#080808]">
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#111] transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    id="chat-input"
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 py-3 px-5 bg-[#111] border border-[#1a1a1a] rounded-xl text-white text-sm focus:border-[#39FF14] outline-none transition-all"
                  />
                  <button
                    onClick={handleSend}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-shadow"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 text-[#333]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
              <p className="text-[#666] text-sm max-w-xs">
                Select a conversation to start chatting with your workout buddies in real time!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        Loading chat module...
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
