import { ponder } from "ponder:registry";
import { agentIdentity, agentMetadata, feed } from "ponder:schema";

ponder.on("IdentityRegistry:Registered", async ({ event, context }) => {
  try {
    const timestamp = event.block.timestamp;
    const date = new Date(Number(timestamp));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const insertAgentIdentity = context.db
      .insert(agentIdentity)
      .values({
        chainId: context.chain.id,
        tokenId: event.args.agentId,
        ownerAddress: event.args.owner,
        tokenUri: event.args.tokenURI,
      });
     const insertFeed = context.db
       .insert(feed)
       .values({
	 id: event.id,
         chainId: context.chain.id,
	 chainName: context.chain.name,
         agentId: event.args.agentId,
         eventType: "IdentityRegistry:Registered",
	 description: `Agent#${event.args.agentId} just registered on ${context.chain.name}`,
	 date: formattedDate,
	 createdBy: event.args.owner,
	 createdAt: event.block.timestamp,
	 blockNumber: event.log.blockNumber,
       });

     await Promise.all([
       insertAgentIdentity,
       insertFeed,
     ]);
  } catch (err) {
    console.log("IdentityRegistry:Registered error");
    console.log({ err });
  }
})

ponder.on("IdentityRegistry:MetadataSet", async ({ event, context }) => {
  try {
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
  } catch (err) {
    console.log("IdentityRegistry:MetadataSet error");
    console.log({ err });
  }
})

// when UriUpdated emited, we try to fetch the metadata from the IPFS or HTTP
ponder.on("IdentityRegistry:UriUpdated", async ({ event, context }) => {
  try {
    let metaData = null;

    // fetch metadata and store it to database
    // check if its ipfs or http/https
    let url = "";
    const ipfsFormat = "ipfs://";
    if (event.args.newUri.startsWith(ipfsFormat)) {
      const IPFS_PUBLIC_GATEWAY_URL = "https://ipfs.io/ipfs/";
      url = IPFS_PUBLIC_GATEWAY_URL + event.args.newUri.substring(ipfsFormat.length);
    } else if (
      event.args.newUri.startsWith("http://") || event.args.newUri.startsWith("https://")
    ) {
      // basically if url doesn't start with ipfs, http, or https, we throw them away
      url = event.args.newUri;
    }

    if (url) {
      const metaResponse = await fetch(url);
      // if tokenURI is reachable, we update the metaData value
      if (metaResponse.ok) {
        metaData = await metaResponse.json();
      }
    }

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
	tokenMetadata: metaData,
      });
  } catch (err) {
    console.log("IdentityRegistry:UriUpdated error");
    console.log({ err });
  }
})
