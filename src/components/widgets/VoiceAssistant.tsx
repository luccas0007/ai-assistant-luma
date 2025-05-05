
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Speaker } from 'lucide-react';

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [animating, setAnimating] = useState(false);
  
  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setResponse('');
      // Simulate listening
      setTimeout(() => {
        setTranscript('What meetings do I have today?');
        setTimeout(() => handleVoiceCommand(), 1000);
      }, 2000);
    } else {
      setTranscript('');
    }
  };
  
  const handleVoiceCommand = () => {
    setIsListening(false);
    setAnimating(true);
    
    // Simulate AI thinking and responding
    setTimeout(() => {
      setResponse('You have a team meeting at 2:00 PM in Conference Room A and a project review at 4:30 PM on Zoom.');
      setAnimating(false);
    }, 1500);
  };
  
  // Animation effect for the pulse
  useEffect(() => {
    if (!isListening && !animating) {
      const interval = setInterval(() => {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 100);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isListening, animating]);
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-36 bg-gradient-to-r from-assistant-blue to-assistant-purple flex flex-col items-center justify-center text-white">
        <div className={`w-24 h-24 rounded-full bg-white/20 flex items-center justify-center ${(isListening || animating) ? 'animate-pulse-slow' : ''}`}>
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
            <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${isListening ? 'animate-bounce-subtle' : ''}`}>
              {isListening ? (
                <Mic className="h-6 w-6 text-assistant-purple" />
              ) : (
                <Speaker className="h-6 w-6 text-assistant-purple" />
              )}
            </div>
          </div>
        </div>
        
        {transcript && (
          <div className="absolute bottom-2 left-0 right-0 text-center text-sm font-medium px-4 animate-fade-in">
            "{transcript}"
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        {response ? (
          <div className="text-sm animate-fade-in">
            <p className="font-medium mb-1">Assistant Response:</p>
            <p>{response}</p>
          </div>
        ) : (
          <div className="text-center p-2">
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              className="gap-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Voice Command
                </>
              )}
            </Button>
            
            {!isListening && !response && (
              <p className="text-xs text-muted-foreground mt-2">
                Click to give a voice command to your assistant
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
