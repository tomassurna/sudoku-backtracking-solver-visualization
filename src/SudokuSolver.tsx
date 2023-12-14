import { Sudoku } from './Sudoku';
import { useAppDispatch } from './app/Hooks';
import { setSudoku } from './actions/SudokuSlice';
import { useEffect } from 'react';

const SudokuSolver = ({ toSolve }: { toSolve: Sudoku }) => {
  useEffect(() => {
    solveSudoku(toSolve);
  }, [toSolve]);

  /**
   *
   *
   * Sudo:
   * 1. Find first valid move
   * 2. Apply valid move
   * 3. Check if solved, if so return, else call self
   * 4. If self returns undefined then undo move and find next valid move. Go to step 2
   * 5. If loop breaks then return undefined
   * @param sudoku
   * @constructor
   */
  function solveSudoku(sudoku: Sudoku): Sudoku | undefined {
    const dispatch = useAppDispatch();

    // find first empty cell
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      const row = sudoku.rows[rowIndex];

      for (let sectionIndex = 0; sectionIndex < 3; sectionIndex++) {
        const section = row.sections[sectionIndex];

        for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
          const cell = section.cells[cellIndex];

          if (cell.value) {
            continue;
          }

          console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);

          for (let value = 1; value < 10; value++) {
            const cloned = JSON.parse(JSON.stringify(sudoku)) as Sudoku;
            cloned.rows[rowIndex].sections[sectionIndex].cells[cellIndex].value = value;

            console.log(cloned);
            solveSudoku(cloned);
            dispatch(setSudoku(cloned));
            return;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Sudo:
   *
   * 1. Check for duplicates within section
   * 2. Check for duplicates within columns
   * 3. Check for duplicates within rows
   * @param sudoku
   */
  function isValid(sudoku: Sudoku): boolean {
    const sections = sudoku.rows.flatMap(row => row.sections);
    const isSectionValid = sections.every(section => {
      const cells = section.cells;
      const cellValues = cells
        .map(i => i.value)
        .filter(i => !i)
        .map(i => i as number);
      const distinctValues = new Set(cellValues);

      return cellValues.length === distinctValues.size;
    });

    if (!isSectionValid) {
      // console.log('section invalid');
      return false;
    }

    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      const cellValues: (number | undefined)[] = [];
      const sectionIndex = Math.floor(columnIndex / 3);

      for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
        const rowIndex = Math.floor(cellIndex / 3);
        const row = sudoku.rows[rowIndex];
        const section = row.sections[sectionIndex];
        const adjustedCellIndex = (cellIndex % 3) * 3;
        const cell = section.cells[adjustedCellIndex];

        // console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);
        cellValues.push(cell.value);
      }

      const distinctValues = new Set(cellValues);

      if (cellValues.length !== distinctValues.size) {
        // console.log({ columnIndex, cellValues, distinctValues });
        // console.log('column invalid');
        return false;
      }
    }

    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
      const cellValues: (number | undefined)[] = [];
      const row = sudoku.rows[Math.floor(rowIndex / 3)];

      for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
        const sectionIndex = Math.floor(cellIndex / 3);
        const section = row.sections[sectionIndex];
        // const adjustedCellIndex = Math.floor(cellIndex / 3) + Math.max(rowIndex % 3, 1);
        const adjustedCellIndex = (cellIndex % 3) + (rowIndex % 3) * 3;
        // rowIndex 0 | 1 | 2
        // 0 = 0 || 0 | 4 | 7
        // 1 = 1 || 0 | 5 | 8
        // 2 = 2 || 0 | 6 | 9
        // 3 = 0 || 0 | 4 | 7
        // 4 = 1 || 0 | 5 | 8
        // 5 = 2 || 0 | 6 | 9
        // 6 = 0 || 0 | 4 | 7
        // 7 = 1 || 0 | 5 | 8
        // 8 = 2 || 0 | 6 | 9
        const cell = section.cells[adjustedCellIndex];

        // console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);
        cellValues.push(cell.value);
      }

      const distinctValues = new Set(cellValues);

      if (cellValues.length !== distinctValues.size) {
        // console.log({ rowIndex, cellValues, distinctValues });
        // console.log('row invalid');
        return false;
      }
    }

    return true;
  }

  function isSolved(sudoku: Sudoku): boolean {
    return (
      sudoku.rows.every(row => row.sections.every(section => section.cells.every(cell => cell.value))) &&
      isValid(sudoku)
    );
  }

  return <></>;
};
