import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer,
  DelegatedPowerChanged,
} from "../generated/Token/Token"
import { ADDRESS_ZERO, changeUserTokenBalance } from "./helpers";
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
}

export function handleTokenDelegation(event: DelegatedPowerChanged): void {
  handleDelegation(event.params.user, event.params.amount, event.params.delegationType, DYDXTokenType.Token)
}
