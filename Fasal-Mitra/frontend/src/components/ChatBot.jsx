import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import '../styles/ChatBot.css';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [utteranceQueue, setUtteranceQueue] = useState([]); // Queue for utterances
  const messagesEndRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const API_URL = import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  if (recognition) {
    recognition.lang = language;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setUserInput(speechResult);
      appendMessage(speechResult, 'user');
      fetchAIResponse(speechResult);
    };

    recognition.onerror = (error) => {
      console.error('Speech recognition error:', error);
      appendMessage('Voice recognition error occurred.', 'ai');
    };

    recognition.onend = () => setIsListening(false);
  }

  const formatResponse = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold** formatting
      .replace(/\*(.*?)\*/g, '$1')      // Remove *italic* formatting
      .replace(/\\\*/g, '*');           // Handle escaped asterisks
  };

  const appendMessage = (content, sender) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedContent = formatResponse(content);
    setMessages((prevMessages) => [...prevMessages, { content: formattedContent, sender, timestamp }]);
  };

  const fetchAIResponse = async (userMessage) => {
    if (!API_KEY) {
      appendMessage('Error: API configuration is missing. Please contact support.', 'ai');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant for farmer. Respond in plain text without using bold or italic formatting.',
            },
            { role: 'user', content: userMessage },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || "I couldn't process your question. Could you try rephrasing it?";
      appendMessage(aiMessage, 'ai');
    } catch (error) {
      console.error('Error fetching AI response:', error);
      appendMessage(`Error: ${error.message}. Please try again later.`, 'ai');
    }
  };

  const handleSend = () => {
    if (userInput.trim()) {
      appendMessage(userInput, 'user');
      fetchAIResponse(userInput);
      setUserInput('');
    } else {
      appendMessage('Please type a message before sending.', 'ai');
    }
  };

  const startVoiceRecognition = () => {
    if (!recognition) {
      appendMessage('Voice recognition is not supported in this browser.', 'ai');
      return;
    }
    recognition.start();
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    if (recognition) recognition.lang = e.target.value;
  };

  const handlePlayAudio = (text) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis is not supported in this browser.');
      appendMessage('Speech synthesis is not supported in this browser.', 'ai');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Split text into sentences
    const sentences = text.split(/(?<=।)/g); // Split at Hindi full stops
    const voices = window.speechSynthesis.getVoices();

    // Create utterances with proper language
    const utterances = sentences.map(sentence => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.lang = language;

      // Find appropriate voice
      const voice = voices.find(v => v.lang === language) || voices[0];
      utterance.voice = voice;

      return utterance;
    });

    // Queue utterances
    setUtteranceQueue(utterances);
  };

  const handlePauseAudio = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  };

  const handleResumeAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  };

  // Handle utterance queue
  useEffect(() => {
    const playNext = () => {
      if (utteranceQueue.length > 0) {
        const next = utteranceQueue[0];
        window.speechSynthesis.speak(next);
        setUtteranceQueue(prev => prev.slice(1));
      }
    };

    window.speechSynthesis.onend = playNext;
    playNext();

    return () => {
      window.speechSynthesis.onend = null;
    };
  }, [utteranceQueue]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      // Forces voice list refresh
      window.speechSynthesis.getVoices();
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a check for the API key
  useEffect(() => {
    if (!API_KEY) {
      console.error('GROQ API key is missing. Please check your .env file.');
      appendMessage('Error: API configuration is missing. Please contact support.', 'ai');
    }
  }, []);

  useEffect(() => {
    console.log('Environment variables:', {
      API_URL: import.meta.env.VITE_GROQ_API_URL,
      API_KEY: import.meta.env.VITE_GROQ_API_KEY ? 'Present' : 'Missing'
    });
  }, []);

  return (
    <div>
      <div className="chatbot-main">
      <div className="chatbot">
        <h2>ChatBot</h2>
        <p>Interact with our AI-driven chatbot to answer your agriculture-related queries.</p>
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                <div className="sender-label">{msg.sender === 'user' ? 'You' : 'AI'}</div>
                <div>{msg.content}</div>
                <div className="timestamp">{msg.timestamp}</div>
                {msg.sender === 'ai' && (
                  <div className="audio-controls">
                    <button onClick={() => handlePlayAudio(msg.content)}>Play</button>
                    <button onClick={handlePauseAudio}>Pause</button>
                    <button onClick={handleResumeAudio}>Resume</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-area">
            <div className="controls">
              <select value={language} onChange={handleLanguageChange}>
                <option value="en-US">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="gu-IN">Gujarati</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Ask a question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button onClick={handleSend}>Send</button>
            <div className="mike">
              <button onClick={startVoiceRecognition} className={`voice-button-mike ${isListening ? 'listening' : ''}`}>
                {isListening ? 'Listening...' : '🎤'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ChatBot;