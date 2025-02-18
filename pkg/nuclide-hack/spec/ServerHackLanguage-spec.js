'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as ServerHackLanguageType from '../lib/ServerHackLanguage';
import type {ServerHackLanguage} from '../lib/ServerHackLanguage';
import type {
  HackCompletionsResult,
  HackDefinitionResult,
  HackDiagnosticsResult,
  HackTypedRegion,
} from '../../nuclide-hack-base/lib/HackService';

import {uncachedRequire, clearRequireCache} from '../../nuclide-test-helpers';

const basePath = '/tmp/project';
const filePath = '/tmp/project/file.hh';
const contents = `<?hh // strict
class HackClass {}`;

describe('Mocking Imports test suite', () => {
  let mockService: Object = (null: any);
  let hackLanguage: ServerHackLanguage = (null: any);

  // Tests ToBeTested.functionToTest while mocking imported function toBeMocked.
  beforeEach(() => {

    mockService = jasmine.createSpyObj('HackService', [
      'getCompletions',
      'getDiagnostics',
      'getIdentifierDefinition',
      'getTypedRegions',
    ]);
    spyOn(require('../lib/utils'), 'getHackService')
      .andReturn(mockService);

    const ServerHackLanguageCtor =
      ((uncachedRequire(require, '../lib/ServerHackLanguage'): any): ServerHackLanguageType)
        .ServerHackLanguage;
    hackLanguage = new ServerHackLanguageCtor(true, basePath);
  });

  it('isHackAvailable', () => {
    expect(hackLanguage.isHackAvailable()).toEqual(true);
  });

  it('getBasePath', () => {
    expect(hackLanguage.getBasePath()).toEqual(basePath);
  });

  it('getCompletions', () => {
    waitsForPromise(async () => {
      const serviceResults: HackCompletionsResult = {
        hackRoot: basePath,
        completions: [
          {
            name: 'foo',
            func_details: {
              params: [
                {
                  name: 'p1',
                },
                {
                  name: 'p2',
                },
              ],
            },
            type: 'foo_type',
            pos: {
              filename: filePath,
              line: 42,
              char_start: 0,
              char_end: 10,
            },
          },
        ],
      };
      mockService.getCompletions.andReturn(serviceResults);

      const result = await hackLanguage.getCompletions(filePath, contents, 15);

      expect(mockService.getCompletions).toHaveBeenCalledWith(filePath, `<?hh // strict
AUTO332class HackClass {}`);
      expect(result).toEqual([
        {
          matchSnippet : 'foo(${1:p1}, ${2:p2})',
          matchText : 'foo',
          matchType : 'foo_type',
        },
      ]);
    });
  });

  it('formatSource', () => {
    waitsForPromise(async () => {
      const result = await hackLanguage.formatSource(contents, 0, contents.length);
      // TODO
      expect(result).toEqual(contents);
    });
  });

  it('highlightSource', () => {
    waitsForPromise(async () => {
      const result = await hackLanguage.highlightSource(filePath, contents, 0, 0);
      // TODO
      expect(result).toEqual([]);
    });
  });

  it('getDiagnostics', () => {
    waitsForPromise(async () => {
      const message = {
        message: [
          {
            path: filePath,
            descr: 'Diagnostic description',
            code: 42,
            line: 12,
            start: 4,
            end: 8,
          },
        ],
      };
      const serviceResults: HackDiagnosticsResult = {
        hackRoot: basePath,
        messages: [
          message,
        ],
      };

      mockService.getDiagnostics.andReturn(serviceResults);

      const result = await hackLanguage.getDiagnostics(filePath, contents);
      expect(mockService.getDiagnostics).toHaveBeenCalledWith(filePath, contents);
      expect(result).toEqual([message]);
    });
  });

  it('getTypeCoverage', () => {
    waitsForPromise(async () => {
      const serviceResults: Array<HackTypedRegion> = [
        { color: 'default', text: '123' },
        { color: 'unchecked', text: '456' },
      ];
      mockService.getTypedRegions.andReturn(serviceResults);

      const result = await hackLanguage.getTypeCoverage(filePath);

      expect(mockService.getTypedRegions).toHaveBeenCalledWith(filePath);
      expect(result).toEqual([ { type : 'unchecked', line : 1, start : 4, end : 6 } ]);
    });
  });

  it('getDefinition', () => {
    waitsForPromise(async () => {
      const definition =           {
        path: filePath,
        line: 42,
        column: 24,
        name: 'foo',
        length: 3,
        scope: '',
        additionalInfo: '',
      };

      const serviceResults: HackDefinitionResult = {
        hackRoot: basePath,
        definitions: [definition],
      };
      mockService.getIdentifierDefinition.andReturn(serviceResults);

      const result = await hackLanguage.getDefinition(filePath, contents, 1, 2, 'howdy');

      expect(mockService.getIdentifierDefinition).toHaveBeenCalledWith(filePath, contents, 1, 2);
      expect(result).toEqual([definition]);
    });
  });

  it('getType', () => {
    waitsForPromise(async () => {
      const result = await hackLanguage.getType(filePath, contents, 'expr', 1, 2);
      // TODO
      expect(result).toEqual(null);
    });
  });

  it('findReferences', () => {
    waitsForPromise(async () => {
      const result = await hackLanguage.findReferences(filePath, contents, 1, 2);
      // TODO
      expect(result).toEqual(null);
    });
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/ServerHackLanguage');
  });
});
