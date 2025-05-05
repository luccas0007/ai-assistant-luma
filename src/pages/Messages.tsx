
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Phone,
  Video,
  Send,
  Image,
  Paperclip
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: 'online' | 'offline' | 'away';
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const contacts: Contact[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    lastMessage: 'Can you send me those files we discussed?',
    timestamp: '10:23 AM',
    unread: 1,
    status: 'online'
  },
  {
    id: 2,
    name: 'David Martinez',
    lastMessage: 'Got it, thanks!',
    timestamp: 'Yesterday',
    unread: 0,
    status: 'offline'
  },
  {
    id: 3,
    name: 'Team Chat',
    lastMessage: 'Alex: The latest build is ready for testing',
    timestamp: 'Yesterday',
    unread: 3,
    status: 'online'
  },
  {
    id: 4,
    name: 'Lisa Wong',
    lastMessage: 'Looking forward to our meeting tomorrow',
    timestamp: 'Mon',
    unread: 0,
    status: 'away'
  },
  {
    id: 5,
    name: 'Michael Brown',
    lastMessage: 'How's the project coming along?',
    timestamp: 'Sat',
    unread: 0,
    status: 'online'
  }
];

const messages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 1,
      receiverId: 0,
      text: 'Hi there! Do you have the project files ready?',
      timestamp: '10:00 AM',
      status: 'read'
    },
    {
      id: 2,
      senderId: 0,
      receiverId: 1,
      text: 'Good morning! I\'m just finalizing them now. Should be ready in about an hour.',
      timestamp: '10:15 AM',
      status: 'read'
    },
    {
      id: 3,
      senderId: 1,
      receiverId: 0,
      text: 'Sounds good, no rush. Just need them before the client meeting tomorrow.',
      timestamp: '10:18 AM',
      status: 'read'
    },
    {
      id: 4,
      senderId: 0,
      receiverId: 1,
      text: 'Definitely will have them to you today. Do you need the presentation as well?',
      timestamp: '10:20 AM',
      status: 'read'
    },
    {
      id: 5,
      senderId: 1,
      receiverId: 0,
      text: 'Can you send me those files we discussed?',
      timestamp: '10:23 AM',
      status: 'read'
    }
  ]
};

const MessagesPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  
  const handleSelectContact = (contact: Contact) => {
    setActiveContact(contact);
    setActiveMessages(messages[contact.id] || []);
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeContact) return;
    
    const newMessage: Message = {
      id: Date.now(),
      senderId: 0, // Current user
      receiverId: activeContact.id,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setActiveMessages([...activeMessages, newMessage]);
    
    // Add message to the contact's history
    if (!messages[activeContact.id]) {
      messages[activeContact.id] = [];
    }
    messages[activeContact.id].push(newMessage);
    
    setMessageText('');
  };
  
  const getStatusIndicator = (status: Contact['status']) => {
    const colors = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      away: 'bg-amber-500'
    };
    
    return <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${colors[status]}`}></span>;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Messages</h1>
        <p className="text-muted-foreground">Send and receive messages</p>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6 h-[calc(100vh-16rem)]">
        {/* Contacts list */}
        {(!activeContact || !isMobile) && (
          <Card className={`${isMobile ? 'md:col-span-12' : 'md:col-span-4'}`}>
            <CardContent className="p-0 h-full">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search messages..." 
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="overflow-auto h-[calc(100%-57px)]">
                {contacts.map(contact => (
                  <React.Fragment key={contact.id}>
                    <div 
                      className={`
                        p-3 flex items-center hover:bg-muted/50 cursor-pointer transition-colors
                        ${activeContact?.id === contact.id ? 'bg-muted/80' : ''}
                      `}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          {contact.avatar && <AvatarImage src={contact.avatar} />}
                        </Avatar>
                        {getStatusIndicator(contact.status)}
                      </div>
                      
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium truncate">{contact.name}</h3>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {contact.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {contact.lastMessage}
                        </p>
                      </div>
                      
                      {contact.unread > 0 && (
                        <div className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                          {contact.unread}
                        </div>
                      )}
                    </div>
                    <Separator />
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Chat area */}
        {(activeContact || !isMobile) && (
          <Card className={`${isMobile ? 'md:col-span-12' : 'md:col-span-8'} flex flex-col`}>
            {activeContact ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    {isMobile && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mr-1"
                        onClick={() => setActiveContact(null)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="lucide lucide-chevron-left h-5 w-5"
                        >
                          <path d="m15 18-6-6 6-6"/>
                        </svg>
                      </Button>
                    )}
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {getStatusIndicator(activeContact.status)}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">{activeContact.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {activeContact.status === 'online' ? 'Online' : 
                          activeContact.status === 'away' ? 'Away' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-auto flex flex-col-reverse">
                  <div className="space-y-3">
                    {activeMessages.map(message => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.senderId !== 0 && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div 
                            className={`
                              max-w-md px-4 py-2 rounded-lg
                              ${message.senderId === 0 
                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                : 'bg-muted rounded-bl-none'}
                            `}
                          >
                            <p>{message.text}</p>
                          </div>
                          <div 
                            className={`
                              text-xs text-muted-foreground mt-1
                              ${message.senderId === 0 ? 'text-right' : 'text-left'}
                            `}
                          >
                            {message.timestamp}
                          </div>
                        </div>
                        {message.senderId === 0 && (
                          <Avatar className="h-8 w-8 ml-2">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message input */}
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Image className="h-5 w-5" />
                    </Button>
                    <Input 
                      placeholder="Type a message..." 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a contact to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
