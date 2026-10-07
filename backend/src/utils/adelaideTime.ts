export function adelaideTime(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Adelaide',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const get = (type: string) => parts.find((x) => x.type === type)?.value ?? '';
  return (
    get('year') +
    '-' +
    get('month') +
    '-' +
    get('day') +
    'T' +
    get('hour') +
    ':' +
    get('minute') +
    ':' +
    get('second') +
    get('timeZoneName').replace('GMT', '')
  );
}
