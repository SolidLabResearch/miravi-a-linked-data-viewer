/**
 * 
 * @param {object} record an object of RDF/JS objects 
 * @param {string} source the key of record which is to be processed
 * @returns {string} the id or value of the record at the given source key
 */
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