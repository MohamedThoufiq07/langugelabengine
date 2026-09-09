import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const samplesDir = path.resolve('src/runtime/samples');

try {
    if (fs.existsSync(samplesDir)) {
        // Clean up legacy extracted files at the samples root if any exist
        ['experience.json', 'metadata.json', 'manifest.json'].forEach(file => {
            const rootFile = path.join(samplesDir, file);
            if (fs.existsSync(rootFile)) {
                fs.unlinkSync(rootFile);
            }
        });

        const files = fs.readdirSync(samplesDir);
        const zipFiles = files.filter(f => f.endsWith('.zip'));

        for (const zipFile of zipFiles) {
            const folderName = path.parse(zipFile).name;
            const targetDir = path.join(samplesDir, folderName);
            const targetManifest = path.join(targetDir, 'manifest.json');
            const targetExperience = path.join(targetDir, 'experience.json');

            if (fs.existsSync(targetManifest) || fs.existsSync(targetExperience)) {
                console.log(`[Auto-Extract] Skipping ${zipFile}: already extracted to ${folderName}.`);
                continue;
            }

            console.log(`[Auto-Extract] Extracting ${zipFile} into ${folderName}...`);
            const zipPath = path.join(samplesDir, zipFile);
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(targetDir, true);
            console.log(`[Auto-Extract] Successfully extracted ${zipFile} to ${folderName}.`);
        }
    }
} catch (error) {
    console.error('[Auto-Extract] Error during automatic zip extraction:', error);
}

