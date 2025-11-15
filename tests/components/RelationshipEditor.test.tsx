import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RelationshipEditor from "@/components/schema/editors/RelationshipEditor";
import type { ModelWithUI, CascadeOption } from "@/types/fastapiSpec";
import { CascadeOption as CascadeOptions } from "@/types/fastapiSpec";

const mockModels: ModelWithUI[] = [
  {
    id: "model-1",
    name: "User",
    tablename: "users",
    columns: [],
    position: { x: 0, y: 0 },
  },
  {
    id: "model-2",
    name: "Post",
    tablename: "posts",
    columns: [],
    position: { x: 100, y: 0 },
  },
];

describe("RelationshipEditor", () => {
  it("should render cascade options", () => {
    render(
      <RelationshipEditor
        models={mockModels}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByText("Cascade Options")).toBeInTheDocument();
    expect(screen.getByText("Save/Update")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("should allow selecting cascade options", () => {
    const mockOnSave = jest.fn();

    render(
      <RelationshipEditor
        models={mockModels}
        onSave={mockOnSave}
        onCancel={jest.fn()}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getByRole("textbox", { name: /relationship name/i }), {
      target: { value: "posts" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: /target model/i }), {
      target: { value: "Post" },
    });

    // Select a cascade option
    fireEvent.click(screen.getByText("Delete"));

    // Submit
    fireEvent.click(screen.getByText("Save"));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "posts",
        target: "Post",
        cascade: [CascadeOptions.DELETE],
      })
    );
  });

  it("should load existing relationship with cascade options", () => {
    const existingRelationship = {
      name: "posts",
      target: "Post",
      cascade: [CascadeOptions.DELETE, CascadeOptions.ALL] as CascadeOption[],
    };

    render(
      <RelationshipEditor
        relationship={existingRelationship}
        models={mockModels}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const deleteCheckbox = screen.getByRole("checkbox", { name: /delete$/i });
    const allCheckbox = screen.getByRole("checkbox", { name: /all/i });

    expect(deleteCheckbox).toBeChecked();
    expect(allCheckbox).toBeChecked();
  });
});
