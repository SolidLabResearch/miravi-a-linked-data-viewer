import { useEffect, useRef, useState } from 'react';
import Yasqe from '@triply/yasqe';
import "@triply/yasgui/build/yasgui.min.css";

import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
} from '@mui/material';

export function SparqlEditField({
  required = false,
  label,
  name,
  helperText,
  value,
  onChange
}) {
  const parentRef = useRef(null);
  const yasqeInstance = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange() {
    const value = yasqeInstance.current.getValue();
    let newErrorMsg = "";
    if (required && value.trim() === '') {
      newErrorMsg = "This field is required";
    } else if (!yasqeInstance.current.queryValid) {
      newErrorMsg = "Check syntax";
    }
    setErrorMsg(newErrorMsg);
    if (onChange) {
      // construct an event with properties as expected in customEditor
      onChange({ target: { name, value, validFlag: (newErrorMsg == "") } });
    }
  }

  useEffect(() => {
    if (parentRef.current && !yasqeInstance.current) {
      yasqeInstance.current = new Yasqe(parentRef.current, {
        indentUnit: 2,
        tabSize: 2,
        value,
        inputStyle: "textarea",
        persistencyExpire: 0
      });

      yasqeInstance.current.on('change', () => {
        handleChange();
      });
    }

    return () => {
      if (yasqeInstance.current) {
        yasqeInstance.current.destroy();
        yasqeInstance.current = null;
      }
    };
  }, []);

  // accept external updates to value
  useEffect(() => {
    if (value != yasqeInstance.current.getValue()) {
      yasqeInstance.current.setValue(value);
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
            '& .yasqe_buttons, & .resizeWrapper': {
              display: 'none !important'
            }
          }}
        >
          <div ref={parentRef} id={`sparql-edit-field-${name}`} />
        </Box>
      </Box>

      <FormHelperText>
        {errorMsg ? `${helperText} (${errorMsg})` : helperText}
      </FormHelperText>
    </FormControl>
  );
}
