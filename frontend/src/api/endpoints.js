// One small object per backend area. Views call these, never fetch() directly.
import { api } from './client.js';
const post = (path, body) => api(path, { method: 'POST', body });
const patch = (path, body) => api(path, { method: 'PATCH', body });
const del = path => api(path, { method: 'DELETE' });

export const Auth = {
  login: (email, password) => post('/login', { email, password }),
  changePassword: (current, password) => post('/me/password', { current, password }),
};
export const Users = {
  list: () => api('/users'),
  create: u => post('/users', u),
  update: (id, changes) => patch(`/users/${id}`, changes),
};
export const Classes = {
  list: () => api('/classes'),
  create: (name, level) => post('/classes', { name, level }),
  seedDefaults: () => post('/classes/seed-defaults'),
  autoNext: () => post('/classes/auto-next'),
  update: (id, changes) => patch(`/classes/${id}`, changes),
  remove: id => del(`/classes/${id}`),
};
export const Students = {
  list: classId => api(`/classes/${classId}/students`),
  add: (classId, students) => post('/students', { class: classId, students }),
  update: (id, changes) => patch(`/students/${id}`, changes),
  remove: id => del(`/students/${id}`),
};

const put = (path, body) => api(path, { method: 'PUT', body });

export const Sheets = {
  forClass: classId => api(`/classes/${classId}/sheets`),
  save: (classId, subjectId, rows) => put(`/sheets/${classId}/${subjectId}`, { rows }),
  submit: (classId, subjectId) => post(`/sheets/${classId}/${subjectId}/submit`),
  review: (classId, subjectId, action, note) => post(`/sheets/${classId}/${subjectId}/review`, { action, note }),
  submitMany: (classId, subjects) => post(`/classes/${classId}/submit-subjects`, { subjects }),   // { submitted, skipped }
};
export const Broadsheet = { get: classId => api(`/classes/${classId}/broadsheet`) };
export const Reports = {
  forClass: classId => api(`/classes/${classId}/reports`),          // { status, note, reports: [...] }
  save: (studentId, data) => put(`/reports/${studentId}`, data),
  submit: classId => post(`/classes/${classId}/report/submit`),
  review: (classId, action, note) => post(`/classes/${classId}/report/review`, { action, note }),
  principal: (classId, items) => put(`/classes/${classId}/principal`, { items }),
};
export const Term = {
  get: () => api('/term'), save: term => put('/term', term),
  closeCheck: () => api('/term/close-check'),
  close: force => post('/term/close', { force }),                     // { closed, archivedClasses, nextTerm }
};
export const Archive = {
  list: () => api('/archive'),                                         // [{ session, term, classes: [{ id, name, complete }] }]
  results: (session, term, classId) => api(`/archive/results?session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}&class=${classId}`),
};
export const Backup = { get: () => api('/export') };                                          // everything, as JSON
export const Preview = { draft: classId => api(`/classes/${classId}/preview`) };          // result sheets as they stand now
export const Mastersheet = { get: classId => api(`/classes/${classId}/mastersheet`) };      // pupils x subjects totals
export const History = { list: () => api('/history') };                                      // approvals log
export const Promotion = {
  preview: () => api('/promotion/preview'),
  run: (session, moves) => post('/promotion/run', { session, moves }),   // { promoted, repeated, left }
};
export const Results = {
  status: classId => api(`/classes/${classId}/status`),
  averages: classId => api(`/classes/${classId}/averages`),
  full: classId => api(`/classes/${classId}/results`),                    // { status, term, class, pupils|null }
  saveAverages: classId => post(`/classes/${classId}/save-averages`),
};
