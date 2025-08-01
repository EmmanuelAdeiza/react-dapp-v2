import { JsonRpcRequest } from "@walletconnect/jsonrpc-utils";

import {
  NamespaceMetadata,
  ChainMetadata,
  ChainRequestRender,
  ChainsMap,
} from "../helpers";

export const PartisiaChainData: ChainsMap = {
  Partisia_Blockchain: {
    name: "Partisia Mainnet",
    id: "partisia:Partisia_Blockchain",
    rpc: ["https://rpc.partisia.io"],
    slip44: 60,
    testnet: false,
  },
};

export const PartisiaMetadata: NamespaceMetadata = {
  Partisia_Blockchain: {
    logo: "https://raw.githubusercontent.com/partisiablockchain/logo/main/partisia.svg",
    rgb: "255, 153, 0", // Orange brand colour
  },
};

export function getChainMetadata(chainId: string): ChainMetadata {
  const reference = chainId.split(":")[1];
  const metadata = PartisiaMetadata[reference as keyof typeof PartisiaMetadata];
  if (typeof metadata === "undefined") {
    throw new Error(`No chain metadata found for chainId: ${chainId}`);
  }
  return metadata;
}

export function getChainRequestRender(
  request: JsonRpcRequest
): ChainRequestRender[] {
  return [
    { label: "Method", value: request.method },
    {
      label: "params",
      value: JSON.stringify(request.params, null, "\t"),
    },
  ];
}