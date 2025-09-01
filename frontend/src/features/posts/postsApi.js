import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:4000',
    credentials: 'include',
  }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (params) => ({
        url: '/api/posts',
        params,
      }),
      providesTags: ['Post'],
    }),
    getPost: builder.query({
      query: (id) => `/api/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation({
      query: (post) => ({
        url: '/api/posts',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: ['Post'],
    }),
    getCategories: builder.query({
      query: () => '/api/posts/categories/list',
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/api/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useGetCategoriesQuery,
  useDeletePostMutation,
} = postsApi;
