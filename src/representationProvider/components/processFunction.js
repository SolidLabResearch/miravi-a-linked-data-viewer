export function getRawData(record, source) {
    let value = record[source];
    if (value) {
      const newValue = value.id ? value.id : value.value;
      if (newValue) {
        value = newValue;
      }
    }
    return value;
  }
  