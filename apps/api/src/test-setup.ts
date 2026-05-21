import { Logger, type LoggerService } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import {
  Test,
  type TestingModuleBuilder,
  type TestingModuleOptions,
} from '@nestjs/testing';

const noopLogger: LoggerService = {
  log: () => undefined,
  error: () => undefined,
  warn: () => undefined,
  debug: () => undefined,
  verbose: () => undefined,
  fatal: () => undefined,
};

const createTestingModule: (
  metadata: ModuleMetadata,
  options?: TestingModuleOptions,
) => TestingModuleBuilder = Test.createTestingModule.bind(Test) as (
  metadata: ModuleMetadata,
  options?: TestingModuleOptions,
) => TestingModuleBuilder;

Logger.overrideLogger(noopLogger);

Test.createTestingModule = (
  metadata: ModuleMetadata,
  options?: TestingModuleOptions,
) => createTestingModule(metadata, options).setLogger(noopLogger);
