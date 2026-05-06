// Public AI bridge: re-export from the private AI core package boundary.
const { chat } = require('@allier/sayachan-ai-core');

module.exports = { chat };
