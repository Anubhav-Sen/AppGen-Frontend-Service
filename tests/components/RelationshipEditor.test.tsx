import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RelationshipEditor from "@/components/schema/editors/RelationshipEditor";
import type { ModelWithUI, CascadeOption } from "@/types/fastapiSpec";
import { CascadeOption as CascadeOptions, ColumnTypeName } from "@/types/fastapiSpec";

const mockModels: ModelWithUI[] = [
  {
    id: "model-1",
    name: "User",
    tablename: "users",
    columns: [
      { name: "id", type: { name: ColumnTypeName.INTEGER }, primary_key: true },
    ],
    position: { x: 0, y: 0 },
  },
  {
    id: "model-2",
    name: "Post",
    tablename: "posts",
    columns: [
      { name: "id", type: { name: ColumnTypeName.INTEGER }, primary_key: true },
    ],
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

    // Select target model first (required field)
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "Post" } }); // Target Model

    // Select a cascade option (Delete checkbox)
    const deleteCheckbox = screen.getByRole("checkbox", { name: /delete$/i });
    fireEvent.click(deleteCheckbox);

    // Submit
    fireEvent.click(screen.getByText("Save"));

    expect(mockOnSave).toHaveBeenCalled();
    const callArg = mockOnSave.mock.calls[0][0];
    expect(callArg.relationship.target).toBe("Post");
    expect(callArg.relationship.cascade).toContain(CascadeOptions.DELETE);
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

  it("should show auto-create FK checkbox for new relationships", () => {
    render(
      <RelationshipEditor
        models={mockModels}
        currentModelId="model-1"
        currentModelName="User"
        currentTableName="users"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByLabelText(/auto-create foreign key/i)).toBeInTheDocument();
  });

  it("should not show auto-create FK checkbox when editing existing relationship", () => {
    const existingRelationship = {
      name: "posts",
      target: "Post",
    };

    render(
      <RelationshipEditor
        relationship={existingRelationship}
        models={mockModels}
        currentModelId="model-1"
        currentModelName="User"
        currentTableName="users"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.queryByLabelText(/auto-create foreign key/i)).not.toBeInTheDocument();
  });

  it("should return RelationshipWithFK when creating with auto-FK enabled", () => {
    const mockOnSave = jest.fn();

    render(
      <RelationshipEditor
        models={mockModels}
        currentModelId="model-1"
        currentModelName="User"
        currentTableName="users"
        onSave={mockOnSave}
        onCancel={jest.fn()}
      />
    );

    // Select many-to-one relationship type (first select)
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "many-to-one" } });

    // Select target model (second select)
    fireEvent.change(selects[1], { target: { value: "Post" } });

    // Ensure auto-create FK is checked (should be by default)
    const fkCheckbox = screen.getByRole("checkbox", { name: /auto-create foreign key/i });
    expect(fkCheckbox).toBeChecked();

    // Submit
    fireEvent.click(screen.getByText("Save"));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        relationship: expect.objectContaining({
          target: "Post",
          uselist: false,
        }),
        fkColumn: expect.objectContaining({
          name: "post_id",
          foreign_key: "posts.id",
        }),
        fkTargetModelId: "model-1",
      })
    );
  });
});
