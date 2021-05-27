import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { getUser } from "./helpers";
import { User } from "../generated/schema"

export function handleDelegation(userAddress: Address, amount: BigInt, delegationType: i32): void {
  let user: User = getUser(userAddress)

  if (delegationType == 0) {
    // Voting power
    let votingPowerDiff: BigInt = amount.minus(user.delegatedVotingPower)
    user.delegatedVotingPower = user.delegatedVotingPower.plus(votingPowerDiff)
    user.votingPower = user.votingPower.plus(votingPowerDiff)
  } else if (delegationType == 1) {
    // Proposition power
    let proposingPowerDiff: BigInt = amount.minus(user.delegatedProposingPower)
    user.delegatedProposingPower = user.delegatedProposingPower.plus(proposingPowerDiff)
    user.proposingPower = user.proposingPower.plus(proposingPowerDiff)
  } else {
    // Unknown option
    log.error("Unknown delegation type", [delegationType.toString()])
    return
  }

  user.save()
}
