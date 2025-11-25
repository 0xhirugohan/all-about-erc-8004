import { type Context, type Event } from "ponder:registry";
import { feed } from "ponder:schema";

const feedHandler = (
  context: Context,
  event: Event,
  eventType: string,
  description: string,
  tokenId: bigint,
  owner: `0x${string}`,
  blockNumber: bigint,
) => {
  const timestamp = event.block.timestamp;
  const date = new Date(Number(timestamp));
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return context.db
    .insert(feed)
    .values({
      id: event.id,
      chainId: BigInt(context.chain.id),
      chainName: context.chain.name,
      agentId: tokenId,
      eventType,   
      description,
      date: formattedDate,
      createdBy: owner,
      createdAt: event.block.timestamp,
      blockNumber: blockNumber,
    });
};

export default feedHandler;
