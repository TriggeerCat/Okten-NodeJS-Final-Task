export const REGIONS = {
    // Regions
    vinnytsia: "vinnytsia",
    dnipro: "dnipro",
    donetsk: "donetsk",
    zhytomyr: "zhytomyr",
    uzhhorod: "uzhhorod",
    zaporizhzhia: "zaporizhzhia",
    ivano_frankivsk: "ivano-frankivsk",
    kyiv: "kyiv",
    kropyvnytskyi: "kropyvnytskyi",
    luhansk: "luhansk",
    lutsk: "lutsk",
    lviv: "lviv",
    mykolaiv: "mykolaiv",
    odesa: "odesa",
    poltava: "poltava",
    rivne: "rivne",
    sumy: "sumy",
    ternopil: "ternopil",
    kharkiv: "kharkiv",
    kherson: "kherson",
    khmelnytskyi: "khmelnytskyi",
    cherkasy: "cherkasy",
    chernivtsi: "chernivtsi",
    chernihiv: "chernihiv",
    simferopol: "simferopol",

    // Cities
    kyiv_city: "kyiv-city",
    sevastopol: "sevastopol"
} as const;

export type RegionsEnum = (typeof REGIONS)[keyof typeof REGIONS];
