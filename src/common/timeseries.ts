import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { CurrentDYDXPrice, HourlydYdXTokenExchangeRate } from "../../generated/schema";
import { HARDCODED_ID } from "../helpers";
import { getdYdXPriceUsd } from "./pricing";

function createHourlyId(timestamp: i32): string {
  const uniqueHourIndex = timestamp / 3600;
  return (uniqueHourIndex * 3600).toString();
}

export function updateHourlydYdXTokenExchangeRate(block: ethereum.Block): void {
  // Block at which ETH/DYDX uniswap v3 pool was created
  // https://etherscan.io/tx/0x97960e665d758e9fd6bfd9efd9e90de5d3665b165ff5f14960602aa792f2ac2f
  if (block.number.lt(BigInt.fromI32(13181841 + 1))) { 
    return;
  }

  const timestamp = block.timestamp.toI32();
  const id = createHourlyId(timestamp);
  const dydxPriceUsd = getdYdXPriceUsd();
  const roundedTimestamp = (timestamp / 3600) * 3600;

  let entity = HourlydYdXTokenExchangeRate.load(id);
  let price = CurrentDYDXPrice.load(HARDCODED_ID);

  if (!entity) {
    entity = new HourlydYdXTokenExchangeRate(id);
  }

  if (!price) {
    price = new CurrentDYDXPrice(HARDCODED_ID);
  }

  entity.timestamp = roundedTimestamp;
  entity.blockNumber = block.number.toI32();
  entity.exchangeRateUSDC = dydxPriceUsd;

  price.value = dydxPriceUsd;

  entity.save();
  price.save();
}
  