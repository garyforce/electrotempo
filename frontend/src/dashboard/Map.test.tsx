import ReactDOM from "react-dom";
import Map, { getColor } from "./Map";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Map />, div);
});

it("correctly gets color from grades", () => {
  const grade = [
    {
      lower: -Infinity,
      upper: 0.25,
      color: "#FFF2FE",
      label: "Less than 25%",
    },
    {
      lower: 0.25,
      upper: 0.5,
      color: "#FFA3F1",
      label: "25% to 50%",
    },
    {
      lower: 0.5,
      upper: 0.75,
      color: "#FD63DC",
      label: "50% to 75%",
    },
    {
      lower: 0.75,
      upper: 1,
      color: "#AD369D",
      label: "75% to 100%",
    },
    {
      lower: 1,
      upper: Infinity,
      color: "#5C1657",
      label: "Greater than 100%",
    },
  ];
  expect(getColor(grade)).toBe(grade[0].color);
  expect(getColor(grade, 0)).toBe(grade[0].color);
  expect(getColor(grade, 0.3)).toBe(grade[1].color);
  expect(getColor(grade, 0.5)).toBe(grade[2].color);
  expect(getColor(grade, 2)).toBe(grade[4].color);
  expect(getColor(grade, Infinity)).toBe(grade[4].color);
});
