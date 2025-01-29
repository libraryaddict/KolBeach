import {BeachTile} from "./typings";
import packedData from "/public/packed.txt";
import sand from "/public/images/sand.png";
import castle from "/public/images/castle.png";
import uncommon from "/public/images/uncommon.png";
import rare from "/public/images/rare.png";
import head from "/public/images/head.png";

export function getImage(tile: BeachTile): string {
    if (tile == BeachTile.Sand) return sand;
    if (tile == BeachTile.Castle) return castle;
    if (tile == BeachTile.Uncommon_Sparkle) return uncommon;
    if (tile == BeachTile.Rare_Sparkle) return rare;
    if (tile == BeachTile.Beach_Head) return head;
}

export function isRotateable(tile: BeachTile): boolean {
    return [BeachTile.Sand, BeachTile.Uncommon_Sparkle, BeachTile.Rare_Sparkle].includes(tile);
}

const originalTime = 1044847800;

export function getKolDays() {
    const time = Math.round(Date.now() / 1000);
    const timeDiff = time - originalTime;
    const daysSince = timeDiff / (24 * 60 * 60);

    return Math.floor(daysSince);
}

export function getEstRowsHidden(inDays = 0) {
    // 7505 - Row 1 to 3 is hidden

    // 7502 - Lets say all rows visible here
    // 7506 - All rows invisible here
    // 7510 - All rows visible here
    const counter = (getKolDays() + inDays - 2) % 8;
    // So at 4, there's no rows hidden
    const rowsHidden = Math.abs(4 - counter);

    return rowsHidden;
}

let BITS: number;
let NUM_LENGTH: number;
let acceptedRaw: BeachTile[];
let accepted: BeachTile[];
let sandRatios: number[] = [1];

export function getBitLength(bits: number): number {
    return (1 << bits) - 1;
}

function isCompositeNumber(number: number) {
    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i != 0) {
            continue;
        }

        // Found a divisor other than 1 and itself
        return true;
    }

    return false; // Number is not divisible by any number other than 1 and itself
}

export function withBits(bb: number, leaveLeftOver = 0) {
    // So we write a 3 bit number, if its no.7 then we read a X bit number on how much sand there is
    BITS = bb;
    NUM_LENGTH = getBitLength(bb);

    //console.log("Our max len is " + NUM_LENGTH);

    acceptedRaw = [
        BeachTile.Sand,
        BeachTile.Rare_Sparkle,
        BeachTile.Uncommon_Sparkle,
        BeachTile.Castle,
        BeachTile.Beach_Head
    ];
    accepted = [...acceptedRaw];

    if (accepted.length > NUM_LENGTH) {
        throw "Not enough bits. We only have " + NUM_LENGTH;
    }

    while (accepted.length + leaveLeftOver < NUM_LENGTH) {
        accepted.unshift(BeachTile.Sand);
    }

    const SAND_MULTS = accepted.filter((t) => t == BeachTile.Sand).length;
    sandRatios = [1];

    for (let i = 2; sandRatios.length < SAND_MULTS; i++) {
        if (isCompositeNumber(i)) {
            continue;
        }

        sandRatios.push(i);
    }
}
function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

withBits(4);

function setBit(number: number, bitPosition: number, value: number): number {
    return number | (value << bitPosition);
}

function isSet(n: number, mask: number): boolean {
    return (n & (1 << mask)) != 0;
}

export function readPacked(): BeachTile[] {
    const unpacked = base64ToArrayBuffer(packedData);

    const rawTiles = [];

    let startAtBit = 0;

    const read = (bits: number) => {
        let unpackedNumber = 0;

        for (let bit = 0; bit < bits; bit++) {
            const globalBitPos = startAtBit + bit;
            const charIndex = Math.floor(globalBitPos / 8);
            const charBit = globalBitPos % 8;
            const char = unpacked[charIndex];

            unpackedNumber = setBit(unpackedNumber, bit, isSet(char, charBit) ? 1 : 0);
        }

        startAtBit += bits;

        return unpackedNumber;
    };

    for (
        let numbersRead = 0;
        rawTiles.length < 10_000 * 100 && startAtBit / 8 < unpacked.length;
        numbersRead++
    ) {
        const acceptedIndex = read(BITS);
        const tile = accepted[acceptedIndex];

        if (tile == BeachTile.Sand) {
            const mult = sandRatios[acceptedIndex];

            for (let a = 0; a < mult; a++) {
                rawTiles.push(tile);
            }
        } else {
            rawTiles.push(tile);
        }
    }

    if (rawTiles.length != 10000 * 100) {
        throw "Expected 1m tiles to read, got " + rawTiles.length;
    }

    return rawTiles;
}

export function getAllBeachTiles(): BeachTile[][][] {
    const packed = readPacked();
    const tiles: BeachTile[][][] = [];
    let ind = 0;

    for (let i = 1; i <= 10000; i++) {
        const area = (tiles[i] = []);

        for (let row = 0; row < 10; row++) {
            const rows = (area[row] = []);

            for (let col = 0; col < 10; col++) {
                rows[col] = packed[ind++];
            }
        }
    }

    return tiles;
}
