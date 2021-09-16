import { Address, BigInt } from "@graphprotocol/graph-ts"
import { getUser, getRewardsClaimed } from "./helpers";
import { RewardsClaimed } from "../generated/schema"

export function handleClaimRewards(
  userAddress: Address,
  incentivesModule: string,
  claimTimestamp: BigInt,
  rewards: BigInt,
): void {
  let RewardsClaimed: RewardsClaimed = getRewardsClaimed(
    userAddress,
    incentivesModule,
    claimTimestamp,
  )

  RewardsClaimed.user = getUser(userAddress).id
  RewardsClaimed.incentivesModule = incentivesModule
  RewardsClaimed.claimTimestamp = claimTimestamp
  RewardsClaimed.rewards = rewards

  RewardsClaimed.save()
}
