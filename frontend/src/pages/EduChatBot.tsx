import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Mic, MicOff } from "lucide-react";
// import Button from "../components/ui/Button"; // <-- Adjust this import path as needed

// AWS SDK v3 for Lex V2
import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
} from "@aws-sdk/client-lex-runtime-v2";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

// AWS Lex Config
const REGION = "us-east-1";
const BOT_ID = "WDNMJVY8CX";
const BOT_ALIAS_ID = "SGLA5QQFPX";
const LOCALE_ID = "en_US";
const IDENTITY_POOL_ID = "us-east-1:f8438e92-3111-4f84-a9f9-6b2be72732ec";

// Initialize Lex Client
const lexClient = new LexRuntimeV2Client({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: REGION },
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

const EduChatBot = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hi! I'm Edu, your AI learning assistant. Ask me anything about coding, science, or math!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    "Explain recursion in simple terms",
    "How does JavaScript async/await work?",
    "What's the Pythagorean theorem?",
    "Tips for studying effectively?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const params = {
      botId: BOT_ID,
      botAliasId: BOT_ALIAS_ID,
      localeId: LOCALE_ID,
      sessionId: "edu-user-" + Date.now(),
      text,
    };

    try {
      const command = new RecognizeTextCommand(params);
      const response = await lexClient.send(command);
      const botMessageText =
        response.messages?.[0]?.content ||
        "Hmm, I'm not sure I understood that. Can you try rephrasing it?";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: botMessageText,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Lex error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: "Oops! Something went wrong. Please try again.",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleQuickReply = (reply) => handleSendMessage(reply);

  const toggleListening = () => {
    setIsListening((prev) => !prev);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInputValue("Can you explain how photosynthesis works?");
      }, 3000);
    } else {
      if (inputValue === "Can you explain how photosynthesis works?") {
        setInputValue("");
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Edu Assistant</h3>
            <p className="text-xs text-blue-100">Here to help you learn</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isBot ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                message.isBot
                  ? "bg-white text-slate-800 border border-slate-200"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.isBot && (
                  <Bot className="h-4 w-4 mt-0.5 text-sky-600" />
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                {!message.isBot && (
                  <User className="h-4 w-4 mt-0.5 text-white/90" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-sky-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-all shadow-sm"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSendMessage(inputValue)
            }
            placeholder={isListening ? "Listening..." : "Type your question..."}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm disabled:opacity-70"
            disabled={isListening}
          />
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
            aria-label="Toggle mic"
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isListening}
            className="p-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-full disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EduChatBot;
