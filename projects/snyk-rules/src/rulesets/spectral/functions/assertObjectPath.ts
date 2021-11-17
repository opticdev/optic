export default (targetVal, opts) => {
  for (let item of opts.path) {
    targetVal = targetVal && targetVal[item];
    if (!targetVal) {
      break;
    }
  }
  if (!targetVal) {
    return [
      {
        message: `${opts.path.join(".")} not defined`,
      },
    ];
  }
};
