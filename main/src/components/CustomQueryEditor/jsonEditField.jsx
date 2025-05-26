import { useEffect, useRef, useState } from 'react';

import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.js';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import jsonlint from 'jsonlint-mod';

import './jsonEditField.css';

import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
} from '@mui/material';

export function JsonEditField({
  required = false,
  label,
  name,
  helperText,
  value,
  onChange
}) {
  const parentRef = useRef(null);
  const cmInstance = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange() {
    const value = cmInstance.current.getValue();
    let newErrorMsg = "";
    if (required && value.trim() === '') {
      newErrorMsg = "This field is required";
    } else {
      try {
        JSON.parse(value);
      } catch (e) {
        newErrorMsg = "Check syntax";
      }
    }
    setErrorMsg(newErrorMsg);
    if (onChange) {
      // construct an event with properties as expected in customEditor
      onChange({ target: { name, value, validFlag: (newErrorMsg == "") } });
    }
  }

  useEffect(() => {
    window.jsonlint = jsonlint;

    if (parentRef.current && !cmInstance.current) {
      cmInstance.current = new CodeMirror(parentRef.current, {
        mode: {name: "javascript", json: true},
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        value,
        inputStyle: "textarea",
        gutters: ['CodeMirror-lint-markers'],
        lint: true
      });

      cmInstance.current.on('change', () => {
        handleChange();
      });

      // force first change event
      handleChange();
    }

    return () => {
      if (cmInstance.current) {
        cmInstance.current.getWrapperElement().remove(); // remove DOM node and count on GC to clean up
        cmInstance.current = null;
      }
    };
  }, []);

  // accept external updates to value
  useEffect(() => {
    if (value != cmInstance.current.getValue()) {
      cmInstance.current.setValue(value);
      handleChange();
    }
  }, [value]);

  return (
    <FormControl
      fullWidth
      variant="outlined"
      required={required}
      error={errorMsg !== ""}
      sx={{ marginBottom: '16px' }}
    >
      <Box sx={{ position: 'relative', mt: 1}}>
        {label && (
          <InputLabel
            shrink
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'white',
              px: 0.5,
              zIndex: 1,
              color: errorMsg ? 'error.main' : 'rgba(0, 0, 0, 0.6)',
            }}
          >
            {label}
          </InputLabel>
        )}
        <Box
          component="fieldset"
          sx={{
            border: '1px solid',
            borderColor: errorMsg ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            p: 1,
            '& .resizeWrapper': {
              display: 'none !important'
            }
          }}
        >
          <div className="jsonField" ref={parentRef} id={`json-edit-field-${name}`} />
        </Box>
      </Box>

      <FormHelperText>
        {errorMsg ? `${helperText} (${errorMsg})` : helperText}
      </FormHelperText>
    </FormControl>
  );
}
