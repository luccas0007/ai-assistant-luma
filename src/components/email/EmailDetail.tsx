
import { ArrowLeft, Star, Trash, Reply, MoreHorizontal, Paperclip, Mail, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Email } from '@/types/email';
import { EmailAccount } from '@/types/email';
import { toggleStarEmail, moveEmailToFolder } from '@/services/emailService';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  onReply: () => void;
  account?: EmailAccount;
  onRefresh: () => void;
}

export default function EmailDetail({ 
  email, 
  onBack, 
  onReply, 
  account,
  onRefresh 
}: EmailDetailProps) {
  const [starred, setStarred] = useState<boolean>(email.is_starred || false);
  const { toast } = useToast();

  const handleToggleStar = async () => {
    try {
      await toggleStarEmail(email.id, !starred);
      setStarred(!starred);
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: "Error",
        description: "Failed to update star status",
        variant: "destructive",
      });
    }
  };

  const handleMoveToTrash = async () => {
    try {
      await moveEmailToFolder(email.id, 'trash');
      toast({
        title: "Email moved",
        description: "Email moved to trash folder",
      });
      onRefresh();
    } catch (error) {
      console.error('Error moving to trash:', error);
      toast({
        title: "Error",
        description: "Failed to move email to trash",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formattedDate = email.received_at || email.sent_at 
    ? new Date(email.received_at || email.sent_at || '').toLocaleString()
    : '';

  // Render HTML content if available, otherwise text content with line breaks
  const renderContent = () => {
    if (email.body_html) {
      return <div dangerouslySetInnerHTML={{ __html: email.body_html }} />;
    }
    
    return <div className="whitespace-pre-line">{email.body_text}</div>;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="ml-2 text-xl font-semibold truncate max-w-[250px] sm:max-w-sm md:max-w-md lg:max-w-lg">
            {email.subject || '(No subject)'}
          </h2>
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleToggleStar}>
            <Star className={starred ? "h-5 w-5 fill-yellow-400 text-yellow-400" : "h-5 w-5"} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleMoveToTrash}>
            <Trash className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onReply}>
            <Reply className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {(email.from_name?.[0] || email.from_address?.[0] || '?').toUpperCase()}
              </div>
              <div className="ml-3">
                <h3 className="font-medium">
                  {email.from_name || email.from_address}
                </h3>
                <p className="text-sm text-muted-foreground">{email.from_address}</p>
                <div className="text-sm mt-1">
                  To: {email.to_addresses.join(', ')}
                  {email.cc_addresses && email.cc_addresses.length > 0 && (
                    <div>Cc: {email.cc_addresses.join(', ')}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {formattedDate}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="email-content">
            {renderContent()}
          </div>
          
          {email.has_attachments && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments
              </h4>
              <div className="text-muted-foreground text-sm">
                Attachment support will be added in a future version
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button variant="default" size="sm" onClick={onReply}>
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </Button>
      </div>
    </div>
  );
}
