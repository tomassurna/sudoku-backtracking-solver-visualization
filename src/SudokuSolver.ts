import { Sudoku } from './Sudoku';
import { cloneDeep } from 'lodash';
import { store } from './app/Store';
import { setSudoku } from './actions/SudokuSlice';

/**
 * 1. For all empty cells compute possible values. These are values that are not present in the row, column or section.
 * Possible values does not take into account other empty cells and their possible values.
 * 2. For all empty cells that have only one possible value, set the value.
 * 3. Check if the sudoku is valid. If not, return undefined.
 * 4. For all cells that have more than one possible value, try each possible value and go back to step 1.
 * @param sudoku
 */
export async function solveSudokuSmarter(sudoku: Sudoku): Promise<Sudoku | undefined> {
  store.dispatch(setSudoku(cloneDeep(sudoku)));
  await new Promise(f => setTimeout(f, 100));

  const cells = sudoku.rows.flatMap(row => row.sections.flatMap(section => section.cells));
  const emptyCells = cells.filter(cell => !cell.value);

  for (const emptyCell of emptyCells) {
    emptyCell.possibleValues = [];

    for (let value = 1; value < 10; value++) {
      emptyCell.value = value;

      if (!isValid(sudoku)) {
        emptyCell.value = undefined;
        continue;
      }

      emptyCell.possibleValues.push(value);
      emptyCell.value = undefined;
    }

    if (emptyCell.possibleValues.length === 0) {
      emptyCells.forEach(cell => (cell.value = undefined));
      return undefined;
    }

    if (emptyCell.possibleValues.length === 1) {
      emptyCell.value = emptyCell.possibleValues[0];
      emptyCell.possibleValues = [];
    }
  }

  if (!isValid(sudoku)) {
    emptyCells.forEach(cell => (cell.value = undefined));
    return undefined;
  }

  if (isSolved(sudoku)) {
    store.dispatch(setSudoku(cloneDeep(sudoku)));
    return sudoku;
  }

  // 1. Go to the first empty cell
  // 2. Set value of cell to first possible value
  // 3. Confirm sudoku is valid
  // 4. If valid step into next recursion
  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    const row = sudoku.rows[rowIndex];

    for (let sectionIndex = 0; sectionIndex < 3; sectionIndex++) {
      const section = row.sections[sectionIndex];

      for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
        const cell = section.cells[cellIndex];

        if (cell.value) {
          continue;
        }

        let valueSet = false;

        for (let value of cell.possibleValues ?? []) {
          cell.value = value;

          if (!isValid(sudoku)) {
            cell.value = undefined;
            continue;
          }
          valueSet = true;

          const result = await solveSudokuSmarter(sudoku);

          if (result !== undefined && isSolved(result)) {
            store.dispatch(setSudoku(cloneDeep(sudoku)));
            return result;
          }

          cell.value = undefined;
          valueSet = false;
        }

        // If no value was set then the section is incomplete and can be exited early
        if (!valueSet) {
          emptyCells.forEach(cell => (cell.value = undefined));
          return undefined;
        }
      }
    }
  }

  emptyCells.forEach(cell => (cell.value = undefined));
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
export function isValid(sudoku: Sudoku): boolean {
  const sections = sudoku.rows.flatMap(row => row.sections);
  const isSectionValidVal = sections.every(section => {
    const cells = section.cells;
    const cellValues = cells
      .map(i => i.value)
      .filter(i => !!i)
      .map(i => i as number);
    const distinctValues = new Set(cellValues);

    return cellValues.length === distinctValues.size;
  });

  if (!isSectionValidVal) {
    return false;
  }

  for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
    const cellValues: (number | undefined)[] = [];
    const sectionIndex = Math.floor(columnIndex / 3);

    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      const rowIndex = Math.floor(cellIndex / 3);
      const row = sudoku.rows[rowIndex];
      const section = row.sections[sectionIndex];

      // Index matrix
      // colIndex 0 | 1 | 2
      // 0 = 0 || 0 | 1 | 2
      // 1 = 1 || 3 | 4 | 5
      // 2 = 2 || 6 | 7 | 8
      // 3 = 0 || 0 | 1 | 2
      // 4 = 1 || 3 | 4 | 5
      // 5 = 2 || 6 | 7 | 8
      // 6 = 0 || 0 | 1 | 2
      // 7 = 1 || 3 | 4 | 5
      // 8 = 2 || 6 | 7 | 8
      const adjustedCellIndex = (cellIndex % 3) * 3 + (columnIndex % 3);

      const cell = section.cells[adjustedCellIndex];

      // console.debug(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);
      cell.value && cellValues.push(cell.value);
    }

    const distinctValues = new Set(cellValues);

    if (cellValues.length !== distinctValues.size) {
      return false;
    }
  }

  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const cellValues: (number | undefined)[] = [];
    const row = sudoku.rows[Math.floor(rowIndex / 3)];

    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      const sectionIndex = Math.floor(cellIndex / 3);
      const section = row.sections[sectionIndex];

      // Index matrix
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
      const adjustedCellIndex = (cellIndex % 3) + (rowIndex % 3) * 3;

      const cell = section.cells[adjustedCellIndex];

      // console.debug(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);
      cell.value && cellValues.push(cell.value);
    }

    const distinctValues = new Set(cellValues);

    if (cellValues.length !== distinctValues.size) {
      return false;
    }
  }

  return true;
}

export function isSolved(sudoku: Sudoku): boolean {
  return (
    sudoku.rows.every(row => row.sections.every(section => section.cells.every(cell => cell.value))) && isValid(sudoku)
  );
}

function sudokuPrettyPrint(sudoku: Sudoku) {
  return [
    `${sudoku.rows[0].sections[0].cells[0].value ?? '_'}, ${sudoku.rows[0].sections[0].cells[1].value ?? '_'}, ${
      sudoku.rows[0].sections[0].cells[2].value ?? '_'
    } | ${sudoku.rows[0].sections[1].cells[0].value ?? '_'}, ${sudoku.rows[0].sections[1].cells[1].value ?? '_'}, ${
      sudoku.rows[0].sections[1].cells[2].value ?? '_'
    } | ${sudoku.rows[0].sections[2].cells[0].value ?? '_'}, ${sudoku.rows[0].sections[2].cells[1].value ?? '_'}, ${
      sudoku.rows[0].sections[2].cells[2].value ?? '_'
    }`,
    `${sudoku.rows[0].sections[0].cells[3].value ?? '_'}, ${sudoku.rows[0].sections[0].cells[4].value ?? '_'}, ${
      sudoku.rows[0].sections[0].cells[5].value ?? '_'
    } | ${sudoku.rows[0].sections[1].cells[3].value ?? '_'}, ${sudoku.rows[0].sections[1].cells[4].value ?? '_'}, ${
      sudoku.rows[0].sections[1].cells[5].value ?? '_'
    } | ${sudoku.rows[0].sections[2].cells[3].value ?? '_'}, ${sudoku.rows[0].sections[2].cells[4].value ?? '_'}, ${
      sudoku.rows[0].sections[2].cells[5].value ?? '_'
    }`,
    `${sudoku.rows[0].sections[0].cells[6].value ?? '_'}, ${sudoku.rows[0].sections[0].cells[7].value ?? '_'}, ${
      sudoku.rows[0].sections[0].cells[8].value ?? '_'
    } | ${sudoku.rows[0].sections[1].cells[6].value ?? '_'}, ${sudoku.rows[0].sections[1].cells[7].value ?? '_'}, ${
      sudoku.rows[0].sections[1].cells[8].value ?? '_'
    } | ${sudoku.rows[0].sections[2].cells[6].value ?? '_'}, ${sudoku.rows[0].sections[2].cells[7].value ?? '_'}, ${
      sudoku.rows[0].sections[2].cells[8].value ?? '_'
    }`,
    '----------------------------------',
    `${sudoku.rows[1].sections[0].cells[0].value ?? '_'}, ${sudoku.rows[1].sections[0].cells[1].value ?? '_'}, ${
      sudoku.rows[1].sections[0].cells[2].value ?? '_'
    } | ${sudoku.rows[1].sections[1].cells[0].value ?? '_'}, ${sudoku.rows[1].sections[1].cells[1].value ?? '_'}, ${
      sudoku.rows[1].sections[1].cells[2].value ?? '_'
    } | ${sudoku.rows[1].sections[2].cells[0].value ?? '_'}, ${sudoku.rows[1].sections[2].cells[1].value ?? '_'}, ${
      sudoku.rows[1].sections[2].cells[2].value ?? '_'
    }`,
    `${sudoku.rows[1].sections[0].cells[3].value ?? '_'}, ${sudoku.rows[1].sections[0].cells[4].value ?? '_'}, ${
      sudoku.rows[1].sections[0].cells[5].value ?? '_'
    } | ${sudoku.rows[1].sections[1].cells[3].value ?? '_'}, ${sudoku.rows[1].sections[1].cells[4].value ?? '_'}, ${
      sudoku.rows[1].sections[1].cells[5].value ?? '_'
    } | ${sudoku.rows[1].sections[2].cells[3].value ?? '_'}, ${sudoku.rows[1].sections[2].cells[4].value ?? '_'}, ${
      sudoku.rows[1].sections[2].cells[5].value ?? '_'
    }`,
    `${sudoku.rows[1].sections[0].cells[6].value ?? '_'}, ${sudoku.rows[1].sections[0].cells[7].value ?? '_'}, ${
      sudoku.rows[1].sections[0].cells[8].value ?? '_'
    } | ${sudoku.rows[1].sections[1].cells[6].value ?? '_'}, ${sudoku.rows[1].sections[1].cells[7].value ?? '_'}, ${
      sudoku.rows[1].sections[1].cells[8].value ?? '_'
    } | ${sudoku.rows[1].sections[2].cells[6].value ?? '_'}, ${sudoku.rows[1].sections[2].cells[7].value ?? '_'}, ${
      sudoku.rows[1].sections[2].cells[8].value ?? '_'
    }`,
    '----------------------------------',
    `${sudoku.rows[2].sections[0].cells[0].value ?? '_'}, ${sudoku.rows[2].sections[0].cells[1].value ?? '_'}, ${
      sudoku.rows[2].sections[0].cells[2].value ?? '_'
    } | ${sudoku.rows[2].sections[1].cells[0].value ?? '_'}, ${sudoku.rows[2].sections[1].cells[1].value ?? '_'}, ${
      sudoku.rows[2].sections[1].cells[2].value ?? '_'
    } | ${sudoku.rows[2].sections[2].cells[0].value ?? '_'}, ${sudoku.rows[2].sections[2].cells[1].value ?? '_'}, ${
      sudoku.rows[2].sections[2].cells[2].value ?? '_'
    }`,
    `${sudoku.rows[2].sections[0].cells[3].value ?? '_'}, ${sudoku.rows[2].sections[0].cells[4].value ?? '_'}, ${
      sudoku.rows[2].sections[0].cells[5].value ?? '_'
    } | ${sudoku.rows[2].sections[1].cells[3].value ?? '_'}, ${sudoku.rows[2].sections[1].cells[4].value ?? '_'}, ${
      sudoku.rows[2].sections[1].cells[5].value ?? '_'
    } | ${sudoku.rows[2].sections[2].cells[3].value ?? '_'}, ${sudoku.rows[2].sections[2].cells[4].value ?? '_'}, ${
      sudoku.rows[2].sections[2].cells[5].value ?? '_'
    }`,
    `${sudoku.rows[2].sections[0].cells[6].value ?? '_'}, ${sudoku.rows[2].sections[0].cells[7].value ?? '_'}, ${
      sudoku.rows[2].sections[0].cells[8].value ?? '_'
    } | ${sudoku.rows[2].sections[1].cells[6].value ?? '_'}, ${sudoku.rows[2].sections[1].cells[7].value ?? '_'}, ${
      sudoku.rows[2].sections[1].cells[8].value ?? '_'
    } | ${sudoku.rows[2].sections[2].cells[6].value ?? '_'}, ${sudoku.rows[2].sections[2].cells[7].value ?? '_'}, ${
      sudoku.rows[2].sections[2].cells[8].value ?? '_'
    }`,
  ];
}
