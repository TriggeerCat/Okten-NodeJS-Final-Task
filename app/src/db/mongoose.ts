import mongoose from "mongoose";

import envData from "../env/env";

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 3000;

export const connectToDB = async () => {
    for (let attempt = 1; ; attempt++) {
        try {
            await mongoose.connect(envData.MONGO_URI);
            return;
        } catch (e) {
            if (attempt >= MAX_ATTEMPTS) throw e;
            console.log(`Connection failed (${attempt}/${MAX_ATTEMPTS}). Trying to reconnect in 3 seconds.`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
};
