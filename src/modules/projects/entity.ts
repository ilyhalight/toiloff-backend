import { t } from "elysia";

export const ProjectCanShowOnMain = t.Boolean({ default: true });

export const Project = t.Object(
  {
    id: t.String(),
    title: t.String({ minLength: 1, maxLength: 48 }),
    description: t.String({ minLength: 1, maxLength: 128 }),
    href: t.String({ minLength: 1, maxLength: 512 }),
    imageUrl: t.String({ minLength: 1, maxLength: 512 }),
    imageAlt: t.String({ minLength: 1, maxLength: 128 }),
    canShowOnMain: ProjectCanShowOnMain,
    lexorank: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  {
    error: "invalid project data",
  },
);
