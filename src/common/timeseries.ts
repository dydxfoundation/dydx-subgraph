import { BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { HourlydYdXTokenExchangeRate } from "../../generated/schema";

function createHourlyId(timestamp: i32): string {
  const uniqueHourIndex = timestamp / 3600;
  return (uniqueHourIndex * 3600).toString();
}

export function updateHourlydYdXTokenExchangeRate(block: ethereum.Block, dydxPriceUsd: BigDecimal): void {
  const timestamp = block.timestamp.toI32();
  const id = createHourlyId(timestamp);
  const roundedTimestamp = (timestamp / 3600) * 3600;

  let entity = HourlydYdXTokenExchangeRate.load(id);

  if (entity == null) {
    entity = new HourlydYdXTokenExchangeRate(id);
  }

  entity.timestamp = roundedTimestamp;
  entity.blockNumber = block.number.toI32();
  entity.exchangeRateUSDC = dydxPriceUsd;

  entity.save();
}
  