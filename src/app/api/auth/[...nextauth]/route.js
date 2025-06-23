import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { upsertUser } from '@/services/userService'

const handler = NextAuth({
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
          // Store or update user in Supabase
          await upsertUser({
            email: user.email,
            name: user.name,
            image: user.image
          })
          return true
        } catch (error) {
          console.error('Error storing user:', error)
          return true // Still allow sign in even if DB storage fails
        }
      }
      return true
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
})

export { handler as GET, handler as POST }