const snakeCaseRegex = /^([a-z]+(_[a-z]+)*)$/;

export default (targetVal, _opts, context) => {
  const parts = targetVal.replace(/[?].*/, "").split(/[/]/);
  const invalid = parts
    // Filter out empty string (leading path) and params (different rule)
    .filter((part) => part.length > 0 && !part.match(/^[{].*[}]/))
    .filter((part) => !part.match(snakeCaseRegex));
  if (invalid.length > 0) {
    return [
      {
        message: `Path elements were not snake case: ${invalid.join(", ")}`,
      },
    ];
  }
};
