const fs = require('node:fs');
const path = require('node:path');
const files = ['index.html','app.js','data.js','program.js','style.css','sw.js','manifest.webmanifest','privacy.html','icon.svg','icon-180.png','icon-192.png','icon-512.png'];
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');
for(const file of files) fs.copyFileSync(file,path.join('dist',file));
if(process.argv.includes('--native')) {
  require('esbuild').buildSync({entryPoints:['native/bridge.js'],bundle:true,outfile:'dist/native.js',format:'iife',target:'es2020'});
  const html=fs.readFileSync('dist/index.html','utf8').replace('<script src="program.js">','<script src="native.js"></script>\n<script src="program.js">');
  fs.writeFileSync('dist/index.html',html);
}
console.log('Application copiée dans dist/');
