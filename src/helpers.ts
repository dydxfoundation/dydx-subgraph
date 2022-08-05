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
  CurrentDYDXPrice,
  Balance,
  HistoricalBalance,
  TotalTreasuryHistoricalBalance
} from '../generated/schema';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// Address on mainnet for dYdX community treasury, which doesn't have an equivalent on other networks.
export const COMMUNITY_TREASURY_CONTRACT_ADDRESS = '0xe710ced57456d3a16152c32835b5fb4e72d9ea5b'; // Initialized @ 12931471
export const COMMUNITY_TREASURY_2_CONTRACT_ADDRESS = '0x08a90fe0741b7def03fb290cc7b273f1855767d8'; // Initialized @ 12931479
export const GRANTS_TREASURY_CONTRACT_ADDRESS = '0xfa3811e5c92358133330f9f787980ba1e8e0d99a'; // Initialized @ 13817982

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
  const id = `community-${txHash.toHexString()}`;

  let tx: CommunityTreasuryTransaction | null =
    CommunityTreasuryTransaction.load(id)

  if (!tx) {
    tx = new CommunityTreasuryTransaction(id)
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
  const id = `grants-${txHash.toHexString()}`;
  
  let tx: GrantsProgramTreasuryTransaction | null =
    GrantsProgramTreasuryTransaction.load(id)

  if (!tx) {
    tx = new GrantsProgramTreasuryTransaction(id);
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
  if (!(
      to.toHexString().toLowerCase() == COMMUNITY_TREASURY_CONTRACT_ADDRESS ||
      to.toHexString().toLowerCase() == COMMUNITY_TREASURY_2_CONTRACT_ADDRESS ||
      from.toHexString().toLowerCase() == COMMUNITY_TREASURY_CONTRACT_ADDRESS ||
      from.toHexString().toLowerCase() == COMMUNITY_TREASURY_2_CONTRACT_ADDRESS ||
      to.toHexString().toLowerCase() == GRANTS_TREASURY_CONTRACT_ADDRESS ||
      from.toHexString().toLowerCase() == GRANTS_TREASURY_CONTRACT_ADDRESS
  )) {
    return;
  }
  const txHash = transactionHash.toHexString();
  let fromBalance = Balance.load(from.toHexString());
  if (!fromBalance) {
    fromBalance = new Balance(from.toHexString());
    fromBalance.dydxBalance = new BigInt(0);
  }
  let toBalance = Balance.load(to.toHexString());
  if (!toBalance) {
    toBalance = new Balance(to.toHexString());
    toBalance.dydxBalance = new BigInt(0);
  }

  fromBalance.dydxBalance = fromBalance.dydxBalance.minus(amount);
  toBalance.dydxBalance = toBalance.dydxBalance.plus(amount);
  fromBalance.save();
  toBalance.save();

  let fromHistoricalBalance = HistoricalBalance.load(`${from.toHexString()}-${transactionHash}`);
  if (!fromHistoricalBalance) {
    fromHistoricalBalance = new HistoricalBalance(`${from.toHexString()}-${transactionHash}`);
  }
  fromHistoricalBalance.timestamp = timestamp;
  fromHistoricalBalance.dydxBalance = fromBalance.dydxBalance;
  fromHistoricalBalance.transactionHash = transactionHash;
  fromHistoricalBalance.contract = from;
  fromHistoricalBalance.save();
  
  let toHistoricalBalance = HistoricalBalance.load(`${to.toHexString()}-${transactionHash}`);
  if (!toHistoricalBalance) {
    toHistoricalBalance = new HistoricalBalance(`${to.toHexString()}-${transactionHash}`);
  }
  toHistoricalBalance.timestamp = timestamp;
  toHistoricalBalance.dydxBalance = toBalance.dydxBalance;
  toHistoricalBalance.transactionHash = transactionHash;
  toHistoricalBalance.contract = from;
  toHistoricalBalance.save();

  const communityTreasuryContract1Balance = Balance.load(COMMUNITY_TREASURY_CONTRACT_ADDRESS);
  const communityTreasuryContract2Balance = Balance.load(COMMUNITY_TREASURY_2_CONTRACT_ADDRESS);
  const grantsProgramTreasuryBalance = Balance.load(GRANTS_TREASURY_CONTRACT_ADDRESS);

  const communityTreasuryContract1DydxBalance = communityTreasuryContract1Balance ? communityTreasuryContract1Balance.dydxBalance : new BigInt(0);
  const communityTreasuryContract2DydxBalance = communityTreasuryContract2Balance ? communityTreasuryContract2Balance.dydxBalance : new BigInt(0);
  const grantsProgramTreasuryDydxBalance = grantsProgramTreasuryBalance ? grantsProgramTreasuryBalance.dydxBalance : new BigInt(0);

  if (
    to.toHexString().toLowerCase() == COMMUNITY_TREASURY_CONTRACT_ADDRESS ||
    to.toHexString().toLowerCase() == COMMUNITY_TREASURY_2_CONTRACT_ADDRESS ||
    from.toHexString().toLowerCase() == COMMUNITY_TREASURY_CONTRACT_ADDRESS ||
    from.toHexString().toLowerCase() == COMMUNITY_TREASURY_2_CONTRACT_ADDRESS
  ) {
    let communityTreasuryHistoricalBalance = CommunityTreasuryHistoricalBalance.load(
      `community-${txHash}`
    );
    if (!communityTreasuryHistoricalBalance) {
      communityTreasuryHistoricalBalance = new CommunityTreasuryHistoricalBalance(
        `community-${txHash}`
      );
    }

    communityTreasuryHistoricalBalance.timestamp = timestamp;
    communityTreasuryHistoricalBalance.dydxBalance = communityTreasuryContract1DydxBalance.plus(
      communityTreasuryContract2DydxBalance
    );
    communityTreasuryHistoricalBalance.transactionHash = transactionHash;
    communityTreasuryHistoricalBalance.save();
  }

  if (
    to.toHexString().toLowerCase() == GRANTS_TREASURY_CONTRACT_ADDRESS ||
    from.toHexString().toLowerCase() == GRANTS_TREASURY_CONTRACT_ADDRESS
  ) {
    let grantsProgramTreasuryHistoricalBalance = GrantsProgramTreasuryHistoricalBalance.load(
      `grantsprogram-${txHash}`
    );
    if (!grantsProgramTreasuryHistoricalBalance) {
      grantsProgramTreasuryHistoricalBalance = new GrantsProgramTreasuryHistoricalBalance(
        `grantsprogram-${txHash}`
      );
    }

    grantsProgramTreasuryHistoricalBalance.timestamp = timestamp;
    grantsProgramTreasuryHistoricalBalance.dydxBalance = grantsProgramTreasuryDydxBalance;
    grantsProgramTreasuryHistoricalBalance.transactionHash = transactionHash;
    grantsProgramTreasuryHistoricalBalance.save();
  }

  let totalTreasuryHistoricalBalance = TotalTreasuryHistoricalBalance.load(`total-${txHash}`);
  if (!totalTreasuryHistoricalBalance) {
    totalTreasuryHistoricalBalance = new TotalTreasuryHistoricalBalance(`total-${txHash}`);
  }
  totalTreasuryHistoricalBalance.timestamp = timestamp;
  totalTreasuryHistoricalBalance.dydxBalance = communityTreasuryContract1DydxBalance
    .plus(communityTreasuryContract2DydxBalance)
    .plus(grantsProgramTreasuryDydxBalance);
  totalTreasuryHistoricalBalance.transactionHash = transactionHash;
  totalTreasuryHistoricalBalance.save();
}

function getCurrentDYDXPrice(): BigDecimal {
  const price = CurrentDYDXPrice.load(HARDCODED_ID);

  if (!price) {
    return BigDecimal.fromString('0');
  }

  return price.value;
}
