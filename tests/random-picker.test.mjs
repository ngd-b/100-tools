import assert from 'node:assert/strict';
import test from 'node:test';
import {drawIndices,drawNumbers,parseNames,secureIndex} from '../src/lib/random-picker.ts';
test('names normalize whitespace and exact duplicates, preserving case and Unicode',()=>{assert.deepEqual(parseNames(' 小明\r\n\n小明\nAlice\nalice '),['小明','Alice','alice']);});
test('sampling without replacement exhausts each candidate exactly once',()=>{for(const rng of [()=>0,n=>n-1,n=>Math.floor(n/2)]){const result=drawIndices(100,100,false,rng);assert.equal(new Set(result).size,100);assert.ok(result.every(n=>n>=0&&n<100));}assert.deepEqual(drawIndices(2,3,true,()=>1),[1,1,1]);});
test('large sparse ranges and signed endpoints work without allocating the range',()=>{assert.equal(drawIndices(4294967296,100,false).length,100);assert.deepEqual(drawNumbers(-2,-2,1,false),[-2]);for(let i=0;i<100;i++){const n=secureIndex(7);assert.ok(n>=0&&n<7);}});
test('invalid ranges, quantities, empty candidates and excess unique draws rejected',()=>{for(const args of [[0,1,false],[2,3,false],[3,0,true],[3,10001,true],[3,1.5,true],[4294967297,1,true]])assert.throws(()=>drawIndices(...args));for(const args of [[3,2,1,false],[0.1,2,1,false],[0,Infinity,1,false]])assert.throws(()=>drawNumbers(...args));});
