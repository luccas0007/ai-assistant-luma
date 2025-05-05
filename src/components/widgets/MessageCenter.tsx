
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare } from 'lucide-react';

const dummyEmails = [
  {
    id: 1,
    sender: 'John Smith',
    subject: 'Project Update',
    preview: 'I wanted to share the latest developments...',
    time: '10:45 AM',
    unread: true
  },
  {
    id: 2,
    sender: 'Marketing Team',
    subject: 'Campaign Results',
    preview: 'Here are the results from our latest campaign...',
    time: 'Yesterday',
    unread: false
  },
  {
    id: 3,
    sender: 'HR Department',
    subject: 'Office Policy Update',
    preview: 'Please review the updated office policies...',
    time: 'May 2',
    unread: false
  }
];

const dummyMessages = [
  {
    id: 1,
    sender: 'Lisa Johnson',
    preview: 'Can you send me the files we discussed?',
    time: '12:34 PM',
    unread: true
  },
  {
    id: 2,
    sender: 'Dev Team',
    preview: 'The latest build is ready for testing',
    time: 'Yesterday',
    unread: false
  },
  {
    id: 3,
    sender: 'Client Support',
    preview: 'Thanks for your quick response!',
    time: 'May 3',
    unread: false
  }
];

const MessageCenter: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Message Center</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>Email</span>
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{dummyEmails.filter(e => e.unread).length}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{dummyMessages.filter(m => m.unread).length}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="mt-0 space-y-3">
            {dummyEmails.map(email => (
              <div key={email.id} className={`p-3 rounded-md ${email.unread ? 'bg-primary/5' : 'bg-transparent'} cursor-pointer hover:bg-muted/80 transition-colors`}>
                <div className="flex items-start justify-between">
                  <h4 className={`text-sm ${email.unread ? 'font-semibold' : 'font-medium'}`}>{email.sender}</h4>
                  <span className="text-xs text-muted-foreground">{email.time}</span>
                </div>
                <p className="text-sm font-medium mt-1">{email.subject}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{email.preview}</p>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="messages" className="mt-0 space-y-3">
            {dummyMessages.map(message => (
              <div key={message.id} className={`p-3 rounded-md ${message.unread ? 'bg-primary/5' : 'bg-transparent'} cursor-pointer hover:bg-muted/80 transition-colors`}>
                <div className="flex items-start justify-between">
                  <h4 className={`text-sm ${message.unread ? 'font-semibold' : 'font-medium'}`}>{message.sender}</h4>
                  <span className="text-xs text-muted-foreground">{message.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{message.preview}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MessageCenter;
