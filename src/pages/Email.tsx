
import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  Inbox, 
  Send, 
  Trash, 
  Star, 
  AlertCircle, 
  MailOpen, 
  ArrowLeft, 
  MoreHorizontal, 
  Paperclip
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface EmailItem {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  content: string;
  time: string;
  unread: boolean;
  starred: boolean;
  attachments: boolean;
  category: string;
}

const dummyEmails: EmailItem[] = [
  {
    id: 1,
    sender: 'John Smith',
    senderEmail: 'john.smith@company.com',
    subject: 'Project Update - New Milestones',
    content: `Hi there,

I wanted to share the latest developments on our project. We've reached several key milestones ahead of schedule and the client feedback has been very positive.

Here are the highlights:
- Frontend development is 90% complete
- Backend APIs are fully implemented
- Quality assurance has begun on the core features
- Documentation is being updated regularly

Let me know if you have any questions or concerns.

Best regards,
John`,
    time: 'Today, 10:45 AM',
    unread: true,
    starred: false,
    attachments: true,
    category: 'inbox'
  },
  {
    id: 2,
    sender: 'Marketing Team',
    senderEmail: 'marketing@company.com',
    subject: 'Campaign Results - Q2 Overview',
    content: 'Here are the results from our latest marketing campaign...',
    time: 'Yesterday',
    unread: false,
    starred: true,
    attachments: true,
    category: 'inbox'
  },
  {
    id: 3,
    sender: 'HR Department',
    senderEmail: 'hr@company.com',
    subject: 'Office Policy Update - Remote Work Guidelines',
    content: 'Please review the updated office policies regarding remote work arrangements...',
    time: 'May 2',
    unread: false,
    starred: false,
    attachments: false,
    category: 'inbox'
  },
  {
    id: 4,
    sender: 'Sarah Johnson',
    senderEmail: 'sarah.j@partner.com',
    subject: 'Partnership Opportunity',
    content: 'I would like to discuss a potential partnership opportunity between our companies...',
    time: 'Apr 30',
    unread: true,
    starred: true,
    attachments: false,
    category: 'inbox'
  },
  {
    id: 5,
    sender: 'Tech Support',
    senderEmail: 'support@company.com',
    subject: 'Your Ticket #45678 - Resolution',
    content: 'Your recent support ticket regarding the database connection issue has been resolved...',
    time: 'Apr 28',
    unread: false,
    starred: false,
    attachments: false,
    category: 'inbox'
  }
];

const EmailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [emails, setEmails] = useState<EmailItem[]>(dummyEmails);
  
  const filteredEmails = emails.filter(email => email.category === activeTab);
  
  const handleSelectEmail = (email: EmailItem) => {
    // Mark as read when opened
    if (email.unread) {
      setEmails(emails.map(e => 
        e.id === email.id ? { ...e, unread: false } : e
      ));
    }
    setSelectedEmail(email);
  };
  
  const handleBackToList = () => {
    setSelectedEmail(null);
  };
  
  const toggleStar = (emailId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, starred: !email.starred } : email
    ));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Email</h1>
        <p className="text-muted-foreground">Manage your emails and communications</p>
      </div>
      
      <div className="relative">
        <div className="flex mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search emails..." 
              className="pl-9"
            />
          </div>
          <Button className="ml-3">
            Compose
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Email navigation */}
          <Card className="md:col-span-3">
            <CardContent className="p-2">
              <div className="space-y-1">
                <Button 
                  variant={activeTab === 'inbox' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab('inbox')}
                >
                  <Inbox className="mr-2 h-4 w-4" />
                  <span>Inbox</span>
                  <Badge variant="secondary" className="ml-auto">
                    {emails.filter(e => e.category === 'inbox' && e.unread).length}
                  </Badge>
                </Button>
                <Button 
                  variant={activeTab === 'starred' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('starred')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  <span>Starred</span>
                </Button>
                <Button 
                  variant={activeTab === 'sent' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('sent')}
                >
                  <Send className="mr-2 h-4 w-4" />
                  <span>Sent</span>
                </Button>
                <Button 
                  variant={activeTab === 'trash' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('trash')}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Trash</span>
                </Button>
                <Button 
                  variant={activeTab === 'spam' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('spam')}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span>Spam</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Email list and content */}
          <Card className="md:col-span-9">
            <CardContent className="p-0">
              {!selectedEmail ? (
                <>
                  {/* Email list view */}
                  <div className="h-[600px] overflow-auto">
                    {filteredEmails.length > 0 ? (
                      filteredEmails.map(email => (
                        <div key={email.id}>
                          <div 
                            className={`
                              flex items-start p-4 hover:bg-muted/50 cursor-pointer transition-colors
                              ${email.unread ? 'bg-primary/5' : ''}
                            `}
                            onClick={() => handleSelectEmail(email)}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mr-2 shrink-0"
                              onClick={(e) => toggleStar(email.id, e)}
                            >
                              <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <h3 className={`text-sm truncate ${email.unread ? 'font-semibold' : 'font-medium'}`}>
                                  {email.sender}
                                </h3>
                                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                  {email.time}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium truncate mt-1">
                                {email.subject}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {email.content.split('\n')[0]}
                              </p>
                            </div>
                            {email.attachments && (
                              <Paperclip className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
                            )}
                          </div>
                          <Separator />
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-6">
                          <MailOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No emails found</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activeTab === 'inbox' ? 'Your inbox is empty' : `No emails in ${activeTab}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Email detail view */}
                  <div className="p-4 border-b">
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" onClick={handleBackToList}>
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="ml-2 flex-1">
                        <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {selectedEmail.sender.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium">{selectedEmail.sender}</h3>
                          <p className="text-sm text-muted-foreground">{selectedEmail.senderEmail}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedEmail.time}
                      </div>
                    </div>
                    
                    <div className="email-content whitespace-pre-line">
                      {selectedEmail.content}
                    </div>
                    
                    {selectedEmail.attachments && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attachments
                        </h4>
                        <div className="flex gap-3">
                          <div className="border rounded-md p-3 text-sm bg-muted/50 flex items-center">
                            <span className="mr-2">📄</span>
                            Project_Update.pdf
                          </div>
                          <div className="border rounded-md p-3 text-sm bg-muted/50 flex items-center">
                            <span className="mr-2">📊</span>
                            Metrics_Q2.xlsx
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 pt-6">
                      <Button>
                        Reply
                      </Button>
                      <Button variant="outline" className="ml-2">
                        Forward
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailPage;
