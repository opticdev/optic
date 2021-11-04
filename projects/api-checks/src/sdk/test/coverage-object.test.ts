import { wrapObjectInCoverageProxy } from "../coverage-object";

describe("object tracking its coverage", () => {
  const example = [
    {
      country: "NA",
      name: "City Name",
      lat: "44.46372",
      stats: {
        population: [
          {
            year: 2020,
            scalar: 4.3,
            unit: "million",
          },
          {
            year: 2010,
            scalar: 4.3,
            unit: "million",
          },
        ],
      },
      lng: "1.49129",
    },
  ];

  it("can return json paths", () => {
    const coverageTrackingObject = wrapObjectInCoverageProxy(example);
    coverageTrackingObject.forEach((i) => {
      const lat = i.lat;
      const population = i.stats.population;
    });

    expect(coverageTrackingObject._coverage).toMatchSnapshot();
  });
});
