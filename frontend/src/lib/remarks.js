// Suggested principal's remark from a pupil's average. Management can accept or overwrite it.
export function suggestRemark(average) {
  if (average == null) return '';
  if (average >= 70) return 'Excellent result, keep it up.';
  if (average >= 60) return 'A very good result, keep it up.';
  if (average >= 50) return 'A good result, put in more effort next time.';
  if (average >= 40) return 'A fair result, more commitment is needed to improve.';
  return 'More commitment is needed to improve.';
}
