import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '../../../lib/mongodb'
import connectDB from '../../../lib/db'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Starting authorization process...')
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            throw new Error('Email și parola sunt necesare')
          }

          console.log('Attempting to connect to database...')
          await connectDB()
          console.log('Database connected successfully')

          console.log('Looking for user:', credentials.email)
          const user = await User.findOne({
            email: credentials.email,
          }).maxTimeMS(5000)
          if (!user) {
            console.log('User not found')
            throw new Error('Nu există niciun cont cu acest email')
          }

          console.log('User found, comparing passwords')
          const isPasswordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )
          if (!isPasswordMatch) {
            console.log('Password mismatch')
            throw new Error('Parolă incorectă')
          }

          console.log('Authentication successful')
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 zile
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: true, // Enable debug logs
}

export default NextAuth(authOptions)
