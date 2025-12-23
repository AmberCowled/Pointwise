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
      query: ({ projectId }) => `/tasksV2?projectId=${projectId}`,
      providesTags: ["Tasks"],
    }),
    createTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
      query: (task) => ({
        url: "/tasksV2",
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
        url: `/tasksV2/${taskId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation<DeleteTaskResponse, DeleteTaskRequest>({
      query: ({ taskId }) => ({
        url: `/tasksV2/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
