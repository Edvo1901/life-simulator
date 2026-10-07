import { adelaideTime } from './adelaideTime';
test('explicit Adelaide DST and standard offsets survive server timezone differences', () => {
  expect(adelaideTime(new Date('2026-01-01T00:00:00Z'))).toBe(
    '2026-01-01T10:30:00+10:30',
  );
  expect(adelaideTime(new Date('2026-07-01T00:00:00Z'))).toBe(
    '2026-07-01T09:30:00+09:30',
  );
});
