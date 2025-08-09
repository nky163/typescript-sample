module.exports = {
  forbidden: [
    // ドメイン層は他層に依存しない
    {
      name: 'domain-no-deps-on-adapters',
      comment: 'domain layer must not depend on adapter layers',
      severity: 'error',
      from: { path: 'src/application/domain' },
      to: { path: 'src/adapter' }
    },
    // アプリケーション層は内向きのみ
    {
      name: 'application-no-deps-on-web',
      comment: 'application layer must not depend on web adapter',
      severity: 'error',
      from: { path: 'src/application' },
      to: { path: 'src/adapter/in/web' }
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
    reporterOptions: { dot: { collapsePattern: 'node_modules/[^/]+'} }
  }
};
