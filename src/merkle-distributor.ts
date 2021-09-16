import { RewardsClaimed } from "../generated/MerkleDistributor/MerkleDistributor"
import { handleClaimRewards } from "./rewards";

export function handleMerkleDistributorClaimRewards(event: RewardsClaimed): void {
  handleClaimRewards(
    event.params.account,
    'MerkleDistributor',
    event.block.timestamp,
    event.params.amount,
  )
}
