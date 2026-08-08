class ManifestReader {
  constructor() {
    this.manifest = null;
  }

  /**
   * Reads manifest.json from extracted package.
   *
   * @param {string} extractPath
   * @returns {Promise<Object>}
   */
  async read(extractPath) {
    console.log(
      "[ManifestReader] Reading manifest from:",
      extractPath
    );

    // Check if we are running in Node/Electron environment
    if (typeof process !== "undefined" && process.versions && process.versions.node) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const manifestPath = path.join(extractPath, "manifest.json");

        if (fs.existsSync(manifestPath)) {
          const content = fs.readFileSync(manifestPath, "utf-8");
          const manifestData = JSON.parse(content);

          // Normalize keys for the validator and runtime
          this.manifest = {
            packageVersion: manifestData.packageVersion || manifestData.version || "1.0.0",
            packageId: manifestData.packageId || manifestData.package_name || String(manifestData.scenario_id || manifestData.experience_id || ""),
            title: manifestData.title || manifestData.scenario_title || manifestData.experience_title || "Untitled Experience",
            experienceFile: manifestData.experienceFile || (manifestData.files && manifestData.files.find(f => f.path.endsWith(".json") && !f.path.includes("manifest") && !f.path.includes("metadata"))?.path) || "experience.json",
            metadataFile: manifestData.metadataFile || "metadata.json",
            assetsFolder: manifestData.assetsFolder || (manifestData.files && manifestData.files.some(f => f.path.startsWith("media/")) ? "media" : "assets"),
            minimumRuntimeVersion: manifestData.minimumRuntimeVersion || manifestData.runtime_version || "1.0.0",
            ...manifestData
          };

          return this.manifest;
        } else {
          console.warn("[ManifestReader] manifest.json not found in:", extractPath);
        }
      } catch (err) {
        console.error("[ManifestReader] Error reading manifest:", err);
      }
    }

    // Fallback/Mock implementation for browser environment
    this.manifest = {
      packageVersion: "1.0.0",
      packageId: "restaurant-demo",
      title: "Restaurant Conversation",
      experienceFile: "experience.json",
      metadataFile: "metadata.json",
      assetsFolder: "assets",
      minimumRuntimeVersion: "1.0.0",
    };

    return this.manifest;
  }

  /**
   * Returns loaded manifest.
   */
  getManifest() {
    return this.manifest;
  }

  /**
   * Clears manifest.
   */
  reset() {
    this.manifest = null;
  }
}

export default ManifestReader;