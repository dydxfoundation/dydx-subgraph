import { Address } from "@graphprotocol/graph-ts"
import {
  Claimed,
} from "../generated/CumulativeMerkleDistributor/CumulativeMerkleDistributor"
import { User } from "../generated/schema"
import { getUser } from "./helpers";

export function handleClaimed(event: Claimed): void {
  let userEthereumAddress: Address = event.params.account;
  let user: User = getUser(userEthereumAddress)

  user.totalRewardsClaimed = user.totalRewardsClaimed.plus(event.params.cumulativeAmount);
  user.totalTokens = user.totalTokens.plus(event.params.cumulativeAmount);

  user.save()
}
