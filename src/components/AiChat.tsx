import React, { useState, useRef, useEffect } from "react";
import { BabyProfile } from "../types";
import { 
  Send, Sparkles, MessageSquare, Bot, AlertCircle, Trash2, 
  ArrowRight, Plus, Menu, X, History, MessageCircle 
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

interface AiChatProps {
  profile: BabyProfile;
}

export default function AiChat({ profile }: AiChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const QUICK_PROMPTS = [
    "Susu formula bertahan berapa jam setelah dibuat?",
    "Ide menu MPASI pertama untuk bayi 6 bulan yang praktis",
    "Bagaimana cara mengatasi bayi GTM (Gerakan Tutup Mulut)?",
    "Berapa jam kebutuhan tidur harian untuk bayi usia saat ini?",
    "Tips melatih tummy time agar leher bayi cepat tegak"
  ];

  const getWelcomeMessage = (): Message => ({
    id: "welcome",
    role: "model",
    content: `Halo Ibu hebat! Saya **Catatan Ibu AI**, asisten harian Ibu dalam merawat si kecil **${profile.name}**. 

Ibu bisa bertanya apa saja mengenai laktasi (ASI), takaran susu botol, resep & perkembangan MPASI, jadwal tidur, stimulasi tumbuh kembang, hingga imunisasi si kecil. 

*Bagaimana kondisi si kecil hari ini? Ada yang bisa saya bantu jawab?* 🌸`,
    timestamp: new Date().toISOString()
  });

  // Load chat sessions from LocalStorage
  useEffect(() => {
    try {
      const savedSessionsStr = localStorage.getItem("bunda_care_chat_sessions");
      if (savedSessionsStr) {
        const parsed = JSON.parse(savedSessionsStr) as ChatSession[];
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }

      // If no sessions, check if legacy chat history exists
      const legacyHistoryStr = localStorage.getItem("bunda_care_chat_history");
      if (legacyHistoryStr) {
        const legacyHistory = JSON.parse(legacyHistoryStr) as Message[];
        const migratedSession: ChatSession = {
          id: "session-migrated",
          title: "Sesi Tanya Jawab Sebelumnya",
          messages: legacyHistory,
          updatedAt: new Date().toISOString()
        };
        const list = [migratedSession];
        setSessions(list);
        setActiveSessionId(migratedSession.id);
        localStorage.setItem("bunda_care_chat_sessions", JSON.stringify(list));
        localStorage.removeItem("bunda_care_chat_history");
      } else {
        // Create an initial default session
        const initialSession: ChatSession = {
          id: "session-initial",
          title: "Sesi Konsultasi Pertama 🌸",
          messages: [getWelcomeMessage()],
          updatedAt: new Date().toISOString()
        };
        const list = [initialSession];
        setSessions(list);
        setActiveSessionId(initialSession.id);
        localStorage.setItem("bunda_care_chat_sessions", JSON.stringify(list));
      }
    } catch (e) {
      console.error("Error loading chat sessions:", e);
    }
  }, [profile.name]);

  // Save all sessions to LocalStorage
  const saveSessions = (updatedSessions: ChatSession[]) => {
    try {
      localStorage.setItem("bunda_care_chat_sessions", JSON.stringify(updatedSessions));
    } catch (e) {
      console.error("Error saving chat sessions:", e);
    }
  };

  const handleCreateNewSession = () => {
    const newSessionId = "session-" + Date.now();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Sesi Chat Baru 🌸",
      messages: [getWelcomeMessage()],
      updatedAt: new Date().toISOString()
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSessionId);
    saveSessions(updated);
    setShowMobileSidebar(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("Harus ada minimal satu sesi chat yang aktif.");
      return;
    }
    if (confirm("Apakah Ibu yakin ingin menghapus sesi chat ini?")) {
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      saveSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // Scroll to bottom on active messages change
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading || !activeSessionId) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    // Determine updated sessions list
    const updatedSessions = sessions.map(session => {
      if (session.id === activeSessionId) {
        const updatedMessages = [...session.messages, userMsg];
        let newTitle = session.title;
        // If it was the default first title, rename it to user's first query
        if (session.title === "Sesi Chat Baru 🌸" || session.title === "Sesi Konsultasi Pertama 🌸" || session.title === "Sesi Tanya Jawab Sebelumnya") {
          newTitle = text.slice(0, 24) + (text.length > 24 ? "..." : "");
        }
        return {
          ...session,
          title: newTitle,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return session;
    });

    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    setInputValue("");
    setLoading(true);
    setError(null);

    const activeSess = updatedSessions.find(s => s.id === activeSessionId);
    const activeMessages = activeSess ? activeSess.messages : [];

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: activeMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          babyProfile: profile
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung dengan server Catatan Ibu AI.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: "model",
        content: data.reply,
        timestamp: new Date().toISOString()
      };

      const finalSessions = updatedSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, aiMsg],
            updatedAt: new Date().toISOString()
          };
        }
        return session;
      });

      setSessions(finalSessions);
      saveSessions(finalSessions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal mendapatkan respons AI, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (!activeSessionId) return;
    if (confirm("Apakah Ibu yakin ingin mengosongkan riwayat chat pada sesi ini?")) {
      const updated = sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [getWelcomeMessage()],
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      setSessions(updated);
      saveSessions(updated);
    }
  };

  return (
    <div id="ai-chat-section" className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FDFBF7] p-5 rounded-3xl border border-[#E2E8CE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E2E8CE] flex items-center justify-center text-[#BC6C25]">
            <Bot className="w-5 h-5 text-[#BC6C25]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#5A5A40] flex items-center gap-2">
              Tanya AI Pintar
              <span className="text-[9px] bg-[#F2E8CF] text-[#BC6C25] px-2 py-0.5 rounded-full font-sans font-bold tracking-wider uppercase">PWA</span>
            </h3>
            <p className="text-xs text-[#8B8B6B] font-sans">Konsultasi Laktasi, MPASI, Tumbuh Kembang, & Pola Asuh Medis</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="flex lg:hidden items-center justify-center gap-1.5 text-xs font-bold text-[#BC6C25] bg-white border border-[#E2E8CE] px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <History className="w-4 h-4" /> Daftar Sesi ({sessions.length})
          </button>

          {messages.length > 1 && (
            <button
              id="btn-clear-chat"
              onClick={handleClearChat}
              className="ml-auto sm:ml-0 flex items-center gap-1.5 text-xs font-bold text-[#8B8B6B] hover:text-red-600 bg-white border border-[#E2E8CE] px-3 py-2 rounded-xl transition uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Kosongkan Sesi
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px] relative">
        
        {/* --- LEFT SIDEBAR: Chat Sessions list --- */}
        {/* Mobile drawer backdrop */}
        {showMobileSidebar && (
          <div 
            onClick={() => setShowMobileSidebar(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          />
        )}

        {/* Sidebar container */}
        <div className={`
          fixed inset-y-0 left-0 w-[260px] bg-white border-r border-[#E2E8CE] z-40 p-4 flex flex-col justify-between space-y-4 transition-transform duration-300 lg:static lg:inset-auto lg:w-auto lg:h-full lg:bg-[#F2E8CF]/10 lg:border lg:rounded-3xl lg:col-span-3
          ${showMobileSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-[#5A5A40] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#BC6C25]" />
                Kolom Chat (Sesi)
              </h4>
              <button 
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F0] text-[#8B8B6B] lg:hidden cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* "+ Sesi Baru" Button */}
            <button
              onClick={handleCreateNewSession}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#BC6C25] text-white text-xs font-bold hover:bg-[#a6561b] transition shadow-md uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Sesi Baru
            </button>

            {/* Scrollable list of sessions */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setShowMobileSidebar(false);
                    }}
                    className={`group w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition border cursor-pointer ${
                      isActive
                        ? "bg-[#BC6C25]/10 border-[#BC6C25]/40 text-[#BC6C25] font-bold"
                        : "bg-white border-[#E2E8CE] hover:bg-[#FDFBF7] hover:border-[#BC6C25]/40 text-[#5A5A40]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#BC6C25]" : "text-[#8B8B6B]"}`} />
                      <span className="truncate leading-tight">{session.title}</span>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 rounded text-[#8B8B6B] hover:text-red-600 hover:bg-red-50/80 transition opacity-80 lg:opacity-0 lg:group-hover:opacity-100 shrink-0 cursor-pointer"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8CE] text-[10px] text-[#8B8B6B] leading-relaxed flex items-start gap-1 font-serif italic shrink-0">
            <span>💡</span>
            <span>Semua percakapan tersimpan aman di peramban Anda.</span>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Chat Box --- */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-[#E2E8CE] shadow-sm flex flex-col h-full overflow-hidden">
          
          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FDFBF7]/40 flex flex-col">
            {messages.map((msg) => {
              const isAi = msg.role === "model";
              const isWelcome = msg.id === "welcome";
              return (
                <div key={msg.id} className="space-y-4">
                  <div
                    className={`flex gap-3 max-w-[85%] ${
                      isAi ? "self-start" : "self-end ml-auto flex-row-reverse"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isAi ? "bg-[#E2E8CE] text-[#BC6C25]" : "bg-[#BC6C25] text-white"
                    }`}>
                      {isAi ? <Bot className="w-4 h-4" /> : <span className="text-xs font-bold font-serif">Ibu</span>}
                    </div>

                    {/* Bubble content */}
                    <div className="space-y-1">
                      <div className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                        isAi
                          ? "bg-white border-[#E2E8CE] text-[#5A5A40]"
                          : "bg-[#BC6C25] border-[#BC6C25] text-white"
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`text-[9px] text-[#8B8B6B] font-mono ${!isAi ? "text-right" : ""}`}>
                        {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>

                  {/* Render popular questions inside welcome block if there are no other user questions */}
                  {isWelcome && messages.length === 1 && (
                    <div className="max-w-xl mx-auto py-2 px-2 bg-white/70 rounded-2xl border border-[#E2E8CE]/60 shadow-sm space-y-3 animate-in fade-in duration-300">
                      <h4 className="text-xs font-bold text-[#5A5A40] flex items-center gap-1 bg-[#F2E8CF]/40 px-3 py-1.5 rounded-xl border border-[#E2E8CE]/50">
                        <Sparkles className="w-3.5 h-3.5 text-[#BC6C25]" /> Pertanyaan Populer Ibu
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5">
                        {QUICK_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(prompt)}
                            disabled={loading}
                            className="text-left p-2.5 rounded-xl bg-[#FDFBF7]/80 border border-[#E2E8CE] text-[11px] text-[#5A5A40] hover:bg-[#F2E8CF]/20 hover:border-[#BC6C25]/50 transition shadow-xs flex items-start gap-1.5 group disabled:opacity-50 cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3 mt-0.5 text-[#BC6C25]/60 group-hover:translate-x-0.5 transition shrink-0" />
                            <span>{prompt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-[#E2E8CE] text-[#BC6C25] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white border border-[#E2E8CE] px-4 py-3 rounded-2xl shadow-sm text-xs text-[#8B8B6B] flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#BC6C25] rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-[#BC6C25] rounded-full animate-bounce delay-200"></span>
                    <span className="w-1.5 h-1.5 bg-[#BC6C25] rounded-full animate-bounce delay-300"></span>
                  </span>
                  <span>Bunda Care AI sedang mengetik...</span>
                </div>
              </div>
            )}

            {/* Error Indicator */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex gap-2 items-center mx-auto max-w-md">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-4 border-t border-[#E2E8CE] bg-white flex gap-2.5 items-center shrink-0"
          >
            <input
              type="text"
              id="input-ai-chat"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Tanya asisten AI tentang ${profile.name}...`}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8CE] text-xs sm:text-sm text-[#5A5A40] placeholder-[#8B8B6B] bg-[#FDFBF7]/30 focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] font-sans transition"
            />
            <button
              type="submit"
              id="btn-send-ai-chat"
              disabled={!inputValue.trim() || loading}
              className="p-3 bg-[#BC6C25] hover:bg-[#a6561b] text-white rounded-xl transition disabled:opacity-40 disabled:hover:bg-[#BC6C25] shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
