import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  CommunityTreasuryTransaction,
  User,
  Proposal,
  ProposalVote,
  RewardsClaimed,
  GrantsProgramTreasuryTransaction,
  CommunityTreasuryHistoricalBalance,
  GrantsProgramTreasuryHistoricalBalance,
  CurrentDYDXPrice
} from '../generated/schema';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// Address on mainnet for dYdX community treasury, which doesn't have an equivalent on other networks.
export const COMMUNITY_TREASURY_CONTRACT_ADDRESS = '0xe710ced57456d3a16152c32835b5fb4e72d9ea5b';
export const COMMUNITY_TREASURY_2_CONTRACT_ADDRESS = '0x08a90fe0741b7def03fb290cc7b273f1855767d8';
export const GRANTS_TREASURY_CONTRACT_ADDRESS = '0xe710ced57456d3a16152c32835b5fb4e72d9ea5b';

export const HARDCODED_ID = 'dydx';

type ProposalVoteId = string

type RewardsClaimedId = string

export function getUser(address: Address): User {
  let user = User.load(address.toHexString());

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
         from: Address,
         amount: BigInt,
         txHash: Bytes,
         timestamp: BigInt,
         blockNumber: BigInt,
         blockHash: Bytes,
         transactionHash: Bytes
       ): void {
  const txHashString = txHash.toHexString();

  let tx: CommunityTreasuryTransaction | null =
    CommunityTreasuryTransaction.load(txHashString)

  if (!tx) {
    tx = new CommunityTreasuryTransaction(txHashString)
  }

  const dydxPriceUsd = getCurrentDYDXPrice();

  tx.to = to.toHexString();
  tx.from = from.toHexString();
  tx.amount = amount;
  tx.amountUSD = amount.toBigDecimal().times(dydxPriceUsd).div(BigDecimal.fromString('1e18'));
  tx.timestamp = timestamp;
  tx.blockNumber = blockNumber;
  tx.blockHash = blockHash;
  tx.transactionHash = transactionHash;

  tx.save();
}

export function saveGrantsProgramTreasuryTransaction(
  to: Address,
  from: Address,
  amount: BigInt,
  txHash: Bytes,
  timestamp: BigInt,
  blockNumber: BigInt,
  blockHash: Bytes,
  transactionHash: Bytes
): void {
  const txHashString = txHash.toHexString();

  let tx: GrantsProgramTreasuryTransaction | null =
    GrantsProgramTreasuryTransaction.load(txHashString)

  if (!tx) {
    tx = new GrantsProgramTreasuryTransaction(txHashString)
  }

  const dydxPriceUsd = getCurrentDYDXPrice();

  tx.to = to.toHexString();
  tx.from = from.toHexString();
  tx.amount = amount;
  tx.amountUSD = amount.toBigDecimal().times(dydxPriceUsd).div(BigDecimal.fromString('1e18'));
  tx.timestamp = timestamp;
  tx.blockNumber = blockNumber;
  tx.blockHash = blockHash;
  tx.transactionHash = transactionHash;

  tx.save();
}

export function saveBalances(to: Address, from: Address, amount: BigInt, transactionHash: Bytes, timestamp: BigInt): void {
  const id = transactionHash.toString();
  let communityTreasuryHistoricalBalance = CommunityTreasuryHistoricalBalance.load(id);
  let grantsProgramTreasuryHistoricalBalance = GrantsProgramTreasuryHistoricalBalance.load(id);

  if (!communityTreasuryHistoricalBalance) {
    communityTreasuryHistoricalBalance = new CommunityTreasuryHistoricalBalance(id);
    communityTreasuryHistoricalBalance.balance = BigInt.fromI32(0);
  }

  if (!grantsProgramTreasuryHistoricalBalance) {
    grantsProgramTreasuryHistoricalBalance = new GrantsProgramTreasuryHistoricalBalance(id);
    grantsProgramTreasuryHistoricalBalance.balance = BigInt.fromI32(0);
  }

  if (to == Address.fromString(COMMUNITY_TREASURY_CONTRACT_ADDRESS)
       || to == Address.fromString(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS)) {
    communityTreasuryHistoricalBalance.balance = communityTreasuryHistoricalBalance.balance.plus(amount);
  }

  if (to == Address.fromString(GRANTS_TREASURY_CONTRACT_ADDRESS)) {
    grantsProgramTreasuryHistoricalBalance.balance = grantsProgramTreasuryHistoricalBalance.balance.plus(amount);
  }

  if (from == Address.fromString(COMMUNITY_TREASURY_CONTRACT_ADDRESS)
       || from == Address.fromString(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS)) {
    communityTreasuryHistoricalBalance.balance = communityTreasuryHistoricalBalance.balance.minus(amount);
  }

  if (from == Address.fromString(GRANTS_TREASURY_CONTRACT_ADDRESS)) {
    grantsProgramTreasuryHistoricalBalance.balance = grantsProgramTreasuryHistoricalBalance.balance.minus(amount);
  }

  communityTreasuryHistoricalBalance.timestamp = timestamp;
  communityTreasuryHistoricalBalance.transactionHash = transactionHash;

  grantsProgramTreasuryHistoricalBalance.timestamp = timestamp;
  grantsProgramTreasuryHistoricalBalance.transactionHash = transactionHash;

  communityTreasuryHistoricalBalance.save();
  grantsProgramTreasuryHistoricalBalance.save();
}

function getCurrentDYDXPrice(): BigDecimal {
  const price = CurrentDYDXPrice.load(HARDCODED_ID);

  if (!price) {
    return BigDecimal.fromString('0');
  }

  return price.value;
}
