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

    // ------------------------------------------
    // MOCK IMPLEMENTATION
    // ------------------------------------------
    //
    // Later:
    //
    // Electron FS
    //
    // extractPath/manifest.json
    //
    // JSON.parse(...)
    //
    // ------------------------------------------

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