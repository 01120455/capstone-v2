import { NextRequest, NextResponse } from "next/server";
import { DELETE as deleteItemHandler } from "../../purchase/route"; 

export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemid: string } }
) {
  const itemid = parseInt(params.itemid, 10);

  if (isNaN(itemid)) {
    return NextResponse.json({ error: "Invalid Item ID" }, { status: 400 });
  }

  const modifiedReq = new NextRequest(new URL(req.url), {
    method: "DELETE",
    body: JSON.stringify({ itemid }),
  });

  return deleteItemHandler(modifiedReq);
}
