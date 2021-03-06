import RequestShortener from 'webpack/lib/RequestShortener';

import TerserPlugin from '../src/index';

import { cleanErrorStack, compile, createCompiler } from './helpers';

describe('TerserPlugin', () => {
  const rawSourceMap = {
    version: 3,
    file: 'test.js',
    names: ['bar', 'baz', 'n'],
    sources: ['one.js', 'two.js'],
    sourceRoot: 'http://example.com/www/js/',
    mappings:
      'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA',
  };
  const emptyRawSourceMap = {
    version: 3,
    sources: [],
    mappings: '',
  };

  it('should works (without options)', () => {
    const compiler = createCompiler();

    new TerserPlugin().apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (
          Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)
        ) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('isSourceMap method', () => {
    expect(TerserPlugin.isSourceMap(null)).toBe(false);
    expect(TerserPlugin.isSourceMap()).toBe(false);
    expect(TerserPlugin.isSourceMap({})).toBe(false);
    expect(TerserPlugin.isSourceMap([])).toBe(false);
    expect(TerserPlugin.isSourceMap('foo')).toBe(false);
    expect(TerserPlugin.isSourceMap({ version: 3 })).toBe(false);
    expect(TerserPlugin.isSourceMap({ sources: '' })).toBe(false);
    expect(TerserPlugin.isSourceMap({ mappings: [] })).toBe(false);
    expect(TerserPlugin.isSourceMap({ version: 3, sources: '' })).toBe(false);
    expect(TerserPlugin.isSourceMap({ version: 3, mappings: [] })).toBe(false);
    expect(TerserPlugin.isSourceMap({ sources: '', mappings: [] })).toBe(false);
    expect(
      TerserPlugin.isSourceMap({ version: 3, sources: '', mappings: [] })
    ).toBe(false);
    expect(TerserPlugin.isSourceMap(rawSourceMap)).toBe(true);
    expect(TerserPlugin.isSourceMap(emptyRawSourceMap)).toBe(true);
  });

  it('buildSourceMap method', () => {
    expect(TerserPlugin.buildSourceMap()).toBe(null);
    expect(TerserPlugin.buildSourceMap('invalid')).toBe(null);
    expect(TerserPlugin.buildSourceMap({})).toBe(null);
    expect(TerserPlugin.buildSourceMap(rawSourceMap)).toMatchSnapshot();
  });

  it('buildError method', () => {
    const error = new Error('Message');

    error.stack = null;

    expect(TerserPlugin.buildError(error, 'test.js')).toMatchSnapshot();

    const errorWithLineAndCol = new Error('Message');

    errorWithLineAndCol.stack = null;
    errorWithLineAndCol.line = 1;
    errorWithLineAndCol.col = 1;

    expect(
      TerserPlugin.buildError(
        errorWithLineAndCol,
        'test.js',
        TerserPlugin.buildSourceMap(rawSourceMap)
      )
    ).toMatchSnapshot();

    const otherErrorWithLineAndCol = new Error('Message');

    otherErrorWithLineAndCol.stack = null;
    otherErrorWithLineAndCol.line = 1;
    otherErrorWithLineAndCol.col = 1;

    expect(
      TerserPlugin.buildError(
        otherErrorWithLineAndCol,
        'test.js',
        TerserPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/')
      )
    ).toMatchSnapshot();

    const errorWithStack = new Error('Message');

    errorWithStack.stack = 'Stack';

    expect(
      TerserPlugin.buildError(errorWithStack, 'test.js')
    ).toMatchSnapshot();
  });

  it('buildWarning method', () => {
    expect(
      TerserPlugin.buildWarning('Warning [test.js:1,1]')
    ).toMatchSnapshot();
    expect(
      TerserPlugin.buildWarning('Warning [test.js:1,1]', 'test.js')
    ).toMatchSnapshot();
    expect(
      TerserPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        TerserPlugin.buildSourceMap(rawSourceMap)
      )
    ).toMatchSnapshot();
    expect(
      TerserPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        TerserPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/')
      )
    ).toMatchSnapshot();
    expect(
      TerserPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        TerserPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/'),
        () => true
      )
    ).toMatchSnapshot();
    expect(
      TerserPlugin.buildWarning(
        'Warning [test.js:1,1]',
        'test.js',
        TerserPlugin.buildSourceMap(rawSourceMap),
        new RequestShortener('http://example.com/www/js/'),
        () => false
      )
    ).toMatchSnapshot();
  });
});
