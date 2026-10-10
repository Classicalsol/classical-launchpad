import type {Metadata} from 'next'
import { LabHeading } from '@/components/lab-heading'
import { LaunchForm } from '@/components/launch-form'
export const metadata:Metadata={title:'Launch a Token'}
export default function Page(){return <main className="shell"><LabHeading tag="REAL TOKENS. PUBLIC RECORDS." title="Launch with a proof." description="Create a fixed-supply SPL token using your own wallet. Every registered launch gets a verifiable technical record and access to the Classical toolkit."/><LaunchForm/></main>}
