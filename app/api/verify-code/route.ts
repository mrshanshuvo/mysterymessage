// app/api/verify-code/route.ts

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { username, code } = body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired =
      new Date(user.verifyCodeExpiry) > new Date(Date.now());

    if (isCodeValid && isCodeExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Username verified successfully",
        },
        { status: 200 },
      );
    } else if (!isCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error verifying username:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to verify username",
      },
      { status: 500 },
    );
  }
}
