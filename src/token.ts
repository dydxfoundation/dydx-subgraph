import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer,
  DelegatedPowerChanged,
} from "../generated/DydxToken/DydxToken"
import {
  ADDRESS_ZERO,
  COMMUNITY_TREASURY_CONTRACT_ADDRESS,
  changeUserTokenBalance,
  saveCommunityTreasuryTransaction,
} from './helpers';
import { handleDelegation, DYDXTokenType } from "./delegate";

export function handleTokenTransfer(event: Transfer): void {
  let from: Address = event.params.from;
  let to: Address = event.params.to;
  if (from == to) {
    // ignore self-transfers
    return
  }

  let amount = event.params.value;
  if (from.toHexString() != ADDRESS_ZERO) {
    // don't subtract from zero address on mints
    changeUserTokenBalance(from, amount, false)
  }

  changeUserTokenBalance(to, amount, true)

  if (from == Address.fromString(COMMUNITY_TREASURY_CONTRACT_ADDRESS)) {
    saveCommunityTreasuryTransaction(
      to,
      amount,
      event.transaction.hash,
      event.block.timestamp,
      event.block.number,
      event.block.hash
    );
  }
}

export function handleTokenDelegation(event: DelegatedPowerChanged): void {
  handleDelegation(event.params.user, event.params.amount, event.params.delegationType, DYDXTokenType.Token)
}
