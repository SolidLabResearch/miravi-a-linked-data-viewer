import React, { useEffect, useRef, useState  } from 'react';
import Yasqe from "@triply/yasqe";
import "@triply/yasgui/build/yasgui.min.css";


export default function YasqeField({onChange, name}) {
  const yasqeRef = useRef(null); // Create a ref to store the Yasqe instance

  const [query, setQuery] = useState('SELECT ?s ?p ?o \n WHERE { \n ?s ?p ?o \n}'); 

  useEffect(() => {
    // Initialize Yasqe only once
    if (!yasqeRef.current) {
      const yasqeInstance = new Yasqe(document.getElementById("yasqe"),{
        modes: ['sparql'], // Specify the modes (SPARQL, etc.)
        indentUnit: 3, // Number of spaces for indentation
        tabSize: 3,
      });
      yasqeInstance.setValue(query);
      yasqeRef.current = yasqeInstance; // Store the instance in the ref

      yasqeInstance.on('change', // onChange);
       () => {

        const event = {target: {
            name: name,
            value: yasqeInstance.getValue()
        }}
        setQuery(yasqeInstance.getValue()); // Save the query to state
        onChange(event)
    });
    }

    // Cleanup function: destroy Yasqe when the component is unmounted
    return () => {
      if (yasqeRef.current) {
        yasqeRef.current.destroy();
        yasqeRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      {/* Inline styles to hide the buttons */}
      <style>
      {`
        .yasqe_buttons{
         display: none !important;
        }
        `}
      </style>
      Sparql query:
      <p>Current query: {query}</p>
      <div id="yasqe" />
    </div>
  );
}