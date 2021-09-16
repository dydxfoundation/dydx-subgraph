import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer,
  DelegatedPowerChanged,
  ClaimedRewards,
} from "../generated/SafetyModule/SafetyModule"
import { ADDRESS_ZERO, changeUserStakedTokenBalance } from "./helpers";
import { handleDelegation, DYDXTokenType } from "./delegate";
import { handleClaimRewards } from "./rewards";

export function handleSafetyModuleTransfer(event: Transfer): void {
  let from: Address = event.params.from;
  let to: Address = event.params.to;
  if (from == to) {
    // ignore self-transfers
    return
  }

  let amount = event.params.value;
  if (from.toHexString() != ADDRESS_ZERO) {
    // don't subtract from zero address on mints
    changeUserStakedTokenBalance(from, amount, false)
  }

  if (to.toHexString() != ADDRESS_ZERO) {
    // don't subtract from zero address on burns 
    changeUserStakedTokenBalance(to, amount, true)
  }
}

export function handleSafetyModuleDelegation(event: DelegatedPowerChanged): void {
  handleDelegation(event.params.user, event.params.amount, event.params.delegationType, DYDXTokenType.StakedToken)
}

export function handleSafetyModuleClaimRewards(event: ClaimedRewards): void {
  handleClaimRewards(
    event.params.recipient,
    'SafetyModule',
    event.block.timestamp,
    event.params.claimedRewards,
  )
}
