export const environment = {
  production: true,
  apiUrl: '', // Will be replaced by the deployment pipeline
  ws: {
    url: (roomId: string) => {
      // In production, we always use secure WebSockets
      return `wss://${window.location.host}/ws/chat/${roomId}`;
    }
  }
};
