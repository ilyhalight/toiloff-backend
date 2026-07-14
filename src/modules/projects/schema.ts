import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export type ProjectTable = {
  id: Generated<string>;
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  canShowOnMain: Generated<boolean>;
  lexorank: string;
  createdAt: Generated<Date>;
  updatedAt: ColumnType<Date, string | undefined, string | undefined>;
};

export type Project = Selectable<ProjectTable>;
export type NewProject = Omit<Insertable<ProjectTable>, "id" | "createdAt" | "updatedAt">;
export type ProjectUpdate = Omit<Updateable<ProjectTable>, "id" | "createdAt">;
