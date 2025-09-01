import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const matchApi = createApi({
  reducerPath: 'matchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:4000',
    credentials: 'include',
  }),
  tagTypes: ['Match'],
  endpoints: (builder) => ({
    getNextMatch: builder.query({
      query: (bracketId) => ({
        url: '/api/matches/next',
        params: bracketId ? { bracketId } : {},
      }),
      providesTags: ['Match'],
    }),
    seedMatches: builder.mutation({
      query: (postIds) => ({
        url: '/api/matches/seed',
        method: 'POST',
        body: { postIds },
      }),
      invalidatesTags: ['Match'],
    }),
    vote: builder.mutation({
      query: ({ matchId, vote }) => ({
        url: `/api/matches/${matchId}/vote`,
        method: 'POST',
        body: { vote },
      }),
      invalidatesTags: ['Match'],
    }),
    getActiveMatches: builder.query({
      query: (bracketId) => `/api/matches/active/${bracketId}`,
      providesTags: ['Match'],
    }),
    getCompletedMatches: builder.query({
      query: (bracketId) => `/api/matches/completed/${bracketId}`,
      providesTags: ['Match'],
    }),
    getMyVote: builder.query({
      query: (matchId) => `/api/matches/${matchId}/my-vote`,
      providesTags: (result, error, matchId) => [{ type: 'Match', id: matchId }],
    }),
    
    // Admin endpoints
    getAdminBrackets: builder.query({
      query: () => '/api/matches/admin/brackets',
      providesTags: ['Match'],
    }),
    
    createAdminMatch: builder.mutation({
      query: (data) => ({
        url: '/api/matches/admin/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Match'],
    }),
    
    getAdminUsers: builder.query({
      query: () => '/api/matches/admin/users',
      providesTags: ['User'],
    }),
    
    resetMatchVotes: builder.mutation({
      query: (matchId) => ({
        url: `/api/matches/admin/reset-votes/${matchId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Match'],
    }),
    
    resetBracketVotes: builder.mutation({
      query: (bracketId) => ({
        url: `/api/matches/admin/reset-bracket/${bracketId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Match'],
    }),

    // Admin: Delete match
    deleteAdminMatch: builder.mutation({
      query: (matchId) => ({
        url: `/api/matches/admin/match/${matchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Match'],
    }),

    // Admin: Delete bracket
    deleteAdminBracket: builder.mutation({
      query: (bracketId) => ({
        url: `/api/matches/admin/bracket/${bracketId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Match'],
    }),
  }),
});

export const {
  useGetNextMatchQuery,
  useSeedMatchesMutation,
  useVoteMutation,
  useGetActiveMatchesQuery,
  useGetCompletedMatchesQuery,
  useGetMyVoteQuery,
  useGetAdminBracketsQuery,
  useCreateAdminMatchMutation,
  useGetAdminUsersQuery,
  useResetMatchVotesMutation,
  useResetBracketVotesMutation,
  useDeleteAdminMatchMutation,
  useDeleteAdminBracketMutation,
} = matchApi;
