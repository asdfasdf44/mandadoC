import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=s=>document.querySelector(s);
const items=[{name:'키링',file:'ketring.png',en:'ACRYLIC KEYRING',desc:'어디든 함께하는 파라오 친구. 아크릴 외곽과 작은 표정을 가까이 살펴보세요.',color:0xd7e7e4,height:1.35},{name:'에코백',file:'ecoback.png',en:'CANVAS TOTE BAG',desc:'두 공룡의 다정한 하루를 담은 에코백. 자연스러운 원단과 앞면 프린트를 만나보세요.',color:0xc7b89c,height:1.95},{name:'포토카드',file:'photocard.png',en:'HOLOGRAM PHOTO CARD',desc:'별을 든 분홍 공룡의 작은 초상. 이미지에 담긴 홀로그램 컬러를 확대해 보세요.',color:0xbed6cb,height:1.35}];
function renderer(host){const r=new T.WebGLRenderer({antialias:true,alpha:false});r.setPixelRatio(Math.min(devicePixelRatio,2));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.25;host.appendChild(r.domElement);return r}
function lights(s){s.add(new T.HemisphereLight(0xffffff,0x809e8a,2.5));const l=new T.DirectionalLight(0xfff7e7,3);l.position.set(-3,8,5);l.castShadow=true;l.shadow.mapSize.set(2048,2048);Object.assign(l.shadow.camera,{left:-9,right:9,top:9,bottom:-9});l.shadow.normalBias=.025;s.add(l);const f=new T.DirectionalLight(0xe1f5ff,1.5);f.position.set(5,4,-2);s.add(f)}
function box(s,w,h,d,x,y,z,color){const o=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.8}));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;s.add(o);return o}
function textPlane(text,size,color,w,h){const c=document.createElement('canvas');c.width=1536;c.height=384;const x=c.getContext('2d');x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.font=`800 ${size}px Arial`;x.fillText(text,768,192);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}))}
// Trace the supplied transparent silhouette, retaining holes such as the bag handles.
function silhouette(img,height){const w=256,h=Math.round(w*img.height/img.width),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);const data=ctx.getImageData(0,0,w,h).data;const solid=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&data[(y*w+x)*4+3]>100;const edges=new Map();const edge=(x,y,a,b)=>{const k=x+','+y;if(!edges.has(k))edges.set(k,[]);edges.get(k).push([a,b])};for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(solid(x,y)){if(!solid(x,y-1))edge(x,y,x+1,y);if(!solid(x+1,y))edge(x+1,y,x+1,y+1);if(!solid(x,y+1))edge(x+1,y+1,x,y+1);if(!solid(x-1,y))edge(x,y+1,x,y)}const loops=[];while(edges.size){const start=edges.keys().next().value;let key=start,points=[];for(let i=0;i<100000;i++){const p=key.split(',').map(Number);points.push(new T.Vector2((p[0]-w/2)*height/h,(h/2-p[1])*height/h));const es=edges.get(key);if(!es)break;const next=es.pop();if(!es.length)edges.delete(key);key=next.join(',');if(key===start)break}if(points.length>8)loops.push(points)}for(const loop of loops){for(let pass=0;pass<48;pass++){const copy=loop.map(p=>p.clone());for(let i=0;i<loop.length;i++){loop[i].copy(copy[i]).multiplyScalar(.5).addScaledVector(copy[(i+loop.length-1)%loop.length],.25).addScaledVector(copy[(i+1)%loop.length],.25)}}}for(let j=0;j<loops.length;j++){const pts=loops[j].filter((_,i)=>i%8===0);if(pts.length>=4){const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p.x,p.y,0)),true);loops[j]=curve.getPoints(Math.max(80,pts.length*4)).slice(0,-1).map(p=>new T.Vector2(p.x,p.y))}}loops.sort((a,b)=>Math.abs(T.ShapeUtils.area(b))-Math.abs(T.ShapeUtils.area(a)));const shape=new T.Shape(loops[0]);for(const loop of loops.slice(1))if(T.ShapeUtils.area(loop)*T.ShapeUtils.area(loops[0])<0)shape.holes.push(new T.Path(loop));return {shape,width:w*height/h,height}}
// Extend edge colors into transparent pixels so the smooth silhouette has no dark seams.
function edgeTexture(image){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data,w=canvas.width,h=canvas.height;
 let known=new Uint8Array(w*h);for(let i=0;i<known.length;i++)known[i]=d[i*4+3]>100?1:0;
 for(let pass=0;pass<16;pass++){
  const next=known.slice();
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=y*w+x;if(known[i])continue;
   const neighbors=[x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1];
   const n=neighbors.find(n=>n>=0&&known[n]);if(n===undefined)continue;
   for(let k=0;k<3;k++)d[i*4+k]=d[n*4+k];next[i]=1;
  }known=next;
 }
 for(let i=0;i<known.length;i++)d[i*4+3]=255;
 ctx.putImageData(pixels,0,0);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;return texture;
}
// Subdivide the silhouette into a curved front/reverse with a shared sharp seam.
function inflateBag(base,shape,width,height){
 let points=Array.from({length:base.attributes.position.count},(_,i)=>new T.Vector3().fromBufferAttribute(base.attributes.position,i));
 let indices=Array.from(base.index.array);
 for(let pass=0;pass<4;pass++){
  const mids=new Map(),out=[];
  const mid=(a,b)=>{const k=Math.min(a,b)+','+Math.max(a,b);if(!mids.has(k)){mids.set(k,points.length);points.push(points[a].clone().add(points[b]).multiplyScalar(.5))}return mids.get(k)};
  for(let i=0;i<indices.length;i+=3){const [a,b,c]=indices.slice(i,i+3),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);out.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca)}indices=out;
 }
 const contours=[shape.getPoints(),...shape.holes.map(h=>h.getPoints())],edges=[];
 for(const loop of contours)for(let i=0;i<loop.length;i++)edges.push([loop[i],loop[(i+1)%loop.length]]);
 const xyz=[],uv=[];
 for(const p of points){let distance=Infinity;
  for(const [a,b] of edges){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;if(!len)continue;const t=T.MathUtils.clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/len,0,1);distance=Math.min(distance,Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy))}
  const body=1-T.MathUtils.smoothstep(p.y,.22,.52);
  const z=.26*(1-Math.exp(-distance/.12))*(.12+.88*body);
  xyz.push(p.x,p.y,z);uv.push(p.x/width+.5,p.y/height+.5);
 }
 const front=new T.BufferGeometry();front.setAttribute('position',new T.Float32BufferAttribute(xyz,3));front.setAttribute('uv',new T.Float32BufferAttribute(uv,2));front.setIndex(indices);front.computeVertexNormals();
 const back=front.clone(),pos=back.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,-pos.getZ(i));const reversed=indices.slice();for(let i=0;i<reversed.length;i+=3)[reversed[i+1],reversed[i+2]]=[reversed[i+2],reversed[i+1]];back.setIndex(reversed);back.computeVertexNormals();return [front,back];
}
// A single double-sided surface: front and reverse meet at a zero-width edge.
// The smoothed silhouette and its handle/ring holes remain unchanged.
async function makeModel(item){
 const source=await new T.TextureLoader().loadAsync('./assets/'+item.file);
 const {shape,width,height}=silhouette(source.image,item.height),texture=edgeTexture(source.image);source.dispose();
 const geometry=new T.ShapeGeometry(shape),pos=geometry.attributes.position,uv=geometry.attributes.uv;
 for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/width+.5,pos.getY(i)/height+.5);
 const material=new T.MeshStandardMaterial({map:texture,side:T.DoubleSide,roughness:item.name==='에코백'?.85:.48,metalness:item.name==='키링'?.08:0});
 const model=new T.Group();
 const geometries=item.name==='에코백'?inflateBag(geometry,shape,width,height):[geometry];
 if(item.name==='에코백'){geometry.dispose();material.side=T.FrontSide}
 for(const geom of geometries){const surface=new T.Mesh(geom,material);surface.castShadow=true;model.add(surface)}return model;
}

let scene,camera,controls,r,vr,vc,vs,vcontrols,activeModel,models=[],selected=0,lastFocus,movement=null,floorMesh,moveMarker;
const dialog=$('#inspect'),root=$('#room'),viewer=$('#viewer');
function resize(){if(!r)return;const w=root.clientWidth,h=root.clientHeight;r.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(vr&&dialog.open){const a=viewer.clientWidth,b=viewer.clientHeight;vr.setSize(a,b);vc.aspect=a/b;vc.updateProjectionMatrix()}}
function home(instant=false){
 const end=new T.Vector3(innerWidth<700?8.3:7.1,5.1,innerWidth<700?13.9:10.3),target=new T.Vector3(0,1.55,0);
 document.body.classList.remove('walking');$('#walk-status').textContent='';if(moveMarker)moveMarker.visible=false;
 if(instant){camera.position.copy(end);controls.target.copy(target);camera.fov=43;camera.updateProjectionMatrix();controls.update();return}
 controls.enabled=false;controls.enableDamping=false;
 movement={start:performance.now(),duration:1400,from:camera.position.clone(),to:end,lookFrom:controls.target.clone(),lookTo:target,fovFrom:camera.fov,fovTo:43,home:true};
}

function openItem(i){if(!models.length)return;selected=(i+3)%3;const item=items[selected];if(!dialog.open){lastFocus=document.activeElement;dialog.showModal()}$('#number').textContent=String(selected+1).padStart(2,'0');$('#counter').textContent=`${selected+1} / 3`;$('#product-title').textContent=item.name;$('#category').textContent=item.en;$('#description').textContent=item.desc;if(activeModel)vs.remove(activeModel);activeModel=models[selected].clone();activeModel.position.set(0,0,0);activeModel.rotation.set(0,0,0);activeModel.scale.setScalar(2/item.height);vs.add(activeModel);vcontrols.autoRotate=false;$('#auto').setAttribute('aria-pressed','false');vc.position.set(0,.08,3.8);vcontrols.target.set(0,0,0);vcontrols.update();resize();$('#close').focus()}
function close(){dialog.close();lastFocus?.focus()}
async function init(){scene=new T.Scene();scene.background=new T.Color(0xdbece5);scene.fog=new T.Fog(0xdbece5,24,48);camera=new T.PerspectiveCamera(43,1,.1,100);r=renderer(root);lights(scene);controls=new OrbitControls(camera,r.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=.6;controls.maxDistance=20;controls.minPolarAngle=.55;controls.maxPolarAngle=1.75;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;
floorMesh=box(scene,15,.2,15,0,-.15,0,0xc8d7c2);box(scene,13,6,.18,0,2.8,-4,0xaacbbd);box(scene,.18,6,11,-6.5,2.8,1.5,0xc1d8ca);box(scene,.18,6,11,6.5,2.8,1.5,0xbad5c6);box(scene,13,.13,.15,0,.04,-3.83,0x6c9a87);
for(let x=-6;x<=6;x+=1.5)box(scene,.014,.006,14,x,-.042,1.4,0xabbda7);for(let z=-3;z<9;z+=1.5)box(scene,13,.006,.014,0,-.04,z,0xabbda7);
const logoTexture=await new T.TextureLoader().loadAsync('./assets/logo.png');logoTexture.colorSpace=T.SRGBColorSpace;logoTexture.anisotropy=8;const title=new T.Mesh(new T.PlaneGeometry(4.6,4.6*logoTexture.image.height/logoTexture.image.width),new T.MeshBasicMaterial({map:logoTexture,transparent:true,depthWrite:false,toneMapped:false}));title.position.set(0,4.45,-3.88);scene.add(title);const sub=textPlane('LITTLE FRIENDS, EVERYDAY JOY.',48,'#497d68',5.8,1.45);sub.position.set(0,2.9,-3.86);scene.add(sub);
const plinths=[[-2.9,.77,.25,1.55],[0,.6,-.45,1.2],[2.9,.91,.25,1.82]];for(let i=0;i<3;i++){const [x,y,z,h]=plinths[i];const p=new T.Mesh(new T.CylinderGeometry(1.05,1.05,h,64),new T.MeshStandardMaterial({color:[0xe8d6b9,0xe4ecce,0xe5bfd0][i],roughness:.65}));p.position.set(x,y,z);p.castShadow=p.receiveShadow=true;scene.add(p);const label=textPlane('0'+(i+1),120,'#4b6957',.65,.3);label.position.set(x,.65,z+1.06);scene.add(label)}
models=await Promise.all(items.map(makeModel));models.forEach((m,i)=>{const [x,,z,h]=plinths[i];const baseY=h+items[i].height/2+.13;m.position.set(x,baseY,z);m.rotation.y=.12;m.userData.item=i;m.userData.floatBaseY=baseY;m.userData.floatPhase=i*Math.PI*.72;m.traverse(o=>o.userData.item=i);scene.add(m)});
vs=new T.Scene();vs.background=new T.Color(0xedf1ea);lights(vs);vc=new T.PerspectiveCamera(40,1,.01,100);vr=renderer(viewer);vcontrols=new OrbitControls(vc,vr.domElement);vcontrols.enableDamping=true;vcontrols.enablePan=false;vcontrols.minDistance=1.6;vcontrols.maxDistance=7;vcontrols.autoRotateSpeed=1.8;vcontrols.minPolarAngle=.02;vcontrols.maxPolarAngle=Math.PI-.02;home(true);resize();$('#loading').hidden=true;
moveMarker=new T.Mesh(new T.RingGeometry(.18,.24,48),new T.MeshBasicMaterial({color:0x285e4c,side:T.DoubleSide,transparent:true,opacity:.8}));moveMarker.rotation.x=-Math.PI/2;moveMarker.visible=false;scene.add(moveMarker);
const ray=new T.Raycaster(),mouse=new T.Vector2();
function hit(e){const rect=r.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(mouse,camera);return ray.intersectObjects(scene.children,true).find(h=>h.object!==moveMarker&&!(h.object.material?.transparent)&&(h.object===floorMesh||h.object.position.y>=0))}
function walk(point){
 const end=new T.Vector3(T.MathUtils.clamp(point.x,-5.8,5.8),1.75,T.MathUtils.clamp(point.z,-3.3,6.7));
 for(const [x,,z] of plinths){const dx=end.x-camera.position.x,dz=end.z-camera.position.z,length=dx*dx+dz*dz,t=length?T.MathUtils.clamp(((x-camera.position.x)*dx+(z-camera.position.z)*dz)/length,0,1):0;
 if(Math.hypot(camera.position.x+t*dx-x,camera.position.z+t*dz-z)<1.32){$('#walk-status').textContent='전시대 옆의 빈 바닥을 눌러 이동해 주세요.';return}}
 document.body.classList.add("walking");controls.enabled=false;controls.enableDamping=false;movement={start:performance.now(),duration:950,fovFrom:camera.fov,fovTo:65,from:camera.position.clone(),to:end,lookFrom:controls.target.clone(),lookTo:new T.Vector3(0,1.9,-.45)};
 moveMarker.position.set(end.x,-.028,end.z);moveMarker.visible=true;$('#walk-status').textContent='선택한 바닥 위치로 이동합니다.';
}
let down;
r.domElement.addEventListener('pointerdown',e=>{if(!movement)down=[e.clientX,e.clientY]});
r.domElement.addEventListener('pointercancel',()=>down=null);
r.domElement.addEventListener('pointerup',e=>{if(down&&!movement&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const h=hit(e);if(h?.object.userData.item!==undefined)openItem(h.object.userData.item);else if(h?.object===floorMesh)walk(h.point)}down=null});
r.domElement.addEventListener('pointermove',e=>{if(movement)return;const h=hit(e);const floor=h?.object===floorMesh;r.domElement.style.cursor=h&&(h.object.userData.item!==undefined||floor)?'pointer':'grab';moveMarker.visible=floor&&!down;if(moveMarker.visible)moveMarker.position.set(h.point.x,-.028,h.point.z)});
r.domElement.addEventListener('pointerleave',()=>{if(!movement)moveMarker.visible=false});
r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').hidden=false;$('#loading').textContent='3D 화면 연결이 끊겼습니다. 페이지를 새로고침해 주세요.'});
r.setAnimationLoop(()=>{
 if(movement){
  const t=Math.min((performance.now()-movement.start)/movement.duration,1),ease=t*t*(3-2*t);
  camera.position.lerpVectors(movement.from,movement.to,ease);
  controls.target.lerpVectors(movement.lookFrom,movement.lookTo,ease);
  camera.fov=T.MathUtils.lerp(movement.fovFrom,movement.fovTo,ease);camera.updateProjectionMatrix();
  camera.lookAt(controls.target);
  if(t===1){const wasHome=movement.home;movement=null;controls.enabled=true;controls.enableDamping=true;moveMarker.visible=false;$('#walk-status').textContent=wasHome?'':'이동했습니다. 바닥을 누르면 다시 이동할 수 있어요.';controls.update()}
 }else controls.update();
 const time=performance.now()*.001;models.forEach(m=>{m.position.y=m.userData.floatBaseY+Math.sin(time*.9+m.userData.floatPhase)*.055}); r.render(scene,camera);if(dialog.open){vcontrols.update();vr.render(vs,vc)}
})}

document.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>openItem(+b.dataset.item));$('#home').onclick=()=>home();$('#close').onclick=close;dialog.addEventListener('close',()=>lastFocus?.focus());$('#next').onclick=()=>openItem(selected+1);$('#previous').onclick=()=>openItem(selected-1);$('#front').onclick=()=>{vc.position.set(0,.08,3.8);vcontrols.target.set(0,0,0);vcontrols.update()};$('#back').onclick=()=>{vc.position.set(0,.08,-3.8);vcontrols.target.set(0,0,0);vcontrols.update()};$('#auto').onclick=()=>{vcontrols.autoRotate=!vcontrols.autoRotate;$('#auto').setAttribute('aria-pressed',String(vcontrols.autoRotate))};addEventListener('resize',resize);dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')openItem(selected+1);if(e.key==='ArrowLeft')openItem(selected-1)});init().catch(e=>{console.error(e);$('#loading').hidden=false;$('#loading').textContent='3D 전시실을 열지 못했습니다. WebGL을 지원하는 브라우저에서 새로고침해 주세요.'});
