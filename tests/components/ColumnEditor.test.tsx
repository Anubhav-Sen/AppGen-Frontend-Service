import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ColumnEditor from "@/components/schema/editors/ColumnEditor";
import type { EnumWithUI } from "@/types/fastapiSpec";
import { ColumnTypeName } from "@/types/fastapiSpec";

const mockEnums: EnumWithUI[] = [
  {
    id: "enum-1",
    name: "Status",
    values: ["active", "inactive", "pending"],
    position: { x: 0, y: 0 },
  },
  {
    id: "enum-2",
    name: "Priority",
    values: ["low", "medium", "high"],
    position: { x: 100, y: 0 },
  },
];

describe("ColumnEditor", () => {
  it("should render basic column form", () => {
    render(
      <ColumnEditor
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByText("Column Name")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
  });

  it("should show enum selector when ENUM type is selected", () => {
    render(
      <ColumnEditor
        enums={mockEnums}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onCreateEnum={jest.fn()}
      />
    );

    // Select ENUM type from the type dropdown
    const typeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(typeSelect, { target: { value: ColumnTypeName.ENUM } });

    expect(screen.getByText("Enum Type")).toBeInTheDocument();
    expect(screen.getByText("Status (3 values)")).toBeInTheDocument();
    expect(screen.getByText("Priority (3 values)")).toBeInTheDocument();
  });

  it("should show New button for creating enum when onCreateEnum is provided", () => {
    render(
      <ColumnEditor
        enums={mockEnums}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onCreateEnum={jest.fn()}
      />
    );

    const typeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(typeSelect, { target: { value: ColumnTypeName.ENUM } });

    expect(screen.getByRole("button", { name: /new/i })).toBeInTheDocument();
  });

  it("should show inline enum creator when New is clicked", () => {
    render(
      <ColumnEditor
        enums={mockEnums}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onCreateEnum={jest.fn()}
      />
    );

    const typeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(typeSelect, { target: { value: ColumnTypeName.ENUM } });

    fireEvent.click(screen.getByRole("button", { name: /new/i }));

    expect(screen.getByPlaceholderText(/e.g., Status, Priority/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add value/i)).toBeInTheDocument();
  });

  it("should call onCreateEnum when creating a new enum", () => {
    const mockCreateEnum = jest.fn().mockReturnValue("new-enum-id");

    render(
      <ColumnEditor
        enums={mockEnums}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        onCreateEnum={mockCreateEnum}
      />
    );

    // Select ENUM type
    const typeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(typeSelect, { target: { value: ColumnTypeName.ENUM } });

    // Click New to show creator
    fireEvent.click(screen.getByRole("button", { name: /new/i }));

    // Fill in enum name
    fireEvent.change(screen.getByPlaceholderText(/e.g., Status, Priority/i), {
      target: { value: "NewEnum" },
    });

    // Add a value
    fireEvent.change(screen.getByPlaceholderText(/add value/i), {
      target: { value: "value1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // Create enum
    fireEvent.click(screen.getByRole("button", { name: /create enum/i }));

    expect(mockCreateEnum).toHaveBeenCalledWith({
      name: "NewEnum",
      values: ["value1"],
    });
  });

  it("should include enum_class in column type when saving ENUM column", () => {
    const mockOnSave = jest.fn();

    render(
      <ColumnEditor
        enums={mockEnums}
        onSave={mockOnSave}
        onCancel={jest.fn()}
      />
    );

    // Fill column name (first textbox)
    const textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[0], { target: { value: "status" } });

    // Select ENUM type
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: ColumnTypeName.ENUM } });

    // Select existing enum (now there's a second select for enum type)
    const enumSelect = screen.getAllByRole("combobox")[1];
    fireEvent.change(enumSelect, { target: { value: "Status" } });

    // Save
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "status",
        type: expect.objectContaining({
          name: ColumnTypeName.ENUM,
          enum_class: "Status",
        }),
      })
    );
  });
});
