import { Address, BigInt } from "@graphprotocol/graph-ts"
import { getUser } from "./helpers";
import { User } from "../generated/schema"


export function handleDeposit(event: LogDeposit): void {
    let userAddress: Address = event.params.address
    let depositAmount: BigInt = event.params.quantizedAmount
    let user: User = getUser(userAddress)
    user.depositToPerpetual = depositAmount
    user.save()
}


