// Unit tests never reach the network: fetch fails unless a spec stubs it (the shared theme
// call, for one, keeps the default theme).
globalThis.fetch = () => Promise.reject(new TypeError('No network in unit tests'));
