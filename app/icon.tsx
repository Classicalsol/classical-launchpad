import { ImageResponse } from 'next/og'
export const size={width:64,height:64}
export const contentType='image/png'
export default function Icon(){return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#090a0b',alignItems:'center',justifyContent:'center'}}><div style={{display:'flex',border:'3px solid #ffa333',width:46,height:46,alignItems:'center',justifyContent:'center',color:'#ffa333',fontSize:34,fontWeight:700}}>C</div></div>,size)}
