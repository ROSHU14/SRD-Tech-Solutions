import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

export default function Chat() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [allTickets, setAllTickets] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user's tickets on load
  useEffect(() => {
    fetchUserTickets();
    // Welcome message
    setMessages([{
      id: Date.now(),
      sender: 'bot',
      text: "**SRD Support Assistant**\n\nGood day! I'm your dedicated support assistant. I can help you with:\n\n• **Ticket Status** - Simply type your ticket ID (e.g., `7b0c9e43` or `SRD-2024-001`)\n• **Ticket Management** - Create, track, and manage tickets\n• **Platform Support** - Help with features and usage\n• **Quick Actions** - Check all tickets, support hours, and more\n\n**How can I assist you today?**",
      time: new Date().toLocaleTimeString()
    }]);
  }, []);

  const fetchUserTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets/my-tickets');
      setAllTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets');
    }
  };

  // Extract ticket ID from ANY message format
  const extractTicketId = (message) => {
    const msg = message.toLowerCase();

    const uuidMatch = message.match(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i);
    if (uuidMatch) return uuidMatch[0];

    const shortIdMatch = message.match(/\b([a-f0-9]{8})\b/i);
    if (shortIdMatch) return shortIdMatch[0];

    const srdMatch = message.match(/SRD[-\s]?(\d{4}[-\s]?\d{3,5})/i);
    if (srdMatch) return srdMatch[0];

    const genericMatch = message.match(/\b([A-Z0-9]{6,12})\b/i);
    if (genericMatch && !genericMatch[0].match(/^(ticket|status|help|create|support|how|what|when|where|why)$/i)) {
      return genericMatch[0];
    }

    return null;
  };

  // Find ticket by any ID format
  const findTicket = (ticketId) => {
    return allTickets.find(t =>
      t.id === ticketId ||
      t.id?.startsWith(ticketId) ||
      t.ticketNumber === ticketId ||
      (t.ticketNumber && t.ticketNumber.includes(ticketId))
    );
  };

  const getBotResponse = async (message) => {
    const msg = message.toLowerCase().trim();

    // Check for ticket ID
    const ticketId = extractTicketId(message);
    if (ticketId) {
      const ticket = findTicket(ticketId);
      if (ticket) {
        const statusIcon = ticket.status === 'open' ? '🟡' :
                          ticket.status === 'in_progress' ? '🔵' :
                          ticket.status === 'resolved' ? '🟢' : '⚫';

        const priorityIcon = ticket.priority === 'urgent' ? '🔴' :
                            ticket.priority === 'high' ? '🟠' :
                            ticket.priority === 'medium' ? '🔵' : '🟢';

        const daysSince = Math.floor((new Date() - new Date(ticket.createdAt)) / (1000 * 60 * 60 * 24));

        return `**📋 TICKET STATUS REPORT**\n\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
               `**Ticket ID:** \`${ticket.ticketNumber || ticket.id.slice(0,8)}\`\n` +
               `**Title:** ${ticket.title}\n` +
               `**Status:** ${statusIcon} ${ticket.status.toUpperCase()}\n` +
               `**Priority:** ${priorityIcon} ${ticket.priority.toUpperCase()}\n` +
               `**Created:** ${new Date(ticket.createdAt).toLocaleString()}\n` +
               `**Age:** ${daysSince} day(s)\n` +
               `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
               `**Summary:** ${ticket.description.substring(0, 200)}${ticket.description.length > 200 ? '...' : ''}\n\n` +
               `**Next Steps:** ${ticket.status === 'open' ? 'Our team will review your ticket shortly.' :
                                ticket.status === 'in_progress' ? 'Our team is actively working on your issue.' :
                                ticket.status === 'resolved' ? 'Please verify if the solution works for you.' :
                                'This ticket has been closed. Open a new ticket for further assistance.'}\n\n` +
                               `Need more details? I can provide additional information about this ticket.`;
      } else {
        return `**❌ TICKET NOT FOUND**\n\nI couldn't locate a ticket with ID: \`${ticketId}\`\n\n**What would you like to do?**\n• Type \`all tickets\` to see your tickets\n• Type \`create ticket\` to submit a new request\n• Provide another ticket ID`;
      }
    }

    // All tickets command
    if (msg.match(/^(all tickets|my tickets|list tickets|show tickets)$/i)) {
      if (allTickets.length === 0) {
        return `**📋 TICKET OVERVIEW**\n\nYou currently have no tickets in your account.\n\n**Next Steps:**\n• Click "New Ticket" in the sidebar to create your first support request`;
      }

      let response = `**📊 TICKET OVERVIEW**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      response += `**Total Tickets:** ${allTickets.length}\n`;
      response += `**Open:** ${allTickets.filter(t => t.status === 'open').length} | `;
      response += `**In Progress:** ${allTickets.filter(t => t.status === 'in_progress').length} | `;
      response += `**Resolved:** ${allTickets.filter(t => t.status === 'resolved').length}\n`;
      response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n**Recent Tickets:**\n\n`;

      allTickets.slice(0, 5).forEach((t, i) => {
        const statusIcon = t.status === 'open' ? '🟡' : t.status === 'in_progress' ? '🔵' : t.status === 'resolved' ? '🟢' : '⚫';
        response += `${i+1}. **${t.title}**\n`;
        response += `   ${statusIcon} Status: ${t.status.toUpperCase()} | Priority: ${t.priority.toUpperCase()}\n`;
        response += `   📅 Created: ${new Date(t.createdAt).toLocaleDateString()}\n`;
        response += `   🆔 ID: \`${t.ticketNumber || t.id.slice(0,8)}\`\n\n`;
      });

      response += `\nType a ticket ID to see detailed status.`;
      return response;
    }

    // Create ticket help
    if (msg.match(/^(create ticket|new ticket|how to create)$/i)) {
      return `**📝 CREATE A SUPPORT TICKET**\n\n` +
             `**Step-by-Step Guide:**\n\n` +
             `1️⃣ **Navigate** - Click "New Ticket" in the left sidebar\n\n` +
             `2️⃣ **Title** - Provide a clear, descriptive title\n\n` +
             `3️⃣ **Description** - Explain your issue in detail\n\n` +
             `4️⃣ **Priority** - Select appropriate priority:\n` +
             `   • 🔴 Urgent - Critical system down\n` +
             `   • 🟠 High - Major issue\n` +
             `   • 🔵 Medium - Normal priority\n` +
             `   • 🟢 Low - Minor question\n\n` +
             `5️⃣ **Submit** - Click "Create Ticket" to finalize\n\n` +
             `**⏱️ Response Time SLA:**\n` +
             `• Urgent: 1 hour | High: 4 hours | Medium: 24 hours | Low: 48 hours`;
    }

    // Support hours
    if (msg.match(/^(support hours|hours|business hours)$/i)) {
      return `**🕐 SRD SUPPORT HOURS**\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
             `**Live Chat Support**\n• 🤖 AI Assistant: 24/7\n• 👨‍💻 Human Agent: 9 AM - 9 PM EST (Mon-Fri)\n\n` +
             `**Email Support**\n• 📧 support@srdtech.com\n• ⏱️ Response: 2-4 hours\n\n` +
             `**Phone Support**\n• 📞 +1-800-SRD-HELP\n• ⏱️ Hours: 9 AM - 6 PM EST (Mon-Fri)\n\n` +
             `**Emergency Support**\n• 🚨 24/7 for urgent issues\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `Average response time: **2-4 hours** | Customer satisfaction: **98%**`;
    }

    // Help menu
    if (msg.match(/^(help|menu|commands)$/i)) {
      return `**📚 SRD ASSISTANT HELP MENU**\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
             `**🎫 TICKET COMMANDS**\n` +
             `• \`7b0c9e43\` or any ticket ID - Get ticket status\n` +
             `• \`all tickets\` - View all your tickets\n` +
             `• \`create ticket\` - Learn how to create a ticket\n\n` +
             `**ℹ️ INFORMATION COMMANDS**\n` +
             `• \`support hours\` - Business hours and availability\n` +
             `• \`features\` - Platform capabilities\n` +
             `• \`pricing\` - Pricing plans\n\n` +
             `**💬 CONVERSATION**\n` +
             `• \`hello\`, \`hi\` - Greeting\n` +
             `• \`thanks\`, \`thank you\` - Feedback\n` +
             `• \`bye\`, \`goodbye\` - End conversation\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `**Quick Tip:** Simply type any ticket ID to get its status instantly!`;
    }

    // Greetings
    if (msg.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/i)) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      return `**${greeting}! 👋**\n\n` +
             `I'm your SRD Support Assistant. I can help you with:\n\n` +
             `• **Ticket Status** - Type any ticket ID (like \`7b0c9e43\`)\n` +
             `• **All Tickets** - Type \`all tickets\`\n` +
             `• **Quick Help** - Type \`help\` for all commands\n\n` +
             `**How can I assist you today?**`;
    }

    // Thanks
    if (msg.match(/^(thank|thanks|appreciate|good job)$/i)) {
      return `**🙏 You're very welcome!**\n\n` +
             `**What would you like to do next?**\n` +
             `• Check another ticket status\n` +
             `• View all your tickets\n` +
             `• Create a new support ticket\n\n` +
             `Just let me know how I can help! 🌟`;
    }

    // Goodbye
    if (msg.match(/^(bye|goodbye|see you|exit)$/i)) {
      return `**👋 Farewell!**\n\n` +
             `Thank you for using SRD Tech Support.\n\n` +
             `**Remember:**\n` +
             `• I'm available 24/7 whenever you need assistance\n` +
             `• Just type any ticket ID to check its status\n` +
             `• Or type \`help\` to see all available commands\n\n` +
             `Have a wonderful day! 🚀`;
    }

    // Default response
    return `**💡 How Can I Help You?**\n\n` +
           `**Here's what I can assist with:**\n\n` +
           `🔹 **Ticket Status** - Type any ticket ID (e.g., \`7b0c9e43\`)\n` +
           `🔹 **All Tickets** - Type \`all tickets\`\n` +
           `🔹 **Create Ticket** - Type \`create ticket\`\n` +
           `🔹 **Support Hours** - Type \`support hours\`\n` +
           `🔹 **Help Menu** - Type \`help\`\n\n` +
           `**Quick Tip:** Try typing a ticket ID directly to get its status instantly!`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userQuestion = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: userQuestion,
      time: new Date().toLocaleTimeString()
    }]);

    setTimeout(async () => {
      const botResponse = await getBotResponse(userQuestion);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString()
      }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-slate-800 dark:to-slate-900 rounded-t-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h2 className="font-bold text-lg">SRD Support Assistant</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-xs text-indigo-100 dark:text-slate-300">Online • Ready to assist</p>
              <span className="text-xs text-indigo-200 dark:text-slate-400">|</span>
              <p className="text-xs text-indigo-100 dark:text-slate-300">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md border border-gray-200 dark:border-gray-700'
            }`}>
              {msg.sender === 'bot' && (
                <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">SRD Assistant</span>
                  <span className="text-xs text-green-600 dark:text-green-400">● Active</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              <p className={`text-[10px] mt-2 ${
                msg.sender === 'user'
                  ? 'text-indigo-200'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your ticket ID or question... (e.g., 7b0c9e43, all tickets, help)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">💡 Simply type any ticket ID to get its status</p>
        </div>
      </form>
    </div>
  );
}