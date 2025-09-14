import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

interface ChatMessage {
  id: string;
  question: string;
  response: string;
  language: string;
  created_at: string;
}

const Chat = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    if (!user) return;

    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!currentQuestion.trim() || !user || !session) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setLoading(true);

    // Add user message to UI immediately
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      question,
      response: '',
      language,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { question, language },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Update the message with AI response
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, response: data.response }
            : msg
        ));

        toast({
          title: "Response received",
          description: "AI assistant has responded to your question",
        });
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const suggestedQuestions = language === 'malayalam' 
    ? [
        'എന്റെ നെല്ല് വിളയ്ക്ക് എന്ത് വളം ഉപയോഗിക്കാം?',
        'കീടനാശിനി ഉപയോഗിക്കാതെ പച്ചക്കറി വളർത്താമോ?',
        'മണ്ണിന്റെ ആരോഗ്യം എങ്ങനെ മെച്ചപ്പെടുത്താം?'
      ]
    : [
        'What fertilizer should I use for my rice crop?',
        'How can I grow vegetables without pesticides?',
        'How to improve soil health naturally?'
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 pb-20">
      <div className="container mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            AI Farm Assistant
          </h1>
          
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="malayalam">മലയാളം</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'malayalam' ? 'കൃഷി സഹായി' : 'Farm Assistant Chat'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 p-2">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {language === 'malayalam' 
                      ? 'AI കൃഷി സഹായിയോട് സംസാരിക്കുക' 
                      : 'Start chatting with AI Farm Assistant'}
                  </p>
                  <p className="text-sm">
                    {language === 'malayalam'
                      ? 'കൃഷി, വളം, കീടനാശിനി എന്നിവയെക്കുറിച്ച് ചോദിക്കുക'
                      : 'Ask about crops, fertilizers, pesticides and more'}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="space-y-3">
                    {/* User Question */}
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm max-w-xs">
                        <p className="text-sm">{message.question}</p>
                        <p className="text-xs opacity-75 mt-1">{formatTime(message.created_at)}</p>
                      </div>
                      <div className="bg-primary/20 p-2 rounded-full">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    </div>

                    {/* AI Response */}
                    {message.response && (
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/50 p-2 rounded-full">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-accent/20 p-3 rounded-2xl rounded-tl-sm max-w-xs">
                          <p className="text-sm whitespace-pre-wrap">{message.response}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTime(message.created_at)}</p>
                        </div>
                      </div>
                    )}

                    {/* Loading indicator for current message */}
                    {!message.response && loading && message.id.startsWith('temp-') && (
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/50 p-2 rounded-full">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-accent/20 p-3 rounded-2xl rounded-tl-sm">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                            <span className="text-sm text-muted-foreground">
                              {language === 'malayalam' ? 'ചിന്തിക്കുന്നു...' : 'Thinking...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 0 && !loadingHistory && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {language === 'malayalam' ? 'നിർദ്ദേശിച്ച ചോദ്യങ്ങൾ:' : 'Suggested questions:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(question)}
                      className="text-xs bg-accent/30 hover:bg-accent/50 text-accent-foreground px-3 py-2 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Input
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === 'malayalam' 
                    ? 'കൃഷിയെക്കുറിച്ച് ചോദിക്കുക...'
                    : 'Ask about farming...'
                }
                className="flex-1 h-12 rounded-xl border-border/50"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !currentQuestion.trim()}
                size="sm"
                className="h-12 w-12 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Chat;