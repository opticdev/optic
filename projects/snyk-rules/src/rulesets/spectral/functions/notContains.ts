export default (targetVal, opts) => {
  const { field, values } = opts;
  const fieldArray = targetVal.map((item) => item[field]);

  for (const value of values) {
    if (fieldArray.includes(value)) {
      return [
        {
          message: `Array must not include {value}.`,
        },
      ];
    }
  }
};
