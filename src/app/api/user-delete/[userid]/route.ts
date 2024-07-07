import { NextRequest, NextResponse } from "next/server";
import { DELETE as deleteUserHandler } from "../../user/route"; // Adjust the path if necessary

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userid: string } }
) {
  const userid = parseInt(params.userid, 10);

  if (isNaN(userid)) {
    return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
  }

  const modifiedReq = new NextRequest(new URL(req.url), {
    method: "DELETE",
    body: JSON.stringify({ userid }),
  });

  return deleteUserHandler(modifiedReq);
}
