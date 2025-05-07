
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, 
  Search, 
  MailOpen, 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Email, EmailAccount } from '@/types/email';
import EmailSidebar from '@/components/email/EmailSidebar';
import EmailItem from '@/components/email/EmailItem';
import EmailDetail from '@/components/email/EmailDetail';
import EmailCompose from '@/components/email/EmailCompose';
import EmailAccountSetup from '@/components/email/EmailAccountSetup';
import { getEmailAccounts, getEmails, getEmail, syncEmails } from '@/services/emailService';

const EmailPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<EmailAccount | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState<boolean>(false);
  const [showAddAccount, setShowAddAccount] = useState<boolean>(false);

  // Load email accounts
  useEffect(() => {
    const loadAccounts = async () => {
      if (!user) return;
      
      try {
        const accounts = await getEmailAccounts();
        setAccounts(accounts);
        
        if (accounts.length > 0) {
          setCurrentAccountId(accounts[0].id);
          setCurrentAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error loading accounts:', error);
      }
    };
    
    loadAccounts();
  }, [user]);
  
  // Load emails when account/folder changes
  useEffect(() => {
    const loadEmails = async () => {
      if (!currentAccountId) {
        setEmails([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        let emailData = await getEmails(currentAccountId, currentFolder);
        
        // If no emails in folder, try syncing
        if (emailData.length === 0 && currentFolder === 'inbox') {
          await syncEmails(currentAccountId, currentFolder);
          emailData = await getEmails(currentAccountId, currentFolder);
        }
        
        setEmails(emailData);
      } catch (error) {
        console.error('Error loading emails:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedEmail) {
      setSelectedEmail(null); // Reset selected email when changing folder/account
    }
    
    loadEmails();
  }, [currentAccountId, currentFolder]);

  const handleAccountChange = (accountId: string) => {
    setCurrentAccountId(accountId);
    const account = accounts.find(acc => acc.id === accountId) || null;
    setCurrentAccount(account);
  };
  
  const handleSelectEmail = async (email: Email) => {
    try {
      const fullEmail = await getEmail(email.id);
      setSelectedEmail(fullEmail);
    } catch (error) {
      console.error('Error loading email details:', error);
    }
  };
  
  const handleRefreshEmails = async () => {
    if (!currentAccountId) return;
    
    try {
      const emailData = await getEmails(currentAccountId, currentFolder);
      setEmails(emailData);
    } catch (error) {
      console.error('Error refreshing emails:', error);
    }
  };
  
  const handleAddAccountComplete = async () => {
    setShowAddAccount(false);
    
    try {
      const accounts = await getEmailAccounts();
      setAccounts(accounts);
      
      if (accounts.length > 0 && !currentAccountId) {
        setCurrentAccountId(accounts[0].id);
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.error('Error reloading accounts:', error);
    }
  };

  const handleComposeComplete = () => {
    setShowCompose(false);
    handleRefreshEmails();
  };
  
  const handleReply = () => {
    // For MVP, just open compose window
    setShowCompose(true);
  };
  
  const handleBackToList = () => {
    setSelectedEmail(null);
  };
  
  if (showAddAccount) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Email</h1>
          <p className="text-muted-foreground">Connect your email accounts</p>
        </div>
        
        <div className="flex justify-center">
          <EmailAccountSetup onComplete={handleAddAccountComplete} />
        </div>
      </div>
    );
  }
  
  if (showCompose) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Email</h1>
          <p className="text-muted-foreground">Compose new message</p>
        </div>
        
        <div className="flex justify-center">
          <EmailCompose 
            accounts={accounts}
            onClose={() => setShowCompose(false)}
            onSent={handleComposeComplete}
          />
        </div>
      </div>
    );
  }
  
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
          <Button className="ml-3" onClick={() => setShowCompose(true)}>
            Compose
          </Button>
          {accounts.length === 0 && (
            <Button 
              variant="outline"
              className="ml-3"
              onClick={() => setShowAddAccount(true)}
            >
              Add Account
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Email navigation */}
          <Card className="md:col-span-3">
            <CardContent className="p-0">
              <EmailSidebar 
                accounts={accounts}
                currentAccount={currentAccount}
                onAccountChange={handleAccountChange}
                currentFolder={currentFolder}
                onFolderChange={setCurrentFolder}
                onAddAccount={() => setShowAddAccount(true)}
                onCompose={() => setShowCompose(true)}
                isRefreshing={isRefreshing}
                setIsRefreshing={setIsRefreshing}
              />
            </CardContent>
          </Card>
          
          {/* Email list and content */}
          <Card className="md:col-span-9">
            <CardContent className="p-0">
              {!selectedEmail ? (
                <>
                  {/* Email list view */}
                  <div className="h-[600px] overflow-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-6">
                          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                          <h3 className="text-lg font-medium">Loading emails...</h3>
                        </div>
                      </div>
                    ) : emails.length > 0 ? (
                      emails.map(email => (
                        <EmailItem 
                          key={email.id} 
                          email={email} 
                          onClick={() => handleSelectEmail(email)} 
                        />
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-6">
                          <MailOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No emails found</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentFolder === 'inbox' ? 'Your inbox is empty' : `No emails in ${currentFolder}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <EmailDetail 
                  email={selectedEmail}
                  onBack={handleBackToList}
                  onReply={handleReply}
                  account={currentAccount}
                  onRefresh={handleBackToList}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailPage;
