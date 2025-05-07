
export default function OAuthNotice() {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <p className="text-sm">
        For this MVP, we're simulating OAuth authentication. In a real application,
        you would be redirected to the provider's login page to authenticate.
      </p>
    </div>
  );
}
