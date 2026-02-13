export const loginInitialValues = {
  email: "",
  password: ""
};

export const loginFormFields = [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "student@example.com"
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Password123!"
  }
];

export const loginMessages = {
  failed: "Login failed"
};
