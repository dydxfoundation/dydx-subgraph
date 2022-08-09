import { Address } from "@graphprotocol/graph-ts";
import {Transfer} from "../generated/UsdcToken/UsdcToken"
import { COMMUNITY_TREASURY_2_CONTRACT_ADDRESS, COMMUNITY_TREASURY_CONTRACT_ADDRESS, GRANTS_TREASURY_CONTRACT_ADDRESS, saveCommunityTreasuryTransaction, saveGrantsProgramTreasuryTransaction, saveUsdcBalances } from "./helpers";

export function handleUsdcTokenTransfer(event: Transfer): void {
  let from: Address = event.params.from;
  let to: Address = event.params.to;

  if (from.equals(to)) {
    // ignore self-transfers
    return;
  }

  const amount = event.params.value;

  saveUsdcBalances(to, from, amount, event.transaction.hash, event.block.timestamp);

  if (
    from.equals(COMMUNITY_TREASURY_CONTRACT_ADDRESS) ||
    from.equals(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS) ||
    to.equals(COMMUNITY_TREASURY_CONTRACT_ADDRESS) ||
    to.equals(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS)
  ) {
    saveCommunityTreasuryTransaction(
      to,
      from,
      amount,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.block.hash,
      event.transaction.hash,
      'usdc'
    );
  }

  if (
    from.equals(GRANTS_TREASURY_CONTRACT_ADDRESS) ||
    to.equals(GRANTS_TREASURY_CONTRACT_ADDRESS)
  ) {
    saveGrantsProgramTreasuryTransaction(
      to,
      from,
      amount,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.block.hash,
      event.transaction.hash,
      'usdc'
    );
  }
}