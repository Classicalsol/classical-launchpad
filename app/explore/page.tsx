import type {Metadata} from 'next'
import { LabHeading } from '@/components/lab-heading'
import { ComputingExhibit } from '@/components/computing-exhibit'
export const metadata:Metadata={title:'Classical vs. Quantum'}
export default function Page(){return <main className="shell"><LabHeading tag="BEFORE QUANTUM, THERE WAS CLASSICAL." title="Classical vs. quantum." description="Not a rivalry. A closer look at two ways to compute, the cryptography we depend on, and the work still ahead."/><ComputingExhibit/></main>}
