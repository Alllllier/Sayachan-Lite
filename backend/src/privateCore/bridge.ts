// Public AI bridge: re-export from the private AI core package boundary.
import aiCore from '@allier/sayachan-ai-core';

const { chat } = aiCore;
const { chatStream } = aiCore;

export { chat, chatStream };

export default { chat, chatStream };
