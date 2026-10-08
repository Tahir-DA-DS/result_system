const STATUS = ['draft', 'submitted', 'approved', 'returned'];

// Grade scale, default subjects per level, and the default class list.
const SC = [[70, 'A', 'Excellent'], [60, 'B', 'Very Good'], [50, 'C', 'Good'], [40, 'D', 'Credit'], [30, 'E', 'Fair'], [0, 'F', 'Poor']];
const DEF = {
  nursery: ['English Studies', 'Mathematics', 'Poem/Rhymes', 'Art/Craft', 'Phonics', 'Social Habit', 'Computer', 'Basic Science', 'Moral Habit', 'Primary Health Edu.', 'Hand Writing', 'Quantitative Reasoning', 'Verbal Reasoning', 'Religion', 'K.U.W', 'P.S.E.D', 'P.L.S'],
  primary: ['English Studies', 'Mathematics', 'Agricultural Science', 'Physical Health Education', 'Quantitative', 'Verbal Reasoning', 'Hand Writing', 'I.R.S/C.R.S', 'Computer Science', 'Social Studies', 'Home Economics', 'Civic Education', 'Basic Science', 'Creative Art', 'History', 'Phonics'],
  secondary: ['Mathematics', 'English Language', 'Agric. Science', 'Basic Science', 'Basic Technology', 'Civic Education', 'CCA', 'History', 'Home Economics', 'Physical Health Education', 'Social Studies', 'Business Studies', 'ICT', 'Religion (IRS/CRS)'] };
const PRE = [['nursery', 'Nursery 1', 'Nursery 2', 'Nursery 3'], ['primary', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'], ['secondary', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3']];

module.exports = { STATUS, SC, DEF, PRE };
