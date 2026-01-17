import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BiSearch, BiUser, BiLoaderAlt, BiArrowBack, 
  BiSend, BiCheckDouble, BiPlusCircle, BiGroup,
  BiDotsVerticalRounded, BiEditAlt, BiTrash, BiPin, BiRedo, BiX, BiUndo
} from 'react-icons/bi';
import ChatService from '../services/ChatService';

export default function MessageContent() {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('chats'); 
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); 
  const [activeMenu, setActiveMenu] = useState(null);
  
  // États pour le transfert multiple
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [selectedForwardTargets, setSelectedForwardTargets] = useState([]); // Array d'IDs

  const scrollRef = useRef(null);
  const currentAdminId = localStorage.getItem('adminId'); 

  const getName = (participant) => {
    const userData = participant?.admin?.user || participant?.user || participant;
    return userData?.nom ? `${userData.nom} ${userData.prenom || ''}` : "Utilisateur";
  };

  const getOtherParticipant = (participants) => {
    if (!participants) return null;
    return participants.find(p => String(p.adminId) !== String(currentAdminId)) || participants[0];
  };

  const loadConversations = useCallback(async () => {
    try {
      const data = await ChatService.getMyConversations();
      setConversations(data);
    } catch (err) {
      console.error("❌ Erreur conversations:", err);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const result = await ChatService.getContacts(1, 50);
      setContacts(result.contacts || []);
    } catch (err) {
      console.error("❌ Erreur contacts:", err);
    }
  }, []);

  useEffect(() => { 
    loadConversations();
    loadContacts(); 
  }, [loadConversations, loadContacts]);

  const handleSelectChat = async (conv) => {
    setSelectedChat(conv);
    setView('chats');
    setLoading(true);
    try {
      const msgs = await ChatService.getConversationMessages(conv.id);
      setMessages(msgs);
      await ChatService.markAsRead(conv.id);
      loadConversations();
    } catch (err) {
      console.error("❌ Erreur messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    try {
      if (editingMessage) {
        const updated = await ChatService.editMessage(editingMessage.id, newMessage);
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
        setEditingMessage(null);
      } else {
        const sentMsg = await ChatService.sendMessage(selectedChat.id, newMessage, replyingTo?.id);
        setMessages(prev => [...prev, sentMsg]);
        setReplyingTo(null);
      }
      setNewMessage('');
      loadConversations();
    } catch (err) {
      console.error("❌ Erreur envoi:", err);
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await ChatService.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  // --- LOGIQUE DE TRANSFERT MULTIPLE ---
  const openForwardModal = (msg) => {
    setMessageToForward(msg);
    setSelectedForwardTargets([]); // Reset la sélection
    setShowForwardModal(true);
    setActiveMenu(null);
  };

  const toggleForwardTarget = (adminId) => {
    setSelectedForwardTargets(prev => 
      prev.includes(adminId) ? prev.filter(id => id !== adminId) : [...prev, adminId]
    );
  };

  const executeBulkForward = async () => {
    if (selectedForwardTargets.length === 0) return;
    try {
      setLoading(true);
      for (const targetAdminId of selectedForwardTargets) {
        const conv = await ChatService.getOrCreateConversation(targetAdminId);
        await ChatService.forwardMessage(messageToForward.id, conv.id);
      }
      setShowForwardModal(false);
      loadConversations();
      // On ne met pas d'alert ici comme demandé
    } catch (err) {
      console.error("Erreur lors du transfert multiple:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (msgId) => {
    setActiveMenu(activeMenu === msgId ? null : msgId);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const menuItemStyle = { cursor: 'pointer', transition: 'background 0.2s' };

  return (
    <div className="container-fluid p-0 shadow-lg rounded-4 overflow-hidden" style={{ height: '96.9vh', backgroundColor: '#f0f4f8' }}>
      
      <style>{`
        .conv-item { transition: all 0.25s ease; border-left: 4px solid transparent; }
        .conv-item:hover { background-color: #f1f3f5 !important; transform: translateX(5px); }
        .conv-item.active { background-color: #e7f1ff !important; border-left: 4px solid #0d6efd !important; }
        .custom-checkbox { width: 20px; height: 20px; cursor: pointer; }
      `}</style>

      {/* --- MODAL DE TRANSFERT MULTIPLE --- */}
      {showForwardModal && (
        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-4 shadow-lg p-0 d-flex flex-column" style={{ width: '450px', maxHeight: '80vh' }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top-4">
              <h6 className="fw-bold mb-0 text-primary">Transférer le message à...</h6>
              <BiX size={28} className="cursor-pointer text-muted" onClick={() => setShowForwardModal(false)} />
            </div>
            
            <div className="p-2 bg-white flex-grow-1 overflow-auto" style={{ maxHeight: '50vh' }}>
              {contacts.map(contact => (
                <label key={contact.adminId} className="d-flex align-items-center justify-content-between p-3 border-bottom hover-bg-light cursor-pointer mb-0 w-100">
                  <div className="d-flex align-items-center">
                    <div className="bg-secondary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}><BiUser size={20} /></div>
                    <span className="fw-bold">{getName(contact)}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="form-check-input custom-checkbox"
                    checked={selectedForwardTargets.includes(contact.adminId)}
                    onChange={() => toggleForwardTarget(contact.adminId)}
                  />
                </label>
              ))}
            </div>

            <div className="p-3 bg-light border-top d-flex gap-2 justify-content-end rounded-bottom-4">
              <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowForwardModal(false)}>Annuler</button>
              <button 
                className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" 
                disabled={selectedForwardTargets.length === 0 || loading}
                onClick={executeBulkForward}
              >
                {loading ? <BiLoaderAlt className="spinner-border spinner-border-sm" /> : <BiRedo size={20} />}
                Envoyer ({selectedForwardTargets.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-0 h-100">
        {/* --- SIDEBAR --- */}
        <div className="col-md-4 border-end bg-white h-100 d-flex flex-column">
          <div className="p-3 bg-primary text-white d-flex justify-content-between align-items-center shadow-sm">
            <h5 className="mb-0 fw-bold">{view === 'chats' ? 'Discussions' : 'Contacts'}</h5>
            <button className="btn btn-light btn-sm rounded-circle shadow-sm" onClick={() => setView(view === 'chats' ? 'contacts' : 'chats')}>
              {view === 'chats' ? <BiPlusCircle size={20} /> : <BiArrowBack size={20} />}
            </button>
          </div>
          
          <div className="flex-grow-1 overflow-auto">
            {view === 'chats' ? (
              conversations.map((conv, idx) => {
                const partner = getOtherParticipant(conv.participants);
                const isSelected = selectedChat?.id === conv.id;
                return (
                  <div key={conv.id} onClick={() => handleSelectChat(conv)} 
                       className={`d-flex align-items-center p-3 border-bottom cursor-pointer conv-item ${isSelected ? 'active' : ''}`}
                       style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                    <div className="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48, minWidth: 48 }}><BiUser size={24} /></div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className={`mb-0 fw-bold ${isSelected ? 'text-primary' : 'text-dark'}`}>{getName(partner)}</h6>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </small>
                      </div>
                      <p className="mb-0 text-muted text-truncate small">{conv.lastMessage?.content || "Démarrer la discussion"}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              contacts.map((contact, idx) => (
                <div key={contact.adminId} onClick={() => ChatService.getOrCreateConversation(contact.adminId).then(handleSelectChat)} 
                     className="d-flex align-items-center p-3 border-bottom conv-item cursor-pointer"
                     style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                   <div className="bg-secondary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, minWidth: 48 }}><BiUser size={24} /></div>
                   <h6 className="mb-0 fw-bold text-dark">{getName(contact)}</h6>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- ZONE MESSAGES --- */}
        <div className="col-md-8 h-100 d-flex flex-column" style={{ backgroundColor: '#e5ddd5' }}>
          {selectedChat ? (
            <>
              <div className="p-3 bg-white border-bottom d-flex align-items-center shadow-sm" style={{ zIndex: 10 }}>
                <div className="bg-primary-subtle rounded-circle p-2 me-3 text-primary shadow-sm"><BiUser size={20} /></div>
                <h6 className="mb-0 fw-bold">{getName(getOtherParticipant(selectedChat.participants))}</h6>
              </div>

              <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3" 
                   style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: '400px' }} 
                   onClick={() => setActiveMenu(null)}>
                
                {loading && messages.length === 0 ? <div className="m-auto"><BiLoaderAlt className="spinner-border text-primary" /></div> : (
                  messages.map((msg, idx) => {
                    const isMe = String(msg.senderId) === String(currentAdminId);
                    return (
                      <div key={msg.id || idx} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className="p-2 px-3 rounded-3 shadow-sm position-relative" style={{ maxWidth: '75%', backgroundColor: isMe ? '#dcf8c6' : '#fff', minWidth: '150px' }}>
                          
                          {msg.replyTo && (
                            <div className="p-2 mb-2 bg-black bg-opacity-10 rounded border-start border-primary border-4" style={{ fontSize: '0.8rem' }}>
                               <div className="fw-bold text-primary small">{getName(msg.replyTo.sender)}</div>
                               <div className="text-muted text-truncate">{msg.replyTo.content}</div>
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-start gap-2">
                             <p className="mb-1 text-dark flex-grow-1" style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                             <BiDotsVerticalRounded className="cursor-pointer text-muted" size={18} onClick={(e) => { e.stopPropagation(); toggleMenu(msg.id); }} />
                          </div>

                          {activeMenu === msg.id && (
                            <div className="bg-white shadow-lg rounded-3 position-absolute" style={{ zIndex: 1000, top: '25px', right: isMe ? '0' : 'auto', left: isMe ? 'auto' : '0', minWidth: '170px', border: '1px solid #eee' }}>
                              <div className="p-2 border-bottom small d-flex align-items-center hover-bg-light" style={menuItemStyle} onClick={() => { setReplyingTo(msg); setActiveMenu(null); }}>
                                <BiUndo className="me-2 text-info" size={18} /> Répondre
                              </div>
                              {isMe && (
                                <>
                                  <div className="p-2 border-bottom small d-flex align-items-center hover-bg-light" style={menuItemStyle} onClick={() => { setEditingMessage(msg); setNewMessage(msg.content); setActiveMenu(null); }}>
                                    <BiEditAlt className="me-2 text-primary" /> Modifier
                                  </div>
                                  <div className="p-2 border-bottom small d-flex align-items-center text-danger hover-bg-light" style={menuItemStyle} onClick={() => handleDelete(msg.id)}>
                                    <BiTrash className="me-2" /> Supprimer
                                  </div>
                                </>
                              )}
                              <div className="p-2 border-bottom small d-flex align-items-center hover-bg-light" style={menuItemStyle} onClick={() => openForwardModal(msg)}>
                                <BiRedo className="me-2 text-success" size={20} /> Transférer
                              </div>
                            </div>
                          )}

                          <div className="text-end d-flex align-items-center justify-content-end mt-1" style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                            {msg.isEdited && <span className="me-1 fst-italic">modifié</span>}
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            {isMe && <BiCheckDouble className="ms-1 text-primary" size={16} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>

              {/* --- FOOTER AVEC RÉPONSE / EDITION --- */}
              <div className="p-3 bg-light border-top shadow-sm">
                {replyingTo && (
                  <div className="d-flex align-items-center justify-content-between p-2 bg-white border-start border-info border-4 rounded mb-2 shadow-sm">
                    <div className="overflow-hidden">
                      <small className="text-info fw-bold">Répondre à {getName(replyingTo.sender)}</small>
                      <p className="mb-0 text-muted text-truncate small">{replyingTo.content}</p>
                    </div>
                    <BiX className="cursor-pointer text-muted" size={20} onClick={() => setReplyingTo(null)} />
                  </div>
                )}

                <form onSubmit={handleSend} className="d-flex align-items-center gap-2">
                  {editingMessage && (
                    <div className="badge bg-warning text-dark d-flex align-items-center p-2 rounded-pill">
                      Modif <BiX className="ms-1 cursor-pointer" size={18} onClick={() => { setEditingMessage(null); setNewMessage(''); }} />
                    </div>
                  )}
                  <input 
                    type="text" 
                    className={`form-control rounded-pill border-0 shadow-sm px-4 ${editingMessage ? 'bg-warning-subtle' : ''}`} 
                    placeholder={replyingTo ? "Tapez votre réponse..." : "Tapez votre message..."} 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                  />
                  <button type="submit" className="btn btn-primary rounded-circle shadow p-0 d-flex align-items-center justify-content-center" style={{ width: 45, height: 45, minWidth: 45 }}>
                    <BiSend size={22} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="m-auto text-center p-5">
              <BiGroup size={100} className="text-primary opacity-25 mb-4" />
              <h3 className="fw-bold text-dark">Messenger Administratif</h3>
              <p className="text-muted">Sélectionnez une discussion pour commencer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}