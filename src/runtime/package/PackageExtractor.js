class PackageExtractor {
  constructor() {
    this.extractPath = "";
  }

  /**
   * Extract an ELAB package.
   *
   * @param {string} packagePath
   * @returns {Promise<string>}
   */
  async extract(packagePath) {
    console.log(
      "[PackageExtractor] Extracting package:",
      packagePath
    );

    // Check if we are running in Node/Electron environment
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const { default: AdmZip } = await import("adm-zip");

        if (fs.existsSync(packagePath)) {
          const zip = new AdmZip(packagePath);
          // Resolve extract path: e.g., in the same directory as the package
          const parsedPath = path.parse(packagePath);
          const targetDir = path.join(parsedPath.dir, parsedPath.name);

          // Create target directory if it doesn't exist
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          console.log("[PackageExtractor] Extracting to:", targetDir);
          zip.extractAllTo(targetDir, true);
          this.extractPath = targetDir;
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
  }
}

export default PackageExtractor;