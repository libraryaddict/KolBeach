import {BeachTile} from "components/typings";
import React, {useState} from "react";
import {Route, Routes, MemoryRouter} from "react-router-dom";
import BeachGrid from "./components/beach";
import {getEstRowsHidden} from "components/utils";
import {useSwipeable} from "react-swipeable";

function PageNavigation({tiles}: {tiles: BeachTile[][][]}) {
    const [pageNumber, setPageNumber] = useState<number | undefined>(
        parseInt(new URLSearchParams(window.location.search).get("minute") ?? "1")
    );
    const [displayedInput, setDisplayedInput] = useState(pageNumber.toString());
    const [invalidNumber, setInvalidNumber] = useState<boolean>(false);

    const handlePageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newPage = parseInt(event.target.value);
        setInvalidNumber(isNaN(newPage) || newPage < 1 || newPage > 10000);

        if (newPage > 10000) return;

        setPageNumber(Math.max(1, isNaN(newPage) ? 1 : newPage));
    };

    const wavesToday = getEstRowsHidden();
    const wavesTomorrow = getEstRowsHidden(1);

    const nextRare = (workBackwards: boolean, exposedOnly: boolean) => {
        const increm = workBackwards ? -1 : 1;

        for (let i = pageNumber + increm; (i += increm); i > 0 && i <= 10000) {
            const area = tiles[i];

            for (let row = exposedOnly ? wavesToday : 0; row < 10; row++) {
                if (!area[row].includes(BeachTile.Rare_Sparkle)) continue;

                setInvalidNumber(false);
                setDisplayedInput(i.toString());
                setPageNumber(i);
                return;
            }
        }
    };

    const handlers = useSwipeable({
        onSwiped: (eventData) => {
            let offset = 0;

            if (eventData.dir == "Left") {
                offset = 1;
            } else if (eventData.dir == "Right") {
                offset = -1;
            } else {
                return;
            }

            let pos = pageNumber + offset;

            if (pos > 10000) pos = 10000;
            else if (pos < 1) pos = 1;

            setInvalidNumber(false);
            setDisplayedInput(pos.toString());
            setPageNumber(pos);
        }
    });

    return (
        <div id="container" {...handlers}>
            <MemoryRouter>
                <nav>
                    <button className="rareButton" onClick={() => nextRare(true, false)}>
                        Last Rare
                    </button>

                    <button className="rareButton" onClick={() => nextRare(true, true)}>
                        Last Exposed Rare
                    </button>
                    <input
                        value={displayedInput}
                        id="beachMinute"
                        type="number"
                        placeholder="Minute"
                        onChange={handlePageChange}
                        maxLength={5}
                        className={"minute-input" + (invalidNumber ? " invalid-minute" : "")}
                        min="1"
                        max="10000"
                        onKeyDown={(e) => {
                            if (!/^[^0-9]$/.test(e.key) || e.ctrlKey || e.metaKey) return;

                            e.preventDefault();
                        }}
                        onInput={(e) => {
                            const t = e.currentTarget;

                            if (t.value.length <= t.maxLength) {
                                setDisplayedInput(t.value);
                                return;
                            }

                            setDisplayedInput(t.value.substring(0, t.maxLength));
                        }}
                    />

                    <button className="rareButton" onClick={() => nextRare(false, false)}>
                        Next Rare
                    </button>
                    <button className="rareButton" onClick={() => nextRare(false, true)}>
                        Next Exposed Rare
                    </button>
                </nav>

                <Routes>
                    <Route
                        index
                        path="/"
                        element={
                            pageNumber &&
                            pageNumber >= 1 &&
                            pageNumber <= 10000 && (
                                <BeachGrid
                                    minute={pageNumber}
                                    tiles={tiles}
                                    wavesToday={wavesToday}
                                    wavesTomorrow={wavesTomorrow}
                                />
                            )
                        }
                    ></Route>
                </Routes>
                <div>At minute {pageNumber}</div>
                <div>
                    {wavesToday} wave{wavesToday != 1 ? "s" : ""} today
                </div>
                <div>
                    {wavesTomorrow} wave{wavesTomorrow != 1 ? "s" : ""} tomorrow
                </div>
                <a href={`${window.location.href.split(/[?#]/)[0]}?minute=${pageNumber}`}>
                    Link to minute {pageNumber}
                </a>
            </MemoryRouter>
        </div>
    );
}

export default PageNavigation;
