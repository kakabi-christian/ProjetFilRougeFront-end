import React, { useState, useEffect, useRef } from 'react';
import AiService from '../services/AiService';

export default function ChatComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider pour votre concours ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const colorGreen = '#25963F';
  const colorBlue = '#1E90FF';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // --- MISE À JOUR : RÉCUPÉRATION DE L'ID UTILISATEUR ---
    // On récupère les infos stockées lors du loginUser ou register
    const storedUser = localStorage.getItem('user'); 
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const userId = userData?.id || localStorage.getItem('userId'); // Fallback sur userId direct
    // -----------------------------------------------------

    const userMsg = { role: 'user', content: message };
    setChatHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      // On passe le message ET le userId au service
      const data = await AiService.sendMessage(message, userId);
      const aiMsg = { role: 'assistant', content: data.reply };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { 
        role: 'assistant', 
        content: "Désolé, je rencontre une difficulté technique. Veuillez réessayer." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
      {isOpen && (
        <div className="card shadow-lg border-0 mb-3" style={{ width: '320px', height: '450px', borderRadius: '15px' }}>
          <div className="card-header d-flex justify-content-between align-items-center text-white" 
               style={{ backgroundColor: colorBlue, borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
            <h6 className="mb-0">Assistant Concours</h6>
            <button type="button" className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
          </div>

          <div className="card-body overflow-auto bg-light" ref={scrollRef} style={{ height: '300px' }}>
            {chatHistory.map((msg, index) => (
              <div key={index} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className="p-2 rounded-3 shadow-sm" 
                     style={{ 
                        maxWidth: '85%', 
                        backgroundColor: msg.role === 'user' ? colorGreen : '#ffffff',
                        color: msg.role === 'user' ? '#ffffff' : '#333',
                        fontSize: '0.9rem'
                     }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-muted small italic">
                <span className="spinner-grow spinner-grow-sm me-1" role="status"></span>
                Analyse de votre dossier...
              </div>
            )}
          </div>

          <div className="card-footer bg-white border-0">
            <form onSubmit={handleSendMessage} className="input-group">
              <input
                type="text"
                className="form-control form-control-sm border-0 bg-light"
                placeholder="Posez votre question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ borderRadius: '20px 0 0 20px' }}
              />
              <button className="btn text-white" type="submit" disabled={isLoading}
                      style={{ backgroundColor: colorBlue, borderRadius: '0 20px 20px 0' }}>
                ➤
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn shadow-lg rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '60px', height: '60px', backgroundColor: colorGreen, color: 'white', fontSize: '24px', border: 'none' }}
        >
          {isOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
}