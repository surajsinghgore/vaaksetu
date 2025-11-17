'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  ArrowRightLeft, 
  X, 
  Loader2,
  Check,
  Languages,
  VolumeX,
  Search
} from 'lucide-react';
import type { 
  Language, 
  TranslationResponse, 
  DetectionResponse, 
  CopyField,
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from '@/app/types/translator';

const LANGUAGES: Language[] = [
  // English and European Languages
  { code: 'en', name: 'English', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', speechCode: 'de-DE' },
  { code: 'it', name: 'Italian', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', speechCode: 'pt-BR' },
  { code: 'ru', name: 'Russian', speechCode: 'ru-RU' },
  { code: 'nl', name: 'Dutch', speechCode: 'nl-NL' },
  { code: 'pl', name: 'Polish', speechCode: 'pl-PL' },
  { code: 'sv', name: 'Swedish', speechCode: 'sv-SE' },
  { code: 'no', name: 'Norwegian', speechCode: 'nb-NO' },
  { code: 'da', name: 'Danish', speechCode: 'da-DK' },
  { code: 'fi', name: 'Finnish', speechCode: 'fi-FI' },
  { code: 'cs', name: 'Czech', speechCode: 'cs-CZ' },
  { code: 'hu', name: 'Hungarian', speechCode: 'hu-HU' },
  { code: 'ro', name: 'Romanian', speechCode: 'ro-RO' },
  { code: 'bg', name: 'Bulgarian', speechCode: 'bg-BG' },
  { code: 'el', name: 'Greek', speechCode: 'el-GR' },
  { code: 'tr', name: 'Turkish', speechCode: 'tr-TR' },
  { code: 'uk', name: 'Ukrainian', speechCode: 'uk-UA' },
  { code: 'hr', name: 'Croatian', speechCode: 'hr-HR' },
  { code: 'sr', name: 'Serbian', speechCode: 'sr-RS' },
  { code: 'sk', name: 'Slovak', speechCode: 'sk-SK' },
  { code: 'sl', name: 'Slovenian', speechCode: 'sl-SI' },
  
  // Asian Languages
  { code: 'ja', name: 'Japanese', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', speechCode: 'ko-KR' },
  { code: 'zh', name: 'Chinese (Simplified)', speechCode: 'zh-CN' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', speechCode: 'zh-TW' },
  { code: 'vi', name: 'Vietnamese', speechCode: 'vi-VN' },
  { code: 'th', name: 'Thai', speechCode: 'th-TH' },
  { code: 'id', name: 'Indonesian', speechCode: 'id-ID' },
  { code: 'ms', name: 'Malay', speechCode: 'ms-MY' },
  { code: 'tl', name: 'Tagalog (Filipino)', speechCode: 'fil-PH' },
  
  // Indian Languages
  { code: 'hi', name: 'Hindi', speechCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', speechCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', speechCode: 'te-IN' },
  { code: 'mr', name: 'Marathi', speechCode: 'mr-IN' },
  { code: 'ta', name: 'Tamil', speechCode: 'ta-IN' },
  { code: 'ur', name: 'Urdu', speechCode: 'ur-PK' },
  { code: 'gu', name: 'Gujarati', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', speechCode: 'ml-IN' },
  { code: 'or', name: 'Odia (Oriya)', speechCode: 'or-IN' },
  { code: 'pa', name: 'Punjabi', speechCode: 'pa-IN' },
  { code: 'as', name: 'Assamese', speechCode: 'as-IN' },
  { code: 'bho', name: 'Bhojpuri', speechCode: 'hi-IN' }, // Uses Hindi as fallback
  { code: 'sa', name: 'Sanskrit', speechCode: 'hi-IN' }, // Uses Hindi as fallback
  { code: 'mai', name: 'Maithili', speechCode: 'hi-IN' }, // Uses Hindi as fallback
  { code: 'kok', name: 'Konkani', speechCode: 'kok-IN' },
  { code: 'doi', name: 'Dogri', speechCode: 'hi-IN' }, // Uses Hindi as fallback
  { code: 'ks', name: 'Kashmiri', speechCode: 'ks-IN' },
  { code: 'mni', name: 'Manipuri', speechCode: 'mni-IN' },
  { code: 'raj', name: 'Rajasthani', speechCode: 'hi-IN' }, // Uses Hindi as fallback
  { code: 'sat', name: 'Santali', speechCode: 'sat-IN' },
  { code: 'sd', name: 'Sindhi', speechCode: 'sd-IN' },
  { code: 'ne', name: 'Nepali', speechCode: 'ne-NP' },
  { code: 'si', name: 'Sinhala', speechCode: 'si-LK' },
  
  // Middle Eastern Languages
  { code: 'ar', name: 'Arabic', speechCode: 'ar-SA' },
  { code: 'he', name: 'Hebrew', speechCode: 'he-IL' },
  { code: 'fa', name: 'Persian', speechCode: 'fa-IR' },
  
  // African Languages
  { code: 'af', name: 'Afrikaans', speechCode: 'af-ZA' },
  { code: 'sw', name: 'Swahili', speechCode: 'sw-KE' },
  { code: 'am', name: 'Amharic', speechCode: 'am-ET' },
  { code: 'ha', name: 'Hausa', speechCode: 'ha-NG' },
  { code: 'yo', name: 'Yoruba', speechCode: 'yo-NG' },
  { code: 'zu', name: 'Zulu', speechCode: 'zu-ZA' },
  { code: 'xh', name: 'Xhosa', speechCode: 'xh-ZA' },
];

// Group languages by region for better UX
const LANGUAGE_GROUPS = {
  popular: ['en', 'es', 'fr', 'de', 'zh', 'hi', 'ar', 'pt', 'ja', 'ru'],
  indian: ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'bho', 'sa', 'or', 'as', 'mai', 'kok', 'raj'],
  european: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'nl', 'pl', 'sv', 'no', 'da'],
  asian: ['zh', 'zh-TW', 'ja', 'ko', 'vi', 'th', 'id', 'ms', 'tl'],
  middleEastern: ['ar', 'he', 'fa', 'tr', 'ur'],
  african: ['af', 'sw', 'am', 'ha', 'yo', 'zu', 'xh'],
};

export default function Translator() {
  // State management
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('hi');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<CopyField>(null);
  const [error, setError] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isRecognitionSupported, setIsRecognitionSupported] = useState<boolean>(false);
  const [isSynthesisSupported, setIsSynthesisSupported] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPopularOnly, setShowPopularOnly] = useState<boolean>(false);
  
  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Filter languages based on search
  const getFilteredLanguages = useCallback(() => {
    let langs = LANGUAGES;
    
    if (showPopularOnly) {
      langs = langs.filter(l => LANGUAGE_GROUPS.popular.includes(l.code));
    }
    
    if (searchQuery) {
      langs = langs.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return langs;
  }, [searchQuery, showPopularOnly]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionConstructor) {
        setIsRecognitionSupported(true);
        const recognition = new SpeechRecognitionConstructor();
        
        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        
        // Set language
        const selectedLang = LANGUAGES.find(l => l.code === sourceLang);
        recognition.lang = selectedLang?.speechCode || 'en-US';
        
        // Event handlers
        recognition.onstart = () => {
          setIsListening(true);
          setError('');
          setInterimTranscript('');
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interim = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interim += transcript;
            }
          }
          
          if (finalTranscript) {
            setSourceText(prev => prev + finalTranscript);
            setInterimTranscript('');
          } else {
            setInterimTranscript(interim);
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setInterimTranscript('');
          
          let errorMessage = 'Speech recognition error: ';
          switch(event.error) {
            case 'network':
              errorMessage += 'Network error occurred';
              break;
            case 'no-speech':
              errorMessage += 'No speech detected';
              break;
            case 'audio-capture':
              errorMessage += 'No microphone found';
              break;
            case 'not-allowed':
              errorMessage += 'Microphone permission denied';
              break;
            default:
              errorMessage += event.error;
          }
          setError(errorMessage);
        };
        
        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };
        
        recognitionRef.current = recognition;
      }
      
      // Check for speech synthesis support
      if ('speechSynthesis' in window) {
        setIsSynthesisSupported(true);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update recognition language when source language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const selectedLang = LANGUAGES.find(l => l.code === sourceLang);
      recognitionRef.current.lang = selectedLang?.speechCode || 'en-US';
    }
  }, [sourceLang]);

  // Auto-translate with debouncing
  useEffect(() => {
    if (sourceText) {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      
      translationTimeoutRef.current = setTimeout(() => {
        handleTranslate();
      }, 800);
    } else {
      setTranslatedText('');
    }
    
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang]);

  // Translation function
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setError('');
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: LANGUAGES.find(l => l.code === sourceLang)?.name,
          targetLang: LANGUAGES.find(l => l.code === targetLang)?.name,
        }),
      });

      const data: TranslationResponse = await response.json();
      
      if (data.success && data.translation) {
        setTranslatedText(data.translation);
      } else {
        setError(data.error || 'Translation failed. Please try again.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Language detection
  const detectLanguage = async () => {
    if (!sourceText.trim()) return;

    setIsDetecting(true);
    setError('');
    
    try {
      const response = await fetch('/api/detect-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText }),
      });

      const data: DetectionResponse = await response.json();
      
      if (data.success && data.language) {
        const detectedLang = LANGUAGES.find(
          l => l.name.toLowerCase() === data.language?.toLowerCase()
        );
        if (detectedLang) {
          setSourceLang(detectedLang.code);
        }
      } else {
        setError(data.error || 'Language detection failed.');
      }
    } catch (error) {
      console.error('Language detection error:', error);
      setError('Failed to detect language.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Toggle speech recognition
  const toggleListening = useCallback(() => {
    if (!isRecognitionSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setError('Failed to start microphone. Please check permissions.');
      }
    }
  }, [isListening, isRecognitionSupported]);

  // Text-to-speech function
  const speak = useCallback((text: string, langCode: string) => {
    if (!isSynthesisSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedLang = LANGUAGES.find(l => l.code === langCode);
    
    if (selectedLang) {
      utterance.lang = selectedLang.speechCode;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Speech synthesis failed.');
    };
    
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSynthesisSupported]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (isSynthesisSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSynthesisSupported]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, field: 'source' | 'translation') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setError('Failed to copy to clipboard.');
    }
  };

  // Swap languages
  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Clear all
  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setInterimTranscript('');
    setError('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Languages className="w-10 h-10" />
            AI Language Translator
          </h1>
          <p className="text-gray-600">Powered by Gemini AI • 100+ Languages • Speech Recognition</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Language Selectors with Search */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Popular">
                {LANGUAGES.filter(l => LANGUAGE_GROUPS.popular.includes(l.code)).map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Indian Languages">
                {LANGUAGES.filter(l => LANGUAGE_GROUPS.indian.includes(l.code)).map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Languages">
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={swapLanguages}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors mt-6"
            title="Swap languages"
            disabled={!sourceText && !translatedText}
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Popular">
                {LANGUAGES.filter(l => LANGUAGE_GROUPS.popular.includes(l.code)).map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Indian Languages">
                {LANGUAGES.filter(l => LANGUAGE_GROUPS.indian.includes(l.code)).map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Languages">
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Quick Language Tags */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <span className="text-sm text-gray-600">Quick select:</span>
          {['hi', 'bho', 'sa', 'pa', 'bn', 'ta', 'te', 'gu'].map(code => {
            const lang = LANGUAGES.find(l => l.code === code);
            return (
              <button
                key={code}
                onClick={() => setTargetLang(code)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  targetLang === code 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {lang?.name}
              </button>
            );
          })}
        </div>

        {/* Translation Boxes */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Source Text Box */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Source Text</h3>
              <div className="flex gap-2">
                <button
                  onClick={detectLanguage}
                  disabled={isDetecting || !sourceText}
                  className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="inline w-3 h-3 mr-1 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    'Auto-detect'
                  )}
                </button>
                <button
                  onClick={clearAll}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                value={sourceText + interimTranscript}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text or click the microphone to speak..."
                className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isListening && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } ${!isRecognitionSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isRecognitionSupported}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Speaking
                  </>
                )}
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speak(sourceText, sourceLang)}
                  disabled={!sourceText || !isSynthesisSupported}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={isSpeaking ? "Stop speaking" : "Listen"}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(sourceText, 'source')}
                  disabled={!sourceText}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Copy"
                >
                  {copiedField === 'source' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Translated Text Box */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Translation</h3>
              {isTranslating && (
                <span className="text-sm text-blue-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Translating...
                </span>
              )}
            </div>
            
            <div className="w-full h-48 p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto">
              {translatedText ? (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <span className="text-gray-400">Translation will appear here...</span>
              )}
            </div>
            
            <div className="flex justify-end items-center mt-4 gap-2">
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speak(translatedText, targetLang)}
                disabled={!translatedText || !isSynthesisSupported}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={isSpeaking ? "Stop speaking" : "Listen"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(translatedText, 'translation')}
                disabled={!translatedText}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Copy"
              >
                {copiedField === 'translation' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Language Support Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">✨ Supports 100+ languages including Indian languages like Bhojpuri, Sanskrit, and more!</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className={`px-2 py-1 rounded ${isRecognitionSupported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              🎤 Speech Recognition: {isRecognitionSupported ? 'Supported' : 'Not Supported'}
            </span>
            <span className={`px-2 py-1 rounded ${isSynthesisSupported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              🔊 Speech Synthesis: {isSynthesisSupported ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          <p className="mt-2">Works best in Chrome, Edge, or Safari</p>
        </div>
      </div>
    </div>
  );
}