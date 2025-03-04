import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createAdmins, adminSeed } from "@seeds/admin";

import { FormDataToObject } from "@helpers/object";

const mockedAdminData = createAdmins();

vi.mock("@actions/admin", () => {
  return {
    get: vi.fn(async () => mockedAdminData),
    updateForm: vi.fn(async formData => {
      const adminData = FormDataToObject(formData);

      const findAdmin = mockedAdminData.find(
        mockAdmin => mockAdmin.id === +adminData.id
      );

      if (findAdmin.email === adminData.email)
        return {
          error: "Admin and so it has this email!",
        };

      return {
        success: true,
      };
    }),
  };
});

import { updateForm } from "@actions/admin";

import FormExample from "@components/FormExample/FormExample";
import FormExampleContainer from "@components/FormExample/FormExampleContainer";

describe("FormExample async tests", async () => {
  const typedAdmin = adminSeed(),
    firstAdmin = mockedAdminData[0];

  test("FormExample empty admins", async () => {
    const { unmount } = render(<FormExample adminsIds={[]} />);

    const emptyText = await screen.findByText("Admins list is empty");
    const buttonSubmit = await screen.getByRole("button", { name: "Submit" });

    expect(emptyText).toBeDefined();
    expect(buttonSubmit).toHaveProperty("disabled", true);
    expect(buttonSubmit).toHaveProperty(
      "title",
      "Can't submit admins list empty"
    );

    unmount();
  });

  test("FormExample admins contains", async () => {
    const { unmount } = render(<FormExample adminsIds={mockedAdminData} />);

    expect(await screen.findByText("Choose admin id")).toBeDefined();

    const options = await screen.findAllByRole("option");

    expect(options).toHaveLength(mockedAdminData.length);

    options.forEach((option, iOption) =>
      expect(option).toHaveProperty(
        "textContent",
        mockedAdminData[iOption].id.toString()
      )
    );

    unmount();
  });

  test("FormExample success test send", async () => {
    const { unmount } = render(await FormExampleContainer());

    const select = screen.getByRole("combobox", { name: "Choose admin id" });

    const emailInput = screen.getByPlaceholderText("New email"),
      passwordInput = screen.getByPlaceholderText("New password");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.selectOptions(select, firstAdmin.id.toString());
    await userEvent.type(emailInput, typedAdmin.email);
    await userEvent.type(passwordInput, typedAdmin.password);

    await act(async () => submitButton.click());

    await waitFor(() => {
      expect(updateForm).toBeCalledWith(expect.any(FormData));

      const successText = screen.getByRole("paragraph", {
        value: "Success update!",
      });

      expect(successText).toBeDefined();

      unmount();
    });
  });

  test("FormExample error unique email test send", async () => {
    const { unmount } = render(await FormExampleContainer());

    const select = screen.getByRole("combobox", { name: "Choose admin id" });

    const emailInput = screen.getByPlaceholderText("New email"),
      passwordInput = screen.getByPlaceholderText("New password");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.selectOptions(select, firstAdmin.id.toString());
    await userEvent.type(emailInput, firstAdmin.email);
    await userEvent.type(passwordInput, firstAdmin.password);

    await act(async () => submitButton.click());

    await waitFor(() => {
      expect(updateForm).toBeCalledWith(expect.any(FormData));

      const erroredText = screen.getByRole("paragraph", {
        value: "Admin and so it has this email!",
      });

      expect(erroredText).toBeDefined();

      unmount();
    });
  });
});
