import { onchainTable, primaryKey } from "ponder";

export const agentIdentity = onchainTable(
  "agent_identity", (t) => ({
    chainId: t.integer().notNull(),
    tokenId: t.bigint().notNull(),
    ownerAddress: t.hex().notNull(),
    tokenUri: t.text(),
    tokenMetadata: t.json(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.chainId, table.tokenId] }) })
);

export const agentMetadata = onchainTable(
  "agent_identity_metadata", (t) => ({
    chainId: t.integer().notNull(),
    tokenId: t.bigint().notNull(),
    key: t.text().notNull(),
    value: t.text().notNull(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.chainId, table.tokenId, table.key] }) })
);

// pseudo

// global (unrelated to any entities)
// table: feeds
// columns
// id bigint autoincrement pk
// chainId integer => so we can filter feed by chain
// agentId integer => so we can filter by agentId, or we can go to agent profile
// eventType string => so we can filter by eventType
// description string => text to show in the frontend
// createdBy address => so we can filter by address, more accurate should be txBy
// createdAt timestamp or blockId => so we can sort by newest to oldest
// blockId bigint => so we can filter feed by block id, should be combined with chain id to make data relevant / make sense

// table: statistic_feed_by_blocks
// columns
// chainId integer => so we can filter feed by chain
// blockId bigint => so we can filter feed by block, we can sort by blockId as well
// amount integer => the number of feed in a single block in a certain feed
// createdBy timestamp => I think we still need timestamp so we know how to sort from multi chain
// PK (chainId, blockId) because there should not be multiplie entries from same blockId in a chain

// table: statistic_feed_by_date
// columns
// date day (unique to each day) => so we can filter by date
// amount integer => the number of feed in a certain date
// blockId bigint => so we can filter the amount by block
// eventType string => same as `feeds.eventType`, default `all`
// PK (date, eventType) because there should not be multiple

// entities
// table: agents
// columns
// chainId integer
// id (tokenId) bigint => the token id, should be unique on each chain
// owner address => so we can filter agents by owner
// tokenUri? string => the metadata url, optional
// registrationType? string => this might exist in the metadata
// name? string => from metadata
// description? string => from metadata
// image? string => from metadata
// metadata? json => we store it to show as is in the agent profile
// PK (chainId, id) => not possible to have duplicate entries

// table: agent_capabilities
// columns
// agentId bigint
// chainId integer
// name string
// endpoint? string
// capabilities? json
// version? string
// PK (agentId, chainId, name) => not possible to have duplicate entries

// table: agent_metadatas
// columns
// agentId bigint
// chainId integer
// key string
// value string
// PK(agentId, chainId)

// table: agent_feedbacks
// columns
// agentId bigint
// chainId integer
// index bigint => (as FK to response), increase 1 on each entry
// client address
// score integer
// tag1 string
// tag2 string
// uri string
// hash string
// createdAt datetime
// createdBy address
// revokedAt datetime
// revokedBy address
// PK (chainId, index)

// table: agent_feedback_responses
// columns
// id bigint (PK)
// agentId bigint
// chainId integer
// feedbackIndex bigint
// client address
// responder address
// uri string
// hash string
// createdAt datetime
// createdBy address

// table: agent_validation_requests
// columns
// id bigint (PK)
// agentId bigint
// chainId integer
// validator address
// uri string
// hash string
// createdBy address
// createdAt datetime

// table: agent_validation_responses
// columns
// id bigint (PK)
// agentId bigint
// chainId integer
// validator address
// requestHash string
// response integer
// uri string
// hash string
// tag string
