import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { getUser, getUserReward } from "./helpers";
import { User, UserReward } from "../generated/schema"

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
  let UserReward: UserReward = getUserReward(
    userAddress,
    incentivesModule,
    claimTimestamp,
  )

  UserReward.user = getUser(userAddress).id
  UserReward.incentivesModule = incentivesModule.toString()
  UserReward.claimTimestamp = claimTimestamp
  UserReward.rewards = rewards

  UserReward.save()
}
