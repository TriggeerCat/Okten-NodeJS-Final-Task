import { tokenCleaner } from "./tokenCleaner";

export const cronStarter = async () => {
    tokenCleaner.start();
};
