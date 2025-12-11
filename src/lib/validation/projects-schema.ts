import { z } from 'zod';

const MAX_PROJECT_NAME_LENGTH = 100;
const MAX_PROJECT_DESCRIPTION_LENGTH = 1000;

const PROJECT_NAME_SCHEMA = z.string().min(1).max(MAX_PROJECT_NAME_LENGTH);
const PROJECT_DESCRIPTION_SCHEMA = z
  .string()
  .min(1)
  .max(MAX_PROJECT_DESCRIPTION_LENGTH);
const PROJECT_VISIBILITY_SCHEMA = z.enum(['PUBLIC', 'PRIVATE']);

export const CreateProjectRequestSchema = z.object({
  name: PROJECT_NAME_SCHEMA,
  description: PROJECT_DESCRIPTION_SCHEMA,
  visibility: PROJECT_VISIBILITY_SCHEMA,
});

export const UpdateProjectRequestSchema = z.object({
  name: PROJECT_NAME_SCHEMA,
  description: PROJECT_DESCRIPTION_SCHEMA,
  visibility: PROJECT_VISIBILITY_SCHEMA,
});

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;
