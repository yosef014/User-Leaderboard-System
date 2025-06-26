import {MigrationInterface, QueryRunner, Table} from "typeorm"

export class CreateUsersTable1750873052428 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('users')
        if (!hasTable) {
            await queryRunner.createTable(
                new Table({
                    name: 'users',
                    columns: [
                        {
                            name: 'id',
                            type: 'bigint',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        {
                            name: 'username',
                            type: 'varchar',
                            isNullable: false,
                        },
                        {
                            name: 'avatar_url',
                            type: 'varchar',
                            isNullable: true,
                        },
                        {
                            name: 'score',
                            type: 'bigint',
                            default: "'0'",
                        },
                        {
                            name: 'created_at',
                            type: 'timestamp',
                            default: 'CURRENT_TIMESTAMP',
                        }
                    ],
                }),
            )
            await queryRunner.query(`CREATE INDEX idx_users_score_desc ON users (score DESC, id ASC)`)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_score_desc`)
        await queryRunner.dropTable('users')
    }
}