import chalk from 'chalk';

function safeValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }
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
        return Object.prototype.toString.call(value);
    }
}

function logLine(label = null, value = null) {
    console.log(chalk.bgBlue(" " + label.toUpperCase() + " "), chalk.blue(value ? safeValue(value) : ''));
}

function logErr(label, err) {
    console.error(chalk.red(' ' + label.toUpperCase() + ' '), chalk.red(err ? safeValue(err) : ''));
}

function logHeader(label) {
    console.log(chalk.bgMagentaBright(" " + label.toUpperCase() + " "))
}

function logOk(label, value = '') {
    console.log(chalk.bgGreen(" " + label.toUpperCase() + " "), chalk.green(value ? safeValue(value) : ''))
}

function logWarn(label, value = '') {
    console.log(chalk.bgYellow(" " + label.toUpperCase() + " "), chalk.yellow(value ? safeValue(value) : ''));
}

export {
    logHeader,
    logLine,
    logOk,
    logWarn,
    logErr
};