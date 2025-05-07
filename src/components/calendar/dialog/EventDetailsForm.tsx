
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EventDetailsFormProps {
  title: string;
  location: string;
  description: string;
  onTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const EventDetailsForm: React.FC<EventDetailsFormProps> = ({
  title,
  location,
  description,
  onTitleChange,
  onLocationChange,
  onDescriptionChange
}) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Event title"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Event location (optional)"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Event description (optional)"
          rows={3}
        />
      </div>
    </>
  );
};

export default EventDetailsForm;
