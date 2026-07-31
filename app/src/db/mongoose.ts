import mongoose from "mongoose";

import envData from "../env/env";

export const connectToDB = async () => {
    while (true) {
        try {
            await mongoose.connect(envData.MONGO_URI);
            break;
        } catch {
            console.log("Connection failed. Trying to reconnect in 3 seconds.");
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
};
