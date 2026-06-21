import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    username: string
    role: string
  }
  interface Session {
    user: {
      id: string
      role: string
      name: string
      username: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
