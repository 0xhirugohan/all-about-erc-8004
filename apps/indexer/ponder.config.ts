import { createConfig } from "ponder";

import { IdentityRegistryAbi } from "./abis/IdentityRegistryAbi";

export default createConfig({
  chains: {
    sepolia: {
      id: 11155111,
      rpc: process.env.PONDER_SEPOLIA_RPC_URL!,
    },
  },
  contracts: {
    IdentityRegistry: {
      chain: "sepolia",
      abi: IdentityRegistryAbi,
      address: "0x8004a6090Cd10A7288092483047B097295Fb8847",
      // startBlock: 9420230, // testnet
      startBlock: 9499890, // dev
    },
  },
});
