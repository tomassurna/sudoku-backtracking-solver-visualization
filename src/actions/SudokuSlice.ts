import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/Store';
import { Sudoku } from '../Sudoku';
import { EmptySudokuExample } from '../SudokuExample';

export interface SudokuState {
  sudoku: Sudoku | undefined;
}

const initialState: SudokuState = {
  sudoku: EmptySudokuExample,
};

export const sudokuSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setSudoku: (state, action: PayloadAction<Sudoku | undefined>) => {
      return {
        ...state,
        sudoku: action.payload,
      };
    },
  },
});

export const { setSudoku } = sudokuSlice.actions;

export const selectSudoku = (state: RootState) => state.sudoku;

export default sudokuSlice.reducer;
