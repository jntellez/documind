import pg from "../db";
import { requestAiGatewayEmbeddings } from "../services/aiGateway.service";

function toVectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

async function main() {
  const rows = (await pg`
    SELECT id, content
    FROM document_chunks
    WHERE embedding IS NULL
    ORDER BY id ASC
  `) as Array<{ id: number | string; content: string }>;

  if (rows.length === 0) {
    console.log("No chunks pending embedding backfill.");
    return;
  }

  let updated = 0;

  for (const row of rows) {
    try {
      const response = await requestAiGatewayEmbeddings({
        input: row.content,
        metadata: {
          source: "documind-backfill-chunk-embeddings",
          chunkId: Number(row.id),
        },
      });

      const embedding = response.data.embeddings.find((entry) => entry.index === 0)?.vector;

      if (!Array.isArray(embedding) || embedding.length === 0) {
        continue;
      }

      await pg`
        UPDATE document_chunks
        SET embedding = ${toVectorLiteral(embedding)}::vector,
            updated_at = NOW()
        WHERE id = ${Number(row.id)}
      `;

      updated += 1;
    } catch (error) {
      console.warn(`Failed to embed chunk ${row.id}. Skipping.`, error);
    }
  }

  console.log(`Backfill complete. Updated ${updated}/${rows.length} chunks.`);
}

main()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await pg.close();
  });
