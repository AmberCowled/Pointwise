import type {
  DeleteTaskRequestV2,
  DeleteTaskResponseV2,
  GetTasksResponse,
  UpdateTaskRequestV2,
  UpdateTaskResponseV2,
} from "@pointwise/lib/api/types";
import type {
  CreateTaskRequest,
  CreateTaskResponse,
} from "@pointwise/lib/validation/tasks-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Tasks"],
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getTasks: builder.query<GetTasksResponse, { projectId: string }>({
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
      UpdateTaskResponseV2,
      { taskId: string; data: UpdateTaskRequestV2 }
    >({
      query: ({ taskId, data }) => ({
        url: `/tasksV2/${taskId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation<DeleteTaskResponseV2, DeleteTaskRequestV2>({
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
