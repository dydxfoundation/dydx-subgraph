import { Address, BigInt } from "@graphprotocol/graph-ts"
import { getUser, getUserReward } from "./helpers";
import { UserReward } from "../generated/schema"

export function handleClaimRewards(
  userAddress: Address,
  incentivesModule: string,
  claimTimestamp: BigInt,
  rewards: BigInt,
): void {
  let UserReward: UserReward = getUserReward(
    userAddress,
    incentivesModule,
    claimTimestamp,
  )

  UserReward.user = getUser(userAddress).id
  UserReward.incentivesModule = incentivesModule
  UserReward.claimTimestamp = claimTimestamp
  UserReward.rewards = rewards

  UserReward.save()
}
