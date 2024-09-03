interface Window {
  onAmazonLoginReady: () => void;
  amazon?: {
    Login: {
      setClientId: (clientId: string) => void;
      authorize: (options: any, callback: (response: any) => void) => void;
    };
  };
}