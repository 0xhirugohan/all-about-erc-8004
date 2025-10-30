import { onchainTable, primaryKey } from "ponder";

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
