import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const samplesDir = path.resolve('src/runtime/samples');

try {
    if (fs.existsSync(samplesDir)) {
        const files = fs.readdirSync(samplesDir);
        const zipFiles = files.filter(f => f.endsWith('.zip'));

        for (const zipFile of zipFiles) {
            const zipPath = path.join(samplesDir, zipFile);
            console.log(`[Auto-Extract] Extracting ${zipFile} into ${samplesDir}...`);
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(samplesDir, true);
            console.log(`[Auto-Extract] Successfully extracted ${zipFile}.`);
        }
    }
} catch (error) {
    console.error('[Auto-Extract] Error during automatic zip extraction:', error);
}
