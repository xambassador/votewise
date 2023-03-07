import React from "react";

import { SelectField, TextAreaField, TextField } from "@votewise/ui";

const options = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export function StepOne() {
  return (
    <>
      <TextField
        name="username"
        label="Username"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
      />

      <TextField
        name="name"
        label="Name"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
      />

      <SelectField
        name="gender"
        label="Gender"
        labelProps={{
          className: "font-medium",
        }}
        options={options}
        placeholder=""
      />

      <TextAreaField
        name="about"
        label="About yourself"
        className="resize-none"
        labelProps={{
          className: "font-medium",
        }}
      />
    </>
  );
}

export function StepTwo() {
  return (
    <>
      <TextField
        name="location"
        label="Location"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
      />

      <TextField
        name="twitter"
        label="Twitter (optional)"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
      />

      <TextField
        name="facebook"
        label="Facebook (optional)"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
      />

      <TextField
        name="instagram"
        label="Instagram (optional)"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
      />
    </>
  );
}
