class PackageValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate package manifest.
   *
   * @param {Object} manifest
   * @returns {boolean}
   */
  validate(manifest) {
    this.reset();

    console.log("[PackageValidator] Validating package...");

    if (!manifest) {
      this.errors.push("Manifest not found.");
      return false;
    }

    if (!manifest.packageVersion) {
      this.errors.push("Missing packageVersion.");
    }

    if (!manifest.packageId) {
      this.errors.push("Missing packageId.");
    }

    if (!manifest.title) {
      this.errors.push("Missing title.");
    }

    if (!manifest.experienceFile) {
      this.errors.push("Missing experience file.");
    }

    if (!manifest.assetsFolder) {
      this.errors.push("Missing assets folder.");
    }

    if (!manifest.minimumRuntimeVersion) {
      this.warnings.push(
        "Minimum runtime version not specified."
      );
    }

    return this.errors.length === 0;
  }

  /**
   * Returns validation errors.
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Returns validation warnings.
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * Returns validation summary.
   */
  getResult() {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Reset validator state.
   */
  reset() {
    this.errors = [];
    this.warnings = [];
  }
}

export default PackageValidator;