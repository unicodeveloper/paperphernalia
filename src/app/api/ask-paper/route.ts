import { z } from "zod";
import { askPaper } from "@/lib/paper";
import { SOURCE_IDS } from "@/lib/sources";

const body = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(400),
  source: z.enum(SOURCE_IDS),
  question: z.string().trim().min(3).max(500),
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid question." }, { status: 400 });
  const { url, title, source, question } = parsed.data;
  const answer = await askPaper(url, title, source, question);
  if (!answer) return Response.json({ error: "Valyu couldn’t read this paper just now." }, { status: 502 });
  return Response.json({ answer });
}
