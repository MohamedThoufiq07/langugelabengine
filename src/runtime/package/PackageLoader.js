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

import PackageValidator from "./PackageValidator.js";
import ManifestReader from "./ManifestReader.js";
import PackageExtractor from "./PackageExtractor.js";
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

        const extractionPath = await this.extractor.extract(packagePath);

        const manifest = await this.manifestReader.read(extractionPath);

        const isValid = await this.validator.validate(manifest);
        if (!isValid) {
            console.warn("[PackageLoader] Package validation failed:", this.validator.getErrors());
        }

        return {
            manifest
        };

    }

}

export default PackageLoader;