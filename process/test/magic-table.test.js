import { test } from 'node:test'
import * as assert from 'node:assert'
import AoLoader from '@permaweb/ao-loader'
import fs from 'fs'

const wasm = fs.readFileSync('./process.wasm')
const options = { format: "wasm32-unknown-emscripten" }
test('magictable to wrap send to convert data to json', async () => {
  const handle = await AoLoader(wasm, options)
  const env = {
    Process: {
      Id: 'AOS',
      Owner: 'FOOBAR',
      Tags: [
        { name: 'Name', value: 'Thomas' }
      ]
    }
  }
  const msg = {
    Target: 'AOS',
    Owner: 'FOOBAR',
    ['Block-Height']: "1000",
    Id: "1234xyxfoo",
    Module: "WOOPAWOOPA",
    Tags: [
      { name: 'Action', value: 'Eval' }
    ],
    Data: 'Send({ Target = "TEST", Data = { foo = "bar" }})'
  }
  const result = await handle(null, msg, env)
  assert.equal(result.Messages[0].Data, '{"foo":"bar"}')
  const msg2 = Object.assign({}, msg, result.Messages[0])
  const tableResult = await handle(result.Memory, msg2, env)
  const inboxResult = await handle(
    tableResult.Memory,
    Object.assign({}, msg, { Tags: [{ name: 'Action', value: 'Eval' }], Data: 'Inbox[1].Data.foo' }),
    env
  )
  assert.equal(inboxResult.Output.data.output, 'bar')
})

test('magictable to wrap swap to convert data to json', async () => {
  const handle = await AoLoader(wasm, options)
  const env = {
    Process: {
      Id: 'AOS',
      Owner: 'FOOBAR',
      Tags: [
        { name: 'Name', value: 'Thomas' }
      ]
    }
  }
  const msg = {
    Target: 'AOS',
    Owner: 'FOOBAR',
    ['Block-Height']: "1000",
    Id: "1234xyxfoo",
    Module: "WOOPAWOOPA",
    Tags: [
      { name: 'Action', value: 'Eval' }
    ],
    Data: 'Spawn("AWESOME_SAUCE", { Target = "TEST", Data = { foo = "bar" }})'
  }
  const result = await handle(null, msg, env)
  assert.equal(result.Spawns[0].Data, '{"foo":"bar"}')
})
