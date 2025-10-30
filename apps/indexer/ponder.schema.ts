import {
  count,
  onchainTable,
  onchainView,
  primaryKey,
  sql,
  sum,
} from "ponder";

export const agentIdentity = onchainTable(
  "agent_identity", (t) => ({
    chainId: t.bigint().notNull(),
    tokenId: t.bigint().notNull(),
    ownerAddress: t.hex().notNull(),
    tokenUri: t.text(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.chainId, table.tokenId] }) })
);

export const agentMetadata = onchainTable(
  "agent_identity_metadata", (t) => ({
    chainId: t.bigint().notNull(),
    tokenId: t.bigint().notNull(),
    key: t.text().notNull(),
    value: t.text().notNull(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.chainId, table.tokenId, table.key] }) })
);

export const agentOwnerLeaderboard = onchainView("agent_owner_leaderboard").as((qb) =>
  qb
    .select({
      ownerAddress: agentIdentity.ownerAddress,
      // totalAgent: count().as("total_agent"),
    })
    .from(agentIdentity)
    .groupBy(agentIdentity.ownerAddress)
);

export const transferEvent = onchainTable("transfer_event", (t) => ({
  id: t.text().primaryKey(),
  amount: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
}));
 
export const hourlyBucket = onchainView("hourly_bucket").as((qb) =>
  qb
    .select({
      hour: sql`FLOOR(${transferEvent.timestamp} / 3600) * 3600`.as("hour"),
      totalVolume: sum(transferEvent.amount).as("total_volume"),
      transferCount: count().as("transfer_count"),
    })
    .from(transferEvent)
    .groupBy(sql`FLOOR(${transferEvent.timestamp} / 3600)`)
);
