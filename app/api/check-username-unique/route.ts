import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import z from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    const parsed = UsernameQuerySchema.safeParse({ username });

    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Invalid username";

      return Response.json(
        {
          success: false,
          message: msg,
        },
        { status: 400 },
      );
    }

    // ✅ use validated value from Zod
    const usernameValue = parsed.data.username;

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username: usernameValue,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking username uniqueness:", error);

    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 },
    );
  }
}
