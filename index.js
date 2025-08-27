import { Worker, isMainThread } from 'worker_threads';
import os from 'os';
import fs from 'fs';
import HyperExpress from 'hyper-express';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 5999;
const numCPUs = os.cpus().length;
const __filename = fileURLToPath(import.meta.url);

if (isMainThread) {
    // Main thread - just spawn workers
    console.log(`Starting ${numCPUs} worker threads...`);

    for (let i = 0; i < numCPUs; i++) {
        new Worker(__filename);
    }

} else {
    // Worker thread - load file and serve
    const metadata = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
    console.log(`Worker loaded ${Object.keys(metadata).length} NFTs`);

    const app = new HyperExpress.Server();

    // CORS
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Max-Age', '86400');

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }
        next();
    });

    // Serve metadata
    app.get('/:id', (req, res) => {
        const id = req.path_parameters.id;
        const data = metadata[id] || metadata[parseInt(id)];

        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ error: 'NFT metadata not found', id });
        }
    });

    // Health check
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy', nfts: Object.keys(metadata).length });
    });

    // Start server
    app.listen(PORT).then(() => {
        console.log(`Worker listening on port ${PORT}`);
    });
}
