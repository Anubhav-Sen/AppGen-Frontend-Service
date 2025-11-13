import { useSchemaStore } from "@/stores/schemaStore";
import { ColumnTypeName } from "@/types/fastapiSpec";

export function loadSampleData() {
  const store = useSchemaStore.getState();

  const userId = store.addModel({
    name: "User",
    tablename: "users",
    columns: [
      {
        name: "id",
        type: { name: ColumnTypeName.INTEGER },
        primary_key: true,
        autoincrement: true,
      },
      {
        name: "username",
        type: { name: ColumnTypeName.STRING, length: 50 },
        unique: true,
        nullable: false,
      },
      {
        name: "email",
        type: { name: ColumnTypeName.STRING, length: 255 },
        unique: true,
        nullable: false,
      },
      {
        name: "password_hash",
        type: { name: ColumnTypeName.STRING, length: 255 },
        nullable: false,
      },
    ],
    position: { x: 100, y: 100 },
  });

  const postId = store.addModel({
    name: "Post",
    tablename: "posts",
    columns: [
      {
        name: "id",
        type: { name: ColumnTypeName.INTEGER },
        primary_key: true,
        autoincrement: true,
      },
      {
        name: "title",
        type: { name: ColumnTypeName.STRING, length: 200 },
        nullable: false,
      },
      {
        name: "content",
        type: { name: ColumnTypeName.TEXT },
      },
      {
        name: "author_id",
        type: { name: ColumnTypeName.INTEGER },
        foreign_key: "User.id",
        nullable: false,
      },
      {
        name: "created_at",
        type: { name: ColumnTypeName.DATE_TIME },
        nullable: false,
      },
    ],
    relationships: [
      {
        name: "author",
        target: "User",
        back_populates: "posts",
      },
    ],
    position: { x: 400, y: 100 },
  });

  store.addEnum(
    {
      name: "StatusType",
      values: ["active", "inactive", "pending"],
    },
    { x: 250, y: 400 }
  );

  return { userId, postId };
}
