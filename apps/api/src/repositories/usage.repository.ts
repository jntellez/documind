import pg from "../db";

type UsageType = "processing" | "chat";

export async function incrementUsage(
  tx: any,
  {
    userId,
    ip,
    type,
  }: {
    userId?: number;
    ip: string;
    type: UsageType;
  },
) {
  if (userId) {
    return tx`
      INSERT INTO usage_tracking (user_id, usage_type, date, count)
      VALUES (${userId}, ${type}, CURRENT_DATE, 1)
      ON CONFLICT (user_id, usage_type, date)
      DO UPDATE SET count = usage_tracking.count + 1
      RETURNING count
    `;
  }

  return tx`
    INSERT INTO usage_tracking (ip_address, usage_type, date, count)
    VALUES (${ip}, ${type}, CURRENT_DATE, 1)
    ON CONFLICT (ip_address, usage_type, date)
    DO UPDATE SET count = usage_tracking.count + 1
    RETURNING count
  `;
}

export async function getUsageCount(
  tx: any,
  {
    userId,
    ip,
    type,
    date,
  }: {
    userId?: number;
    ip: string;
    type: UsageType;
    date: string;
  },
) {
  if (userId) {
    const rows = await tx`
      SELECT count FROM usage_tracking
      WHERE user_id = ${userId} AND usage_type = ${type} AND date = ${date}
    `;
    return rows.length > 0 ? (rows[0] as { count: number }).count : 0;
  }

  const rows = await tx`
    SELECT count FROM usage_tracking
    WHERE ip_address = ${ip} AND usage_type = ${type} AND date = ${date}
  `;
  return rows.length > 0 ? (rows[0] as { count: number }).count : 0;
}

export async function getDocumentCount(
  tx: any,
  { userId }: { userId: number },
) {
  const rows = await tx`
    SELECT COUNT(*) as count FROM documents WHERE user_id = ${userId}
  `;
  return Number((rows[0] as { count: string | number }).count);
}
