class PackageExtractor {
  constructor() {
    this.extractPath = "";
    this.extractedPackages = new Map();
  }

  /**
   * Extract an ELAB package.
   *
   * @param {string} packagePath
   * @returns {Promise<string>}
   */
  async extract(packagePath) {

    // Check if we are running in Node/Electron environment
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const { default: AdmZip } = await import("adm-zip");

        if (fs.existsSync(packagePath)) {
          const parsedPath = path.parse(packagePath);
          const targetDir = parsedPath.dir;
          const targetManifest = path.join(targetDir, "manifest.json");

          if (this.extractedPackages.has(packagePath) || fs.existsSync(targetManifest)) {
            this.extractPath = targetDir;
            this.extractedPackages.set(packagePath, targetDir);
            return this.extractPath;
          }

          const zip = new AdmZip(packagePath);
          zip.extractAllTo(targetDir, true);

          this.extractPath = targetDir;
          this.extractedPackages.set(packagePath, targetDir);
          return this.extractPath;
        } else {
          console.warn("[PackageExtractor] Package file not found:", packagePath);
        }
      } catch (err) {
        console.error("[PackageExtractor] Error during extraction:", err);
      }
    }

    // Fallback/Mock behavior for browser environment
    this.extractPath = "/runtime/cache/package";
    return this.extractPath;
  }

  /**
   * Get current extracted path.
   */
  getExtractPath() {
    return this.extractPath;
  }

  /**
   * Clear extraction state.
   */
  reset() {
    this.extractPath = "";
    this.extractedPackages.clear();
  }
}

export default PackageExtractor;