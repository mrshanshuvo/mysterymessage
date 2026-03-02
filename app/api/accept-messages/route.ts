import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  const userId = user._id.toString();
  const { acceptingMessage } = await req.json();

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      userId,
      { isAcceptingMessage: acceptingMessage },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "Failed to update user" },
        { status: 404 },
      );
    }

    return Response.json(
      { success: true, message: "Message accepted", user },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error accepting message:", error);
    return Response.json(
      { success: false, message: "Failed to accept message" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  const userId = user._id.toString();

  try {
    const foundUser = await UserModel.findOneAndUpdate(userId);

    if (!foundUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return Response.json(
      { success: true, message: "User found", user: foundUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error is getting message acceptance status" },
      { status: 500 },
    );
  }
}
