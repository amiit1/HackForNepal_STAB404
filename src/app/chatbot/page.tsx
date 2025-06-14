
'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppShell from '@/components/layout/AppShell';
import type { ChatMessage, ChatbotResponse } from '@/lib/types';
import { aiChatbotSupport } from '@/ai/flows/ai-chatbot-support';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Send, User, Bot, HelpCircle, Volume2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useTranslations();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'auto' });
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    // Cleanup speech synthesis on component unmount
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (text: string, lang: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      let speechLang = lang;
      if (lang === 'en') speechLang = 'en-US';
      if (lang === 'ne') speechLang = 'ne-NP';
      utterance.lang = speechLang;
      
      // Attempt to find a voice that matches the language
      // This is best-effort as voice availability varies
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.lang === speechLang) || voices.find(voice => voice.lang.startsWith(lang));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: t('chatbot.ttsNotSupportedTitle'),
        description: t('chatbot.ttsNotSupportedBody'),
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: input,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result: ChatbotResponse = await aiChatbotSupport({ query: currentInput, language: currentLanguage });
      const botMessageText = `${result.advice}${result.suggestedVetContact ? `\n\n${t('chatbot.suggestedVet')}: ${result.suggestedVetContact}` : ''}`;
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: botMessageText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      toast({ title: t('chatbot.errorTitle'), description: t('chatbot.errorDescription'), variant: 'destructive' });
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: t('chatbot.errorMessage'),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <Card className="flex flex-col h-[calc(100vh-10rem)] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
             <HelpCircle className="w-8 h-8 mr-2" /> च्याट मद्दत (AI Chatbot)
          </CardTitle>
          <CardDescription>गाईको स्वास्थ्य वा खेती सम्बन्धी प्रश्नहरू नेपालीमा सोध्नुहोस्।</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl shadow ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <div className="flex items-center mb-1">
                      {msg.sender === 'user' ? <User className="w-4 h-4 mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                      <span className="text-xs font-medium">{msg.sender === 'user' ? t('chatbot.userLabel') : t('chatbot.botLabel')}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs opacity-70 text-right flex-grow">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        {msg.sender === 'bot' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => handleSpeak(msg.text, currentLanguage)}
                            aria-label={t('chatbot.speakResponseLabel')}
                        >
                            <Volume2 className="h-4 w-4" />
                        </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-muted-foreground flex items-center">
                    <LoadingSpinner size={20} className="mr-2" />
                    <span>{t('chatbot.typing')}...</span>
                   </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder={t('chatbot.inputPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow text-base"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon" aria-label={t('chatbot.sendLabel')}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
