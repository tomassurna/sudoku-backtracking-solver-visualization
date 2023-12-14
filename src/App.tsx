import React, { useEffect } from 'react';
import './App.css';
import { Box, Typography } from '@mui/material';
import { Sudoku } from './Sudoku';
import { EmptySudokuExample, SudokuExample, SudokuExampleSolved } from './SudokuConstants';
import { solveSudoku } from './SudokuSolver';
import { selectSudokuState, setSudoku } from './actions/SudokuSlice';
import { useAppSelector } from './app/Hooks';
import { cloneDeep } from 'lodash';
import { store } from './app/Store';

function App() {
  const sudokuState = useAppSelector(selectSudokuState);

  useEffect(() => {
    new Promise(f => setTimeout(f, 2000)).then(() => {
      solveSudoku(cloneDeep(SudokuExample)).then(solved => {
        store.dispatch(setSudoku(cloneDeep(solved)));
      });
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 5, marginTop: 1 }}>
      <Box>
        <Typography variant={'h5'}>Step Count: {sudokuState.counter}</Typography>
      </Box>
      <Sudoku sudoku={sudokuState.sudoku ?? EmptySudokuExample} />
    </Box>
  );
}

export default App;
