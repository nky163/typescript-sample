# TypeScript Sample Application

This project is a sample application implemented using TypeScript, following the principles of Clean Architecture and Hexagonal Architecture. It utilizes Express as the web framework, TypeORM for database interactions, and PostgreSQL as the database, all managed through Docker Compose. The application is designed to demonstrate best practices in software architecture and development.

## Project Structure

The project is organized into several key directories:

- **src**: Contains the main application code.
  - **application**: Contains use cases and data transfer objects (DTOs).
  - **domain**: Contains domain entities, value objects, and repository interfaces.
  - **infrastructure**: Contains configuration, persistence, web server setup, and logging.
  - **shared**: Contains shared utilities and error handling.

- **test**: Contains unit and integration tests for the application.

- **scripts**: Contains scripts for database migrations and seeding.

- **docker**: Contains Docker-related files, including initialization scripts and Docker Compose configuration.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Docker and Docker Compose

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd typescript-sample
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the environment variables:
   Copy `.env.example` to `.env` and update the values as needed.

4. Start the database using Docker Compose:
   ```
   docker-compose up -d
   ```

5. Run database migrations:
   ```
   npm run migrate
   ```

### Running the Application

To start the application, run:
```
npm start
```

The server will be running on `http://localhost:3000`.

### Running Tests

To run the tests, use:
```
npm test
```

## データベース初期化

1. DockerでDB起動
```bash
docker compose up -d db
```
2. マイグレーション実行 (init.sql は廃止し、TypeORM migrations を利用)
```bash
npm run migrate
```
3. (任意) 初期データ投入
```bash
npm run seed
```

## エンドポイント

- GET /health : ヘルスチェック
- POST /api/accounts { balance?: number } : アカウント作成
- GET /api/accounts : アカウント一覧
- POST /api/transfer { senderId, receiverId, amount } : 残高振替

## エラーレスポンス方針
- 404 NotFoundError: 対象アカウントが存在しない
- 422 DomainError: ドメインルール違反 (残高不足 等)

## 統合テスト注意
- DBはtmpfs上で動作しデータはコンテナ停止で消えます。
- 初期化はマイグレーション (必要に応じて seed)。init.sql は不要です。

## 実行モード別DBストレージ
- 開発/本番相当 (npm start): `docker-compose.yml` を使用し named volume `db-data` に永続化。
- テスト (npm test): `docker-compose.test.yml` を使用し tmpfs 上でインメモリ動作。テスト終了時に破棄。

### 開発サーバ起動
```bash
npm run start:db
npm run migrate
npm start
```

### テスト実行
```bash
npm test
```
(内部で tmpfs DB を起動 -> migrate -> jest -> teardown)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.