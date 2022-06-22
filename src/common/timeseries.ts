import { BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { CurrentDYDXPrice, HourlydYdXTokenExchangeRate } from "../../generated/schema";
import { HARDCODED_ID } from "../helpers";

function createHourlyId(timestamp: i32): string {
  const uniqueHourIndex = timestamp / 3600;
  return (uniqueHourIndex * 3600).toString();
}

export function updateHourlydYdXTokenExchangeRate(block: ethereum.Block, dydxPriceUsd: BigDecimal): void {
  const timestamp = block.timestamp.toI32();
  const id = createHourlyId(timestamp);
  const roundedTimestamp = (timestamp / 3600) * 3600;

  let entity = HourlydYdXTokenExchangeRate.load(id);
  let price = CurrentDYDXPrice.load(HARDCODED_ID);

  if (entity == null) {
    entity = new HourlydYdXTokenExchangeRate(id);
  }

  if (price == null) {
    price = new CurrentDYDXPrice(HARDCODED_ID);
  }

  entity.timestamp = roundedTimestamp;
  entity.blockNumber = block.number.toI32();
  entity.exchangeRateUSDC = dydxPriceUsd;

  price.value = dydxPriceUsd;

  entity.save();
  price.save();
}
  