import GoogleProvider from 'next-auth/providers/google'
import { upsertUser } from '@/services/userService'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Store or update user in Supabase and get the ID
          const dbUser = await upsertUser({
            email: user.email,
            name: user.name,
            image: user.image
          })
          
          // Add the database ID to the user object
          user.id = dbUser.id
          return true
        } catch (error) {
          console.error('Error storing user:', error)
          return true // Still allow sign in even if DB storage fails
        }
      }
      return true
    },
    async session({ session, token }) {
      // Add user ID to the session from the token
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      // Add user ID to the token when first signing in
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/signin',
    signUp: '/signup',
    error: '/error',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
} 