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
            const targetManifest = path.join(samplesDir, 'manifest.json');

            if (fs.existsSync(targetManifest)) {
                console.log(`[Auto-Extract] Skipping ${zipFile}: already extracted to ${samplesDir}.`);
                continue;
            }

            console.log(`[Auto-Extract] Extracting ${zipFile} into ${samplesDir}...`);
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(samplesDir, true);
            console.log(`[Auto-Extract] Successfully extracted ${zipFile}.`);
        }
    }
} catch (error) {
    console.error('[Auto-Extract] Error during automatic zip extraction:', error);
}
