import type { Metadata } from 'next'
import { LabHeading } from '@/components/lab-heading'
import { ComputeTerminal } from '@/components/compute-terminal'
export const metadata: Metadata = {title:'Compute Terminal'}
export default async function Page({searchParams}:{searchParams:Promise<{algorithm?:string;mint?:string}>}) {const params=await searchParams;return <main className="shell"><LabHeading tag="NO THEORETICAL PROMISES. REAL COMPUTATION." title="The Compute Terminal" description="Run the algorithms behind the infrastructure. Real outputs and measured execution times, isolated in a worker in your browser."/>{params.mint&&<p className="mb-6 break-all font-mono text-sm text-muted-foreground">Token workspace: {params.mint} · local algorithms are independent of token safety.</p>}<ComputeTerminal initialAlgorithm={params.algorithm}/></main>}
