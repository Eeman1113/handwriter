/**
 * Handwriting synthesis engine.
 *
 * A port of the recurrent mixture-density network from Alex Graves,
 * "Generating Sequences With Recurrent Neural Networks" (2013), sec. 5.
 * The network emits one pen offset at a time -- dx, dy and a lift-the-pen
 * probability -- conditioned on the text, so every rendering of the same
 * word is a genuinely different piece of writing.
 *
 * Adapted from the calligrapher.ai implementation. Reworked here to drop all
 * DOM coupling: it takes text and returns stroke geometry, nothing more.
 *
 * Port and API: Eeman Majumder <eeman.majumder@gmail.com>
 */

/* eslint-disable */

// --- seedable RNG (reproducible output for a given seed) ---
let RNG = Math.random;

/** Seed the generator. Same seed + same text => same handwriting. */
export function setSeed(seed) {
  if (seed === null || seed === undefined) {
    RNG = Math.random;
    return;
  }
  let s = seed >>> 0 || 1;
  RNG = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Sampling temperature. Low = loose and sketchy, high = tidy and deliberate.
let BIAS = 0.85;

// Model weights, populated by loadModel().
let $ = null;
// Per-line character embeddings, recomputed for each line of text.
let er = null;

// --- network operations (dense/sparse matmuls, LSTM cells, MDN sampling) ---
var r,e,t,a=r=>e=>{var t=Y(K(e));for(let a=0;a<K(e);a++)t[a]=r(e[a]);return t},l=a(r=>Q(r)),o=a(r=>1/(1+N(-r))),n=a(r=>Q(1+N(r))),v=a(r=>{var e=N(2*r);return(e-1)/(e+1)}),i=r=>(e,t)=>{var a="number"==typeof t,l=Y(K(e));for(let o=0;o<K(e);o++)l[o]=r(e[o],a?t:t[o]);return l},u=i((r,e)=>r+e),f=i((r,e)=>r-e),s=i((r,e)=>r*e),h=i((r,e)=>r/e),d=r=>{var e=Y(K(r)),t=0;for(let a=0;a<K(r);a++)e[a]=N(r[a]),t+=e[a];for(let r=0;r<K(e);r++)e[r]=e[r]/t;return e},p=(r,e)=>{for(let t=0;t<K(r)/G;t++)for(let a=0;a<K(e);a++)r[t*G+a]=r[t*G+a]+e[a];return r},w=(r,e,t)=>{var a=K(r)+K(e),l=Y(a);for(let e=0;e<K(r);e++)l[e]=r[e];for(let t=0;t<K(e);t++)l[t+K(r)]=e[t];return l},m=(r,e)=>{var t=K(e)/K(r),a=Y(t);for(let o=0;o<t;o++){var l=0;for(let a=0;a<K(r);a++)l+=r[a]*e[a*t+o];a[o]=l}return a},g=(r,e)=>{var[t,a,l,o]=e,n=t[0],v=Y(n);for(let e=0;e<n;e++){var i=o[e],u=o[e+1],f=0;for(let e=i;e<u;e++)f+=a[e]*r[l[e]];v[e]=f}return v},b=(r,e)=>{var t=K(r)/e,a=[];for(let o=0;o<e;o++){var l=O(r,o*t,(o+1)*t);a.push(l)}return a},M=(r,e)=>{var t=[K(r),e],a=Y(t[0]*t[1]);for(let e=0;e<t[0];e++)for(let l=0;l<t[1];l++)a[e*t[1]+l]=r[e];return a},y=(r,e)=>{var t=[e[1]],a=Y(t[0]);for(let t=0;t<e[0];t++)for(let l=0;l<e[1];l++)a[l]+=r[t*e[1]+l];return a},x=(r,e,t)=>{var a=[K(e),t],l=Y(a[0]*a[1]);for(let a=0;a<K(e);a++){var o=e[a],n=O(r,o*t,(o+1)*t);l.set(n,a*t)}return l},C=(r,e,t)=>{if(1==t)var a=e.a,l=e.d,n=$.y,i=$.p;else if(2==t)n=$.w,i=$.q,a=e.b,l=e.e;else n=$.r,i=$.f,a=e.c,l=e.f;r=w(r,l);var f=u(g(r,n),i),[h,d,c,p]=b(f,4),m=u(s(o(c),a),s(o(h),v(d))),M=s(o(p),v(m));return 1==t?(e.a=m,e.d=M):2==t?(e.b=m,e.e=M):(e.c=m,e.f=M),M},A=r=>{r=[0,...r,0],r=Y(r);var e,t=((r,e)=>{var t=[K(r)/G-2,G],a=Y(t[0]*t[1]);for(let n=0;n<t[0];n++){var l=O(r,n*G,(n+3)*G);for(let r=0;r<t[1];r++){var o=0;for(let t=0;t<K(l);t++)o+=l[t]*e[r+G*t];a[n*t[1]+r]=o}}return a})(e=((r,e)=>{var t=[K(e),G],a=Y(t[0]*t[1]);for(let t=0;t<K(e);t++){var l=e[t],o=O(r,l*G,(l+1)*G);a.set(o,t*G)}return a})($.s,r),$.b),a=(t=p(t,$.t),t=v(t),((r,e,t)=>{var a=[K(r)/G,J],l=Y(a[0]*a[1]);for(let e=0;e<a[0];e++)for(let t=0;t<G;t++)l[e*a[1]+t]=r[e*G+t];for(let r=0;r<a[0];r++)for(let t=0;t<G;t++)l[r*a[1]+t+G]=e[r*G+t];return l})(e=O(e,G,K(e)-G),t)),l=$.j,o=$.E;return t=p(((r,e)=>{var t=[K(r)/J,J],a=[J,K(e)/J],l=K(e)/G,o=[K(r)/J,K(e)/J],n=Y(o[0]*o[1]);for(let i=0;i<o[0];i++)for(let u=0;u<o[1];u++){var v=0;for(let o=0;o<l;o++)v+=r[i*t[1]+o]*e[o*a[1]+u];n[i*o[1]+u]=v}return n})(a,l),o)},k=(r,e)=>{var t=m(r,$.h),[a,l,v]=(t=u(t,$.n),b(t,3));l=n(l),v=n(v),a=d(a),v=u(e.k,h(v,15)),e.k=v;var i=e.u;a=M(a,K(i)/10-1),l=M(l,K(i)/10),v=M(v,K(i)/10);var c=o(h(f(i,v),l)),p=s(a,(r=>{var e=[10,K(r)/10],t=[e[0],e[1]-1],a=Y(t[0]*t[1]);for(let o=0;o<t[0];o++){var l=o*e[1];for(let e=0;e<t[1];e++)a[o*t[1]+e]=r[l+e+1]-r[l+e]}return a})(c)),w=y(p,[10,K(p)/10]);t=er;w=M(w,G);var g=y(s(w,t),[K(w)/G,G]);return e.w=g,g},F=(r,e)=>{var t=m(r,$.i),a=(t=u(t,$.W),t=s(u(t,e.z),X),C(t,e,1)),l=(t=s(u(t,a),X),w(t,e.w)),n=C(l,e,2),i=k(n,e),f=w(n,i),h=(f=g(f,$.l),f=u(f,$.Q),f=v(f),t=s(u(t,f),X),(r=>{var e=$.c,t=$.u;return o(u(m(r,e),t))})(i)),d=C(t,e,3),c=(t=s(u(t,d),X),m(t,$.z));return[c=u(c,$.v),h]},U=r=>{var[e,t]=((r,e)=>{var t=[],a=0;for(let v=0;v<K(e);v++){var l=a,o=a+e[v],n=O(r,l,o);a=o,t.push(n)}return t})(r,[120,1]),a=o(t)[0],i=R()<a?1:0,[f,c,p,w]=((r,e)=>{var t=[],a=0;for(let v=0;v<K(e);v++){var l=a;a+=e[v];var o=[20,e[v]],n=Y(20*e[v]);for(let t=0;t<20;t++)for(let a=0;a<e[v];a++)n[t*o[1]+a]=r[6*t+(l+a)];t.push(n)}return t})(e,[1,2,1,2]);p=v(p);var g=BIAS,c=h(n(c),N(g)),f=(f=l(d(f)),s(f,1+g));for(let r=0;r<K(f);r++)f[r]<Q(.02)&&(f[r]=f[r]-100);var b=(r=>{var e=-1e6,t=0;for(let o=0;o<K(r);o++){var a=-Q(-Q(R())),l=r[o]+a;l>e&&(t=o,e=l)}return Y([t])})(f),M=x(w,b,2),y=x(c,b,2),C=x(p,b,1),A=y[0],k=y[1],F=[A,(C=C[0])*k,0,k*P(1-C*C)];F=Y(F);var U=(r=>{var e=Y(r);for(let n=0;n<r;n++){var t=1-R(),a=1-R(),l=P(-2*Q(t)),o=Math.cos(2*Math.PI*a);e[n]=l*o}return e})(2),L=u(M,m(U,F)),E=[L[0],L[1],i];return E=Y(E)},L=(r,e)=>{var[t,a]=F(r,e);return[U(t),a,e]};

// --- sparse weight decoders ---
var V=(r,e,t)=>{var a=0,l=[],o=[],n=[];for(let f=0;f<K(r);f++){var v=r[f];a+=e[f];var i=Math.floor(a/t[1]),u=a%t[1];0!=v&&(l.push(v),o.push(u),n.push(i))}var f=[0],s=0;for(let r=0;r<t[0];r++){for(;n[s]==r;)s+=1;f.push(s)}return[t,l,o,f]};
var _=(r,e,t)=>{var a=t.reduce((r,e)=>r*e,1),l=Y(a),o=K(r),n=0;for(let t=0;t<o;t++){var v=r[t];l[n+=e[t]]=v}return l};
var D=r=>{for(var e="",t=0;t<K(r);t++)e+=String.fromCharCode(r[t]);return e};

// --- character set and math shorthands ---
var H={"":0,"":2," ":8,'"':4,"&":84,"(":66,"*":80,",":37,".":7,0:62,2:63,4:68,6:71,8:76,":":74,B:47,D:52,F:53,H:41,J:64,L:48,N:38,P:46,R:55,T:31,V:39,X:79,Z:78,b:32,d:27,f:35,h:30,j:43,l:26,n:15,p:29,r:6,t:21,v:34,x:44,z:10,"":1,"":3,"!":72,"#":56,"'":16,")":67,"+":82,"-":40,"/":77,1:59,3:69,5:61,7:70,9:60,";":73,"?":51,A:9,C:57,E:42,G:45,I:23,K:58,M:5,O:36,Q:75,S:18,U:65,W:54,Y:50,"[":81,"]":83,a:14,c:20,e:19,g:33,i:13,k:28,m:12,o:25,q:49,s:17,u:11,w:24,y:22};
var N=Math.exp,P=Math.sqrt,Q=Math.log,R=()=>RNG(),W=(Math.abs,Math.max,Math.min,Math.floor),X=P(.5),G=256,J=512,K=r=>r.length,O=(r,e,t)=>r.slice(e,t),Y=function(){return new Float32Array(...arguments)};

// --- model loading ---

const SPARSE_KEYS = ["y", "w", "r", "l"];

/** Decode the packed weight file into the tensor dictionary the network uses. */
function parseModel(buffer) {
  const view = new DataView(buffer);
  const weights = {};
  let off = 0;

  while (off < view.byteLength) {
    // name
    const nameLen = view.getUint8(off); off += 1;
    const nameBytes = new Uint8Array(nameLen);
    for (let i = 0; i < nameLen; i++) { nameBytes[i] = view.getUint8(off); off += 1; }
    const name = D(nameBytes);

    // values
    const isSparse = view.getUint8(off); off += 1;
    const count = view.getUint32(off, true); off += 4;
    const values = new Float32Array(count);
    for (let i = 0; i < count; i++) { values[i] = view.getFloat32(off, true); off += 4; }

    // run-length offsets, present only for sparse tensors
    let offsets;
    if (isSparse) {
      offsets = new Uint8Array(count);
      for (let i = 0; i < count; i++) { offsets[i] = view.getUint16(off, true); off += 1; }
    }

    // shape
    const rank = view.getUint8(off); off += 1;
    const shape = new Uint16Array(rank);
    for (let i = 0; i < rank; i++) { shape[i] = view.getUint16(off, true); off += 2; }

    weights[name] = SPARSE_KEYS.includes(name)
      ? V(values, offsets, shape)   // keep sparse, as a CSR-ish triple
      : isSparse
        ? _(values, offsets, shape) // expand back to dense
        : values;
  }
  return weights;
}

/** Fetch and decode the weights. Must resolve before generate() is called. */
export async function loadModel(url) {
  if ($) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load the handwriting model (HTTP ${res.status})`);
  $ = parseModel(await res.arrayBuffer());
}

export function isLoaded() {
  return $ !== null;
}

/** Number of distinct handwriting styles baked into the model. */
export function styleCount() {
  return $ ? Math.floor(K($.g) / 64) : 0;
}

export const SUPPORTED_CHARS = Object.keys(H).filter((ch) => ch.trim().length || ch === " ");

// --- generation ---

/** Split the flat point list into strokes, breaking wherever the pen lifts. */
function toStrokes(points) {
  const strokes = [];
  let cur = [];
  for (const [x, y, penUp] of points) {
    cur.push([x, y]);
    if (penUp === 1) {
      if (cur.length > 1) strokes.push(cur);
      cur = [];
    }
  }
  if (cur.length > 1) strokes.push(cur);
  return strokes;
}

/**
 * Write one line of text.
 * Returns strokes in arbitrary model units, baseline running along y = 0 with
 * y pointing up, starting at x = 0. The caller decides the real size.
 */
function generateLine(text, styleIndex) {
  const chars = text.split("").map((ch) => (ch in H ? H[ch] : 1));
  const codes = Y([2, ...chars, 3]);           // 2 = start, 3 = end
  er = A(codes);                               // character embeddings for this line

  // initial network state, conditioned on the chosen style
  const n = K(codes) + 1;
  const win = Y(10 * n);
  for (let i = 0; i < 10; i++) for (let j = 0; j < n; j++) win[i * n + j] = j - 0.5;
  const styleVec = u(m(O($.g, 64 * styleIndex, 64 * (styleIndex + 1)), $.k), $.R);
  let state = { a: $.d, b: $.o, c: $.e, d: $.m, e: $.x, f: $.a, w: $.T, k: Y(10), u: win, z: styleVec };

  const limit = 40 * Math.max(text.length, 1);
  let input = Y([0, 0, 1]);
  const points = [[0, 0, 1]];
  let steps = 0;

  while (steps++ < limit) {
    const [next, endProb, nextState] = L(input, state);
    state = nextState;
    if (endProb > 0.55) break;
    input = next;
    const prev = points[points.length - 1];
    points.push([prev[0] + next[0], prev[1] + next[1], next[2]]);
  }

  // make sure the pen is lifted at the end
  const last = points[points.length - 1];
  if (last[2] === 0) points.push([last[0], last[1], 1]);

  return toStrokes(points);
}

/**
 * Write multi-line text. Blank lines are preserved as vertical gaps.
 *
 * @returns {{lines: Array<{text: string, strokes: number[][][]}>}}
 *          Strokes are in model units; every line starts at x = 0, baseline y = 0.
 */
export function generate(text, { style = 0, bias = 0.85, seed = null } = {}) {
  if (!$) throw new Error("Model is not loaded yet");
  setSeed(seed);
  BIAS = bias;

  const total = styleCount();
  const out = [];

  for (const raw of text.split("\n")) {
    const line = raw.trim().replace(/ +/g, " ");
    if (!line) { out.push({ text: "", strokes: [] }); continue; }
    const idx = style === "random" ? Math.floor(total * RNG()) : Math.min(style, total - 1);
    out.push({ text: line, strokes: generateLine(line, idx) });
  }

  setSeed(null);
  return { lines: out };
}

/** Bounding box of a set of strokes, in model units. */
export function bounds(strokes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const stroke of strokes) {
    for (const [x, y] of stroke) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}
