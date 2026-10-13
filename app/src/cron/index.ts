import { exchangeRefresher } from "./exchangeRefresher";

// expired tokens are removed by the TTL index on the tokens collection
export const cronStarter = () => {
    exchangeRefresher.start();
};
