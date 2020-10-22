window.addEventListener("load", main);
//$.event.special.tap.emitTapOnTaphold = false;
("use strict");

// define timer
let t = 0;
let move = 0;
let timer = undefined;

function clearTimer(seconds) {
  clearInterval(timer);
  t = seconds;
  document.querySelectorAll(".time").forEach((e) => {
    e.textContent = String(t);
  });
}

let MSGame = (function () {
  // private constants
  const STATE_HIDDEN = "hidden";
  const STATE_SHOWN = "shown";
  const STATE_MARKED = "marked";
  const STATE_FLIPPED = "flipped";

  function array2d(nrows, ncols, val) {
    const res = [];
    for (let row = 0; row < nrows; row++) {
      res[row] = [];
      for (let col = 0; col < ncols; col++) res[row][col] = val(row, col);
    }
    return res;
  }

  // returns random integer in range [min, max]
  function rndInt(min, max) {
    [min, max] = [Math.ceil(min), Math.floor(max)];
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  class _MSGame {
    constructor() {
      this.init(8, 10, 10); // easy
    }

    validCoord(row, col) {
      return row >= 0 && row < this.nrows && col >= 0 && col < this.ncols;
    }

    startTimer() {
      ++t;
      document.querySelectorAll(".time").forEach((e) => {
        e.textContent = String(t);
      });
    }

    uncoverBlock(arr, i) {
      let row = ~~(i / arr[0].length);
      let col = i % arr[0].length;
      this.uncover(row, col);
    }

    setFlag(arr, i) {
      let row = ~~(i / arr[0].length);
      let col = i % arr[0].length;
      this.mark(row, col);
    }

    didWin() {
      let status = this.getStatus();
      if (
        status.nmarked === status.nmines &&
        status.nuncovered === status.nrows * status.ncols - status.nmines
      ) {
        document.querySelector("#win").classList.toggle("active");
        clearTimer(t);
        console.log("won");
        var nums = document.getElementsByTagName("element");
        for (let i = 0; i < nums.length; i++) {
          var x = document.getElementsByTagName("element")[i];
          x.innerText = "";
        }
      }
    }

    end(arr) {
      const board = document.querySelector(".board");
      board.style.gridTemplateColumns = `repeat(${arr[0].length}, 1fr)`;
      for (let i = 0; i < board.children.length; i++) {
        const block = board.children[i];
        const ind = Number(block.getAttribute("blockIndex"));
        let row = ~~(i / arr[0].length);
        let col = i % arr[0].length;

        if (ind >= arr.length * arr[0].length) {
          block.style.display = "none";
        } else {
          block.style.display = "block";
          if (this.arr[row][col].mine) {
            block.classList.remove("flipped");
            block.classList.add("bomb");
            block.classList.add("fas");
            block.classList.add("fa-bomb");
          }
        }
      }
      var nums = document.getElementsByTagName("element");
      for (let i = 0; i < nums.length; i++) {
        var x = document.getElementsByTagName("element")[i];
        x.innerText = "";
      }

      document.querySelector("#lost").classList.toggle("active");
      clearTimer(t);
    }

    getNumColor(num) {
      switch (num) {
        case 1:
          return "#FF5A5C";
        case 2:
          return "#FFAA5A";
        case 3:
          return "#FFF370";
        case 4:
          return "#6EEA80";
        case 5:
          return "#9BD4FF";
        case 6:
          return "#5773FF";
        case 7:
          return "#C383FF";
        case 8:
          return "#FF83E8";
        default:
          return { color: "#FF83A4" };
      }
    }

    render(arr) {
      const board = document.querySelector(".board");
      board.style.gridTemplateColumns = `repeat(${arr[0].length}, 1fr)`;
      for (let i = 0; i < board.children.length; i++) {
        const block = board.children[i];
        const ind = Number(block.getAttribute("blockIndex"));
        let row = ~~(i / arr[0].length);
        let col = i % arr[0].length;

        if (ind >= arr.length * arr[0].length) {
          block.style.display = "none";
        } else {
          block.style.display = "block";
          if (this.arr[row][col].state === STATE_HIDDEN) {
            block.classList.remove("bomb");
            block.classList.remove("flag");
            block.classList.remove("number");
            block.classList.remove("far");
            block.classList.remove("fa-flag");
            block.classList.remove("fas");
            block.classList.remove("fa-bomb");
            block.classList.add("flipped");
          } else if (this.arr[row][col].state === STATE_MARKED) {
            // console.log(this.arr[row][col].state)
            block.classList.remove("flipped");
            block.classList.add("flag");
            block.classList.add("far");
            block.classList.add("fa-flag");
          } else if (this.arr[row][col].state === STATE_SHOWN) {
            block.classList.remove("flipped");
            block.classList.remove("flag");
            block.classList.remove("far");
            block.classList.remove("fa-flag");
            if (this.arr[row][col].mine) {
              block.classList.add("fas");
              block.classList.add("fa-bomb");
              this.end(this.arr);
              return;
            } else {
              block.classList.remove("flipped");
              block.classList.add("number");
              block.style.color = this.getNumColor(this.arr[row][col].count);
              var para = document.createElement("element");
              console.log(this.arr[row][col].count);
              var node = document.createTextNode(this.arr[row][col].count);
              para.appendChild(node);
              block.appendChild(para);
            }
            this.arr[row][col].state = STATE_FLIPPED;
          }
        }
      }

      document.querySelectorAll(".mine").forEach((e) => {
        e.textContent = String(this.nmines - this.nmarked);
      });
      document.querySelectorAll(".move").forEach((e) => {
        e.textContent = String(move);
      });
      this.didWin();
    }

    init(nrows, ncols, nmines) {
      console.log(nrows, ncols, nmines);
      this.nrows = nrows;
      this.ncols = ncols;
      this.nmines = nmines;
      this.nmarked = 0;
      this.nuncovered = 0;
      this.exploded = false;
      move = 0;
      // this.nflags = nmines;
      // create an array
      this.arr = array2d(nrows, ncols, () => ({
        mine: false,
        state: STATE_HIDDEN,
        count: 0,
      }));
      this.render(this.arr);
      clearTimer(0);
    }

    count(row, col) {
      const c = (r, c) =>
        this.validCoord(r, c) && this.arr[r][c].mine ? 1 : 0;
      let res = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) res += c(row + dr, col + dc);
      return res;
    }

    sprinkleMines(row, col) {
      // prepare a list of allowed coordinates for mine placement
      let allowed = [];
      for (let r = 0; r < this.nrows; r++) {
        for (let c = 0; c < this.ncols; c++) {
          if (Math.abs(row - r) > 2 || Math.abs(col - c) > 2)
            allowed.push([r, c]);
        }
      }
      this.nmines = Math.min(this.nmines, allowed.length);
      for (let i = 0; i < this.nmines; i++) {
        let j = rndInt(i, allowed.length - 1);
        [allowed[i], allowed[j]] = [allowed[j], allowed[i]];
        let [r, c] = allowed[i];
        this.arr[r][c].mine = true;
      }
      // erase any marks (in case user placed them) and update counts
      for (let r = 0; r < this.nrows; r++) {
        for (let c = 0; c < this.ncols; c++) {
          if (this.arr[r][c].state == STATE_MARKED)
            this.arr[r][c].state = STATE_HIDDEN;
          this.arr[r][c].count = this.count(r, c);
        }
      }
      let mines = [];
      for (let row = 0; row < this.nrows; row++) {
        let s = "";
        for (let col = 0; col < this.ncols; col++) {
          s += this.arr[row][col].mine ? "B" : ".";
        }
        s += "  |  ";
        for (let col = 0; col < this.ncols; col++) {
          s += this.arr[row][col].count.toString();
        }
        mines[row] = s;
      }
      console.log("Mines and counts after sprinkling:");
      console.log(mines.join("\n"), "\n");
    }
    // uncovers a cell at a given coordinate
    // this is the 'left-click' functionality
    uncover(row, col) {
      console.log("uncover", row, col);
      // if coordinates invalid, refuse this request
      if (!this.validCoord(row, col)) return false;
      // if this is the very first move, populate the mines, but make
      // sure the current cell does not get a mine
      if (this.nuncovered === 0) {
        this.sprinkleMines(row, col);
        timer = setInterval(this.startTimer, 1000);
      }
      // if cell is not hidden, ignore this move
      if (this.arr[row][col].state !== STATE_HIDDEN) return false;
      // floodfill all 0-count cells
      const ff = (r, c) => {
        if (!this.validCoord(r, c)) return;
        if (this.arr[r][c].state !== STATE_HIDDEN) return;
        this.arr[r][c].state = STATE_SHOWN;
        this.nuncovered++;
        if (this.arr[r][c].count !== 0) return;
        ff(r - 1, c - 1);
        ff(r - 1, c);
        ff(r - 1, c + 1);
        ff(r, c - 1);
        ff(r, c + 1);
        ff(r + 1, c - 1);
        ff(r + 1, c);
        ff(r + 1, c + 1);
      };
      ff(row, col);
      // have we hit a mine?
      if (this.arr[row][col].mine) {
        this.exploded = true;
      }
      this.getRendering();
      return true;
    }
    // puts a flag on a cell
    // this is the 'right-click' or 'long-tap' functionality
    mark(row, col) {
      console.log("mark", row, col);
      // if coordinates invalid, refuse this request
      if (!this.validCoord(row, col)) return false;
      // if cell already uncovered, refuse this
      console.log("marking previous state=", this.arr[row][col].state);
      if (this.arr[row][col].state === STATE_SHOWN) return false;
      // accept the move and flip the marked status
      this.nmarked += this.arr[row][col].state == STATE_MARKED ? -1 : 1;
      this.arr[row][col].state =
        this.arr[row][col].state == STATE_MARKED ? STATE_HIDDEN : STATE_MARKED;

      this.getRendering();
      this.didWin();
      return true;
    }

    // returns array of strings representing the rendering of the board
    //      "H" = hidden cell - no bomb
    //      "F" = hidden cell with a mark / flag
    //      "M" = uncovered mine (game should be over now)
    // '0'..'9' = number of mines in adjacent cells
    getRendering() {
      const res = [];
      const block = document.querySelector(".block");
      for (let row = 0; row < this.nrows; row++) {
        let s = "";
        for (let col = 0; col < this.ncols; col++) {
          let a = this.arr[row][col];
          if (this.exploded && a.mine) s += "M";
          else if (a.state === STATE_HIDDEN) s += "H";
          else if (a.state === STATE_MARKED) s += "F";
          else if (a.mine) s += "M";
          else s += a.count.toString();
        }
        res[row] = s;
      }
      this.render(res);

      // document.querySelectorAll(".mine").forEach((e) => {
      //   e.textContent = String(this.nmines - this.nmarked);
      // });
      // document.querySelectorAll(".move").forEach((e) => {
      //   e.textContent = String(move);
      // });
      // this.didWin();
    }

    getStatus() {
      let done =
        this.exploded ||
        this.nuncovered === this.nrows * this.ncols - this.nmines;
      return {
        done: done,
        exploded: this.exploded,
        nrows: this.nrows,
        ncols: this.ncols,
        nmarked: this.nmarked,
        nuncovered: this.nuncovered,
        nmines: this.nmines,
      };
    }

    gamePrep() {
      const board = document.querySelector(".board");
      const nblocks = 20 * 24;
      for (let i = 0; i < nblocks; i++) {
        const block = document.createElement("div");
        block.className = "block";
        block.setAttribute("blockIndex", i);
        block.addEventListener("click", () => {
          move++;
          this.uncoverBlock(this.arr, i);
        });
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) {
          block.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.setFlag(this.arr, i);
          });
        } else {
          $(block).bind("taphold", (e) => {
            e.preventDefault();
            this.setFlag(this.arr, i);
          });
        }

        board.appendChild(block);
      }
    }
  }

  return _MSGame;
})();

function main() {
  let game = new MSGame();

  document.querySelectorAll(".levelBtn").forEach((btn) => {
    let mode = btn.getAttribute("data-size");
    btn.innerHTML = `${mode}`;
    console.log(mode);
    let nrows = 0,
      ncols = 0,
      nmines = 0;
    if (mode === "easy") {
      console.log(mode);
      nrows = 8;
      ncols = 10;
      nmines = 10;
    } else if (mode === "medium") {
      console.log(mode);
      nrows = 14;
      ncols = 18;
      nmines = 40;
    } else if (mode === "hard") {
      console.log(mode);
      nrows = 20;
      ncols = 24;
      nmines = 99;
    }

    btn.addEventListener("click", game.init.bind(game, nrows, ncols, nmines));
  });

  document.querySelector("#win").addEventListener("click", () => {
    document.querySelector("#win").classList.remove("active");
    clearTimer(0);
    game.init(8, 10, 10);
  });
  document.querySelector("#lost").addEventListener("click", () => {
    document.querySelector("#lost").classList.remove("active");
    clearTimer(0);
    game.init(8, 10, 10);
  });

  game.gamePrep();
  game.init(8, 10, 10);
}
