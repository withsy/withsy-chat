import { getAuthOptions } from "@/server/auth";
import NextAuth from "next-auth";

export default NextAuth(getAuthOptions());
