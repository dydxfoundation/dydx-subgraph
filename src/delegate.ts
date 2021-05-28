import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { getUser } from "./helpers";
import { User } from "../generated/schema"

export enum TokenType {
  Token,
  StakedToken,
}

export function handleDelegation(userAddress: Address, amount: BigInt, delegationType: i32, tokenType: TokenType): void {
  let user: User = getUser(userAddress)

  let diff: BigInt;
  if (delegationType == 0) {
    // Voting power was delegated
    if (tokenType == TokenType.Token) {
      diff = amount.minus(user.tokenVotingPower)
      user.tokenVotingPower = amount
    } else if (tokenType == TokenType.StakedToken) {
      diff = amount.minus(user.stakedTokenVotingPower)
      user.stakedTokenVotingPower = amount
    } else {
      // Unknown option
      log.error("Unknown token type", [tokenType.toString()])
      return
    }
    // votingPower is combination of both staked + regular token voting power
    user.votingPower = user.votingPower.minus(diff)
  } else if (delegationType == 1) {
    // Proposition power was delegated
    if (tokenType == TokenType.Token) {
      diff = amount.minus(user.tokenProposingPower)
      user.tokenProposingPower = amount
    } else if (tokenType == TokenType.StakedToken) {
      diff = amount.minus(user.stakedTokenProposingPower)
      user.stakedTokenProposingPower = amount
    } else {
      // Unknown option
      log.error("Unknown token type", [tokenType.toString()])
      return
    }
    // proposingPower is combination of both staked + regular token voting power
    user.proposingPower = user.proposingPower.minus(diff)
  } else {
    // Unknown option
    log.error("Unknown delegation type", [delegationType.toString()])
    return
  }

  user.save()
}
