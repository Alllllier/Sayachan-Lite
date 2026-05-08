// Public AI bridge: re-export from the private AI core package boundary.
import aiCore from '@allier/sayachan-ai-core';

const { chat } = aiCore;

export { chat };

export default { chat };
