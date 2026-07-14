import { t } from "elysia";
import { Project, ProjectCanShowOnMain } from "./entity";
import { CursorNav, CursorQuery } from "@/shared/cursor";

const CreateProject = t.Composite([
  t.Omit(Project, ["id", "lexorank", "createdAt", "updatedAt", "canShowOnMain"]),
  t.Object({
    canShowOnMain: t.Optional(ProjectCanShowOnMain),
  }),
]);

export type CreateProject = typeof CreateProject.static;

export const ProjectsWithNav = t.Composite([
  t.Object({
    items: t.Array(Project),
  }),
  CursorNav,
]);

export type ProjectsWithNav = typeof ProjectsWithNav.static;

export const ProjectParam = t.Object({
  projectId: t.String(),
});

export const ProjectModel = {
  getAllResponse: ProjectsWithNav,
  getAllQuery: CursorQuery,
  getMainPageResponse: t.Array(Project),
  createBody: CreateProject,
  createResponse: Project,
  getParam: ProjectParam,
  getResponse: Project,
  deleteParam: ProjectParam,
  deleteResponse: Project,
  updateParam: ProjectParam,
  updateBody: CreateProject,
  updateResponse: Project,
};
