// custom-edu-app/frontend/src/App.jsx
import { useState } from 'react';
import './App.css';
import en from './locales/en.json';
import es from './locales/es.json';

const translations = { en, es };

export default function App() {
  const [navLang, setNavLang] = useState('en');
  const [contentLang, setContentLang] = useState('English');
  const [view, setView] = useState('dashboard');
  const [lesson, setLesson] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const t = translations[navLang];

  const handleStudyRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('http://localhost:8000/generate-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: e.target.topic.value,
        focus: e.target.focus.value,
        contentLanguage: contentLang,
        speed: e.target.speed.value,
        depth: e.target.depth.value
      })
    });
    const data = await res.json();
    setLesson(data.lesson);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatLog([...chatLog, { sender: 'user', text: userMsg }]);
    setChatInput('');

    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, chatLanguage: contentLang })
    });
    const data = await res.json();
    setChatLog(prev => [...prev, { sender: 'ai', text: data.response }]);
  };

  if (view === 'dashboard') {
    return (
      <div className="login-box">
        <h2>{t.studentLogin}</h2>
        <input type="text" placeholder="Credentials" />
        <button onClick={() => setView('home')}>{t.enterApp}</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="lang-selectors">
          <label>Nav:</label>
          <select value={navLang} onChange={(e) => setNavLang(e.target.value)}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
          <label>Content:</label>
          <select value={contentLang} onChange={(e) => setContentLang(e.target.value)}>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
        <button onClick={() => setView('home')}>🏠 {t.home}</button>
        <button onClick={() => setView('search')}>🔍 {t.search}</button>
        <button onClick={() => setView('chat')}>✨ {t.aiAssistant}</button>
      </nav>
      
      <main className="content-area">
        {view === 'home' && (
          <form className="customizer" onSubmit={handleStudyRequest}>
            <input name="topic" placeholder={t.topic} required />
            <input name="focus" placeholder={t.focus} required />
            <select name="speed">
              <option value="quick summary">Quick Summary</option>
              <option value="normal pace">Normal Pace</option>
              <option value="step-by-step slow">Step-by-Step Slow</option>
            </select>
            <select name="depth">
              <option value="beginner">Beginner (No past knowledge)</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button type="submit">{t.generate}</button>
          </form>
        )}

        {view === 'chat' && (
          <div className="gemini-chat">
            <div className="chat-log">
              {chatLog.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender}`}>{msg.text}</div>
              ))}
            </div>
            <div className="chat-input-row">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t.chatPlaceholder} />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}

        {loading ? <p>Loading...</p> : <div className="lesson-output">{lesson}</div>}
      </main>
    </div>
  );
}