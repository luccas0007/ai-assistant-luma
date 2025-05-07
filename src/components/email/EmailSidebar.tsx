
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Inbox, 
  Send, 
  Trash, 
  Star, 
  AlertCircle,
  Plus,
  RefreshCw,
  Settings
} from 'lucide-react';
import { EmailAccount } from '@/types/email';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { syncEmails } from '@/services/emailService';
import { cn } from '@/lib/utils';

interface EmailSidebarProps {
  accounts: EmailAccount[];
  currentAccount: EmailAccount | null;
  onAccountChange: (accountId: string) => void;
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  onAddAccount: () => void;
  onCompose: () => void;
  isRefreshing: boolean;
  setIsRefreshing: (value: boolean) => void;
}

export default function EmailSidebar({
  accounts,
  currentAccount,
  onAccountChange,
  currentFolder,
  onFolderChange,
  onAddAccount,
  onCompose,
  isRefreshing,
  setIsRefreshing
}: EmailSidebarProps) {
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (isRefreshing || !currentAccount) return;
    
    setIsRefreshing(true);
    try {
      await syncEmails(currentAccount.id, currentFolder);
      toast({
        title: "Emails synced",
        description: "Your emails have been refreshed",
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to refresh emails",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4">
        <Button className="w-full mb-4" onClick={onCompose}>
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </Button>
        
        {accounts.length > 0 ? (
          <Select 
            value={currentAccount?.id || ''} 
            onValueChange={onAccountChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Button variant="outline" className="w-full" onClick={onAddAccount}>
            Add Email Account
          </Button>
        )}

        {accounts.length > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mt-2 w-full flex justify-start px-3" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2", 
              isRefreshing ? "animate-spin" : ""
            )} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </Button>
        )}
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          <FolderItem 
            icon={Inbox} 
            label="Inbox" 
            value="inbox"
            currentFolder={currentFolder}
            onSelect={onFolderChange}
          />
          <FolderItem 
            icon={Star} 
            label="Starred" 
            value="starred"
            currentFolder={currentFolder}
            onSelect={onFolderChange}
          />
          <FolderItem 
            icon={Send} 
            label="Sent" 
            value="sent"
            currentFolder={currentFolder}
            onSelect={onFolderChange}
          />
          <FolderItem 
            icon={Trash} 
            label="Trash" 
            value="trash"
            currentFolder={currentFolder}
            onSelect={onFolderChange}
          />
          <FolderItem 
            icon={AlertCircle} 
            label="Spam" 
            value="spam"
            currentFolder={currentFolder}
            onSelect={onFolderChange}
          />
        </div>
      </ScrollArea>
      
      <div className="p-2 mt-auto">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}

interface FolderItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  currentFolder: string;
  onSelect: (folder: string) => void;
  badge?: number;
}

function FolderItem({ icon: Icon, label, value, currentFolder, onSelect, badge }: FolderItemProps) {
  const isActive = currentFolder === value;
  
  return (
    <Button 
      variant={isActive ? "secondary" : "ghost"} 
      className="w-full justify-start mb-1"
      onClick={() => onSelect(value)}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span>{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </Button>
  );
}
