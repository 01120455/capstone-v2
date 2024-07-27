
// import { getIronSession } from 'iron-session';
// import { sessionOptions, SessionData, defaultSession } from '@/lib/session';
// import { cookies } from 'next/headers';
// import { compare } from "bcrypt";
// import { loginSchema } from "@/schemas/User.schema";
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const getSession = async () => {
//   "use server";
//   const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
//   if(!session.isLoggedIn) {
//     session.isLoggedIn = defaultSession.isLoggedIn;
//   }

//   return session;
// };

// export const POST = async (req: NextRequest) => {
//   const session = await getSession();
//   try {
//     const { username, password } = loginSchema.parse(await req.json());
//     const usernames = await prisma.user.findUnique({
//       where: {
//         username,
//       },
//     });
//     if (!usernames) {
//       return new Response(
//         JSON.stringify({ message: "Invalid username or password" }),
//         {
//           status: 400,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     }

//     const passwordMatch = await compare(password, usernames.password);
//     if (!passwordMatch) {
//       return new Response(
//         JSON.stringify({ message: "Invalid username or password" }),
//         {
//           status: 400,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     }

//     session.isLoggedIn = true;
//     session.userid = usernames.userid;
//     session.username = usernames.username;
//     session.firstname = usernames.firstname;
//     session.lastname = usernames.lastname;
//     session.role = usernames.role;
//     session.status = usernames.status
//     await session.save();
//     return new Response(JSON.stringify({ message: "Login successful" }), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     return new Response(
//       JSON.stringify({ message: "Invalid username or password" }),
//       {
//         status: 400,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }
// };