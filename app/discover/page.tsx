import type {Metadata} from 'next'
import { LabHeading } from '@/components/lab-heading'
import { Discovery } from '@/components/discovery'
export const metadata:Metadata={title:'Token Discovery'}
export default function Page(){return <main className="shell"><LabHeading tag="EXPLORE THE NETWORK" title="Tokens, with context." description="Discover verified Classical launch records or inspect external Solana markets. Provenance is not a promise of performance."/><Discovery/></main>}
