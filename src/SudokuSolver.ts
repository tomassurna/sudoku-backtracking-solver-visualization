import { Sudoku, SudokuRow, SudokuSection } from './Sudoku';
import { cloneDeep } from 'lodash';
import { store } from './app/Store';
import { setSudoku } from './actions/SudokuSlice';

type Indexes = {
  rowIndex: number;
  sectionIndex: number;
  cellIndex: number;
};

let counter = 0;

export async function solveSudokuSmarter(sudoku: Sudoku): Promise<Sudoku | undefined> {
  store.dispatch(setSudoku(cloneDeep(sudoku)));
  console.log(counter++);
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

        const originalValue = cell.value;

        // console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);

        let valueSet = false;

        for (let value of cell.possibleValues ?? []) {
          // const cloned = JSON.parse(JSON.stringify(sudoku)) as Sudoku;
          // cloned.rows[rowIndex].sections[sectionIndex].cells[cellIndex].value = value;

          sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
            location: cell.location,
            preset: cell.preset,
            value: value,
          };
          // cell.value = value;

          if (!isValid(sudoku)) {
            sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
              location: cell.location,
              preset: cell.preset,
              value: originalValue,
            };
            // cell.value = originalValue;
            continue;
          }
          valueSet = true;

          const result = await solveSudokuSmarter(sudoku);

          if (result !== undefined && isSolved(result)) {
            store.dispatch(setSudoku(cloneDeep(sudoku)));
            return result;
          }

          sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
            location: cell.location,
            preset: cell.preset,
            value: originalValue,
          };
          // cell.value = originalValue;
          valueSet = false;
        }

        if (!valueSet) {
          emptyCells.forEach(cell => (cell.value = undefined));
          return undefined;
        }
      }

      // // after all cells are set, check that the section has all values set, otherwise return.
      // const hasMissingValues = section.cells.some(cell => !cell.value);
      //
      // if (hasMissingValues) {
      //   return undefined;
      // }
    }
  }

  emptyCells.forEach(cell => (cell.value = undefined));
  return undefined;
}

export async function solveSudokuSmarterHelper(
  sudoku: Sudoku,
  index: Indexes = {
    rowIndex: 0,
    sectionIndex: 0,
    cellIndex: 0,
  }
): Promise<Sudoku | undefined> {
  console.log({ counter, index });
  if (counter % 5 === 0) {
    store.dispatch(setSudoku(cloneDeep(sudoku)));
    // console.log({ count, sudoku: sudokuPrettyPrint(sudoku) });
  }

  // find first empty cell
  for (let rowIndex = index.rowIndex; rowIndex < 3; rowIndex++) {
    const row = sudoku.rows[rowIndex];

    for (let sectionIndex = index.sectionIndex; sectionIndex < 3; sectionIndex++) {
      const section = row.sections[sectionIndex];

      for (let cellIndex = index.cellIndex; cellIndex < 9; cellIndex++) {
        const cell = section.cells[cellIndex];

        if (cell.value) {
          continue;
        }

        const originalValue = cell.value;

        // console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);

        let valueSet = false;

        for (let value = 1; value < 10; value++) {
          // const cloned = JSON.parse(JSON.stringify(sudoku)) as Sudoku;
          // cloned.rows[rowIndex].sections[sectionIndex].cells[cellIndex].value = value;

          sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
            location: cell.location,
            preset: cell.preset,
            value: value,
          };
          // cell.value = value;

          if (!isValid(sudoku)) {
            sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
              location: cell.location,
              preset: cell.preset,
              value: originalValue,
            };
            // cell.value = originalValue;
            continue;
          }
          valueSet = true;

          // sleep
          await new Promise(f => setTimeout(f, 1));

          const result = await solveSudokuSmarterHelper(sudoku, {
            rowIndex: rowIndex,
            sectionIndex: sectionIndex,
            cellIndex: cellIndex,
          });

          if (result !== undefined && isSolved(result)) {
            return result;
          }

          sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
            location: cell.location,
            preset: cell.preset,
            value: originalValue,
          };
          // cell.value = originalValue;
          valueSet = false;
        }

        if (!valueSet) {
          return undefined;
        }
      }

      // after all cells are set, check that the section has all values set, otherwise return.
      const hasMissingValues = section.cells.some(cell => !cell.value);

      if (hasMissingValues) {
        return undefined;
      }
      index.cellIndex = 0;
    }

    index.sectionIndex = 0;
  }

  if (isSolved(sudoku)) {
    return sudoku;
  }

  return undefined;
}

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

export async function solveSudoku(sudoku: Sudoku): Promise<Sudoku | undefined> {
  // pre compute every single section possible.
  const allPossibleSections: Record<string, SudokuSection[]> = {};
  const allPossibleRows: Record<string, SudokuRow[]> = {};

  for (const row of sudoku.rows) {
    for (const section of row.sections) {
      allPossibleSections[`(${row.location}, ${section.location})`] = buildAllPossibleSections(section);
    }

    console.log(allPossibleSections);
    const possibleRows: SudokuRow[] = [];
    for (const section1 of allPossibleSections[`(${row.location}, ${1})`]) {
      console.log(section1);
      for (const section2 of allPossibleSections[`(${row.location}, ${2})`]) {
        for (const section3 of allPossibleSections[`(${row.location}, ${3})`]) {
          const possibleRow: SudokuRow = {
            sections: [section1, section2, section3],
            location: row.location,
          };

          if (!isValidRow(possibleRow)) {
            continue;
          }

          console.log(possibleRow);
          possibleRows.push(possibleRow);
        }
      }
    }

    console.log(possibleRows);
  }

  console.log(allPossibleRows);

  // return await solveSudokuUsingSections(sudoku, allPossibleSections);
  return undefined;
}

async function solveSudokuUsingSections(
  sudoku: Sudoku,
  allPossibleSections: Record<string, SudokuSection[]>
): Promise<Sudoku | undefined> {
  console.log(counter++);
  // store.dispatch(setSudoku(cloneDeep(sudoku)));
  if (isSolved(sudoku)) {
    return sudoku;
  }

  for (const row of sudoku.rows) {
    for (let sectionIndex = 0; sectionIndex < 3; sectionIndex++) {
      const section = row.sections[sectionIndex];
      const isEmpty = section.cells.some(cell => !cell.value);

      if (!isEmpty) {
        continue;
      }

      const possibleSections = allPossibleSections[`(${row.location}, ${section.location})`];
      for (const possibleSection of possibleSections) {
        row.sections[sectionIndex] = possibleSection;

        await new Promise(f => setTimeout(f, 1));

        const result = solveSudokuUsingSections(sudoku, allPossibleSections);

        if (!result) {
          return result;
        }

        row.sections[sectionIndex] = section;
      }
    }
  }

  return undefined;
}

export function buildAllPossibleSections(sudokuSection: SudokuSection) {
  return buildAllPossibleSectionsHelper(sudokuSection, []);
}

function buildAllPossibleSectionsHelper(sudokuSection: SudokuSection, possibleSudokuSections: SudokuSection[]) {
  const firstEmptyCell = sudokuSection.cells.find(cell => !cell.value);

  if (!firstEmptyCell) {
    return [...possibleSudokuSections, cloneDeep(sudokuSection)];
  }

  const originalValue = firstEmptyCell.value;
  const newPossibleValues: SudokuSection[] = [];

  for (let value = 1; value < 10; value++) {
    firstEmptyCell.value = value;

    if (!isSectionValid(sudokuSection)) {
      firstEmptyCell.value = originalValue;
      continue;
    }

    newPossibleValues.push(...buildAllPossibleSectionsHelper(sudokuSection, possibleSudokuSections));
    firstEmptyCell.value = originalValue;
  }

  return [...possibleSudokuSections, ...newPossibleValues];
}

// export async function solveSudoku(
//   sudoku: Sudoku,
//   count: number = 0,
//   index: Indexes = {
//     rowIndex: 0,
//     sectionIndex: 0,
//     cellIndex: 0,
//   }
// ): Promise<Sudoku | undefined> {
//   console.log({ count, index });
//   if (count % 5 === 0) {
//     store.dispatch(setSudoku(cloneDeep(sudoku)));
//     // console.log({ count, sudoku: sudokuPrettyPrint(sudoku) });
//   }
//
//   // find first empty cell
//   for (let rowIndex = index.rowIndex; rowIndex < 3; rowIndex++) {
//     const row = sudoku.rows[rowIndex];
//
//     for (let sectionIndex = index.sectionIndex; sectionIndex < 3; sectionIndex++) {
//       const section = row.sections[sectionIndex];
//
//       for (let cellIndex = index.cellIndex; cellIndex < 9; cellIndex++) {
//         const cell = section.cells[cellIndex];
//
//         if (cell.value) {
//           continue;
//         }
//
//         const originalValue = cell.value;
//
//         // console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);
//
//         let valueSet = false;
//
//         for (let value = 1; value < 10; value++) {
//           // const cloned = JSON.parse(JSON.stringify(sudoku)) as Sudoku;
//           // cloned.rows[rowIndex].sections[sectionIndex].cells[cellIndex].value = value;
//
//           sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
//             location: cell.location,
//             preset: cell.preset,
//             value: value,
//           };
//           // cell.value = value;
//
//           if (!isValid(sudoku)) {
//             sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
//               location: cell.location,
//               preset: cell.preset,
//               value: originalValue,
//             };
//             // cell.value = originalValue;
//             continue;
//           }
//           valueSet = true;
//
//           // sleep
//           await new Promise(f => setTimeout(f, 1));
//
//           const result = await solveSudoku(sudoku, count + 1, {
//             rowIndex: rowIndex,
//             sectionIndex: sectionIndex,
//             cellIndex: cellIndex,
//           });
//
//           if (result !== undefined && isSolved(result)) {
//             return result;
//           }
//
//           sudoku.rows[rowIndex].sections[sectionIndex].cells[cellIndex] = {
//             location: cell.location,
//             preset: cell.preset,
//             value: originalValue,
//           };
//           // cell.value = originalValue;
//           valueSet = false;
//         }
//
//         if (!valueSet) {
//           return undefined;
//         }
//       }
//
//       // after all cells are set, check that the section has all values set, otherwise return.
//       const hasMissingValues = section.cells.some(cell => !cell.value);
//
//       if (hasMissingValues) {
//         return undefined;
//       }
//       index.cellIndex = 0;
//     }
//
//     index.sectionIndex = 0;
//   }
//
//   if (isSolved(sudoku)) {
//     return sudoku;
//   }
//
//   return undefined;
// }

function isSectionValid(section: SudokuSection) {
  const cells = section.cells;
  const cellValues = cells
    .map(i => i.value)
    .filter(i => !!i)
    .map(i => i as number);
  const distinctValues = new Set(cellValues);

  // if (cellValues.length !== distinctValues.size) {
  //   console.log({ cellValues, distinctValues });
  // }

  return cellValues.length === distinctValues.size;
}

function isValidRow(row: SudokuRow) {
  const sections = row.sections;
  const isSectionValidVal = sections.every(section => {
    return isSectionValid(section);
  });

  if (!isSectionValidVal) {
    // console.log('section invalid');
    // console.log({
    //   invalid: 'section invalid',
    //   sudoku: sudokuPrettyPrint(sudoku),
    // });
    return false;
  }

  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    const cellValues: (number | undefined)[] = [];

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
      const cell = section.cells[adjustedCellIndex];

      // console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);
      cell.value && cellValues.push(cell.value);
    }

    const distinctValues = new Set(cellValues);

    if (cellValues.length !== distinctValues.size) {
      // console.log({ rowIndex, cellValues, distinctValues });
      // console.log('row invalid');
      // console.log({ invalid: 'row invalid', sudoku: sudoku });
      return false;
    }
  }
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
  // console.log({ sudoku, prettyPrint: sudokuPrettyPrint(sudoku) });

  const sections = sudoku.rows.flatMap(row => row.sections);
  const isSectionValidVal = sections.every(section => {
    return isSectionValid(section);
  });

  if (!isSectionValidVal) {
    // console.log('section invalid');
    // console.log({
    //   invalid: 'section invalid',
    //   sudoku: sudokuPrettyPrint(sudoku),
    // });
    return false;
  }

  for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
    const cellValues: (number | undefined)[] = [];
    const sectionIndex = Math.floor(columnIndex / 3);

    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      const rowIndex = Math.floor(cellIndex / 3);
      const row = sudoku.rows[rowIndex];
      const section = row.sections[sectionIndex];
      const adjustedCellIndex = (cellIndex % 3) * 3 + (columnIndex % 3);
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

      const cell = section.cells[adjustedCellIndex];

      // console.log(`(${row.location - 1}, ${section.location - 1}, ${cell.location - 1})`);
      cell.value && cellValues.push(cell.value);
    }

    const distinctValues = new Set(cellValues);

    // console.log({ columnIndex, cellValues, distinctValues });
    if (cellValues.length !== distinctValues.size) {
      // console.log('column invalid');
      // console.log({
      //   invalid: 'column invalid',
      //   sudoku: sudokuPrettyPrint(sudoku),
      // });
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
      cell.value && cellValues.push(cell.value);
    }

    const distinctValues = new Set(cellValues);

    if (cellValues.length !== distinctValues.size) {
      // console.log({ rowIndex, cellValues, distinctValues });
      // console.log('row invalid');
      // console.log({ invalid: 'row invalid', sudoku: sudoku });
      return false;
    }
  }

  // console.log({ invalid: 'false', sudoku: sudokuPrettyPrint(sudoku) });
  return true;
}

export function isSolved(sudoku: Sudoku): boolean {
  const valid =
    sudoku.rows.every(row => row.sections.every(section => section.cells.every(cell => cell.value))) && isValid(sudoku);

  if (valid) {
    console.log({
      success: 'solved',
      sudoku: sudokuPrettyPrint(sudoku),
      sudokuObj: sudoku,
    });
  }

  return valid;
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
    '---------------------',
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
    '---------------------',
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
