import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  CommunityTreasuryTransaction,
  User,
  Proposal,
  ProposalVote,
  RewardsClaimed,
  GrantsProgramTreasuryTransaction,
  CurrentDYDXPrice,
  Balance,
  HistoricalBalance
} from '../generated/schema';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// Address on mainnet for dYdX community treasury, which doesn't have an equivalent on other networks.
export const COMMUNITY_TREASURY_CONTRACT_ADDRESS = Address.fromString('0xe710ced57456d3a16152c32835b5fb4e72d9ea5b'); // Initialized @ 12931471
export const COMMUNITY_TREASURY_2_CONTRACT_ADDRESS = Address.fromString('0x08a90fe0741b7def03fb290cc7b273f1855767d8'); // Initialized @ 12931479
export const GRANTS_TREASURY_CONTRACT_ADDRESS = Address.fromString('0xfa3811e5c92358133330f9f787980ba1e8e0d99a'); // Initialized @ 13817982

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
  transactionHash: Bytes,
  logIndex: BigInt,
  symbol: string
): void {
  const id = `community-${symbol}-${txHash.toHexString()}-${logIndex.toString()}`;

  let tx: CommunityTreasuryTransaction | null =
    CommunityTreasuryTransaction.load(id)

  if (!tx) {
    tx = new CommunityTreasuryTransaction(id)
  }

  const dydxPriceUsd = getCurrentDYDXPrice();
  const amountUSD = symbol == 'dydx'
    ? amount.toBigDecimal().times(dydxPriceUsd).div(BigDecimal.fromString('1e18'))
    : amount.toBigDecimal().div(BigDecimal.fromString('1e6'));

  tx.to = to;
  tx.from = from;
  tx.amount = amount;
  tx.amountUSD = amountUSD;
  tx.timestamp = timestamp;
  tx.blockNumber = blockNumber;
  tx.blockHash = blockHash;
  tx.transactionHash = transactionHash;
  tx.currencySymbol = symbol;

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
  transactionHash: Bytes,
  symbol: string
): void {
  const id = `grants-${symbol}-${txHash.toHexString()}`;
  
  let tx: GrantsProgramTreasuryTransaction | null =
    GrantsProgramTreasuryTransaction.load(id)

  if (!tx) {
    tx = new GrantsProgramTreasuryTransaction(id);
  }

  const dydxPriceUsd = getCurrentDYDXPrice();
  const amountUSD = symbol == 'dydx'
    ? amount.toBigDecimal().times(dydxPriceUsd).div(BigDecimal.fromString('1e18'))
    : amount.toBigDecimal().div(BigDecimal.fromString('1e6'));

  tx.to = to;
  tx.from = from;
  tx.amount = amount;
  tx.amountUSD = amountUSD;
  tx.timestamp = timestamp;
  tx.blockNumber = blockNumber;
  tx.blockHash = blockHash;
  tx.transactionHash = transactionHash;
  tx.currencySymbol = symbol;

  tx.save();
}

export function saveDydxBalances(to: Address, from: Address, amount: BigInt, transactionHash: Bytes, timestamp: BigInt): void {
  if (!(
      to.equals(COMMUNITY_TREASURY_CONTRACT_ADDRESS) ||
      to.equals(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS) ||
      from.equals(COMMUNITY_TREASURY_CONTRACT_ADDRESS) ||
      from.equals(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS) ||
      to.equals(GRANTS_TREASURY_CONTRACT_ADDRESS) ||
      from.equals(GRANTS_TREASURY_CONTRACT_ADDRESS)
  )) {
    return;
  }
  const txHash = transactionHash.toHexString();
  let fromBalance = Balance.load(from.toHexString());
  if (!fromBalance) {
    fromBalance = new Balance(from.toHexString());
    fromBalance.dydxBalance = new BigInt(0);
    fromBalance.usdcBalance = new BigInt(0);
  }
  let toBalance = Balance.load(to.toHexString());
  if (!toBalance) {
    toBalance = new Balance(to.toHexString());
    toBalance.dydxBalance = new BigInt(0);
    toBalance.usdcBalance = new BigInt(0);
  }

  fromBalance.dydxBalance = fromBalance.dydxBalance.minus(amount);
  toBalance.dydxBalance = toBalance.dydxBalance.plus(amount);
  fromBalance.save();
  toBalance.save();

  let fromHistoricalBalance = HistoricalBalance.load(
    `${from.toHexString()}-${txHash}`
  );
  if (!fromHistoricalBalance) {
    fromHistoricalBalance = new HistoricalBalance(
      `${from.toHexString()}-${txHash}`
    );
  }
  fromHistoricalBalance.timestamp = timestamp;
  fromHistoricalBalance.dydxBalance = fromBalance.dydxBalance;
  fromHistoricalBalance.usdcBalance = fromBalance.usdcBalance;
  fromHistoricalBalance.transactionHash = transactionHash;
  fromHistoricalBalance.contract = from;
  fromHistoricalBalance.save();
  
  let toHistoricalBalance = HistoricalBalance.load(
    `${to.toHexString()}-${txHash}`
  );
  if (!toHistoricalBalance) {
    toHistoricalBalance = new HistoricalBalance(
      `${to.toHexString()}-${txHash}`
    );
  }
  toHistoricalBalance.timestamp = timestamp;
  toHistoricalBalance.dydxBalance = toBalance.dydxBalance;
  toHistoricalBalance.usdcBalance = toBalance.usdcBalance;
  toHistoricalBalance.transactionHash = transactionHash;
  toHistoricalBalance.contract = to;
  toHistoricalBalance.save();
}

export function saveUsdcBalances(to: Address, from: Address, amount: BigInt, transactionHash: Bytes, timestamp: BigInt): void {
  if (!(
      to.equals(COMMUNITY_TREASURY_CONTRACT_ADDRESS) ||
      to.equals(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS) ||
      from.equals(COMMUNITY_TREASURY_CONTRACT_ADDRESS) ||
      from.equals(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS) ||
      to.equals(GRANTS_TREASURY_CONTRACT_ADDRESS) ||
      from.equals(GRANTS_TREASURY_CONTRACT_ADDRESS)
  )) {
    return;
  }
  const txHash = transactionHash.toHexString();
  let fromBalance = Balance.load(from.toHexString());
  if (!fromBalance) {
    fromBalance = new Balance(from.toHexString());
    fromBalance.usdcBalance = new BigInt(0);
    fromBalance.dydxBalance = new BigInt(0);
  }
  let toBalance = Balance.load(to.toHexString());
  if (!toBalance) {
    toBalance = new Balance(to.toHexString());
    toBalance.usdcBalance = new BigInt(0);
    toBalance.dydxBalance = new BigInt(0);
  }

  fromBalance.usdcBalance = fromBalance.usdcBalance.minus(amount);
  toBalance.usdcBalance = toBalance.usdcBalance.plus(amount);
  fromBalance.save();
  toBalance.save();

  let fromHistoricalBalance = HistoricalBalance.load(
    `${from.toHexString()}-${txHash}`
  );
  if (!fromHistoricalBalance) {
    fromHistoricalBalance = new HistoricalBalance(
      `${from.toHexString()}-${txHash}`
    );
  }
  fromHistoricalBalance.timestamp = timestamp;
  fromHistoricalBalance.usdcBalance = fromBalance.usdcBalance;
  fromHistoricalBalance.dydxBalance = fromBalance.dydxBalance;
  fromHistoricalBalance.transactionHash = transactionHash;
  fromHistoricalBalance.contract = from;
  fromHistoricalBalance.save();
  
  let toHistoricalBalance = HistoricalBalance.load(
    `${to.toHexString()}-${txHash}`
  );
  if (!toHistoricalBalance) {
    toHistoricalBalance = new HistoricalBalance(
      `${to.toHexString()}-${txHash}`
    );
  }
  toHistoricalBalance.timestamp = timestamp;
  toHistoricalBalance.usdcBalance = toBalance.usdcBalance;
  toHistoricalBalance.dydxBalance = toBalance.dydxBalance;
  toHistoricalBalance.transactionHash = transactionHash;
  toHistoricalBalance.contract = to;
  toHistoricalBalance.save();
}

function getCurrentDYDXPrice(): BigDecimal {
  const price = CurrentDYDXPrice.load(HARDCODED_ID);

  if (!price) {
    return BigDecimal.fromString('0');
  }

  return price.value;
}
