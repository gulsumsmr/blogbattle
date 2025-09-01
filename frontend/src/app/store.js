import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { postsApi } from '../features/posts/postsApi';
import { matchApi } from '../features/match/matchApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [matchApi.reducerPath]: matchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      postsApi.middleware,
      matchApi.middleware
    ),
});
