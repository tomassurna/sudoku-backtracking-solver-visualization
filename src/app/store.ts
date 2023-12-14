import { configureStore } from '@reduxjs/toolkit';
import { sudokuSlice } from '../actions/sudokuSlice';

export const store = configureStore({
  reducer: {
    sudoku: sudokuSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
