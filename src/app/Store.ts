import { configureStore } from '@reduxjs/toolkit';
import { sudokuSlice } from '../actions/SudokuSlice';

export const store = configureStore({
  reducer: {
    sudoku: sudokuSlice.reducer,
    counter: sudokuSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
