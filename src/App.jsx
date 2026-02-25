import { useState, useRef, useEffect } from 'react';
import { Send, Menu, Plus, Sprout, User, Info, Paperclip, Settings, Search, PanelLeftClose, PanelLeft } from 'lucide-react';
import './App.css';

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true); // NEW: Loading state
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Ram Ram, Kisan bhai! I am KisanGPT. Ask me anything about crop seasons, fertilizers, or farm management.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const messagesEndRef = useRef(null);

  // NEW: Initial Loading Screen Timer (2.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input;
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://kisangptv2.onrender.com/api/v1/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, language: 'en' })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: data.answer,
        sources: data.sources 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Error: Could not connect to the KisanGPT server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: The Loading Screen UI ---
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

  // Notice the added "fade-in" class to app-container below!
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
          <button className="nav-btn new-chat-btn" onClick={() => setMessages([{ role: 'bot', text: 'Ram Ram! How can I help you today?' }])}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
          
          <button className="nav-btn">
            <Search size={18} />
            <span>Search History</span>
          </button>
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

        <div className="chat-area">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              <div className="message-content-wrapper">
                <div className="avatar">
                  {msg.role === 'bot' ? <Sprout size={20} color="#fff" /> : <User size={20} color="#fff" />}
                </div>
                <div className="message-text-block">
                  <div className="message-text" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="sources-container">
                      <div className="sources-title"><Info size={14}/> Sources utilized:</div>
                      <ul>
                        {msg.sources.map((src, i) => (
                          <li key={i}>{src.source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
            <button type="button" className="action-btn upload-btn" title="Upload File (Coming Soon)">
              <Paperclip size={20} />
            </button>
            
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message KisanGPT..." 
              disabled={isLoading}
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