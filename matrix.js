const COLUMN = "column";
const ROW = "row";
const START = "start";
const END = "end";

class Matrix {
    constructor(rows = 1, columns, content = 0) {
        if (columns === undefined) {
            columns = rows;
        }
        this.rows = rows;
        this.columns = columns;
        this.data = new Array(rows).fill([]).map(() => new Array(columns).fill(content));
    }

    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                let newValue = func(this.data[i][j], i, j);
                if (newValue !== undefined) {
                    this.data[i][j] = func(this.data[i][j], i, j);
                }
            }
        }
        return this;
    }

    static map(m, func) {
        return m.copy().map(func);
    }

    copy() {
        return new Matrix(this.rows, this.columns).map((v, i, j) => this.data[i][j]);
    }

    fill(n) {
        this.map(() => n);
        return this;
    }

    transpose() {
        return new Matrix(this.columns, this.rows).map((v, i, j) => this.data[j][i]);
    }

    randomize(min, max) {
        this.map(() => aleatory(min, max));
        return this;
    }

    print() {
        console.table(this.data);
    }

    static fromArray(arr, orientation = ROW) {
        const rows = arr.length;
        const columns = arr[0].length;
        if (columns === undefined) {
            if (orientation == COLUMN) {
                return new Matrix(rows, 1).map((v, i) => arr[i]);
            } else if (orientation == ROW) {
                return new Matrix(1, rows).map((v, i, j) => arr[j]);
            }
        }
        return new Matrix(rows, columns).map((v, i, j) => arr[i][j]);
    }

    toArray(){
        return this.data.slice();
    }

    sum(n = COLUMN) {
        if (n === COLUMN || n == ROW) {
            if (n === ROW) {
                const newData = new Array(this.rows).fill(0);
                this.data.forEach((row, i) => newData[i] = row.reduce((prev, curr) => prev + curr));
                return Matrix.fromArray(newData, COLUMN);
            } else {
                const newData = new Array(this.columns).fill(0);
                this.transpose().data.forEach((row, i) => newData[i] = row.reduce((prev, curr) => prev + curr));
                return Matrix.fromArray(newData, ROW);
            }
        } else if (n instanceof Matrix) {
            if (n.rows === this.rows && n.columns === this.columns) {
                this.map((v, i, j) => v + n.data[i][j]);
            } else {
                throw MatrixException("rows or columns don't match.");
            }
        } else if (typeof n === "number") {
            this.map(v => v + n);
        }
        return this;
    }

    static sum(m, n) {
        if (n instanceof Matrix) {
            if (m.rows === n.rows && m.columns === n.columns) {
                return m.copy().sum(n);
            } else {
                throw MatrixException("rows or columns don't match.");
            }
        } else {
            return m.copy().sum(n);
        }
    }

    sub(n) {
        if (n instanceof Matrix) {
            if (n.rows === this.rows && n.columns === this.columns) {
                this.map((v, i, j) => v - n.data[i][j]);
            } else {
                throw MatrixException("rows or columns don't match.");
            }
        } else if (typeof n === "number") {
            this.map(v => v - n);
        }
        return this;
    }

    static sub(m, n) {
        if (n instanceof Matrix) {
            if (m.rows === n.rows && m.columns === n.columns) {
                return m.copy().sub(n);
            } else {
                throw MatrixException("rows or columns don't match.");
            }
        } else {
            return m.copy().sub(n);
        }
    }

    mult(n) {
        if (n instanceof Matrix) {
            if (n.rows === this.rows && n.columns === this.columns) {
                this.map((v, i, j) => v * n.data[i][j]);
            } else {
                throw MatrixException("rows or columns don't match.");
            }
        } else if (typeof n === "number") {
            this.map(v => v * n);
        }
        return this;
    }

    static mult(m, n){
        const mtx = m.copy();
        if (n instanceof Matrix) {
            if (n.rows === m.rows && n.columns === m.columns) {
                mtx.map((v, i, j) => v * n.data[i][j]);
            } else {
                throw MatrixException("rows or columns don't match.");
            }
        } else if (typeof n === "number") {
            mtx.map(v => v * n);
        }
        return mtx;
    }

    static mmult(m, n) {
        if (n instanceof Matrix) {
            if (m.columns === n.rows) {
                return new Matrix(m.rows, n.columns, 0).map((v, i, j) => {
                    let sum = 0;
                    for (let k = 0; k < m.columns; k++) {
                        sum += m.data[i][k] * n.data[k][j];
                    }
                    return sum;
                });
            }else if(m.rows === n.rows && m.columns === n.columns){
                const mtx = m.copy();
                mtx.map((v, i, j) => v * n.data[i][j]);
                return mtx;
            } else {
                throw MatrixException("rows or columns don't match.");
            }
        } else {
            return m.copy().map((v) => v * n);
        }
    }

    static shift(m, orientation, position = END){
        const data = m.data.slice();
        if(orientation === ROW){
            if(position === END){
                data.splice(data.length-1, 1);
            }else{
                data.splice(0, 1);
            }
        }else{
            if(position === END){
                data.forEach(row => {
                    row.splice(row.length-1,1);
                });
            }else{
                data.forEach(row => {
                    row.splice(0,1);
                });
            }
        }
        return Matrix.fromArray(data);
    }

    append(line, position = END, orientation) {
        if (line instanceof Array) {
            line = Matrix.fromArray(line, orientation);
        }
        if(orientation === undefined){
            if(this.rows === line.rows) orientation = COLUMN;
            else if(this.columns === line.columns) orientation = ROW;
        }
        if (orientation === COLUMN && this.rows === line.rows) {
            this.columns += line.columns;
            const newData = [];
            if (position === START) {
                this.data.forEach((row, i) => {
                    newData.push(line.data[i].concat(row));
                });
            } else {
                this.data.forEach((row, i, arr) => {
                    newData.push(row.concat(line.data[i]));
                });
            }
            this.data = newData;
        } else if (orientation === ROW && this.columns == line.columns) {
            this.rows += line.rows;
            if (position === START) {
                const newData = [];
                line.data.forEach(row => {
                    newData.push(row.slice());
                })
                this.data.forEach(row => {
                    newData.push(row.slice());
                });
                this.data = newData;
            } else {
                line.data.forEach(row => {
                    this.data.push(row.slice());
                })
            }
        } else {
            throw MatrixException("parameters don't match.");
        }
        return this;
    }

    inv() {
        if (this.rows !== this.columns) {
            throw MatrixException("matrix not invertible.");
        }
        const dim = this.rows;
        const ide = eye(dim).data;
        const cop = this.copy().data;

        for (let i = 0; i < dim; i++) {
            let e = cop[i][i];

            if (e == 0) {
                for (let ii = i + 1; ii < dim; ii++) {
                    if (cop[ii][i] != 0) {
                        for (let j = 0; j < dim; j++) {
                            e = cop[i][j];
                            cop[i][j] = cop[ii][j];
                            cop[ii][j] = e;
                            e = ide[i][j];
                            ide[i][j] = ide[ii][j];
                            ide[ii][j] = e;
                        }
                        break;
                    }
                }
                e = cop[i][i];
                if (e == 0) {
                    throw MatrixException("matrix not invertible.");
                }
            }

            for (let j = 0; j < dim; j++) {
                cop[i][j] = cop[i][j] / e;
                ide[i][j] = ide[i][j] / e;
            }

            for (let ii = 0; ii < dim; ii++) {
                if (ii == i) {
                    continue;
                }
                e = cop[ii][i];
                for (let j = 0; j < dim; j++) {
                    cop[ii][j] -= e * cop[i][j];
                    ide[ii][j] -= e * ide[i][j];
                }
            }
        }
        return Matrix.fromArray(ide);
    }
}

function MatrixException(message) {
    const error = new Error(message);

    error.code = "MATRIX_ERROR";
    return error;
}
MatrixException.prototype = Object.create(Error.prototype);

function eye(size) {
    return zeros(size, size).map((v, i, j) => {
        if (i == j) {
            return 1;
        }
    });
}

function zeros(rows, columns) {
    return new Matrix(rows, columns, 0);
}

function ones(rows, columns) {
    return new Matrix(rows, columns, 1);
}

function aleatory(min, max) {
    if (min instanceof Array) {
        const index = Math.floor(aleatory(0, min.length));
        return min[index];
    } else {
        if(min === undefined){
            max = 1;
            min = 0;
        }else if(max === undefined){
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }
}
