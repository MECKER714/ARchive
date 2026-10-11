import { readFile, writeFile } from 'node:fs/promises';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
// STL has no reliable units or material: orient Z-up to Y-up and normalize display size.
const inputs = process.argv.slice(2);
if (inputs.length !== 3) throw new Error('Provide the three STL paths in exhibition order.');
const names = ['continuum', 'still', 'balance'];
const report = [];
for (let i = 0; i < inputs.length; i++) {
  const raw = await readFile(inputs[i]);
  const geometry = new STLLoader().parse(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
  if (i < 2) geometry.rotateX(-Math.PI / 2); // The tower source is already Y-up.
  geometry.center();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const scale = 2 / Math.max(box.max.x-box.min.x, box.max.y-box.min.y, box.max.z-box.min.z);
  geometry.scale(scale, scale, scale);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const positions = geometry.attributes.position.array;
  const normals = geometry.attributes.normal.array;
  if (![...positions, ...normals].every(Number.isFinite)) throw new Error('Non-finite mesh coordinates');
  const positionBytes = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);
  const normalBytes = Buffer.from(normals.buffer, normals.byteOffset, normals.byteLength);
  const bin = Buffer.concat([positionBytes, normalBytes]);
  const bounds = geometry.boundingBox;
  const doc = {asset:{version:'2.0',generator:'ARchive STL conversion'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1},material:0}]}],materials:[{name:'Architectural plaster',pbrMetallicRoughness:{baseColorFactor:[0.78,0.75,0.66,1],metallicFactor:0,roughnessFactor:0.7},doubleSided:true}],buffers:[{byteLength:bin.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:positionBytes.length,target:34962},{buffer:0,byteOffset:positionBytes.length,byteLength:normalBytes.length,target:34962}],accessors:[{bufferView:0,componentType:5126,count:positions.length/3,type:'VEC3',min:bounds.min.toArray(),max:bounds.max.toArray()},{bufferView:1,componentType:5126,count:normals.length/3,type:'VEC3'}]};
  const json = Buffer.from(JSON.stringify(doc));
  const jsonPadded = Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);
  const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67,0); header.writeUInt32LE(2,4); header.writeUInt32LE(28+jsonPadded.length+bin.length,8); header.writeUInt32LE(jsonPadded.length,12); header.writeUInt32LE(0x4e4f534a,16);
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(bin.length,0); binHeader.writeUInt32LE(0x004e4942,4);
  const result = Buffer.concat([header,jsonPadded,binHeader,bin]);
  await writeFile(`public/models/${names[i]}.glb`,result);
  report.push({file:`${names[i]}.glb`,triangles:positions.length/9,bytes:result.length});
  geometry.dispose();
}
console.log(JSON.stringify(report,null,2));

