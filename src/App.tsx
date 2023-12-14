import React, { useEffect } from 'react';
import './App.css';
import { Box } from '@mui/material';
import { Sudoku } from './Sudoku';
import { EmptySudokuExample, SudokuExample, SudokuExampleSolved } from './SudokuExample';
import { solveSudokuSmarter } from './SudokuSolver';
import { selectSudoku } from './actions/SudokuSlice';
import { useAppSelector } from './app/Hooks';
import { cloneDeep } from 'lodash';

function App() {
  const sudokuState = useAppSelector(selectSudoku);

  useEffect(() => {
    // console.log({
    //   sudoku: SudokuExample,
    //   isValid: isValid(SudokuExample),
    //   isSolved: isSolved(SudokuExample),
    // });

    // console.log({ solved: solveSudokuSmarter(cloneDeep(SudokuExample)) });
    // console.log({
    //   sections: buildAllPossibleSections(cloneDeep(SudokuExample.rows[0].sections[0])),
    // });

    solveSudokuSmarter(cloneDeep(SudokuExample)).then(solved => {
      console.log(solved);
    });
  }, []);

  return (
    <Box>
      <Sudoku sudoku={sudokuState.sudoku ?? EmptySudokuExample} />
      <Sudoku sudoku={SudokuExample} />
      <Sudoku sudoku={SudokuExampleSolved} />
      {/*<Box sx={{ padding: 10 }}>{isValid(SudokuExampleSolved) ? 'valid' : 'invalid'}</Box>*/}
    </Box>
  );
}

export default App;
