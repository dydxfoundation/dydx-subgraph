import { RewardsClaimed } from "../generated/MerkleDistributor/MerkleDistributor"
import { handleClaimRewards, IncentivesModule } from "./rewards";

export function handleMerkleDistributorClaimRewards(event: RewardsClaimed): void {
  handleClaimRewards(
    event.params.account,
    IncentivesModule.MerkleDistributor,
    event.block.timestamp,
    event.params.amount,
  )
}
