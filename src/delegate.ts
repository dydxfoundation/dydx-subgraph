import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { getUser } from "./helpers";
import { User } from "../generated/schema"

export enum DYDXTokenType {
  Token,
  StakedToken,
}

enum DelegationType {
  VotingPower = 0,
  PropositionPower = 1,
}

export function handleDelegation(userAddress: Address, amount: BigInt, delegationType: i32, tokenType: DYDXTokenType): void {
  let user: User = getUser(userAddress)

  let diff: BigInt;
  if (delegationType == DelegationType.VotingPower) {
    // Voting power was delegated
    if (tokenType == DYDXTokenType.Token) {
      diff = amount.minus(user.tokenVotingPower)
      user.tokenVotingPower = amount
    } else if (tokenType == DYDXTokenType.StakedToken) {
      diff = amount.minus(user.stakedTokenVotingPower)
      user.stakedTokenVotingPower = amount
    } else {
      // Unknown option
      log.error("Unknown token type", [tokenType.toString()])
      return
    }
    // votingPower is combination of both staked + regular token voting power
    user.votingPower = user.votingPower.plus(diff)
  } else if (delegationType == DelegationType.PropositionPower) {
    // Proposition power was delegated
    if (tokenType == DYDXTokenType.Token) {
      diff = amount.minus(user.tokenProposingPower)
      user.tokenProposingPower = amount
    } else if (tokenType == DYDXTokenType.StakedToken) {
      diff = amount.minus(user.stakedTokenProposingPower)
      user.stakedTokenProposingPower = amount
    } else {
      // Unknown option
      log.error("Unknown token type", [tokenType.toString()])
      return
    }
    // proposingPower is combination of both staked + regular token voting power
    user.proposingPower = user.proposingPower.plus(diff)
  } else {
    // Unknown option
    log.error("Unknown delegation type", [delegationType.toString()])
    return
  }

  user.save()
}
