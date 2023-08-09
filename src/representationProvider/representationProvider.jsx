import { useEffect, useState } from "react";
import { ImageField, UrlField, useRecordContext } from "react-admin";

export const typeMapper = {
  img: CustomImageField,
  url: CustomURLField,
};

function CustomImageField({ source, record }) {
  let value = record[source];
  const newValue = value.id ? value.id : value.value;
  if (newValue) {
    value = newValue;
  }
  record[source] = value;

  return <ImageField record={record} source={source} />;
}

function CustomURLField({source, record}) {
  let value = record[source];
  const newValue = value.id ? value.id : value.value;
  if (newValue) {
    value = newValue;
  }
  record[source] = value;

  return <UrlField record={record} source={source} />;
}
