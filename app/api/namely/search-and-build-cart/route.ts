import { z } from "zod";
import { matchItems } from "@/lib/namely";

const RequestSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    source: z.enum(["voice", "manual"])
  })).min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.parse(body);
    const matches = matchItems(parsed.items);
    return Response.json({ ok: true, matches });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Bad request" }, { status: 400 });
  }
}
