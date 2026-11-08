import {readdir,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const base=process.argv[2]??'http://127.0.0.1:4173/custom/';
const hash=b=>createHash('sha256').update(b).digest('hex');
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?walk(join(dir,e.name)):join(dir,e.name)))).flat();}
const files=await walk('dist');
for(const file of files){const path=relative('dist',file).replaceAll('\\','/');const response=await fetch(new URL(path,base));if(!response.ok)throw Error(`${path}: HTTP ${response.status}`);if(hash(await readFile(file))!==hash(Buffer.from(await response.arrayBuffer())))throw Error(`${path}: served bytes differ from build`);}
console.log(`Verified ${files.length} production files at ${base}; all served bytes match the build.`);
