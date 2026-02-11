import type {
	CreateTaskRequest,
	CreateTaskResponse,
	DeleteTaskRequest,
	DeleteTaskResponse,
	GetTasksRequest,
	GetTasksResponse,
	UpdateTaskRequest,
	UpdateTaskResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tasksApi = createApi({
	reducerPath: "tasksApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["Tasks"],
	refetchOnFocus: false,
	refetchOnReconnect: true,
	endpoints: (builder) => ({
		getTasks: builder.query<GetTasksResponse, GetTasksRequest>({
			query: ({ projectId }) => `/tasks?projectId=${projectId}`,
			providesTags: ["Tasks"],
		}),
		createTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
			query: (task) => ({
				url: "/tasks",
				method: "POST",
				body: task,
			}),
			invalidatesTags: ["Tasks"],
		}),
		updateTask: builder.mutation<
			UpdateTaskResponse,
			{ taskId: string; data: UpdateTaskRequest }
		>({
			query: ({ taskId, data }) => ({
				url: `/tasks/${taskId}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Tasks"],
		}),
		deleteTask: builder.mutation<DeleteTaskResponse, DeleteTaskRequest>({
			query: ({ taskId }) => ({
				url: `/tasks/${taskId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Tasks"],
		}),
		likeTask: builder.mutation<
			UpdateTaskResponse,
			{ taskId: string; projectId: string }
		>({
			query: ({ taskId, projectId }) => ({
				url: `/tasks/${taskId}/like?projectId=${projectId}`,
				method: "POST",
			}),
			async onQueryStarted(
				{ taskId, projectId },
				{ dispatch, queryFulfilled },
			) {
				const patchResult = dispatch(
					tasksApi.util.updateQueryData("getTasks", { projectId }, (draft) => {
						const task = draft.tasks.find((t) => t.id === taskId);
						if (task) {
							task.likedByCurrentUser = true;
							task.likeCount = (task.likeCount ?? 0) + 1;
						}
					}),
				);
				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
			invalidatesTags: ["Tasks"],
		}),
		unlikeTask: builder.mutation<
			UpdateTaskResponse,
			{ taskId: string; projectId: string }
		>({
			query: ({ taskId, projectId }) => ({
				url: `/tasks/${taskId}/like?projectId=${projectId}`,
				method: "DELETE",
			}),
			async onQueryStarted(
				{ taskId, projectId },
				{ dispatch, queryFulfilled },
			) {
				const patchResult = dispatch(
					tasksApi.util.updateQueryData("getTasks", { projectId }, (draft) => {
						const task = draft.tasks.find((t) => t.id === taskId);
						if (task) {
							task.likedByCurrentUser = false;
							task.likeCount = Math.max(0, (task.likeCount ?? 0) - 1);
						}
					}),
				);
				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
			invalidatesTags: ["Tasks"],
		}),
	}),
});

export const {
	useGetTasksQuery,
	useCreateTaskMutation,
	useUpdateTaskMutation,
	useDeleteTaskMutation,
	useLikeTaskMutation,
	useUnlikeTaskMutation,
} = tasksApi;
