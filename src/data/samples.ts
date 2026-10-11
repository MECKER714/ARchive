import type { Artwork } from '@/domain/artwork';
import { assetUrl } from './paths';
export const samples: Artwork[] = [
  { id:'sample-continuum', title:'Gothic Cathedral Structure', artist:'작가 정보 미등록', description:'고딕 성당의 구조를 입체적으로 살펴보는 건축 모형입니다.\n\n제공된 still.stl을 웹 감상용 GLB로 변환했습니다.', category:'건축 모형', modelUrl:assetUrl('models/continuum.glb?v=20261011'), format:'glb', size:2197120, createdAt:'2026-10-11', color:'#e9ebdf', sample:true },
  { id:'sample-still', title:'Sagrada Família — Interior Structure', artist:'작가 정보 미등록', description:'사그라다 파밀리아의 내부 구조를 살펴보는 건축 모형입니다.\n\n제공된 seccio_sagrada_familia_1.stl을 웹 감상용 GLB로 변환했습니다.', category:'건축 모형', modelUrl:assetUrl('models/still.glb?v=20261011'), format:'glb', size:1893704, createdAt:'2026-10-11', color:'#eae3dc', sample:true },
  { id:'sample-balance', title:'Twisted Towers', artist:'작가 정보 미등록', description:'비틀린 타워의 형태와 구조를 다양한 각도에서 감상하는 건축 모형입니다., category:'건축 모형', modelUrl:assetUrl('models/balance.glb?v=20261011'), format:'glb', size:2062332, createdAt:'2026-10-11', color:'#dfe6eb', sample:true },
];
