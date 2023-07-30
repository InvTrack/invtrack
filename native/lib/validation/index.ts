import { isFinite } from "lodash";
import { ValidateResult } from "react-hook-form";

// this is currently unused but a nice concept to explore

export const isRequired = <
  T extends string | number,
  U extends Record<string, any>
>(
  value: T,
  _formValues: U
): ValidateResult => {
  if (value === undefined || value === null || value === "") {
    return "To pole jest wymagane";
  }
  return true;
};

export const isTwoPointPrecisionNumber = <
  T extends string | number,
  U extends Record<string, any>
>(
  value: T,
  _formValues: U
): ValidateResult => {
  const convertedValue = value + "";
  if (/^[0-9]+(\.[0-9]{1,2})?$/.test(convertedValue) === false) {
    return "Niepoprawna wartość, maksymalnie 2 miejsca po przecinku";
  }

  return true;
};

export const isNumber = <
  T extends string | number,
  U extends Record<string, any>
>(
  value: T,
  _formValues: U
): ValidateResult => {
  const convertedValue = +value;

  if (isFinite(convertedValue)) {
    return "Niepoprawna wartość, tylko liczby";
  }

  return true;
};
