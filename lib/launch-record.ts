export const LAUNCH_SUPPLY = 1_000_000_000
export const LAUNCH_DECIMALS = 9
export const LAUNCH_SUPPLY_RAW = BigInt(LAUNCH_SUPPLY) * 10n ** BigInt(LAUNCH_DECIMALS)

export type LaunchReceipt = {mint:string; signature:string; creator:string; name:string; symbol:string}
export function launchMessage(receipt:LaunchReceipt) { return `Classical public launch record\nNetwork: Solana mainnet\nMint: ${receipt.mint}\nCreation transaction: ${receipt.signature}\nCreator: ${receipt.creator}\nDisplay name: ${receipt.name}\nDisplay symbol: ${receipt.symbol}\nThis signature only authorizes a public registry record. It does not transfer assets.` }
