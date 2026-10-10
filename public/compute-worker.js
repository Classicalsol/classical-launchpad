const encode = text => new TextEncoder().encode(text)
const hex = data => Array.from(new Uint8Array(data), byte => byte.toString(16).padStart(2, '0')).join('')
const sha = async bytes => new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
self.onmessage = async event => {
  const start = performance.now()
  try {
    const {algorithm, input} = event.data
    if(typeof input !== 'string' || input.length > 20000) throw new Error('Input is limited to 20,000 characters.')
    let output; let layers = null; let operations = null
    switch(algorithm) {
      case 'sha256': output = hex(await sha(encode(input))); operations = encode(input).length; break
      case 'primes': {
        const n = Number(input)
        if(!Number.isInteger(n) || n < 2 || n > 1000000) throw new Error('Enter an integer between 2 and 1,000,000.')
        const composite = new Uint8Array(n+1); const primes=[]
        for(let i=2;i*i<=n;i++) if(!composite[i]) for(let j=i*i;j<=n;j+=i) composite[j]=1
        for(let i=2;i<=n;i++) if(!composite[i]) primes.push(i)
        output = `${primes.length} primes ≤ ${n}\n${primes.slice(0,1000).join(', ')}${primes.length>1000?'\n[Display limited to first 1,000 primes]':''}`
        operations = n; break
      }
      case 'sort': {
        const parts = input.trim().split(/[\s,]+/)
        if(parts.length > 10000 || !input.trim()) throw new Error('Enter between 1 and 10,000 numbers, separated by commas or spaces.')
        const values = parts.map(Number)
        if(values.some(x => !Number.isFinite(x))) throw new Error('Every value must be a finite number.')
        function mergeSort(a) {if(a.length<2)return a; const middle=Math.floor(a.length/2),l=mergeSort(a.slice(0,middle)),r=mergeSort(a.slice(middle));let i=0,j=0;const out=[];while(i<l.length&&j<r.length) out.push(l[i]<=r[j]?l[i++]:r[j++]);return out.concat(l.slice(i),r.slice(j))}
        output = mergeSort(values).join(', '); operations = values.length; break
      }
      case 'binary': {if(input.length>2000)throw new Error('Binary conversion is limited to 2,000 characters.'); const bytes=encode(input); output=Array.from(bytes,x=>x.toString(2).padStart(8,'0')).join(' '); operations=bytes.length;break}
      case 'aes': {
        const key = await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt'])
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,encode(input))
        const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ciphertext)
        output=`AES-256-GCM · fresh ephemeral key\nIV: ${hex(iv)}\nCiphertext + tag: ${hex(ciphertext)}\nDecrypted: ${new TextDecoder().decode(decrypted)}\nRound trip: ${new TextDecoder().decode(decrypted)===input?'MATCH':'MISMATCH'}\nKey discarded when worker terminates. This is an educational round trip, not a file encryption service.`;operations=encode(input).length;break
      }
      case 'merkle': {
        const leaves=input.split('\n').filter(x=>x.length>0)
        if(!leaves.length || leaves.length>16) throw new Error('Enter 1–16 nonempty leaves, one per line.')
        let nodes=await Promise.all(leaves.map(s=>sha(new Uint8Array([0,...encode(s)]))))
        layers=[nodes.map(hex)]
        while(nodes.length>1) {const parents=[];for(let i=0;i<nodes.length;i+=2){parents.push(await sha(new Uint8Array([1,...nodes[i],...(nodes[i+1]??nodes[i])])))}nodes=parents;layers.push(nodes.map(hex))}
        output=`Root: ${hex(nodes[0])}\nLeaves: ${leaves.length}\nLeaf hash = SHA-256(0x00 || UTF-8 leaf)\nParent hash = SHA-256(0x01 || left bytes || right bytes)\nOdd nodes are duplicated; order is preserved. This is a local demonstration, not a Solana block-inclusion proof.`;operations=layers.reduce((a,l)=>a+l.length,0);break
      }
      default: throw new Error('Unsupported algorithm. Arbitrary code execution is not permitted.')
    }
    self.postMessage({output,layers,operations,elapsed:performance.now()-start,algorithm})
  } catch(error) {self.postMessage({error:error instanceof Error?error.message:'Computation failed.'})}
}
