import {BeachTile} from "components/typings";
import {getImage, isRotateable} from "components/utils";
import React, {useState} from "react";

// in order to work 'Math.seed' must NOT be undefined,
// so in any case, you HAVE to provide a Math.seed

const makeSeed = (seed: number) => {
    return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
};

function waves(rowsHidden: number, pixelHeight: number, goingOut: boolean) {
    return (
        <>
            <div
                className="oceanDirection"
                style={{
                    marginTop: `-${(pixelHeight / 10) * rowsHidden + pixelHeight / 12}px`
                }}
            >
                {createArrow(pixelHeight, goingOut)}
                {createArrow(pixelHeight, goingOut)}
                {createArrow(pixelHeight, goingOut)}
            </div>
            <div
                className="ocean"
                style={{
                    marginTop: `-${(pixelHeight / 10) * rowsHidden + pixelHeight / 30}px`,
                    height: `${(pixelHeight / 10) * rowsHidden + pixelHeight / 30}px`
                }}
            >
                <svg
                    width="100%"
                    height={pixelHeight}
                    viewBox="0 0 1000 1000"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                >
                    <defs>
                        <path
                            id="wavepath"
                            d="M 0 2000 0 500 Q 40.5 485 81 500 t 81 0 81 0 81 0 81 0 81 0 81 0 81 0 81 0 81 0 81 0 81 0 81 0 81 0 81 0 v1000 z"
                        />
                        <path
                            id="motionpath"
                            d="M 0 0 -40 -5 M -40 -5 -81 -10 M -81 -10 -122 -5 M -122 -5 -164 0"
                        ></path>
                        <path
                            id="withdrawpath"
                            d={"M 0 0 0 " + (pixelHeight / 10) * rowsHidden}
                        ></path>
                    </defs>
                    <g>
                        <use xlinkHref="#wavepath" y="-463" fill="#29B6F6" opacity="0.4">
                            <animateMotion dur="2.5s" repeatCount="indefinite" begin="-1">
                                <mpath xlinkHref="#motionpath" />
                            </animateMotion>
                        </use>
                        <use xlinkHref="#wavepath" y="-463" fill="#29c7f6" opacity="0.3">
                            <animateMotion dur="2.5s" repeatCount="indefinite">
                                <mpath xlinkHref="#motionpath" />
                            </animateMotion>
                        </use>
                        <use xlinkHref="#wavepath" y="-463" fill="#29B6F6" opacity="0.4">
                            <animateMotion
                                dur="4s"
                                repeatCount="indefinite"
                                keyPoints="1;0"
                                keyTimes="0;1"
                            >
                                <mpath xlinkHref="#motionpath" />
                            </animateMotion>
                        </use>
                        <use xlinkHref="#wavepath" y="-463" fill="#29a5f6" opacity="0.3">
                            <animateMotion
                                dur="4s"
                                repeatCount="indefinite"
                                begin="-2"
                                keyPoints="1;0"
                                keyTimes="0;1"
                            >
                                <mpath xlinkHref="#motionpath" />
                            </animateMotion>
                        </use>
                    </g>
                </svg>
            </div>
        </>
    );
}

function createArrow(pixelHeight: number, goingOut: boolean) {
    return (
        <>
            <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 122.433 122.88"
                enableBackground="0 0 122.433 122.88"
                className={!goingOut ? "oceanFlipped" : ""}
                style={{
                    paddingLeft: pixelHeight / 10 + "px",
                    paddingRight: pixelHeight / 10 + "px",
                    width: pixelHeight / 10 + "px"
                }}
            >
                <g>
                    <polygon
                        fill="blue"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        points="61.216,122.88 0,59.207 39.403,59.207 39.403,0 83.033,0 83.033,59.207 122.433,59.207 61.216,122.88"
                    />
                </g>
            </svg>
        </>
    );
}

function BeachGrid({
    minute,
    tiles,
    wavesToday,
    wavesTomorrow
}: {
    minute: number;
    tiles: BeachTile[][][];
    wavesToday: number;
    wavesTomorrow: number;
}) {
    const rand = makeSeed(1); // Because having the tiles change on the same page is disorientating

    const reversed = [...tiles[minute]].reverse();
    const getRow = (row: number) => 9 - row;
    const [imgHeight, setImgHeight] = useState<number>(1);

    const updateHeight = () => {
        setImgHeight(Math.min(visualViewport.width * 0.7, visualViewport.height * 0.7));
    };

    React.useEffect(() => {
        window.addEventListener("resize", updateHeight);
        updateHeight();
    });

    const getTransforms = (row: number, tile: BeachTile) => {
        const transforms: string[] = [];

        const rotate = 90 * Math.floor(rand() * 4);
        if (rotate > 0) transforms.push(`rotate(${rotate}deg)`);
        if (rand() < 0.3) transforms.push(`scaleX(-1)`);
        if (rand() < 0.3) transforms.push(`scaleY(-1)`);
        if (rand() < 0.3) transforms.push(`scaleZ(-1)`);

        // We consume the rand() so the sand is consistantly rotated
        if (!isRotateable(tile)) return {};

        const txt = transforms.join(" ");

        return {
            transform: txt
        };
    };

    return (
        <>
            <div className="image-grid" style={{width: imgHeight + "px", height: imgHeight + "px"}}>
                {reversed.map((row, rowIndex) => (
                    <div key={rowIndex} className={"grid-row"}>
                        {row.map((tile, colIndex) => (
                            <img
                                key={`${minute}${rowIndex}${colIndex}`}
                                src={getImage(tile)}
                                alt={`Image ${getRow(rowIndex)}-${colIndex}`}
                                style={getTransforms(rowIndex, tile)}
                                className={"grid-image"}
                                title={
                                    BeachTile[tile].toString().replace("_", " ") +
                                    ", Row: " +
                                    getRow(rowIndex) +
                                    ", Column: " +
                                    colIndex
                                }
                            />
                        ))}
                    </div>
                ))}
                {wavesToday > 0 ? waves(wavesToday, imgHeight, wavesToday > wavesTomorrow) : <></>}
            </div>
        </>
    );
}

export default BeachGrid;
