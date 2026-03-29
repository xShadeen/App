export interface Group {
  id: string;
  name: string;
  students: {
    id: number;
    firstName: string;
  }[];
}
