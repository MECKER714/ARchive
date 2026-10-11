export type Artwork = { id:string; title:string; artist:string; description:string; category:string; modelUrl:string; format:'glb'|'gltf'; usdzUrl?:string|null; size:number; createdAt:string; color?:string; sample?:boolean; };
export const MAX_MODEL_BYTES = 20 * 1024 * 1024;
export const MAX_USDZ_BYTES = 20 * 1024 * 1024;
export const formatBytes = (n:number) => n < 1024 * 1024 ? `${Math.round(n/1024)} KB` : `${(n/1024/1024).toFixed(1)} MB`;
