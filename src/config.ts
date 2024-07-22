const env = import.meta.env;

const url: any = env.VITE_SERVER_URL || 'http://localhost';

const serverPort: any = env.VITE_SERVER_PORT || '3002';

const serverUrl: string = `${url}:${serverPort}`;

export default serverUrl;