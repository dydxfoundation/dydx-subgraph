import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer,
} from "../generated/StakedToken/StakedToken"
import { ADDRESS_ZERO, changeUserStakedTokenBalance } from "./helpers";

export function handleStakedTokenTransfer(event: Transfer): void {
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
    changeUserStakedTokenBalance(from, amount, false)
  }
}
