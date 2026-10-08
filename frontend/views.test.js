// Renders every screen against fake server data and checks the page contains real elements,
// never stray text such as "[object HTMLDivElement]" or "false" (a past bug from passing arrays to the DOM).
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { session } from '../src/state/session.js';

const classes = [
  { _id: 'c1', name: 'JSS 1', level: 'secondary', formTeacher: 'u1', subjects: [{ _id: 's1', name: 'Mathematics', teacher: 'u1' }, { _id: 's2', name: 'English Language', teacher: '' }] },
  { _id: 'c2', name: 'Nursery 1', level: 'nursery', formTeacher: '', subjects: [{ _id: 's3', name: 'Phonics', teacher: '' }] },
];
const users = [{ _id: 'u1', name: 'Ada Admin', email: 'a@x.com', role: 'admin', active: true }, { _id: 'u2', name: 'Tom Teacher', email: 't@x.com', role: 'teacher', active: false }];
const notReady = { ready: false, pendingSubjects: ['Mathematics'], classReport: 'draft', missingPrincipalRemarks: ['David Steven'], pupilCount: 2 };
const api = {
  '/users': users, '/classes': classes, '/term': { term: 'Second', session: '2025/2026' },
  '/classes/c1/students': [{ _id: 'p1', name: 'David Steven', adm: '0014' }, { _id: 'p2', name: 'Mary John', adm: '' }],
  '/classes/c1/sheets': [{ subject: 's1', name: 'Mathematics', teacher: 'u1', status: 'draft', note: '', rows: { p1: { a: 10, b: 12, e: 40 } } },
    { subject: 's2', name: 'English Language', teacher: '', status: 'submitted', note: '', rows: {} }],
  '/classes/c1/reports': { status: 'draft', note: '', reports: [{ student: 'p1', b: [3, 3, 3, 3, 3], att: 90, rem: 'Good', prin: '', st: '' }] },
  '/classes/c1/status': notReady,
  '/classes/c1/averages': [{ id: 'p1', average: 62 }, { id: 'p2', average: null }],
  '/classes/c1/results': { status: notReady, term: {}, class: { id: 'c1', name: 'JSS 1', level: 'secondary' }, pupils: null },
};

beforeEach(() => {
  document.body.innerHTML = '<div id="toast"></div>';
  session.set('token', { id: 'u1', name: 'Ada Admin', email: 'a@x.com', role: 'admin' });
  globalThis.fetch = vi.fn(async url => {
    const path = new URL(url).pathname.replace(/^\/api/, '');
    return path in api ? { ok: true, status: 200, json: async () => api[path] } : { ok: false, status: 404, json: async () => ({ error: 'no mock for ' + path }) };
  });
});

const screens = {
  staff: () => import('../src/views/staff.js'),
  classes: () => import('../src/views/classes.js'),
  pupils: () => import('../src/views/pupils.js'),
  scores: () => import('../src/views/scores.js'),
  report: () => import('../src/views/report.js'),
  approve: () => import('../src/views/approve/index.js'),
  print: () => import('../src/views/print.js'),
  account: () => import('../src/views/account.js'),
};

describe('screens render real elements', () => {
  for (const [name, load] of Object.entries(screens)) {
    it(name, async () => {
      const root = document.createElement('div');
      document.body.append(root);
      await (await load()).render(root);
      expect(root.children.length).toBeGreaterThan(0);
      expect(root.textContent).not.toMatch(/\[object|undefined|null|\bfalse\b|\btrue\b/);
    });
  }
  it('classes screen lists every class and subject row as elements', async () => {
    const root = document.createElement('div');
    await (await screens.classes()).render(root);
    expect(root.querySelectorAll('details').length).toBe(2);
    expect(root.querySelectorAll('details input').length).toBeGreaterThanOrEqual(3);   // subject name boxes (+ new subject boxes)
  });
});
