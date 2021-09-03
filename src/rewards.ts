import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { getUser, getUserClaimedRewards } from "./helpers";
import { User, UserClaimedRewards } from "../generated/schema"

export enum IncentivesModule {
  MerkleDistributor,
  SafetyModule,
  LiquidityStaking,
}

export function handleClaimRewards(
  userAddress: Address,
  incentivesModule: IncentivesModule,
  claimTimestamp: BigInt,
  rewards: BigInt,
): void {
  let userClaimedRewards: UserClaimedRewards = getUserClaimedRewards(
    userAddress,
    incentivesModule,
    claimTimestamp,
  )

  userClaimedRewards.user = getUser(userAddress).id
  userClaimedRewards.incentivesModule = incentivesModule.toString()
  userClaimedRewards.claimTimestamp = claimTimestamp
  userClaimedRewards.rewards = rewards

  userClaimedRewards.save()
}
