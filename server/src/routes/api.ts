import { Router } from 'express';
import { generateDeck } from '../controllers/aiController';

const router = Router();

router.post('/generate-deck', generateDeck);

export default router;
