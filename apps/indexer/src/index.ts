import { ponder } from "ponder:registry";
import { agentIdentity, agentMetadata } from "ponder:schema";

ponder.on("IdentityRegistry:Registered", async ({ event, context }) => {
  await context.db
    .insert(agentIdentity)
    .values({
      chainId: context.chain.id,
      tokenId: event.args.agentId,
      ownerAddress: event.args.owner,
      tokenUri: event.args.tokenURI,
    })
})

ponder.on("IdentityRegistry:MetadataSet", async ({ event, context }) => {
  // if key exist, update. else insert
  await context.db
    .insert(agentMetadata)
    .values({
      chainId: context.chain.id,
      tokenId: event.args.agentId,
      key: event.args.key,
      value: event.args.value,
    })
    .onConflictDoUpdate({
      value: event.args.value,
    });
})

ponder.on("IdentityRegistry:UriUpdated", async ({ event, context }) => {
  await context.db
    .update(
      agentIdentity,
      {
        chainId: context.chain.id,
	tokenId: event.args.agentId,
      }
    )
    .set({
      tokenUri: event.args.newUri,
    })
})
