

/**
 * This handles a thermostat "program". As in, how the temerature threshold should change thoughout the day
 */
module.exports = class Program {

  /**
   * Creates a new instance of Program.
   *
   * @param def Default threshold to return in case all programs return undefined
   * @param programs array of programs to try in order. If they return undefined, the next program is tried
   */
  constructor(def, programs) {
    // Default to 21.3C (70.3F)
    if (def == undefined) def = 21.3;
    this.default = def;

    // Make sure we've at least got an empty array
    this.programs = programs || [];
  }

  /**
   * Add a program to the list of programs to run
   *
   * @param prog A function that returns a number to be used as a threshold in degC or undefined
   */
  addProgram(prog) {
    this.programs.push();
  }

  /**
   * Remove a previously added program from the list of programs
   */
  removeProgram(prog) {
    // Find the index of the element to remove
    var index = this.programs.indexOf(prog);
    // If not found, we're done
    if (index === -1) return;
    // Remove one element at the found index
    this.programs.splice(index, 1);
  }

  /**
   * Set a default threshold to use
   */
  setDefaultThreshold(threshold) {
    return this.default = threshold;
  }

  /**
   * Check all 'programs' for what the threshold should be right now
   */
  getCurrentThreshold() {
    // Use reduce to run all the programs
    for (var i = 0; i < this.programs.length; i++) {
      var prog = this.programs();
      // If a program reuturns a number, that's the threshold we're using.
      if (prog !== undefined) {
        // Stop and don't check other "programs"
        return prog;
      }
    }
    // If all programs returned undefined, return default threshold
    return this.default;
  }
}
