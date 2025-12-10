import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { GetXPResponse, UpdateXPRequest } from '@pointwise/lib/api/types';

export const xpApi = createApi({
  reducerPath: 'xpApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['XP'],
  refetchOnFocus: false, // Don't refetch on window focus
  refetchOnReconnect: true, // Refetch when internet reconnects
  endpoints: (builder) => ({
    getXP: builder.query<GetXPResponse, void>({
      query: () => '/user/xp',
      providesTags: ['XP'],
    }),
    updateXP: builder.mutation<GetXPResponse, UpdateXPRequest>({
      query: (body) => ({
        url: '/user/xp',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['XP'],
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetXPQuery } = xpApi;
