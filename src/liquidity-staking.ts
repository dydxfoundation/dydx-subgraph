import { ClaimedRewards } from "../generated/LiquidityStaking/LiquidityStaking"
import { handleClaimRewards, IncentivesModule } from "./rewards";

export function handleLiquidityStakingClaimedRewards(event: ClaimedRewards): void {
  handleClaimRewards(
    event.params.recipient,
    IncentivesModule.LiquidityStaking,
    event.block.timestamp,
    event.params.claimedRewards,
  )
}
