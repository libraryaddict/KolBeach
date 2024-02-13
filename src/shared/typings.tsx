export enum BeachTile {
    Beach_Head = "h",
    Sand = "s",
    Castle = "c",
    Uncommon_Sparkle = "u",
    Rare_Sparkle = "r"
}

Object.entries(BeachTile).forEach((e) => {
    BeachTile[e[1]] = e[0];
});

export interface BeachArea {
    minute: number;
    tiles: BeachTile[][];
}
