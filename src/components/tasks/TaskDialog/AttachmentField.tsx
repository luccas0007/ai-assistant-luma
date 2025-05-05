
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, X, Upload, FileText, Link as LinkIcon } from 'lucide-react';

interface AttachmentFieldProps {
  attachmentURL: string | null;
  setAttachmentURL: (url: string | null) => void;
  onFileUpload?: (file: File) => Promise<void>;
}

const AttachmentField: React.FC<AttachmentFieldProps> = ({
  attachmentURL,
  setAttachmentURL,
  onFileUpload
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlInputVisible, setUrlInputVisible] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;
    
    try {
      setIsUploading(true);
      await onFileUpload(file);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentURL(null);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setAttachmentURL(urlInput);
      setUrlInput('');
      setUrlInputVisible(false);
    }
  };

  const handleUrlButtonClick = () => {
    setUrlInputVisible(!urlInputVisible);
    if (!urlInputVisible) {
      setUrlInput(attachmentURL || '');
    }
  };

  return (
    <div className="grid gap-2">
      <Label>Attachment</Label>
      
      {attachmentURL ? (
        <div className="flex items-center gap-2 p-2 border rounded-md">
          <FileText className="h-4 w-4 text-blue-500" />
          <a
            href={attachmentURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline flex-1 truncate"
          >
            {attachmentURL.split('/').pop() || 'Attached file'}
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveAttachment}
            type="button"
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
            disabled={isUploading}
          />
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Paperclip className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant={urlInputVisible ? "default" : "outline"}
            size="icon"
            onClick={handleUrlButtonClick}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {urlInputVisible && !attachmentURL && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2 mt-2">
          <Input
            type="url"
            placeholder="Enter attachment URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!urlInput.trim()}>
            Add
          </Button>
        </form>
      )}
    </div>
  );
};

export default AttachmentField;
