import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { ElectricitySupply } from "types/electricity-supply";

export type ElectricitySupplyTableProps = {
  data: ElectricitySupply[];
};

const ElectricitySupplyTable = ({ data }: ElectricitySupplyTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: 500 }}>Year</TableCell>
            {data.map((element: ElectricitySupply, index: number) => (
              <TableCell key={index}>{element.year}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 500 }}>MW</TableCell>
            {data.map((element: ElectricitySupply, index: number) => (
              <TableCell key={index}>{element.mw}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ElectricitySupplyTable;
