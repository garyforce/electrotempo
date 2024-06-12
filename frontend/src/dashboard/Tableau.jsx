import React, { useEffect, useRef } from "react";
// unused import required so window.tableau gets initialized
// eslint-disable-next-line no-unused-vars
import tableau from "tableau-api";

function Tableau(props) {
  const containerRef = useRef(null);
  const vizRef = useRef(null);

  useEffect(() => {
    if (vizRef.current !== null) {
      vizRef.current.dispose();
      vizRef.current = null;
    }
    const container = containerRef.current;
    vizRef.current = new window.tableau.Viz(container, props.url);
  }, [props.url]);

  return <div ref={containerRef} style={{ height: "100%" }} />;
}

export default Tableau;
