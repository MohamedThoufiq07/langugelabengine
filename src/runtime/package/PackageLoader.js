/**
 * ============================================================
 * EnglishLab Runtime Engine
 * ------------------------------------------------------------
 * PackageLoader
 *
 * Responsibilities
 * ----------------
 * ✓ Load ELAB Package
 * ✓ Validate Package
 * ✓ Read Manifest
 * ✓ Load Experience
 * ============================================================
 */

import PackageValidator from "./PackageValidator";
import ManifestReader from "./ManifestReader";
import PackageExtractor from "./PackageExtractor";
class PackageLoader {

    constructor() {

        this.validator =
            new PackageValidator();

        this.manifestReader =
            new ManifestReader();
this.extractor =
    new PackageExtractor();
    }

    /**
     * Load Package
     */
    async load(packagePath) {

        console.log("");

        console.log("========== PACKAGE ==========");

        console.log(packagePath);

        const extraction =
    await this.extractor.extract(packagePath);

await this.validator.validate(
    extraction.extractPath
);

const manifest =
    await this.manifestReader.read(
        extraction.extractPath
);

        return {

            manifest

        };

    }

}

export default PackageLoader;