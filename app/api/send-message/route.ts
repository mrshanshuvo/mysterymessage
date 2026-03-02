import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(req: Request) {
  await dbConnect();

  const body = await req.json();
  const { username, content } = body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // is user accepting messages?
    if (!user.isAcceptingMessage) {
      return Response.json(
        { success: false, message: "User is not accepting messages" },
        { status: 400 },
      );
    }

    const mewMessage = {
      content,
      createdAt: new Date(),
    };

    user.messages.push(mewMessage as Message);
    await user.save();

    return Response.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Failed to send message", error);
    return Response.json(
      { success: false, message: "Failed to send message" },
      { status: 500 },
    );
  }
}
