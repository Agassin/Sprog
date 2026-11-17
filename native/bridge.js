import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
const isNative = Capacitor.isNativePlatform();
const exportPath = 'sprog-export.json';
window.NativeBridge = {
  isNative,
  async exportFile(content) {
    const result = await Filesystem.writeFile({path:exportPath, data:content, directory:Directory.Cache, encoding:Encoding.UTF8});
    await Share.share({title:'Sauvegarde Sprog', files:[result.uri], dialogTitle:'Conserver ma sauvegarde'});
  },
  async clearExports() {
    try {await Filesystem.stat({path:exportPath,directory:Directory.Cache});} catch {return;}
    await Filesystem.deleteFile({path:exportPath,directory:Directory.Cache});
  },
  minimize() {return App.minimizeApp();}
};
if (isNative) {
  App.addListener('backButton', () => window.dispatchEvent(new Event('sprog-back')));
  App.addListener('appStateChange', ({isActive}) => {if(isActive) document.dispatchEvent(new Event('visibilitychange'));});
}
