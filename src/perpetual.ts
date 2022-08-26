import { Address, BigInt } from "@graphprotocol/graph-ts"
import { getUser } from "./helpers";
import { Deposit, User } from "../generated/schema"
import { LogDeposit } from "../generated/DydxPerpetual/DydxPerpetual"


export function handleDeposit(event: LogDeposit): void {
    let userAddress: Address = event.params.depositorEthKey
    let depositAmount: BigInt = event.params.quantizedAmount
    let user: User = getUser(userAddress)
    user.mostRecentDepositToPerpetualAmount = depositAmount
    user.save()

    let deposit: Deposit = new Deposit(event.transaction.hash.toHexString());
    deposit.address = event.params.depositorEthKey.toHexString();
    deposit.depositAmount = event.params.quantizedAmount;
    deposit.block = event.block.number;
    deposit.blockTimestamp = event.block.timestamp;
    deposit.save();
}
