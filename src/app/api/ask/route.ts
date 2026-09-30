import { z } from "zod";
import { ALL_DATASETS, SOURCES, SOURCE_IDS } from "@/lib/sources";
import { valyu } from "@/lib/valyu";

const body = z.object({
  question: z.string().trim().min(3).max(600),
  sources: z.array(z.enum(SOURCE_IDS)).optional(),
});

/**
 * Ask the stacks: streams Valyu's Answer API as newline-delimited JSON so the
 * page can show sources the moment they're found and then the answer as it's written.
 */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please ask a longer question." }, { status: 400 });
  const { question, sources } = parsed.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        const res = await valyu().answer(question, {
          streaming: true,
          searchType: "proprietary",
          includedSources: sources?.length ? sources.map((s) => SOURCES[s].dataset) : ALL_DATASETS,
          systemInstructions:
            "You are a research librarian. Answer in 150-300 words of clear Markdown for a curious non-specialist. Cite sources inline as [1], [2] matching the order of the search results. Prefer recent and well-cited work, note disagreements, and end with one line on what is still unknown.",
        });
        if (!(Symbol.asyncIterator in res)) {
          if (res.success) {
            send({ type: "sources", sources: res.search_results });
            send({ type: "content", content: typeof res.contents === "string" ? res.contents : JSON.stringify(res.contents) });
          } else send({ type: "error", error: res.error });
        } else {
          for await (const chunk of res) {
            if (chunk.type === "search_results") send({ type: "sources", sources: chunk.search_results ?? [] });
            else if (chunk.type === "content" && chunk.content) send({ type: "content", content: chunk.content });
            else if (chunk.type === "metadata") send({ type: "meta", cost: chunk.cost?.total_deduction_dollars ?? null });
            else if (chunk.type === "error") send({ type: "error", error: chunk.error });
          }
        }
      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : "Answer failed" });
      } finally {
        send({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
