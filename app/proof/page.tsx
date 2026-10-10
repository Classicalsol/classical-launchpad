import type { Metadata } from 'next'
import { LabHeading } from '@/components/lab-heading'
import { ProofEngine } from '@/components/proof-engine'
export const metadata: Metadata = {title:'Proof Engine'}
export default function Page(){return <main className="shell"><LabHeading tag="INDEPENDENT CALCULATIONS. EXPLICIT TRUST BOUNDARIES." title="The Classical Proof Engine" description="Inspect the bytes. Verify the signature. Build the tree. A cryptographic laboratory that shows exactly what each computation proves."/><ProofEngine/></main>}
