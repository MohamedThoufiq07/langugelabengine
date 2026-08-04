class AssetResolver {
  constructor() {
    this.assetsRoot = "";
  }

  /**
   * Set package assets folder.
   *
   * Example:
   * /runtime/cache/package/assets
   */
  setAssetsRoot(path) {
    this.assetsRoot = path;
  }

  /**
   * Resolve an asset path.
   *
   * Example:
   * images/bg.png
   *
   * =>
   *
   * /runtime/cache/package/assets/images/bg.png
   */
  resolve(assetPath) {
    if (!assetPath) {
      return "";
    }

    return `${this.assetsRoot}/${assetPath}`;
  }

  /**
   * Returns assets root.
   */
  getAssetsRoot() {
    return this.assetsRoot;
  }

  /**
   * Reset resolver.
   */
  reset() {
    this.assetsRoot = "";
  }
}

export default AssetResolver;