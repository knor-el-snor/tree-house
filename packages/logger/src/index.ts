import debug from 'debug';
import { format, Logger, createLogger, transports } from 'winston';

import { ENV } from './constants';
import { paramsFormat, jsonFormat, simpleFormat } from './format';

const instance: Logger = createLogger({
  level: ENV.logLevel,
  format: format.combine(
    format.timestamp({ alias: 'timestamp' }),
    paramsFormat({ logFormat: ENV.logFormat }),
    ...(ENV.logFormat === 'json' ? jsonFormat() : simpleFormat()),
  ),
  defaultMeta: {
    serviceContext: {
      service: ENV.serviceName,
      version: `${ENV.serviceVersion}-${ENV.nodeEnv}`,
    },
  },
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
export const NSlogger = (namespace: string = ''): ILogger => {
  Object.assign(instance.defaultMeta, {
    ...instance.defaultMeta,
    namespace,
  });

  return {
    info: instance.info.bind(instance),
    warn: instance.warn.bind(instance),
    debug: ENV.logLevel === 'debug' ? getDebugger(namespace) : () => {},
    error: instance.error.bind(instance),
  };
};

export interface ILogger {
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

export interface ISetupOptions {
  // Name of the service
  name: string;
  // Version of the service
  version: string;
}

/**
 * Assigns service name & version to log entries.
 * @param param0 - Name & version of the service to associate with log entries.
 */
export const setup = ({ name, version }: ISetupOptions) => {
  Object.assign(instance.defaultMeta, {
    ...instance.defaultMeta,
    serviceContext: {
      service: name,
      version: `${version}-${ENV.nodeEnv}`,
    },
  });
};
