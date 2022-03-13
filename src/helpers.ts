import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  CommunityTreasuryTransaction,
  User,
  Proposal,
  ProposalVote,
  RewardsClaimed,
} from '../generated/schema';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// Address on mainnet for dYdX community treasury, which doesn't have an equivalent on other networks.
export const COMMUNITY_TREASURY_CONTRACT_ADDRESS =
         '0xe710ced57456d3a16152c32835b5fb4e72d9ea5b';

type ProposalVoteId = string

type RewardsClaimedId = string

export function getUser(address: Address): User {
  let user = User.load(address.toHexString())
  if (!user) {
    user = new User(address.toHexString())
    user.totalTokens = BigInt.fromI32(0)
    user.totalStakedTokens = BigInt.fromI32(0)
    user.votingPower = BigInt.fromI32(0)
    user.proposingPower = BigInt.fromI32(0)
    user.tokenVotingPower = BigInt.fromI32(0)
    user.tokenProposingPower = BigInt.fromI32(0)
    user.stakedTokenVotingPower = BigInt.fromI32(0)
    user.stakedTokenProposingPower = BigInt.fromI32(0)
  }

  return user;
}

export function getProposal(proposalId: BigInt): Proposal {
  let proposal = Proposal.load(proposalId.toString())
  if (!proposal) {
    proposal = new Proposal(proposalId.toString())
  }

  return proposal;
}

export function getProposalVote(proposalId: BigInt, userAddress: Address): ProposalVote {
  let proposalVoteId: ProposalVoteId = getProposalVoteId(proposalId, userAddress)
  let proposalVote = ProposalVote.load(proposalVoteId)
  if (!proposalVote) {
    proposalVote = new ProposalVote(proposalVoteId)
  }

  return proposalVote;
}

function getProposalVoteId(proposalId: BigInt, userAddress: Address): ProposalVoteId {
  return proposalId.toString() + "-" + userAddress.toHexString()
}

export function getRewardsClaimed(
  userAddress: Address,
  incentivesModule: String,
  claimTimestamp: BigInt,
): RewardsClaimed {
  let userRewardId: RewardsClaimedId = getRewardsClaimedId(
    userAddress,
    incentivesModule,
    claimTimestamp,
  )
  let userReward = RewardsClaimed.load(userRewardId)
  if (!userReward) {
    userReward = new RewardsClaimed(userRewardId)
  }

  return userReward;
}

function getRewardsClaimedId(
  userAddress: Address,
  incentivesModule: String,
  claimTimestamp: BigInt,
): RewardsClaimedId {
  return userAddress.toHexString() + "-" + incentivesModule + "-" + claimTimestamp.toString()
}

export function changeUserTokenBalance(address: Address, amount: BigInt, add: boolean): void {
  let user: User = getUser(address)

  if (add) {
    user.totalTokens = user.totalTokens.plus(amount)
  } else {
    user.totalTokens = user.totalTokens.minus(amount)
  }

  user.save()
}

export function changeUserStakedTokenBalance(address: Address, amount: BigInt, add: boolean): void {
  let user: User = getUser(address)

  if (add) {
    user.totalStakedTokens = user.totalStakedTokens.plus(amount)
  } else {
    user.totalStakedTokens = user.totalStakedTokens.minus(amount)
  }

  user.save()
}

export function saveCommunityTreasuryTransaction(
         to: Address,
         amount: BigInt,
         txHash: Bytes,
         timestamp: BigInt,
         blockNumber: BigInt,
         blockHash: Bytes
       ): void {
  const txHashString = txHash.toHexString();
  let tx: CommunityTreasuryTransaction | null =
    CommunityTreasuryTransaction.load(txHashString)
  if (!tx) {
    tx = new CommunityTreasuryTransaction(txHashString)
  }
  tx.to = to.toHexString();
  tx.amount = amount;
  tx.timestamp = timestamp;
  tx.blockNumber = blockNumber;
  tx.blockHash = blockHash;

  tx.save();
}
