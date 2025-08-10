# ソースファイルの構造

## importについて (3.3 Imports)

Google TypeScript Style Guide 3.3 節をベースに、本プロジェクトで採用する import ルールを列挙する。

### インポートは ES Modules 構文を使う

- `import` / `export`（ESM）を使用し、CommonJS の `require` / `module.exports` や `<reference path>` を使わない（可搬性・最適化・型解決一貫性）。
- TypeScript の `import x = require('...')`（旧式）を使わない。

**❌ bad**

```typescript
// CommonJS 形式
const util = require('./util');
import foo = require('./foo');
/// <reference path="legacy.d.ts" />
```

**✅ good**

```typescript
import * as util from './util';
import { foo } from './foo';
```

### import セクションはファイル冒頭でまとめる

- 実装コードより前に連続したグループとして置く（構造の即時把握）。
- セクション途中に関数定義などを挟まない。

**❌ bad**

```typescript
import { A } from './a';

function helper() {}

import { B } from './b'; // 分断された import
```

**✅ good**

```typescript
import { A } from './a';
import { B } from './b';

// --- ここから実装 ---
function helper() {}
```

### 相対パスを優先し過度な親参照を避ける

- 同一論理プロジェクト内は相対パス (`./`, `../`) を用いる（モジュール移動時の差分縮小）。
- `../../../` のような深いパスが増えるなら構造再編を検討。

**❌ bad**

```typescript
import { sendMoney } from 'src/application/service/send'; // ルート固定で移動に弱い
import { X } from '../../../domain/model/x'; // 深すぎる親参照
```

**✅ good**

```typescript
import { sendMoney } from '../application/service/send';
import { X } from '../../domain/model/x';
```

### 命名インポート vs 名前空間インポートの使い分け

- 頻出する少数シンボルは named import（読みやすい・ツリーシェイク明確）。
- 多数のエクスポートを使う大型 API は namespace import（列挙肥大化回避）。

**❌ bad**

```typescript
// 長く読みにくい列挙
import { map as rxMap, filter as rxFilter, scan as rxScan, merge as rxMerge } from 'rxjs/operators';
```

**✅ good**

```typescript
import { map, filter } from 'rxjs/operators'; // 少数なら named
import * as ops from 'rxjs/operators'; // 多数なら namespace
```

### 不要な長い別名や無意味なリネームをしない

- 衝突回避・明確化以外の理由で無意味に `as` リネームしない（可読性低下）。

**❌ bad**

```typescript
import { sendMoney as executeSendMoneyUseCase } from './service/sendMoney'; // 冗長
```

**✅ good**

```typescript
import { sendMoney } from './service/sendMoney';
// 衝突時のみリネーム
import { sendMoney as sendMoneyService } from './service/sendMoney';
```

### default export を定義しない（利用は最小限）

- 自ファイルからは常に named export（リネーム安全性 / 一貫性）。
- 自前モジュールでは `export default` を導入しない。
- 外部ライブラリが default のみ提供する場合に限り default import を使用。

**❌ bad**

```typescript
export default class SendMoneyService {}
// または
export default function buildConfig() {}
```

**✅ good**

```typescript
export class SendMoneyService {}
export function buildConfig() {}
// 外部:
import React from 'react'; // ライブラリ側が default のときは許容
```

<!-- 重複する export 専用ルール（mutable export 回避 / コンテナクラス非推奨）は 3.4 節を参照 -->

### side-effect import は本当に副作用が必要な時のみ

- 目的のない `import './polyfill';` などを残さない。
- グローバル拡張 / 初期化が必要なライブラリ読み込み時のみ使用。

**❌ bad**

```typescript
import './allocate'; // 何も参照せず意味不明
```

**✅ good**

```typescript
import 'reflect-metadata'; // デコレータメタデータ初期化の副作用が必要
```

### 未使用 import を残さない

- 使わなくなった import は削除（ビルド速度 / 読みやすさ / ツリーシェイク）。

**❌ bad**

```typescript
import { Money } from './money'; // 使われていない
console.log('start');
```

**✅ good**

```typescript
console.log('start'); // 不要 import 削除済
```

### 名前空間 (namespace) と古い module 構文は使わない

- `namespace Foo {}` / `module Foo {}` を新規コードで使用しない。
- 型定義互換など不可避な外部ライブラリアダプタでのみ最小限。

**❌ bad**

```typescript
namespace Domain {
  export interface A {}
}
```

**✅ good**

```typescript
// domain/a.ts
export interface A {}
```

### 型専用 import / export の明示（パフォーマンスと意図）

- 値を持たない型だけを扱う場合 `import type` / `export type` を用いてビルド高速化と意図明確化。

**❌ bad**

```typescript
import { Money } from './money'; // Money を値で使っていない
```

**✅ good**

```typescript
import type { Money } from './money';
```

## exportについて (3.4 Exports)

### default export を使わず名前付きエクスポートに統一する

- default export はファイル側での名前決定が曖昧でリネーム追跡が困難 / 一貫性低下。
- 名前付きなら未定義シンボルインポートを型チェック/ビルドで即検出。
- 複数 export の後からの再構成が容易。

**❌ bad**

```typescript
export default class AccountService {}
// または
export default function buildConfig() {}
```

**✅ good**

```typescript
export class AccountService {}
export function buildConfig() {}
```

### 公開 API Surface を最小化する (必要なものだけ export)

- 利用されない export は外部への依存縁を増やし破壊的変更リスクを高める。
- 小さい API は学習/レビュー/リファクタ容易性が高い。
- 内部実装入れ替えの柔軟性を確保。

**❌ bad**

```typescript
// 使われない内部型や補助関数まで露出
export interface InternalCache {
  size: number;
}
export function debugDump() {}
export class SendMoneyService {
  /* ... */
}
```

**✅ good**

```typescript
// 実際に他モジュールから利用されるものだけ
export class SendMoneyService {
  /* ... */
}
```

### mutable export (後から値が変わる export) を避ける

- `export let` / 変化する状態の直接 export は再エクスポートやキャッシュとの整合が不透明。
- 値変化タイミングがモジュール境界を跨ぎ把握しづらい。
- getter 関数経由なら変更点をローカライズできテストもしやすい。

**❌ bad**

```typescript
export let currentRate = 1.0;
setInterval(() => {
  currentRate += 0.05;
}, 1000);
```

**✅ good**

```typescript
let currentRate = 1.0;
setInterval(() => {
  currentRate += 0.05;
}, 1000);
export function getCurrentRate() {
  return currentRate;
}
```

### 条件分岐で選択する値は export 前に確定させる

- export 後に再代入するより初期化関数で決めてから一度きりの `const` export にする。
- 依存注入/テスト時に安定。

**❌ bad**

```typescript
export let strategy = fastStrategy;
if (process.env.MODE === 'safe') {
  strategy = safeStrategy; // 実行タイミング順序依存
}
```

**✅ good**

```typescript
function pickStrategy() {
  return process.env.MODE === 'safe' ? safeStrategy : fastStrategy;
}
export const strategy = pickStrategy();
```

### 名前空間 (container) クラスで束ねない

- 静的メソッド/定数集約だけのクラスは冗長で2階層のネームスペースを生む。
- ツリーシェイク精度低下・テスト困難化。

**❌ bad**

```typescript
export class MoneyUtil {
  static readonly ZERO = 0;
  static isPositive(n: number) {
    return n > 0;
  }
}
```

**✅ good**

```typescript
export const MONEY_ZERO = 0;
export function isPositive(n: number) {
  return n > 0;
}
```

### 再エクスポートは明示的かつ限定的に行う

- バレル (index.ts) の過度な再エクスポートは依存解析を難しくする。
- 利用頻度の高い上位 1 レベル API だけを再公開し内部階層を隠す。

**❌ bad**

```typescript
// index.ts が下層全ディレクトリを無差別再エクスポート
export * from './a';
export * from './b';
export * from './c/deep';
```

**✅ good**

```typescript
// 最上位ユースケースだけを整理して再エクスポート
export { SendMoneyService } from './application/service/sendMoneyService';
export { GetAccountBalanceUseCase } from './application/port/in/getAccountBalanceUseCase';
```

### 型と値を混在させず意図を明確にする

- 型再エクスポートは `export type { ... }` を使うとバンドル不要な識別子明示。
- 値との混同を避けることで tree shaking と読みやすさ向上。

**❌ bad**

```typescript
export { AccountId, Money } from './domain/model/money'; // 型のみなのか値もあるのか曖昧
```

**✅ good**

```typescript
export type { Money } from './domain/model/money';
export { AccountId } from './domain/model/account';
```

### 外部公開不要な内部補助は export しない (ファイル内スコープで閉じる)

- 内部専用関数を非 export にすれば IDE 補完 / ツールの表面積が減る。
- 将来リファクタで破壊的変更扱いにならない。

**❌ bad**

```typescript
export function formatDecimal(d: number) {
  /* 内部専用 */
}
export function toCents(m: Money) {
  /* ... */
}
```

**✅ good**

```typescript
function formatDecimal(d: number) {
  /* 内部専用 */
}
export function toCents(m: Money) {
  /* 公開 API */
}
```

## 型の import/export について (3.5 Type-only Imports/Exports)

Google TypeScript Style Guide 3.5 節の型限定 import / export 指針。3.3 / 3.4 の一般ルールも前提とする。

### 型だけ使用する場合は `import type` を使う

- ランタイム不要シンボルを明示してバンドル削減余地。
- 値でないことが明確になり読みやすい。
- 部分コンパイル/isolatedModules での解決を安定化。

**❌ bad**

```typescript
import { User } from './types'; // 型用途のみ
function create(u: User) {}
```

**✅ good**

```typescript
import type { User } from './types';
function create(u: User) {}
```

### 型と値を同時に扱う場合はまとめて書式化

- 同一モジュール多重 import を避けノイズ削減。
- `import { type Foo, Bar }` 形式で用途区別。

**❌ bad**

```typescript
import type { Foo } from './mod';
import { Bar } from './mod';
```

**✅ good**

```typescript
import { type Foo, Bar } from './mod';
```

### 型再エクスポートには `export type` を用いる

- 値生成が不要なことを宣言しツール最適化を支援。
- 値シンボルとの混同防止。

**❌ bad**

```typescript
export { Account, Money } from './model'; // 型だけ
```

**✅ good**

```typescript
export type { Account, Money } from './model';
```

### `import type` を値で使わない

- ランタイムに存在せず呼び出しで実行時エラー。
- 型だけ必要か再確認を促す。

**❌ bad**

```typescript
import type { ConfigBuilder } from './config';
ConfigBuilder.build();
```

**✅ good**

```typescript
import { ConfigBuilder } from './config';
ConfigBuilder.build();
```

### 過剰な型アサーションを避け `satisfies` を活用

- オブジェクトリテラル直アサーション禁止ルールと整合。
- プロパティ typo を早期検出。

**❌ bad**

```typescript
const cfg = { endpoint: '/api', timout: 5000 } as ApiConfig; // typo
```

**✅ good**

```typescript
const cfg = { endpoint: '/api', timeout: 5000 } satisfies ApiConfig;
```

### 旧式構文 (namespace / require / <reference>) について

詳細は 3.3 の「名前空間 (namespace) と古い module 構文は使わない」を参照。
