import { useState, useRef, useEffect } from 'react';
import { 
  Send, Plus, Sprout, User, Paperclip, Settings, Search, 
  PanelLeftClose, PanelLeft, Trash2, MessageSquare, 
  Wrench, FileText, Upload, FlaskConical, Bug 
} from 'lucide-react';
import './App.css';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const defaultGreeting = { 
  role: 'bot', 
  text: 'Ram Ram, Kisan bhai! I am KisanGPT. Ask me anything about crop seasons, fertilizers, or farm management.' 
};

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true); 
  
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('kisangpt_sessions');
    if (savedSessions) {
      return JSON.parse(savedSessions);
    }
    return [{ id: generateId(), title: 'New Chat', messages: [defaultGreeting] }];
  });

  const [currentSessionId, setCurrentSessionId] = useState(sessions[0]?.id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  
  // New States for the Popup Menus
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  
  const messagesEndRef = useRef(null);

  const activeSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('kisangpt_sessions', JSON.stringify(sessions));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, messages]);

  // Close menus if user clicks anywhere in the chat area
  const handleChatAreaClick = () => {
    setShowUploadMenu(false);
    setShowToolsMenu(false);
  };

  const updateActiveSessionMessages = (newMessages) => {
    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === currentSessionId) {
        let newTitle = session.title;
        if (newTitle === 'New Chat') {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.text.slice(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
          }
        }
        return { ...session, messages: newMessages, title: newTitle };
      }
      return session;
    }));
  };

  const createNewChat = () => {
    const newSession = { id: generateId(), title: 'New Chat', messages: [defaultGreeting] };
    setSessions([newSession, ...sessions]); 
    setCurrentSessionId(newSession.id);
    if(window.innerWidth < 768) setIsSidebarOpen(false); 
  };

  const deleteChat = (e, idToDelete) => {
    e.stopPropagation(); 
    const updatedSessions = sessions.filter(s => s.id !== idToDelete);
    
    if (updatedSessions.length === 0) {
      const freshSession = { id: generateId(), title: 'New Chat', messages: [defaultGreeting] };
      setSessions([freshSession]);
      setCurrentSessionId(freshSession.id);
    } else {
      setSessions(updatedSessions);
      if (currentSessionId === idToDelete) {
        setCurrentSessionId(updatedSessions[0].id); 
      }
    }
  };

  // Helper to auto-fill the input when a tool is selected
  const handleToolSelect = (promptPrefix) => {
    setInput(promptPrefix + input);
    setShowToolsMenu(false);
    document.getElementById('chat-input').focus();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input;
    const updatedMessages = [...messages, { role: 'user', text: userQuery }];
    updateActiveSessionMessages(updatedMessages);
    setInput('');
    setShowUploadMenu(false);
    setShowToolsMenu(false);
    setIsLoading(true);

    try {
      const response = await fetch('https://kisangptv2.onrender.com/api/v1/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, language: 'en' })
      });

      const data = await response.json();
      updateActiveSessionMessages([...updatedMessages, { role: 'bot', text: data.answer }]);
    } catch (error) {
      updateActiveSessionMessages([...updatedMessages, { role: 'bot', text: '⚠️ Error: Could not connect to the KisanGPT server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAppLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo-container">
          <Sprout size={64} color="#2E7D32" className="pulse-animation" />
        </div>
        <h1 className="loading-title">KisanGPT</h1>
        <p className="loading-subtitle">Cultivating Knowledge...</p>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container fade-in">
      {/* --- Sidebar --- */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="icon-btn toggle-sidebar" onClick={() => setIsSidebarOpen(false)} title="Close Sidebar">
            <PanelLeftClose size={24} color="#4a5d4e" />
          </button>
        </div>
        
        <div className="sidebar-nav">
          <button className="nav-btn new-chat-btn" onClick={createNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
          
          <div className="history-section">
            <p className="history-title">Recent Chats</p>
            <div className="history-list">
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  className={`history-item ${session.id === currentSessionId ? 'active' : ''}`}
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <MessageSquare size={16} className="history-icon" />
                  <span className="history-text">{session.title}</span>
                  <button className="delete-chat-btn" onClick={(e) => deleteChat(e, session.id)} title="Delete Chat">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="nav-btn">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="brand">
            <Sprout size={24} color="#2E7D32" />
            <span>KisanGPT Enterprise</span>
          </div>
        </div>
      </aside>

      {/* --- Main Chat Area --- */}
      <main className="main-content">
        <header className="top-header">
          {!isSidebarOpen && (
            <button className="icon-btn open-sidebar-btn" onClick={() => setIsSidebarOpen(true)} title="Open Sidebar">
              <PanelLeft size={24} color="#4a5d4e" />
            </button>
          )}
          <h2 className={isSidebarOpen ? "hide-on-desktop" : ""}>KisanGPT</h2>
          <div className="placeholder-spacer"></div>
        </header>

        <div className="chat-area" onClick={handleChatAreaClick}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              <div className="message-content-wrapper">
                <div className="avatar">
                  {msg.role === 'bot' ? <Sprout size={20} color="#fff" /> : <User size={20} color="#fff" />}
                </div>
                <div className="message-text-block">
                  <div className="message-text" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-row bot">
              <div className="message-content-wrapper">
                <div className="avatar"><Sprout size={20} color="#fff" /></div>
                <div className="message-text-block loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="scroll-anchor" />
        </div>

        {/* Floating Input Area */}
        <div className="input-container">
          <form onSubmit={sendMessage} className="input-box">
            
            {/* Upload Menu Wrapper */}
            <div className="input-action-wrapper">
              <button 
                type="button" 
                className="action-btn upload-btn" 
                onClick={() => { setShowUploadMenu(!showUploadMenu); setShowToolsMenu(false); }}
                title="Upload"
              >
                <Paperclip size={20} />
              </button>
              
              {showUploadMenu && (
                <div className="popup-menu">
                  <button type="button" className="popup-item" onClick={() => { alert("Soil Report Upload coming soon!"); setShowUploadMenu(false); }}>
                    <FileText size={16} />
                    <span>Upload Soil Report</span>
                  </button>
                  <button type="button" className="popup-item" onClick={() => { alert("File Upload coming soon!"); setShowUploadMenu(false); }}>
                    <Upload size={16} />
                    <span>Upload a File</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tools Menu Wrapper */}
            <div className="input-action-wrapper">
              <button 
                type="button" 
                className="action-btn tool-btn" 
                onClick={() => { setShowToolsMenu(!showToolsMenu); setShowUploadMenu(false); }}
                title="Tools"
              >
                <Wrench size={20} />
              </button>

              {showToolsMenu && (
                <div className="popup-menu">
                  <button type="button" className="popup-item" onClick={() => handleToolSelect("[Fertilizer Recommendation] ")}>
                    <FlaskConical size={16} />
                    <span>Fertilizer Recommendation</span>
                  </button>
                  <button type="button" className="popup-item" onClick={() => handleToolSelect("[Disease Detection] ")}>
                    <Bug size={16} />
                    <span>Disease Detection</span>
                  </button>
                  <button type="button" className="popup-item" onClick={() => handleToolSelect("[Deep Research] ")}>
                    <Search size={16} />
                    <span>Deep Research</span>
                  </button>
                </div>
              )}
            </div>
            
            <input 
              id="chat-input"
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message KisanGPT..." 
              disabled={isLoading}
              autoComplete="off"
            />
            
            <button type="submit" disabled={isLoading || !input.trim()} className={`action-btn send-btn ${input.trim() ? 'active' : ''}`}>
              <Send size={18} />
            </button>
          </form>
          <p className="disclaimer">KisanGPT can make mistakes. Verify important agricultural data.</p>
        </div>
      </main>
      
      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
}

export default App;