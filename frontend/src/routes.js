// The list of screens. To add a screen: create views/<name>.js (export render(root)) and add a line here.
// roles = who may open it. hidden = not shown in the menu.
const ALL = ['admin', 'management', 'teacher'];
const ADMIN = ['admin'];
const MANAGEMENT = ['admin', 'management'];

export const routes = [
  { path: 'staff',    title: 'Staff',   roles: ADMIN, load: () => import('./views/staff.js') },
  { path: 'classes',  title: 'Classes', roles: ADMIN, load: () => import('./views/classes.js') },
  { path: 'pupils',   title: 'Pupils',  roles: ADMIN, load: () => import('./views/pupils.js') },
  { path: 'term',     title: 'Term',    roles: ADMIN, load: () => import('./views/term/index.js') },
  { path: 'archive',  title: 'Archive', roles: MANAGEMENT, load: () => import('./views/archive.js') },
  { path: 'history',  title: 'History', roles: MANAGEMENT, load: () => import('./views/history.js') },
  { path: 'preview',  title: 'Preview', roles: ALL, hidden: true, load: () => import('./views/draftPreview.js') },
  { path: 'mastersheet', title: 'Broadsheet', roles: MANAGEMENT, hidden: true, load: () => import('./views/mastersheet.js') },
  { path: 'approve',  title: 'Approve', roles: MANAGEMENT, load: () => import('./views/approve/index.js') },
  { path: 'print',    title: 'Print',   roles: MANAGEMENT, load: () => import('./views/print.js') },
  { path: 'review',   title: 'Review',  roles: ALL, load: () => import('./views/review.js') },
  { path: 'scores',   title: 'Scores',  roles: ALL, load: () => import('./views/scores.js') },
  { path: 'report',   title: 'Report',  roles: ALL, load: () => import('./views/report.js') },
  { path: 'account',  title: 'Account', roles: ALL, hidden: true, load: () => import('./views/account.js') },
];
