import { t } from "elysia";
import { Project, ProjectCanShowOnMain } from "./entity";
import { CursorNav, CursorQuery } from "@/shared/cursor";

const createProject = t.Composite([
  t.Omit(Project, ["id", "lexorank", "createdAt", "updatedAt", "canShowOnMain"]),
  t.Object({
    canShowOnMain: t.Optional(ProjectCanShowOnMain),
  }),
]);

export const ProjectsWithNav = t.Composite([
  t.Object({
    items: t.Array(Project),
  }),
  CursorNav,
]);

export type ProjectsWithNav = typeof ProjectsWithNav.static;

export const ProjectModel = {
  getAllResponse: ProjectsWithNav,
  getAllQuery: CursorQuery,
  getMainPageResponse: t.Array(Project),
  createBody: createProject,
  createResponse: Project,
};
