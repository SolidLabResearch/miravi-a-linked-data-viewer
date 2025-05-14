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
  const [error, setError] = useState(false);

  function handleChange() {
    const value = yasqeInstance.current.getValue();
    if (required) {
      setError(value.trim() === '');
    }
    if (onChange) {
      // construct an event with properties as expected in customEditor
      onChange({ target: { name, value } });
    }
  }

  useEffect(() => {
    if (parentRef.current && !yasqeInstance.current) {
      yasqeInstance.current = new Yasqe(parentRef.current, {
        modes: ['sparql'],
        indentUnit: 2,
        tabSize: 2,
        value,
        inputStyle: "textarea",
      });

      yasqeInstance.current.on('change', () => {
        handleChange(value);
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
      error={error}
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
              color: error ? 'error.main' : 'rgba(0, 0, 0, 0.6)',
            }}
          >
            {label}
          </InputLabel>
        )}
        <Box
          component="fieldset"
          sx={{
            border: '1px solid',
            borderColor: error ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
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
        {error && required ? 'This field is required.' : helperText}
      </FormHelperText>
    </FormControl>
  );
}
