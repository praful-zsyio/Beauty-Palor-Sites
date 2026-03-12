import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';
import { api } from '../store';
import './Chatbot.css';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { msg: "Hello! I'm your Kiran Beauty assistant. 🌸 How can I help you today?", type: 'bot' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message.trim();
        setMessage('');
        setChat(prev => [...prev, { msg: userMsg, type: 'user' }]);
        setIsLoading(true);

        try {
            const res = await api.post('/chat', { message: userMsg });
            setChat(prev => [...prev, { msg: res.data.data.reply, type: 'bot' }]);
        } catch (error) {
            setChat(prev => [...prev, { msg: "Sorry, I'm having trouble connecting right now. 🌸", type: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="chatbot-trigger"
                        onClick={() => setIsOpen(true)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiMessageSquare size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbot-window"
                        initial={{ y: 100, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="chatbot-header">
                            <div className="chatbot-title">
                                <div className="bot-status"></div>
                                <span>Salon Assistant</span>
                            </div>
                            <div className="chatbot-actions">
                                <button onClick={() => setIsOpen(false)}><FiX size={18} /></button>
                            </div>
                        </div>

                        <div className="chatbot-messages" ref={scrollRef}>
                            {chat.map((item, index) => (
                                <div key={index} className={`chat-bubble-wrapper ${item.type}`}>
                                    <div className={`chat-bubble ${item.type}`}>
                                        {item.msg}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="chat-bubble-wrapper bot">
                                    <div className="chat-bubble bot typing">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form className="chatbot-input-area" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!message.trim() || isLoading}>
                                <FiSend size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
