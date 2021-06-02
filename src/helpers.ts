import { Address, BigInt } from '@graphprotocol/graph-ts'
import { User } from "../generated/schema"

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export function getUser(address: Address): User {
  let user = User.load(address.toHexString())
  if (!user) {
    user = new User(address.toHexString())
    user.totalRewardsClaimed = BigInt.fromI32(0)
    user.totalTokens = BigInt.fromI32(0)
  }

  return user!;
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
