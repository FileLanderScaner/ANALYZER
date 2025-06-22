
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, CornerDownLeft, Sparkles } from 'lucide-react';
import { askGeneralAssistantAction } from '@/app/actions';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const initialAiMessage: Message = {
  id: `ai-initial-${Date.now()}`,
  sender: 'ai',
  text: "¡Hola! Soy tu asistente de seguridad IA. Puedo ayudarte a entender las funcionalidades de esta plataforma, aclarar conceptos de ciberseguridad, interpretar hallazgos de análisis (URL, servidor, base de datos) y ofrecerte consejos generales. ¿En qué puedo ayudarte hoy?",
  timestamp: new Date(),
};

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([initialAiMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Pass previous messages for context if your AI flow supports it
      // const conversationHistory = messages.map(m => ({ sender: m.sender, message: m.text }));
      const aiResponseText = await askGeneralAssistantAction({ 
        userMessage: trimmedInput,
        // conversationHistory: conversationHistory (uncomment if flow supports it)
      });
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: 'Lo siento, ocurrió un error al contactar al asistente. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-primary text-primary-foreground">
        <h3 className="text-lg font-semibold flex items-center">
          <Sparkles className="mr-2 h-5 w-5" />
          Asistente IA de Seguridad Integral
        </h3>
        <p className="text-xs text-primary-foreground/80">Consultas sobre la plataforma, seguridad web, de servidores y bases de datos.</p>
      </div>
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg max-w-[85%] shadow-sm',
              msg.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-secondary text-secondary-foreground border border-border'
            )}
          >
            {msg.sender === 'ai' && <Bot className="h-6 w-6 flex-shrink-0 mt-0.5 text-primary" />}
            <div className="flex flex-col flex-grow">
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
              <span className={cn("text-xs mt-1 self-end", msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/80')}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {msg.sender === 'user' && <User className="h-6 w-6 flex-shrink-0 mt-0.5" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 p-3 rounded-lg max-w-[85%] mr-auto bg-secondary text-secondary-foreground animate-pulse shadow-sm border border-border">
            <Bot className="h-6 w-6 flex-shrink-0 mt-0.5 text-primary" />
            <div className="flex flex-col">
                <p className="text-sm">Analizando tu consulta...</p>
            </div>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex items-center gap-2 bg-background">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu consulta aquí..."
          className="flex-grow text-sm"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          aria-label="Mensaje para el asistente IA"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">Enviar Mensaje</span>
        </Button>
      </form>
    </div>
  );
}
