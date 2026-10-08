// Who is assigned to what (the server enforces this too; this only decides what to show).
export const teachesIn = (cls, userId) => cls.subjects.some(s => s.teacher === userId);
export const isFormTeacher = (cls, userId) => cls.formTeacher === userId;
