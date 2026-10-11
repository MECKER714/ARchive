import { MAX_MODEL_BYTES, MAX_USDZ_BYTES } from './artwork';
export class ValidationError extends Error {}
function assert(value:unknown,message:string):asserts value{if(!value)throw new ValidationError(message)}
export function validateMetadata(input:{title:unknown;artist:unknown;description:unknown}){
  const result = {title:'',artist:'',description:''};
  for(const [key,max,label] of [['title',100,'작품명'],['artist',80,'작가명'],['description',2000,'작품 설명']] as const){const value=input[key];assert(typeof value==='string',`${label}을 입력해 주세요.`);const trimmed=value.trim();assert(trimmed.length>0,`${label}을 입력해 주세요.`);assert(trimmed.length<=max,`${label}은 ${max}자 이내로 입력해 주세요.`);result[key]=trimmed}return result;
}
export async function validateModel(file:File):Promise<'glb'|'gltf'>{
  assert(file.size>0,'빈 파일은 올릴 수 없어요.');assert(file.size<=MAX_MODEL_BYTES,'모델은 20MB 이하로 올려 주세요.');
  const ext=file.name.split('.').pop()?.toLowerCase();assert(ext==='glb'||ext==='gltf','GLB 또는 GLTF 파일을 선택해 주세요. USDZ는 추가 파일로 첨부할 수 있어요.');
  let json:unknown;
  try { if(ext==='glb'){const bytes=await file.arrayBuffer();const v=new DataView(bytes);assert(bytes.byteLength>=20 && v.getUint32(0,true)===0x46546c67,'올바른 GLB 파일이 아니에요.');assert(v.getUint32(4,true)===2 && v.getUint32(8,true)===bytes.byteLength,'GLB 2.0 파일을 선택해 주세요.');const len=v.getUint32(12,true);assert(v.getUint32(16,true)===0x4e4f534a&&len>0&&20+len<=bytes.byteLength,'GLB 구조가 손상되었어요.');json=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,len)));}
  else {json=JSON.parse(await file.text())} } catch(e){if(e instanceof ValidationError)throw e;throw new ValidationError('모델 파일을 읽을 수 없어요. 다시 내보낸 파일로 시도해 주세요.')}
  assert(typeof json==='object'&&json!==null,'올바른 glTF 데이터가 아니에요.');
  const doc=json as {asset?:{version?:string}; meshes?:unknown[]; scenes?:unknown[]};
  assert(doc.asset?.version==='2.0','glTF 2.0 모델만 지원해요.');assert(Array.isArray(doc.meshes)&&doc.meshes.length>0&&Array.isArray(doc.scenes)&&doc.scenes.length>0,'표시할 메시와 장면이 있는 모델을 선택해 주세요.');
  // Reject every external resource reference, including those inside extensions.
  const stack:unknown[]=[json];let visited=0;
  while(stack.length){assert(++visited<200000,'모델 구조가 너무 복잡해요. 최적화한 파일로 시도해 주세요.');const item=stack.pop();if(!item||typeof item!=='object')continue;for(const [key,value]of Object.entries(item)){if(key==='uri'){assert(typeof value==='string'&&/^data:(application\/(octet-stream|gltf-buffer)|image\/(png|jpeg|webp));base64,[a-zA-Z0-9+/=\r\n]+$/.test(value),'외부 파일을 참조하는 모델이에요. 텍스처와 버퍼를 포함한 GLB 또는 단일 GLTF로 내보내 주세요.')}else if(typeof value==='object')stack.push(value)}}
  return ext;
}
export async function validateUsdz(file:File){assert(file.name.toLowerCase().endsWith('.usdz'),'USDZ 파일을 선택해 주세요.');assert(file.size>4&&file.size<=MAX_USDZ_BYTES,'USDZ는 20MB 이하의 파일이어야 해요.');const magic=new Uint8Array(await file.slice(0,4).arrayBuffer());assert(magic[0]===80&&magic[1]===75&&magic[2]===3&&magic[3]===4,'USDZ 압축 형식을 확인해 주세요.')}
