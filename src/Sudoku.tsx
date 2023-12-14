import { Box, Typography } from '@mui/material';

export type Sudoku = {
  rows: SudokuRow[];
};

export type SudokuRow = {
  location: number;
  sections: SudokuSection[];
};

export type SudokuSection = {
  location: number;
  cells: SudokuCell[];
};

export type SudokuCell = {
  location: number;
  value?: number;
  preset: boolean;
  possibleValues?: number[];
};

export const Sudoku = ({ sudoku }: { sudoku: Sudoku }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        padding: 1,
      }}
    >
      <Row row={sudoku.rows[0]} />
      <Row row={sudoku.rows[1]} />
      <Row row={sudoku.rows[2]} />
    </Box>
  );
};

const Row = ({ row }: { row: SudokuRow }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Section section={row.sections[0]} />
      <Section section={row.sections[1]} />
      <Section section={row.sections[2]} />
    </Box>
  );
};

const Section = ({ section }: { section: SudokuSection }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        border: 2,
        padding: 0.1,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Cell cell={section.cells[0]} />
        <Cell cell={section.cells[1]} />
        <Cell cell={section.cells[2]} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Cell cell={section.cells[3]} />
        <Cell cell={section.cells[4]} />
        <Cell cell={section.cells[5]} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Cell cell={section.cells[6]} />
        <Cell cell={section.cells[7]} />
        <Cell cell={section.cells[8]} />
      </Box>
    </Box>
  );
};

const Cell = ({ cell }: { cell: SudokuCell }) => {
  return (
    <Box
      sx={{
        border: 1,
        width: '50px',
        height: '50px',
        textAlign: 'center',
        verticalAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
      }}
    >
      <Typography
        variant={'body1'}
        sx={{
          fontWeight: cell.preset ? '700' : 'normal',
          color: cell.preset ? 'mediumblue' : 'black',
          fontSize: '1.5rem',
        }}
      >
        {cell.value ?? ''}
      </Typography>
    </Box>
  );
};
