import { Address, BigInt } from "@graphprotocol/graph-ts"
import { getUser, getProposal, getProposalVote } from "./helpers";
import {
  ProposalCreated,
  VoteEmitted,
} from "../generated/DydxGovernor/DydxGovernor"
import { Proposal, ProposalVote } from "../generated/schema"

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal: Proposal = getProposal(event.params.id)

  proposal.save()
}

export function handleVoteEmitted(event: VoteEmitted): void {
  let userAddress: Address = event.params.voter
  let proposalId: BigInt = event.params.id
  let proposalVote: ProposalVote = getProposalVote(proposalId, userAddress)

  proposalVote.user = getUser(userAddress).id
  proposalVote.proposal = getProposal(proposalId).id
  proposalVote.support = event.params.support
  proposalVote.votingPower = event.params.votingPower

  proposalVote.save()
}
