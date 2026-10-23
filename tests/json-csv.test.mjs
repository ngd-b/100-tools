import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCsv, jsonTable, writeCsv, tableJson } from '../src/lib/json-csv.ts';
test('CSV quoted multiline Unicode and delimiters round trip', () => {
  const table = { headers: ['姓名', 'note'], rows: [['小明', 'a,"b"\r\nc'], ['', '']] };
  for (const delimiter of [',', ';', '\t']) assert.deepEqual(parseCsv('\uFEFF'+writeCsv(table, delimiter), delimiter), table);
});
test('JSON scalar union fields and safe special keys', () => {
  const table = jsonTable('[{"__proto__":"safe","x":null},{"x":true,"y":0}]');
  assert.deepEqual(table.rows, [['safe','',''],['','true','0']]);
  assert.equal(JSON.parse(tableJson(table))[0].__proto__, 'safe');
});
test('reject malformed CSV and unsupported JSON rather than silently losing data', () => {
  for (const input of ['', 'a,a\n1,2', 'a,b\n1', 'a\n"open', 'a\n"closed"x', 'a\nb"c']) assert.throws(() => parseCsv(input));
  for (const input of ['[]', '{}', '[1]', '[{"a":{}}]', '[{"a":1e400}]', '[{"a":9007199254740993}]']) assert.throws(() => jsonTable(input));
  assert.deepEqual(parseCsv('a,b\r\n1,2\r\n').rows, [['1','2']]);
});
