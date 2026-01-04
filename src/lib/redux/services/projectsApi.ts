import type {
	CreateProjectRequest,
	CreateProjectResponse,
	DeleteProjectResponse,
	GetProjectResponse,
	GetProjectsResponse,
	SearchPublicProjectsRequest,
	SearchPublicProjectsResponse,
	UpdateProjectRequest,
	UpdateProjectResponse,
} from "@pointwise/lib/validation/projects-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const projectApi = createApi({
	reducerPath: "projectApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["Projects"],
	refetchOnFocus: false, // Don't refetch on window focus
	refetchOnReconnect: true, // Refetch when internet reconnects
	endpoints: (builder) => ({
		getProject: builder.query<GetProjectResponse, string>({
			query: (projectId) => `/projects/${projectId}`,
			providesTags: ["Projects"],
		}),
		getProjects: builder.query<GetProjectsResponse, void>({
			query: () => "/projects",
			providesTags: ["Projects"],
		}),
		searchPublicProjects: builder.query<
			SearchPublicProjectsResponse,
			SearchPublicProjectsRequest
		>({
			query: () => "/projects/public",
			providesTags: ["Projects"],
		}),
		createProject: builder.mutation<
			CreateProjectResponse,
			CreateProjectRequest
		>({
			query: (body) => ({
				url: "/projects",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Projects"],
		}),
		updateProject: builder.mutation<
			UpdateProjectResponse,
			{ projectId: string; data: UpdateProjectRequest }
		>({
			query: ({ projectId, data }) => ({
				url: `/projects/${projectId}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Projects"],
		}),
		deleteProject: builder.mutation<DeleteProjectResponse, string>({
			query: (projectId) => ({
				url: `/projects/${projectId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Projects"],
		}),
	}),
});

export const {
	useGetProjectsQuery,
	useGetProjectQuery,
	useSearchPublicProjectsQuery,
	useCreateProjectMutation,
	useUpdateProjectMutation,
	useDeleteProjectMutation,
} = projectApi;
