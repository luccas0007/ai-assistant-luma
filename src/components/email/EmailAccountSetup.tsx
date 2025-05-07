
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useEmailAccountForm } from '@/hooks/useEmailAccountForm';
import AccountTypeSelector from './account-setup/AccountTypeSelector';
import BasicAccountFields from './account-setup/BasicAccountFields';
import CustomProviderFields from './account-setup/CustomProviderFields';
import OAuthNotice from './account-setup/OAuthNotice';
import ConnectionTest from './account-setup/ConnectionTest';

export default function EmailAccountSetup({ onComplete }: { onComplete: () => void }) {
  const {
    form,
    accountType,
    isSubmitting,
    formError,
    isTestingConnection,
    testConnectionResult,
    updateProvider,
    testConnection,
    onSubmit
  } = useEmailAccountForm(onComplete);

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Add Email Account</CardTitle>
        <CardDescription>Connect your email account to manage messages</CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
      
        <Tabs defaultValue="gmail" onValueChange={(value) => updateProvider(value as any)}>
          <AccountTypeSelector 
            value={accountType} 
            onValueChange={updateProvider}
          />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
              <div className="space-y-4">
                <BasicAccountFields 
                  form={form} 
                  updateUsernameWithEmail={accountType !== 'custom'} 
                />
                
                {accountType === 'custom' ? (
                  <CustomProviderFields form={form} />
                ) : (
                  <OAuthNotice />
                )}

                {/* Connection test for custom providers */}
                {accountType === 'custom' && (
                  <ConnectionTest
                    onTest={testConnection}
                    isTesting={isTestingConnection}
                    result={testConnectionResult}
                  />
                )}
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding Account...' : 'Add Account'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
