const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',

    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

function toLogValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'bigint') return String(value);
    if (typeof value === 'symbol') return value.toString();

    if (value instanceof Error) {
        return JSON.stringify({
            name: value.name,
            message: value.message,
            stack: value.stack
        }, null, 2);
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return '[Unserializable value]';
    }
}

function logLine(label = null, value = null, color = C.blue) {
    if (label === null) {
        console.log(`${color}${C.bold}${C.white}${toLogValue(value)}`);
    }
    if (value === null) {
        console.log(`${color}${C.bold}${label}`);
    } else {

        console.log(`${color}${C.bold}${label}`, `${C.white}${toLogValue(value)}`);
    }
}

function logErr(label, err, color = C.red) {
    console.error(`${color}${C.bold}${label}`, toLogValue(err));
}

function logHeader(label, color = C.cyan) {
    console.log(`${color}${C.bold}${toLogValue(label)}${C.reset}`);
}

function logOk(label, value = '') {
    console.log(`${C.green}${C.bold}${label}${C.reset} ${toLogValue(value)}`);
}

function logWarn(label, value = '') {
    console.log(`${C.yellow}${C.bold}${label}${C.reset} ${toLogValue(value)}`);
}

module.exports = {
    logHeader,
    logLine,
    logOk,
    logWarn,
    logErr,
    C
};