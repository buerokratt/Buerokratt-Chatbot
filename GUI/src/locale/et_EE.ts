import * as timeago from 'timeago.js';

function locale(number: number, index: number) {
  return [
    ['just nüüd', 'praegu'],
    ['%s sekundit tagasi', '%s sekundi pärast'],
    ['minut tagasi', 'minuti pärast'],
    ['%s minutit tagasi', '%s minuti pärast'],
    ['tund tagasi', 'tunni pärast'],
    ['%s tundi tagasi', '%s tunni pärast'],
    ['päev tagasi', 'päeva pärast'],
    ['%s päeva tagasi', '%s päeva pärast'],
    ['nädal tagasi', 'nädala pärast'],
    ['%s nädalat tagasi', '%s nädala pärast'],
    ['kuu tagasi', 'kuu pärast'],
    ['%s kuud tagasi', '%s kuu pärast'],
    ['aasta tagasi', 'aasta pärast'],
    ['%s aastat tagasi', '%s aasta pärast'],
  ][index] as [string, string];
}

timeago.register('et_EE', locale);
