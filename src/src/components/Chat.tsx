import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Sparkles } from 'lucide-react';
import Groq from 'groq-sdk';
import ApiKeyModal from './ApiKeyModal';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to the Auto Agent interface! How can I help you explore the digital universe today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const appDirPath = await appDataDir();
        const envContent = await readTextFile(`${appDirPath}.env`);
        const match = envContent.match(/VITE_GROQ_API_KEY=(.*)/);
        if (match?.[1]) {
          setApiKey(match[1]);
        } else {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Failed to read .env file:', error);
        setShowModal(true);
      }
    };
    loadApiKey();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !apiKey) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
    setInputValue('');

    try {
      const groq = new Groq({ apiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: inputValue
          }
        ],
        model: 'llama3-8b-8192',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null
      });

      let aiResponseText = '';
      for await (const chunk of chatCompletion) {
        aiResponseText += chunk.choices[0]?.delta?.content || '';
      }

      const aiResponse: Message = {
        id: messages.length + 2,
        text: aiResponseText || 'No response received from Groq.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Groq API error:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Error communicating with Groq. Please check your API key or try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {showModal && <ApiKeyModal onSave={handleApiKeySave} />}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 opacity-40">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Auto Agent
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 ml-3" />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience the future of conversation in our space-themed interface
          </p>
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gray-800/50 border-b border-gray-700 p-4">
              <div className="flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-400 mr-3" />
                <span className="text-white font-semibold">Auto Agent</span>
                <div className="ml-auto flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  <span className="text-sm text-gray-400">Online</span>
                </div>
              </div>
            </div>
            <div className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-4'
                        : 'bg-gray-800/70 backdrop-blur-sm border border-gray-700 text-white mr-4'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message to the cosmos..."
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-200"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || !apiKey}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to send • Shift + Enter for new line
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Powered by cosmic intelligence • Built with ❤️ for the stars
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;