import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const BIGINT_ZERO = BigInt.fromI32(0);

export const USDC_WETH_03_ADDRESS = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8";
export const DYDX_ETH_03_ADDRESS = "0xd8de6af55f618a7bc69835d55ddc6582220c36c0";

export const UNISWAP_Q192 = BigDecimal.fromString(
  BigInt.fromI32(2)
    .pow(192)
    .toString()
);
