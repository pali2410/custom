import {writeFile,mkdir} from 'node:fs/promises';
import {createNetwork,train,forward,loss} from '../src/utils/network.js';
const n=train(createNetwork(),3000),{hidden,output}=forward(n,[0,1]);
const nodes=[[[120,180],[120,320]],[[500,100],[500,200],[500,300],[500,400]],[[880,250]]];
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520"><rect width="1000" height="520" rx="16" fill="#141e17"/><g font-family="monospace" fill="#becdaa"><text x="45" y="40" font-size="17">pali2410 / NEURAL LABORATORY</text><text x="45" y="485" font-size="14">XOR · 3,000 training steps · loss ${loss(n).toFixed(4)} · input [0,1] · prediction ${output.toFixed(4)}</text>`;
for(let a=0;a<2;a++)for(let b=0;b<4;b++){const w=n.w[b][a];svg+=`<path d="M${nodes[0][a].join(',')} L${nodes[1][b].join(',')}" stroke="${w>0?'#b2c68a':'#ba967d'}" opacity=".45" stroke-width="${Math.min(5,Math.abs(w)+.5)}"/>`;}
for(let a=0;a<4;a++){svg+=`<path d="M${nodes[1][a].join(',')} L${nodes[2][0].join(',')}" stroke="${n.v[a]>0?'#b2c68a':'#ba967d'}" opacity=".45" stroke-width="${Math.min(5,Math.abs(n.v[a])+.5)}"/>`;}
nodes.forEach((layer,l)=>layer.forEach(([x,y],i)=>{const value=l===0?[0,1][i]:l===1?hidden[i]:output;svg+=`<circle cx="${x}" cy="${y}" r="28" fill="${l===2?'#d3b67e':'#a9bd80'}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" fill="#172116">${value.toFixed(2)}</text>`;}));
svg+='<text x="120" y="440" text-anchor="middle">INPUT</text><text x="500" y="440" text-anchor="middle">tanh / HIDDEN</text><text x="880" y="440" text-anchor="middle">sigmoid</text></g></svg>';
await mkdir('public/images',{recursive:true});await writeFile('public/images/neural-laboratory.svg',svg);
console.log('Rendered neural artwork from actual trained weights and activations.');
