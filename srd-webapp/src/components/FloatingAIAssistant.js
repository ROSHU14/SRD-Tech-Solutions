import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingAIAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', text: '👋 Hello! I\'m your **SRD AI Assistant**.\n\nI\'m here to help you with everything about SRD Tech Solutions!\n\n**What I can help with:**\n📝 Creating & managing tickets\n📊 Dashboard & analytics\n📁 Projects & tasks\n📚 Knowledge base articles\n🕐 Support hours\n🚨 Emergency support\n\n**Just ask me anything!** 🚀' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const getBotResponse = (question) => {
    const msg = question.toLowerCase().trim();
    let response = '';
    let action = null;

    // Ticket Help
    if (msg.includes('create ticket') || msg.includes('new ticket') || msg.includes('how to create')) {
      response = `📝 **How to Create a Ticket**\n\n1️⃣ Click "New Ticket" in the sidebar\n2️⃣ Enter a clear title\n3️⃣ Describe your issue in detail\n4️⃣ Select priority (Low/Medium/High/Urgent)\n5️⃣ Choose category\n6️⃣ Attach screenshots or videos (optional)\n7️⃣ Click "Create Ticket"\n\n✅ You'll get email confirmation\n⏱️ Response time: 2-4 hours`;
      action = 'create_ticket';
    }
    else if (msg.includes('ticket status') || msg.includes('check ticket') || msg.includes('where is my ticket')) {
      response = `📋 **Check Ticket Status**\n\n1️⃣ Go to "Tickets" in sidebar\n2️⃣ All your tickets are listed\n3️⃣ Click any ticket to see details\n\n**Status Meanings:**\n🟡 Open - Waiting for response\n🔵 In Progress - Being worked on\n🟢 Resolved - Issue solved\n⚫ Closed - Ticket completed`;
      action = 'view_tickets';
    }
    else if (msg.includes('support hours') || msg.includes('when are you available')) {
      response = `🕐 **SRD Support Hours**\n\n🤖 AI Assistant: 24/7\n👨‍💻 Live Agent: 9 AM - 9 PM EST (Mon-Fri)\n📧 Email: 2-4 hour response\n📞 Phone: 9 AM - 6 PM EST (Mon-Fri)\n🚨 Emergency: 24/7\n\n📧 support@srdtech.com\n📞 +1-800-SRD-HELP`;
    }
    else if (msg.includes('urgent') || msg.includes('emergency')) {
      response = `🚨 **Emergency Support**\n\n📞 Hotline: +1-800-SRD-URGENT (24/7)\n📧 Email: urgent@srdtech.com\n🎫 Create ticket with "URGENT" priority\n\n⏱️ Response: Within 30 minutes`;
    }
    else if (msg.includes('pricing') || msg.includes('price') || msg.includes('cost')) {
      response = `💰 **Pricing Information**\n\nFor detailed pricing, please contact our **Sales Team**:\n\n📧 sales@srdtech.com\n📞 +1-800-SRD-SALES\n\nThey'll provide a custom plan for your needs!`;
    }
    else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      response = `👋 Hello! I'm your SRD AI Assistant.\n\nI can help you with:\n• Creating tickets\n• Checking ticket status\n• Support hours\n• Platform features\n• Emergency support\n\nWhat would you like to know?`;
    }
    else if (msg.includes('thank') || msg.includes('thanks')) {
      response = `🙏 You're welcome! Is there anything else I can help you with?`;
    }
    else if (msg.includes('bye') || msg.includes('goodbye')) {
      response = `👋 Goodbye! Have a great day! 🚀`;
    }
    else if (msg.includes('help')) {
      response = `📚 **Help Menu**\n\n• "Create ticket" - How to create\n• "Ticket status" - Check status\n• "Support hours" - When we're available\n• "Emergency" - Urgent support\n• "Pricing" - Plan info\n• "Hello" - Greeting\n• "Bye" - End chat\n\nWhat would you like help with?`;
    }
    else {
      response = `💡 I can help you with:\n\n• "Create ticket" - How to create\n• "Ticket status" - Check status\n• "Support hours" - When we're available\n• "Emergency" - Urgent support\n• "Pricing" - Plan info\n• "Help" - See all options\n\nWhat would you like to know?`;
    }

    return { response, action };
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
    setMessage('');
    setLoading(true);

    setTimeout(() => {
      const { response, action } = getBotResponse(userMessage);
      setChatHistory(prev => [...prev, { type: 'bot', text: response, action }]);
      setLoading(false);

      if (action === 'create_ticket') {
        setTimeout(() => navigate('/create-ticket'), 1500);
      } else if (action === 'view_tickets') {
        setTimeout(() => navigate('/tickets'), 1500);
      }
    }, 600);
  };

  return (
    <>
      {/* AI Button - TOP LAYER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[99999] w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        style={{ boxShadow: '0 8px 32px rgba(79, 70, 229, 0.5)' }}
      >
        <span className="text-2xl">🤖</span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {/* Chat Window - TOP LAYER */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-24 right-6 z-[99999] w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            maxHeight: '80vh',
            height: '600px'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">🤖</span>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">SRD AI Assistant</h3>
                <p className="text-xs text-indigo-200">Online • 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-indigo-200 transition text-xl p-1 hover:bg-white/20 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900"
            style={{ height: 'calc(100% - 140px)' }}
          >
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || loading}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
              💡 Try: "How to create a ticket?" • "Support hours" • "Help"
            </p>
          </div>
        </div>
      )}
    </>
  );
}