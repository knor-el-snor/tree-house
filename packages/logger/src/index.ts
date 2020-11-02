import debug from 'debug';
import { format, Logger, createLogger, transports } from 'winston';
import { TransformableInfo } from 'logform';
import stringify from 'json-stringify-safe';
import { EOL } from 'os';

const { LOG_LEVEL = 'debug' } = process.env;

const LEVEL_EMOJI: Record<string, string> = {
  info: '🍺',
  warn: '❗️',
  error: '🔥',
  default: '🤷‍♂️',
};

/**
 * Returns emoji format based on level.
 */
const emojiLevelFormat = format(
  (info: TransformableInfo): TransformableInfo => {
    const { level } = info;
    const emoji = LEVEL_EMOJI[level] || LEVEL_EMOJI.default;
    return { ...info, level: `${emoji} ${level}` };
  },
);

/**
 * Extracts parameters from winston.
 */
const getWinstonParams = (info: TransformableInfo): any[] | undefined => {
  // Winston adds all parameters to 'splat' property which is accessible only by Symbol[splat]
  return info[Symbol.for('splat') as any];
};

/**
 * Returns stringified parameters, split by new line.
 * Returns undefined if parameters are undefined.
 */
const stringifyParams = (params: any[] | undefined): string[] | undefined =>
  params === undefined ? params : params.map((v: any) => `${EOL}${stringify(v)}`);

/**
 * Formats parameters by splitting them into multiple lines.
 */
const paramsFormat = format(
  (info: TransformableInfo): TransformableInfo => {
    const winstonParams = getWinstonParams(info);
    const params = stringifyParams(winstonParams);
    return { ...info, params };
  },
);

const instance: Logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    emojiLevelFormat(),
    paramsFormat(),
    format.colorize(),
    format.timestamp({ alias: 'timestamp' }),
    format.printf(({ level, message, timestamp, params = '' }) => `${level} ${timestamp}: ${message}${params}`),
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['debug', 'error'],
      consoleWarnLevels: ['warn'],
    }),
  ],
});

const namespaceRegistry = {};
const getDebugger = (namespace: string = ''): debug.IDebugger => {
  if (!namespace) {
    return debug('');
  }
  if (!namespaceRegistry[namespace]) {
    namespaceRegistry[namespace] = debug(namespace);
  }
  return namespaceRegistry[namespace];
};

export const logger: ILogger = {
  info: instance.info.bind(instance),
  warn: instance.warn.bind(instance),
  debug: instance.debug.bind(instance),
  error: instance.error.bind(instance),
};

// tslint:disable-next-line: variable-name
export const NSlogger = (namespace: string = ''): ILogger => ({
  info: instance.info.bind(instance),
  warn: instance.warn.bind(instance),
  debug: LOG_LEVEL === 'debug' ? getDebugger(namespace) : () => {},
  error: instance.error.bind(instance),
});

export interface ILogger {
  error: (message: Error | string, ...args: any[]) => void;
  warn: (message: Error | string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}
