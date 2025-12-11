import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  GetProjectResponse,
  GetProjectsResponse,
  CreateProjectResponse,
  CreateProjectRequest,
  UpdateProjectResponse,
  UpdateProjectRequest,
  DeleteProjectResponse,
} from '@pointwise/lib/api/types';

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Projects'],
  refetchOnFocus: false, // Don't refetch on window focus
  refetchOnReconnect: true, // Refetch when internet reconnects
  endpoints: (builder) => ({
    getProject: builder.query<GetProjectResponse, string>({
      query: (projectId) => `/projectsV2/${projectId}`,
      providesTags: ['Projects'],
    }),
    getProjects: builder.query<GetProjectsResponse, void>({
      query: () => '/projectsV2',
      providesTags: ['Projects'],
    }),
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: (body) => ({
        url: '/projectsV2',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation<
      UpdateProjectResponse,
      { projectId: string; data: UpdateProjectRequest }
    >({
      query: ({ projectId, data }) => ({
        url: `/projectsV2/${projectId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Projects'],
    }),
    deleteProject: builder.mutation<DeleteProjectResponse, string>({
      query: (projectId) => ({
        url: `/projectsV2/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
  }),
});

export const { useGetProjectsQuery, useGetProjectQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation } = projectApi;
