import type { Metadata } from 'next'
import { LabHeading } from '@/components/lab-heading'
import { SecurityScanner } from '@/components/security-scanner'
export const metadata: Metadata = {title:'Security Scanner'}
export default async function Page({searchParams}:{searchParams:Promise<{mint?:string}>}) { const {mint} = await searchParams; return <main className="shell"><LabHeading tag="VERIFY, DON'T ASSUME" title="Classical Security Scanner" description="Inspect what a token can do, not what its marketing says. Every finding has an explanation. Every unchecked area stays explicitly unknown."/><SecurityScanner initialMint={mint ?? ''}/></main> }
