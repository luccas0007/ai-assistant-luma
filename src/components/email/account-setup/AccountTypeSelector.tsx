
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccountTypeSelectorProps {
  value: string;
  onValueChange: (value: 'gmail' | 'outlook' | 'custom') => void;
}

export default function AccountTypeSelector({ value, onValueChange }: AccountTypeSelectorProps) {
  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="gmail">Gmail</TabsTrigger>
      <TabsTrigger value="outlook">Outlook</TabsTrigger>
      <TabsTrigger value="custom">Custom</TabsTrigger>
    </TabsList>
  );
}
