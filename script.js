const form = document.getElementById("contactForm");
const successToast = document.getElementById("successToast");

if (form) {
  const firstNameInput = form.elements.firstName;
  const lastNameInput = form.elements.lastName;
  const emailInput = form.elements.email;
  const messageInput = form.elements.message;
  const consentCheckbox = form.elements.consent;
  const queryRadios = Array.from(form.elements.queryType);
  const queryFieldset = form.querySelector("fieldset.field");
  const queryError = document.getElementById("queryType-error");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errorText = {
    required: "This field is required",
    emailInvalid: "Please enter a valid email address",
    queryType: "Please select a query type",
    consent: "To submit this form, please consent to being contacted",
  };

  const setErrorState = (control, message) => {
    if (!control) return;
    const wrapper = control.closest("[data-field], fieldset.field");
    if (wrapper) {
      wrapper.classList.add("has-error");
    }

    const describedBy = control.getAttribute("aria-describedby");
    const errorElement = describedBy
      ? document.getElementById(describedBy)
      : wrapper?.querySelector(".error-message");
    if (errorElement) {
      errorElement.textContent = message;
    }

    if (
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement
    ) {
      control.setAttribute("aria-invalid", "true");
    }
  };

  const clearErrorState = (control) => {
    if (!control) return;
    const wrapper = control.closest("[data-field], fieldset.field");
    if (wrapper) {
      wrapper.classList.remove("has-error");
    }

    const describedBy = control.getAttribute("aria-describedby");
    const errorElement = describedBy
      ? document.getElementById(describedBy)
      : wrapper?.querySelector(".error-message");
    if (errorElement) {
      errorElement.textContent = "";
    }

    if (
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement
    ) {
      control.removeAttribute("aria-invalid");
    }
  };

  const validateRequiredField = (input) => {
    const value = input.value.trim();
    if (!value) {
      setErrorState(input, errorText.required);
      return false;
    }

    clearErrorState(input);
    return true;
  };

  const validateEmailField = () => {
    const value = emailInput.value.trim();
    if (!value) {
      setErrorState(emailInput, errorText.required);
      return false;
    }

    if (!EMAIL_PATTERN.test(value)) {
      setErrorState(emailInput, errorText.emailInvalid);
      return false;
    }

    clearErrorState(emailInput);
    return true;
  };

  const setQueryError = (message) => {
    if (!queryFieldset) return;
    if (message) {
      queryFieldset.classList.add("has-error");
      if (queryError) {
        queryError.textContent = message;
      }
      queryRadios.forEach((radio) =>
        radio.setAttribute("aria-invalid", "true")
      );
    } else {
      queryFieldset.classList.remove("has-error");
      if (queryError) {
        queryError.textContent = "";
      }
      queryRadios.forEach((radio) => radio.removeAttribute("aria-invalid"));
    }
  };

  const validateQueryGroup = () => {
    const hasSelection = queryRadios.some((radio) => radio.checked);
    if (!hasSelection) {
      setQueryError(errorText.queryType);
      return false;
    }

    setQueryError("");
    return true;
  };

  const validateConsent = () => {
    if (!consentCheckbox.checked) {
      setErrorState(consentCheckbox, errorText.consent);
      return false;
    }

    clearErrorState(consentCheckbox);
    return true;
  };

  let hideToastTimeoutId = null;

  const validators = {
    firstName: () => validateRequiredField(firstNameInput),
    lastName: () => validateRequiredField(lastNameInput),
    email: () => validateEmailField(),
    message: () => validateRequiredField(messageInput),
    queryType: () => validateQueryGroup(),
    consent: () => validateConsent(),
  };

  const clearAllValidation = () => {
    [
      firstNameInput,
      lastNameInput,
      emailInput,
      messageInput,
      consentCheckbox,
    ].forEach((control) => {
      clearErrorState(control);
    });
    setQueryError("");
  };

  firstNameInput.addEventListener("blur", validators.firstName);
  lastNameInput.addEventListener("blur", validators.lastName);
  emailInput.addEventListener("blur", validators.email);
  messageInput.addEventListener("blur", validators.message);

  [firstNameInput, lastNameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener("input", () => {
      const wrapper = input.closest("[data-field]");
      if (wrapper?.classList.contains("has-error")) {
        validators[input.name]?.();
      }
    });
  });

  queryRadios.forEach((radio) => {
    radio.addEventListener("change", validators.queryType);
    radio.addEventListener("focus", () => setQueryError(""));
  });

  consentCheckbox.addEventListener("change", validators.consent);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = Object.values(validators).every((validate) => validate());

    if (!isValid) {
      successToast.hidden = true;
      return;
    }

    form.reset();
    clearAllValidation();

    successToast.hidden = false;
    if (typeof successToast.focus === "function") {
      window.requestAnimationFrame(() => successToast.focus());
    }

    if (hideToastTimeoutId) {
      window.clearTimeout(hideToastTimeoutId);
    }

    hideToastTimeoutId = window.setTimeout(() => {
      successToast.hidden = true;
    }, 6000);
  });
}
