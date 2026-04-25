import '@testing-library/jest-dom'

class TestTextEncoder {
  encode(input: string): Uint8Array {
    return new Uint8Array(
      Array.from(input).map((char) => char.charCodeAt(0))
    )
  }
}

class TestTextDecoder {
  decode(input?: BufferSource): string {
    if (!input) return ''
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input as ArrayBuffer)
    return Array.from(bytes)
      .map((byte) => String.fromCharCode(byte))
      .join('')
  }
}

if (!globalThis.TextEncoder) {
  Object.defineProperty(globalThis, 'TextEncoder', {
    value: TestTextEncoder,
    writable: true,
  })
}

if (!globalThis.TextDecoder) {
  Object.defineProperty(globalThis, 'TextDecoder', {
    value: TestTextDecoder,
    writable: true,
  })
}
