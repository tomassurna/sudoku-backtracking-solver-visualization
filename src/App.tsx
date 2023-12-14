import React, { useEffect } from 'react';
import './App.css';
import { Box } from '@mui/material';
import { Sudoku } from './Sudoku';
import { EmptySudokuExample, SudokuExample, SudokuExampleSolved } from './SudokuConstants';
import { solveSudokuSmarter } from './SudokuSolver';
import { selectSudoku, setSudoku } from './actions/SudokuSlice';
import { useAppSelector } from './app/Hooks';
import { cloneDeep } from 'lodash';
import { store } from './app/Store';

function App() {
  const sudokuState = useAppSelector(selectSudoku);

  useEffect(() => {
    solveSudokuSmarter(cloneDeep(SudokuExample)).then(solved => {
      store.dispatch(setSudoku(cloneDeep(solved)));
    });
  }, []);

  return (
    <Box>
      <Sudoku sudoku={sudokuState.sudoku ?? EmptySudokuExample} />
    </Box>
  );
}

export default App;
