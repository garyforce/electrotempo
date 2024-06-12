import React from "react";
import ReactDOMServer from "react-dom/server";
import L from "leaflet";

import "./Legend.css";

const LegendContents = (props) => {
  return (
    <>
      <h4>{props.title}</h4>
      <h5>{props.units}</h5>
      <table>
        {props.grades.map((grade) => {
          return (
            <tr key={grade.label}>
              <td>
                <i style={{ backgroundColor: grade.color }} />
              </td>
              <td> {grade.label}</td>
            </tr>
          );
        })}
      </table>
    </>
  );
};

export default function createLegend(title, units, colorGrade, className) {
  let demandDensityLegend = L.control({ position: "bottomright" });
  demandDensityLegend.onAdd = () => {
    className = className || "";
    let div = L.DomUtil.create("div", `info legend ${className}`);
    div.innerHTML = ReactDOMServer.renderToString(
      <LegendContents
        title={title}
        units={units}
        grades={colorGrade}
        className={"mapLegend"}
      />
    );
    return div;
  };
  return demandDensityLegend;
}
