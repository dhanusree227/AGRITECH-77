import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, Send, Volume2, Sparkles, Upload, X, Loader2, Bot, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp: string;
}

export const VoiceAssistantModal: React.FC = () => {
  const { isVoiceAssistantOpen, setIsVoiceAssistantOpen, currentUser, language } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.fullName}! I am your AgriTech AI Agricultural Intelligence Advisor. Ask me anything about crop diseases, weather risks, mandi price strategies, fertilizer dosage, or voice search!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setSpeechSupported(true);
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;

      // Map language
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        kn: 'kn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
      };
      rec.lang = langMap[language] || 'en-IN';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isVoiceAssistantOpen) return null;

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser version. You can type your query in any language!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown hashes and asterisks for smooth audio speech
      const cleanText = text.replace(/[#*`_-]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      image: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    const imagePayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const resp = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          role: currentUser.role,
          district: currentUser.district,
          state: currentUser.state,
          language: language === 'kn' ? 'Kannada' : language === 'hi' ? 'Hindi' : 'English',
          imageBase64: imagePayload,
        }),
      });

      if (!resp.ok) throw new Error('Advisor API call returned non-200');
      const data = await resp.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Guidance received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach advisory engine at this moment. Please check network connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Check tomato and onion mandi prices near Mandya',
    'What are the symptoms and cure for leaf blight in tomatoes?',
    'Recommend best sowing dates and fertilizer dose for Basmati Paddy',
    'How do I calculate break-even price for 5 acres of wheat?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#123D2A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-[#C6FF4A]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                AgriTech AI Advisor <span className="text-[10px] uppercase font-semibold bg-[#10B981] text-white px-2 py-0.5 rounded-full">Gemini 2.5 Flash</span>
              </h3>
              <p className="text-xs text-emerald-200">Multilingual Voice & Vision Agricultural Expert</p>
            </div>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsVoiceAssistantOpen(false);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F7F9F4]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#123D2A] text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                }`}
              >
                {m.image && (
                  <img
                    src={m.image}
                    alt="Uploaded crop sample"
                    className="w-48 h-36 object-cover rounded-lg mb-2 border border-slate-200"
                  />
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>
                <div className="mt-2 pt-1 border-t border-slate-100/20 flex items-center justify-between text-[11px] opacity-75">
                  <span>{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="hover:text-[#10B981] flex items-center gap-1 transition-colors ml-2"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs p-3 bg-white rounded-xl border border-slate-200 max-w-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
              Analyzing with agricultural model & mandi indices...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto text-xs no-scrollbar">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-slate-600 font-medium transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Uploaded Image Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" /> Crop photo attached for disease diagnosis
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <label
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              title="Upload crop leaf photo for AI diagnosis"
            >
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-bounce shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening... Speak now' : 'Ask about crops, diseases, mandi prices, weather...'}
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#10B981] focus:bg-white text-slate-900"
            />

            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="p-2.5 bg-[#123D2A] text-white rounded-xl hover:bg-[#1a553b] disabled:opacity-50 transition-colors shadow-xs"
              title="Send query"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          {isListening && (
            <p className="text-[11px] text-red-600 mt-1.5 text-center font-medium animate-pulse">
              Microphone active. Speak in English, Kannada, Hindi, Tamil, Telugu, etc.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
