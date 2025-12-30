import type {
  GetXPResponse,
  UpdateXPRequest,
  UpdateXPResponse,
} from "@pointwise/lib/validation/xp-schema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const xpApi = createApi({
  reducerPath: "xpApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["XP"],
  refetchOnFocus: false, // Don't refetch on window focus
  refetchOnReconnect: true, // Refetch when internet reconnects
  endpoints: (builder) => ({
    getXP: builder.query<GetXPResponse, void>({
      query: () => "/user/xp",
      providesTags: ["XP"],
    }),
    updateXP: builder.mutation<UpdateXPResponse, UpdateXPRequest>({
      query: (body) => ({
        url: "/user/xp",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["XP"],
    }),
  }),
});

export const { useGetXPQuery, useUpdateXPMutation } = xpApi;
