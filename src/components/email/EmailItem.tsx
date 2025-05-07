
import { forwardRef } from 'react';
import { format } from 'date-fns';
import { Star, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Email } from '@/types/email';
import { Button } from '@/components/ui/button';
import { toggleStarEmail } from '@/services/emailService';

interface EmailItemProps {
  email: Email;
  onClick: () => void;
  isSelected?: boolean;
}

const EmailItem = forwardRef<HTMLDivElement, EmailItemProps>(
  ({ email, onClick, isSelected }, ref) => {
    const handleToggleStar = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await toggleStarEmail(email.id, !email.is_starred);
      } catch (error) {
        console.error('Error toggling star:', error);
      }
    };

    // Format date
    const formattedDate = email.received_at || email.sent_at
      ? formatEmailDate(new Date(email.received_at || email.sent_at || ''))
      : '';

    // Get sender name or email
    const senderDisplay = email.from_name || email.from_address;

    // Get truncated subject
    const subject = email.subject || '(No subject)';
    
    // Get preview text
    const previewText = email.body_text 
      ? email.body_text.slice(0, 100).replace(/\n/g, ' ')
      : '(No content)';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "flex items-start p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b",
          isSelected ? "bg-muted" : "",
          email.is_read ? "" : "bg-primary/5 font-medium"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 mr-2 shrink-0"
          onClick={handleToggleStar}
        >
          <Star className={cn("h-4 w-4", email.is_starred ? "fill-yellow-400 text-yellow-400" : "")} />
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <h3 className={cn("text-sm truncate", email.is_read ? "" : "font-semibold")}>
              {senderDisplay}
            </h3>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {formattedDate}
            </span>
          </div>
          
          <h4 className="text-sm font-medium truncate mt-1">
            {subject}
          </h4>
          
          <p className="text-xs text-muted-foreground truncate mt-1">
            {previewText}
          </p>
        </div>
        
        {email.has_attachments && (
          <Paperclip className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
        )}
      </div>
    );
  }
);

EmailItem.displayName = 'EmailItem';

function formatEmailDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date >= today) {
    return format(date, 'h:mm a'); // Today: 3:45 PM
  } else if (date >= yesterday) {
    return 'Yesterday';
  } else if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'MMM d'); // Same year: Jan 15
  } else {
    return format(date, 'MM/dd/yy'); // Different year: 01/15/22
  }
}

export default EmailItem;
