import { Address, Chain } from "viem"

export type AddressMap = {
    [key: Chain["id"]]: Address
}

export enum TransactionState {
    INITIAL,
    PREPARING_TRANSACTION,
    AWAITING_USER_APPROVAL,
    AWAITING_TRANSACTION
}
