const room = document.querySelector(".roomId");

const index = {
    init: function () {
        const _this = this;
        _this.continue();

        document.querySelector(".chess-end-btn").addEventListener("click", event => {
            _this.end();
        });

        document.querySelector(".chess-status-btn").addEventListener("click", event => {
            _this.scores();
        });

        document.querySelector(".chess-board").addEventListener("click", event => {
            const fromInput = document.querySelector(".from");
            const toInput = document.querySelector(".to");

            const clickedPosition = decideClickedPosition(event.target);
            if (fromInput.value === "") {
                if (event.target.tagName !== "IMG" && event.target.firstChild.tagName !== "IMG") {
                    alert("선택한 칸에 말이 없습니다!");
                    return;
                }

                fromInput.value = clickedPosition;
                return;
            }

            if (fromInput.value === clickedPosition) {
                fromInput.value = "";
                return;
            }

            toInput.value = clickedPosition;
            _this.move(fromInput.value, toInput.value);

            fromInput.value = "";
            toInput.value = "";
        });

    },

    move: function (source, target) {
        fetch('/chessgames/' + room.id + '/pieces' + `?source=${source}&target=${target}`)
            .then(data => {
                if (!data.ok) {
                    throw new Error("잘못된 명령입니다!");
                }
                return data.json();
            })
            .then(chessGameDto => {
                clearBoard();
                if (chessGameDto.finished) {
                    winToggleButtons(chessGameDto.finished);
                    placePieces(chessGameDto.pieceDtos);
                    return;
                }

                placePieces(chessGameDto.pieceDtos);
                changeTurn(chessGameDto.state);
            })
    },

    end: function () {
        const option = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        fetch("/chessgames/" + room.id, option)
            .then(data => {
                if (!data.ok) {
                    throw new Error("잘못된 명령입니다!");
                }
                clearBoard();
                toggleStartAndEndButtons("End");
            })
    },

    scores: function () {
        fetch("/chessgames/" + room.id + "/scores")
            .then(data => {
                return data.json()
            })
            .then(scoreDtos => {
                printScores(scoreDtos);
            })
            .catch(error => {
                alert("잘못된 명령입니다!")
            });
    },

    continue: function () {
        fetch("/chessgames/" + room.id)
            .then(data => {
                return data.json()
            })
            .then(chessGameDto => {
                placePieces(chessGameDto.pieceDtos);
                changeTurn(chessGameDto.state);
                toggleContinueAndEndButtons(chessGameDto.finished);
            })
    }
}

decideClickedPosition = (target) => {
    if (target.tagName === "IMG") {
        return target.parentElement.id;
    }

    if (target.tagName === "TD") {
        return target.id;
    }
}

changeTurn = (state) => {
    if (state === "End") {
        return;
    }

    const turnInfoClassList = document.querySelector(".turn-info.color").classList;
    turnInfoClassList.remove("is-white");
    turnInfoClassList.remove("is-black");

    if (state === "BlackTurn") {
        turnInfoClassList.remove("is-white");
        turnInfoClassList.add("is-black");
        return;
    }

    turnInfoClassList.remove("is-black");
    turnInfoClassList.add("is-white");
}

printScores = (scoreDtos) => {
    document.querySelectorAll(".score")
        .forEach(scoreElement => scoreElement.classList.remove("hidden"));
    document.querySelector(".score-black").value = scoreDtos.blackScore;
    document.querySelector(".score-white").value = scoreDtos.whiteScore;
    document.querySelector(".score-black-value-tag").innerText = scoreDtos.blackScore;
    document.querySelector(".score-white-value-tag").innerText = scoreDtos.whiteScore;
}

winToggleButtons = (finished) => {
    if (!finished) {
        return;
    }

    document.querySelector(".chess-status-btn").classList.add("hidden");
    document.querySelector(".chess-end-btn").classList.add("hidden");
    document.querySelector(".turn-info.text").innerText = "승리!";
}

toggleStartAndEndButtons = (state) => {
    if (state === "End") {
        document.querySelector(".chess-status-btn").classList.add("hidden");
        document.querySelector(".chess-end-btn").classList.add("hidden");
        return;
    }

    document.querySelector(".turn-info.text").innerText = "누구 차례?";
    document.querySelector(".chess-status-btn").classList.remove("hidden");
    document.querySelector(".chess-end-btn").classList.remove("hidden");
}

toggleContinueAndEndButtons = () => {
    document.querySelector(".chess-status-btn").classList.remove("hidden");
    document.querySelector(".chess-end-btn").classList.remove("hidden");
}


clearBoard = () => {
    document.querySelectorAll(".piece")
        .forEach(piece => piece.parentNode.removeChild(piece));
}

placePieces = pieceDtos => {
    pieceDtos.forEach(pieceDto => this.changeChessBoardUnitTemplate(pieceDto));
}

changeChessBoardUnitTemplate = (pieceDto) => {
    const position = pieceDto.position;
    const chessBoardUnit = document.querySelector(`#${position}`);
    const inputValue = `<img class="piece" src="../images/${decidePieceColor(pieceDto.notation)}.png" alt=${pieceDto.notation}>`
    chessBoardUnit.innerHTML = inputValue;
}

decidePieceColor = (notation) => {
    return notation.charCodeAt(0) === notation.toUpperCase().charCodeAt(0)
        ? `black-${notation}` : `white-${notation}`;
}

index.init();