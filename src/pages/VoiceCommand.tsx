
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Speaker } from 'lucide-react';
import { Card } from '@/components/ui/card';

const VoiceCommand: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState<Array<{type: 'user' | 'assistant', text: string}>>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Simulate chat messages on initial load
  useEffect(() => {
    setResponses([
      { type: 'assistant', text: 'Hello! How can I assist you today?' }
    ]);
  }, []);
  
  const toggleListening = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Clear previous transcript
      setTranscript('');
      
      // Simulate listening with a timeout
      const simulatedCommands = [
        'Schedule a meeting with the design team tomorrow at 10 AM',
        'What emails do I have from Sarah?',
        'Send a message to John about the project status',
        'Add a task to prepare the quarterly report due next Friday'
      ];
      
      const randomCommand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
      
      setTimeout(() => {
        setTranscript(randomCommand);
        
        // Add user message to responses
        setResponses(prev => [...prev, { type: 'user', text: randomCommand }]);
        
        // Stop listening
        setIsListening(false);
        
        // Simulate AI thinking
        setIsThinking(true);
        
        // Simulate AI response after a delay
        setTimeout(() => {
          setIsThinking(false);
          
          // Add assistant response based on the command
          let assistantResponse = '';
          
          if (randomCommand.includes('Schedule a meeting')) {
            assistantResponse = 'I\'ve scheduled a meeting with the design team for tomorrow at 10 AM. Would you like me to send invitations to the team?';
          } else if (randomCommand.includes('emails')) {
            assistantResponse = 'You have 3 unread emails from Sarah. The most recent one is about the marketing strategy with the subject "Campaign Updates". Would you like me to read them to you?';
          } else if (randomCommand.includes('Send a message')) {
            assistantResponse = 'I\'ve prepared a message to John about the project status. Would you like to dictate the message now or shall I ask about recent project updates?';
          } else if (randomCommand.includes('Add a task')) {
            assistantResponse = 'I\'ve added "Prepare quarterly report" to your tasks with a deadline of next Friday. Is there anything else you\'d like to add to this task?';
          }
          
          setResponses(prev => [...prev, { type: 'assistant', text: assistantResponse }]);
        }, 2000);
      }, 2000);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Voice Assistant</h1>
        <p className="text-muted-foreground">Speak to your AI assistant</p>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 mb-4 border rounded-lg overflow-hidden bg-background">
          <div className="h-full flex flex-col p-4 overflow-y-auto">
            <div className="flex-1 space-y-4">
              {responses.map((response, index) => (
                <div 
                  key={index} 
                  className={`flex ${response.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      response.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {response.text}
                  </div>
                </div>
              ))}
              
              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transcript display while listening */}
              {isListening && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary/50 text-primary-foreground">
                    <span className="opacity-70">{transcript || 'Listening...'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -top-16 left-0 right-0 flex justify-center">
            <Card className="shadow-lg">
              <div className="p-4 flex items-center justify-center">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  className="gap-2 w-full"
                  disabled={isThinking}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-5 w-5" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      <span>Start Voice Command</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="h-16"></div> {/* Spacer for the floating button */}
    </div>
  );
};

export default VoiceCommand;
