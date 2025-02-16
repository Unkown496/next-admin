import { expect, describe, test } from "vitest";
import { render, screen } from "@testing-library/react";

import Page from "@/app/page";

// Mocking next layout

/** Simple Layout file without html, body and like tag, for running test */
const MockLayout = ({ children }) => {
  return <>{children}</>;
};

describe("Test Index Layout With Page", () => {
  render(
    <MockLayout>
      <Page />
    </MockLayout>
  );

  test("Have elements", () => {
    expect(
      screen.getByRole("heading", { level: 1, name: "Next-Admin app" })
    ).toBeDefined();

    expect(
      screen.getByRole("heading", { level: 2, name: "Example server actions" })
    ).toBeDefined();

    expect(screen.getByText("Admin update form")).toBeDefined();

    expect(screen.getByRole("button", { name: "Next App" })).toBeDefined();
  });
});
