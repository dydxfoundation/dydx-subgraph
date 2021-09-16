import { ClaimedRewards } from "../generated/LiquidityStaking/LiquidityStaking"
import { handleClaimRewards } from "./rewards";

export function handleLiquidityStakingClaimedRewards(event: ClaimedRewards): void {
  handleClaimRewards(
    event.params.recipient,
    'LiquidityStaking',
    event.block.timestamp,
    event.params.claimedRewards,
  )
}
