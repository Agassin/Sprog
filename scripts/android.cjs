const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const run = args => execFileSync(process.execPath,['node_modules/@capacitor/cli/bin/capacitor',...args],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/build.cjs','--native'],{stdio:'inherit'});
if(!fs.existsSync('android')) run(['add','android']);
run(['sync','android']);
const manifest='android/app/src/main/AndroidManifest.xml';
fs.writeFileSync(manifest,fs.readFileSync(manifest,'utf8').replace('android:allowBackup="true"','android:allowBackup="false"'));
// Reuse the project icon at each launcher density instead of shipping the Capacitor logo.
for(const folder of fs.readdirSync('android/app/src/main/res').filter(x=>/^mipmap-(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)$/.test(x))) {
  for(const name of ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png']) fs.copyFileSync('icon-192.png','android/app/src/main/res/'+folder+'/'+name);
}
const gradle='android/app/build.gradle';
fs.writeFileSync(gradle,fs.readFileSync(gradle,'utf8').replace(/versionCode \d+/, 'versionCode '+(Number(process.env.GITHUB_RUN_NUMBER)||1)).replace(/versionName "[^"]+"/, 'versionName "3.0.0"'));
console.log('Projet Android préparé. Compiler avec : cd android && ./gradlew assembleDebug');
