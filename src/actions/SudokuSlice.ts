import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/Store';
import { Sudoku } from '../Sudoku';
import { EmptySudokuExample } from '../SudokuConstants';

export interface SudokuState {
  sudoku: Sudoku | undefined;
  counter: number;
}

const initialState: SudokuState = {
  sudoku: EmptySudokuExample,
  counter: 0,
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
    incrementCount: state => {
      state.counter++;
      return;
    },
  },
});

export const { setSudoku, incrementCount } = sudokuSlice.actions;

export const selectSudokuState = (state: RootState) => state.sudoku;

export default sudokuSlice.reducer;
