
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface BasicAccountFieldsProps {
  form: UseFormReturn<any>;
  updateUsernameWithEmail?: boolean;
}

export default function BasicAccountFields({ form, updateUsernameWithEmail = false }: BasicAccountFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="account_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Name</FormLabel>
            <FormControl>
              <Input placeholder="Personal Gmail" {...field} />
            </FormControl>
            <FormDescription>
              A friendly name to identify this account
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="you@example.com" 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  // Auto-update username to match email for OAuth providers
                  if (updateUsernameWithEmail) {
                    form.setValue('username', e.target.value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
