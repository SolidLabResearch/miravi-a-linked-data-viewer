import { ImageField, UrlField } from "react-admin";

export const typeMapper = {
  img: CustomImageField,
  url: CustomURLField,
};

function CustomImageField({ source, record }) {
  record[source] = getRawData(record, source);

  return <ImageField record={record} source={source} />;
}

function CustomURLField({source, record}) {
  record[source] = getRawData(record, source);

  return <UrlField record={record} source={source} />;
}

function getRawData(record, source){
  let value = record[source];
  if(value){
    const newValue = value.id ? value.id : value.value;
    if(newValue){
      value = newValue;
    }
  }
  return value;
}
