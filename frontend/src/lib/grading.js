// Live preview while typing. The server calculates the official totals and grades.
export const MAX = { a: 20, b: 20, e: 60 };
const SCALE = [[70, 'A'], [60, 'B'], [50, 'C'], [40, 'D'], [30, 'E'], [0, 'F']];

export const totalOf = r => (r && (r.a != null || r.b != null || r.e != null)) ? (r.a || 0) + (r.b || 0) + (r.e || 0) : null;
export const gradeOf = total => total == null ? '' : SCALE.find(s => total >= s[0])[1];
export const isComplete = r => !!r && r.a != null && r.b != null && r.e != null;
