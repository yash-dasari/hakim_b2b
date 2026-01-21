import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      accessToken: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken: string;
  }
} 