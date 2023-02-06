import { isDevMode } from '@angular/core';

export enum LoggerLevel {
  DEBUG,
  SUCCESS,
  INFO,
  WARN,
  ERROR
}

export class Logger {
  private static defaultColors = {
    [LoggerLevel.DEBUG]: '#ff0000',
    [LoggerLevel.ERROR]: '#fb2c2c',
    [LoggerLevel.WARN]: '#f4cb36',
    [LoggerLevel.SUCCESS]: '#63d000',
    [LoggerLevel.INFO]: '#007ad9',
  };
  private static defaultLevelText = {
    [LoggerLevel.DEBUG]: '[DEBG]',
    [LoggerLevel.ERROR]: '[ERRO]',
    [LoggerLevel.WARN]: '[WARN]',
    [LoggerLevel.SUCCESS]: '[ OK ]',
    [LoggerLevel.INFO]: '[INFO]',
  };

  private static log(level: LoggerLevel, message: string, properties?: string) {
    if (isDevMode()) {
      properties = `color:${this.defaultColors[level]};` + (properties || '');
      console.log(`${this.defaultLevelText[level]} - %c ` + message, properties || ``);
    }
  }

  public static debug(message: string, properties?: string) {
    this.log(LoggerLevel.DEBUG, message, properties);
  }

  public static info(message: string) {
    this.log(LoggerLevel.INFO, message);
  }

  public static warn(message: string) {
    this.log(LoggerLevel.WARN, message);
  }

  public static success(message: string) {
    this.log(LoggerLevel.SUCCESS, message);
  }

  public static error(message: string) {
    this.log(LoggerLevel.ERROR, message);
  }
}
