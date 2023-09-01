import * as timeago from 'timeago.js';

/* To Add Weeks Support Please add the following in index 8 & 9
  ['nädal tagasi', 'nädala pärast'],
  ['%s nädalat tagasi', '%s nädala pärast'], 
*/

function locale(number: number, index: number, totalSec: number | undefined) {
  const days = Math.round(Math.round(totalSec ?? 0) / (3600 * 24));
  const monthRemainingDays = days - (number * 30);
  return [
    ['just nüüd', 'praegu'],
    ['%s sekundit tagasi', '%s sekundi pärast'],
    ['minut tagasi', 'minuti pärast'],
    ['%s minutit tagasi', '%s minuti pärast'],
    ['tund tagasi', 'tunni pärast'],
    ['%s tundi tagasi', '%s tunni pärast'],
    ['päev tagasi', 'päeva pärast'],
    ['%s päeva tagasi', '%s päeva pärast'],
    [`${days} päev tagasi`, 'nädala pärast'],
    [`${days} päev tagasi`, '%s nädala pärast'],
    [`%s kuu ja ${monthRemainingDays != 0 ? `${monthRemainingDays} päev${monthRemainingDays != 1 ? 'a' : ''}` : ''}`, 'kuu pärast'],
    [`%s kuud ja ${monthRemainingDays != 0 ? `${monthRemainingDays} päev${monthRemainingDays != 1 ? 'a' : ''}` : ''}`, '%s kuu pärast'],
    ['aasta tagasi', 'aasta pärast'],
    ['%s aastat tagasi', '%s aasta pärast'],
  ][index] as [string, string];
}

timeago.register('et_EE', locale);
