import { calculateCoveragePercentage } from "./coverage";

it("correctly calculates coverage", () => {
  let demand = {
    "483021359320": 10,
  };
  let coverage = {
    "483021359320": 10,
  };
  expect(calculateCoveragePercentage(demand, coverage)).toEqual({
    "483021359320": 1,
  });

  demand = {
    "483021359320": 10,
  };
  coverage = {
    "483021359320": 1,
  };
  expect(calculateCoveragePercentage(demand, coverage)).toEqual({
    "483021359320": 0.1,
  });

  demand = {
    "483021359320": 1,
  };
  coverage = {
    "483021359320": 10,
  };
  expect(calculateCoveragePercentage(demand, coverage)).toEqual({
    "483021359320": 10,
  });
});

it("correctly calculates Infinity coverage when demand is 0", () => {
  const demand = {
    "483021359320": 0,
  };
  const coverage = {
    "483021359320": 10,
  };
  expect(calculateCoveragePercentage(demand, coverage)).toEqual({
    "483021359320": Infinity,
  });
});

it("correctly calculates 0 coverage when coverage = 0 and demand is > 0", () => {
  const demand = {
    "483021359320": 10,
  };
  const coverage = {
    "483021359320": 0,
  };
  expect(calculateCoveragePercentage(demand, coverage)).toEqual({
    "483021359320": 0,
  });
});

it("correctly calculates 0 coverage when coverage = 0 and demand = 0", () => {
  let demand = {
    "483021359320": 0,
  };
  let coverage = {
    "483021359320": 0,
  };
  expect(calculateCoveragePercentage(demand, coverage)).toEqual({
    "483021359320": 0,
  });
});
