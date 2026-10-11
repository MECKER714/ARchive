'use client';
import { createElement, useEffect, useRef, useState } from 'react';
import { RotateCcw, Plus, Minus, Box } from 'lucide-react';
import { viewerConfig } from './config';
import { loadViewer } from './load-viewer';
type ViewerElement = HTMLElement & { loaded:boolean; cameraOrbit:string; getCameraOrbit():{theta:number;phi:number;radius:number}; jumpCameraToGoal():void };
type Props = {src:string; title:string; iosSrc?:string|null; compact?:boolean; onReady?:(ready:boolean)=>void};
export function ModelViewer({src,title,iosSrc,compact=false,onReady}:Props) {
  const ref = useRef<ViewerElement|null>(null);
  const [defined,setDefined] = useState(false); const [status,setStatus] = useState('loading'); const [attempt,setAttempt]=useState(0);
  useEffect(()=>{let active=true; loadViewer().then(()=>{if(active)setDefined(true)}).catch(()=>{if(active)setStatus('error')});return()=>{active=false}},[attempt]);
  useEffect(()=>{ if(!defined)return; const el=ref.current; if(!el)return; setStatus('loading');onReady?.(false); const loaded=()=>{setStatus('ready');onReady?.(true)};const failed=()=>{setStatus('error');onReady?.(false)};el.addEventListener('load',loaded);el.addEventListener('error',failed);if(el.loaded)loaded(); return()=>{el.removeEventListener('load',loaded);el.removeEventListener('error',failed)} },[defined,src,attempt,onReady]);
  function zoom(factor:number){ const el=ref.current; if(!el)return;const o=el.getCameraOrbit();el.cameraOrbit=`${o.theta}rad ${o.phi}rad ${o.radius*factor}m`; }
  return <div className={`viewer ${compact?'viewer-compact':''}`}>
    {defined && createElement('model-viewer',{key:`${src}-${attempt}`,ref,src,alt:`${title} 3D 모델`,...(compact?{}:{'camera-controls':true}),...(viewerConfig.arEnabled&&!compact?{ar:true,'ar-modes':viewerConfig.arModes,'ios-src':iosSrc}:{}),'touch-action':'pan-y','shadow-intensity':'1','shadow-softness':'1',exposure:'1.1','camera-orbit':viewerConfig.cameraOrbit,'min-camera-orbit':'auto auto 25%','max-camera-orbit':'auto auto 250%','interaction-prompt':'none',loading:compact?'lazy':'eager',reveal:'auto',style:{width:'100%',height:'100%'},tabIndex:compact?-1:0})}
    {status==='loading'&&<div className="viewer-status" role="status"><Box size={22}/><span>작품을 불러오는 중</span></div>}
    {status==='error'&&<div className="viewer-status" role="alert"><Box/><p>이 모델을 표시할 수 없어요.</p>{!compact&&<><p>파일 형식과 텍스처를 확인하거나 페이지를 다시 열어 주세요.</p><button type="button" className="button" onClick={()=>{setStatus('loading');setAttempt(x=>x+1)}}>다시 시도</button></>}</div>}
    {!compact&&status==='ready'&&<><span className="viewer-badge">INTERACTIVE 3D</span><div className="viewer-controls"><button type="button" aria-label="확대" onClick={()=>zoom(.8)}><Plus size={18}/></button><button type="button" aria-label="축소" onClick={()=>zoom(1.25)}><Minus size={18}/></button><button type="button" aria-label="시점 초기화" onClick={()=>{if(ref.current)ref.current.cameraOrbit='30deg 72deg auto'}}><RotateCcw size={17}/></button></div><p className="viewer-hint">한 손가락으로 회전 · 두 손가락으로 확대</p></>}
  </div>;
}
